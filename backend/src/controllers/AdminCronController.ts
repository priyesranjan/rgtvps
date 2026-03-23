import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { ProfitDistributionService } from "../services/ProfitDistributionService";
import { DateTime } from "luxon";

export class AdminCronController {
  /**
   * Get all daily profit distribution logs
   */
  static async getCronLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await prisma.dailyProfitLog.findMany({
        orderBy: { date: "desc" },
        take: 100
      });
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Manually trigger profit distribution (reconciliation)
   */
  static async triggerDistribution(req: AuthRequest, res: Response) {
    try {
      const nowIST = DateTime.now().setZone("Asia/Kolkata");
      const businessDate = nowIST.toFormat("yyyy-MM-dd");
      const cutoffDate = nowIST.startOf("day").toJSDate();

      const results = await ProfitDistributionService.distributeDailyReturns(cutoffDate, businessDate);
      res.json({ 
        message: "Profit distribution triggered successfully", 
        results 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
