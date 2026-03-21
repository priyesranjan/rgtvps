import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class SystemSettingController {
  static async getSettings(req: Request, res: Response) {
    try {
      let settings = await prisma.systemSetting.findUnique({
        where: { id: "default" }
      });

      if (!settings) {
        settings = await prisma.systemSetting.create({
          data: {
            id: "default",
            showGST: true,
            gstPercentage: 18.0,
            monthlyProfitPercentage: 5.0,
            monthlyReferralPercentage: 5.0,
            monthlyStaffPercentage: 5.0,
            showAdvancedSettings: false
          }
        });
      }

      res.status(200).json(settings);
    } catch (err: any) {
      console.error("❌ [SystemSettingController] Error fetching settings:", err);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const {
        showGST,
        gstPercentage,
        monthlyProfitPercentage,
        monthlyReferralPercentage,
        monthlyStaffPercentage,
        showAdvancedSettings
      } = req.body;

      const settings = await prisma.systemSetting.upsert({
        where: { id: "default" },
        update: {
          showGST: showGST ?? true,
          gstPercentage: gstPercentage ?? 18.0,
          monthlyProfitPercentage: monthlyProfitPercentage,
          monthlyReferralPercentage: monthlyReferralPercentage,
          monthlyStaffPercentage: monthlyStaffPercentage,
          showAdvancedSettings: showAdvancedSettings
        },
        create: {
          id: "default",
          showGST: showGST ?? true,
          gstPercentage: gstPercentage ?? 18.0,
          monthlyProfitPercentage: monthlyProfitPercentage ?? 5.0,
          monthlyReferralPercentage: monthlyReferralPercentage ?? 5.0,
          monthlyStaffPercentage: monthlyStaffPercentage ?? 5.0,
          showAdvancedSettings: showAdvancedSettings ?? false
        }
      });

      res.status(200).json(settings);
    } catch (err: any) {
      console.error("❌ [SystemSettingController] Error updating settings:", err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
}
