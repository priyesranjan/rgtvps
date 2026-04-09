import axios from "axios";

function getBaseUrl() {
  const key = process.env.SMS_API_KEY;
  if (!key) {
    throw new Error("SMS_API_KEY is not configured.");
  }
  return `https://2factor.in/API/V1/${key}`;
}

export class SMSService {
  /**
   * Sends an OTP to the given mobile number.
   * Returns the Session ID from 2Factor.
   */
  static async sendOTP(mobile: string): Promise<string> {
    try {
      const baseUrl = getBaseUrl();
      // 2Factor expects 10-digit mobile or with country code.
      // We'll clean it to ensure it's just numbers.
      const cleanMobile = mobile.replace(/\D/g, "");
      const url = `${baseUrl}/SMS/${cleanMobile}/AUTOGEN/RGT_OTP`;
      
      const response = await axios.get(url);
      if (response.data.Status === "Success") {
        return response.data.Details; // This is the SessionID
      } else {
        throw new Error(response.data.Details || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("SMS SEND ERROR:", error.response?.data || error.message);
      throw new Error("Could not send OTP. Please try again.");
    }
  }

  /**
   * Verifies the OTP using the Session ID.
   */
  static async verifyOTP(sessionId: string, otp: string): Promise<boolean> {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/SMS/VERIFY/${sessionId}/${otp}`;
      const response = await axios.get(url);
      
      return response.data.Status === "Success" && response.data.Details === "OTP Matched";
    } catch (error: any) {
      console.error("SMS VERIFY ERROR:", error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Sends a transactional SMS alert.
   * Note: Template must be approved on 2Factor panel first.
   */
  static async sendAlert(mobile: string, template: string, values: string[]): Promise<void> {
    // 2Factor Transactional API (POST)
    // Values are comma separated for template variables {VAR1}, {VAR2}...
    try {
      const baseUrl = getBaseUrl();
      const cleanMobile = mobile.replace(/\D/g, "");
      const url = `${baseUrl}/ADDON_SERVICES/SEND/TSMS`;
      
      const payload = {
        From: "RGTIND",
        To: cleanMobile,
        TemplateName: template,
        Msg: values.join(",")
      };

      await axios.post(url, payload);
      console.log(`SMS Alert [${template}] sent to ${cleanMobile}`);
    } catch (error: any) {
      console.error("SMS ALERT ERROR:", error.response?.data || error.message);
    }
  }
}
