import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { AuditService } from "../services/AuditService";
import { StorageService } from "../services/StorageService";
import { AuditAction } from "@prisma/client";

export class ProfileController {
  static async updateProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, contactNo, photo, address, gender, dob } = req.body;

    try {
      // Validation: Mobile (10 digits)
      if (contactNo && !/^\d{10}$/.test(contactNo)) {
        return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) return res.status(404).json({ error: "User not found" });

      // Check contactNo uniqueness if it's being changed
      if (contactNo && contactNo !== existingUser.contactNo) {
        const duplicate = await prisma.user.findFirst({
          where: { contactNo, NOT: { id: userId } }
        });
        if (duplicate) return res.status(400).json({ error: "Contact number already in use" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          contactNo: contactNo || undefined,
          mobile: contactNo || undefined, // Legacy
          photo: photo || undefined,
          address: address || undefined,
          gender: gender || undefined,
          dob: dob ? new Date(dob) : undefined
        }
      });

      // Log Audit Record
      await AuditService.logAction({
        actionType: AuditAction.CUSTOMER_UPDATED, // Reusing existing action for now or could add PROFILE_UPDATED
        entityType: "User",
        entityId: userId,
        performedByUserId: userId,
        performedByRole: req.user?.role,
        previousData: existingUser,
        newData: updatedUser,
        description: `Profile updated by user ${userId}`,
        ipAddress: req.ip
      });

      const { password: _, ...safeUser } = updatedUser;
      res.json({ message: "Profile updated successfully", user: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Refactored uploadPhoto to use multer memory storage
  static async uploadPhoto(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const publicUrl = await StorageService.uploadFile(req.file, "profiles");

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { photo: publicUrl }
      });

      res.json({
        message: "Profile photo updated successfully",
        photo: publicUrl,
        user: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
