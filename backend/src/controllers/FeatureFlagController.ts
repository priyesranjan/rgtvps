import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class FeatureFlagController {
  static async getFlags(_req: Request, res: Response) {
    try {
      const flags = await prisma.featureFlag.findMany({
        orderBy: { createdAt: "asc" }
      });
      res.json(flags);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateFlag(req: Request, res: Response) {
    const { key } = req.params;
    const { isEnabled, label, description, category, updatedBy } = req.body;
    try {
      const flag = await prisma.featureFlag.upsert({
        where: { key },
        update: { isEnabled, label, description, category, updatedBy },
        create: { key, isEnabled, label, description, category, updatedBy }
      });
      res.json(flag);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteFlag(req: Request, res: Response) {
    const { key } = req.params;
    try {
      await prisma.featureFlag.delete({ where: { key } });
      res.json({ message: "Flag deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
