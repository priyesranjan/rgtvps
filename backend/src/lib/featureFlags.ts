import { prisma } from "./prisma";

export class FeatureFlags {
  static async isEnabled(key: string): Promise<boolean> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key }
      });
      return flag?.isEnabled ?? false;
    } catch (error) {
      console.error(`Error checking feature flag ${key}:`, error);
      return false;
    }
  }

  /**
   * Helper to check multiple flags at once
   */
  static async getFlags(keys: string[]): Promise<Record<string, boolean>> {
    try {
      const flags = await prisma.featureFlag.findMany({
        where: { key: { in: keys } }
      });
      
      const result: Record<string, boolean> = {};
      keys.forEach(k => result[k] = flags.find(f => f.key === k)?.isEnabled ?? false);
      return result;
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      return {};
    }
  }
}
