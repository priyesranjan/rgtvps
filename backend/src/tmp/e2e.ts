import axios from "axios";

const API = "http://localhost:4000/api";
let adminToken = "";
let managerToken = "";
let employeeToken = "";
let techToken = "";

async function runTests() {
  console.log("🚀 Starting Product Engineer E2E API Tests...");

  try {
    // 1. Auth Tests
    console.log("\n--- Authentication & Roles ---");
    
    const adminRes = await axios.post(`${API}/auth/employee/login`, {
      email: "admin@rgt.in", password: "admin@123"
    });
    adminToken = adminRes.data.token;
    console.log("✅ Admin Login Success");

    const managerRes = await axios.post(`${API}/auth/employee/login`, {
      email: "manager@rgt.in", password: "manager@123"
    });
    managerToken = managerRes.data.token;
    console.log("✅ Manager Login Success");

    const empRes = await axios.post(`${API}/auth/employee/login`, {
      email: "raunak@rgt.in", password: "employee@123"
    });
    employeeToken = empRes.data.token;
    console.log("✅ Employee Login Success");

    const techRes = await axios.post(`${API}/auth/employee/login`, {
      email: "tech@rgt.in", password: "techteam@123"
    });
    techToken = techRes.data.token;
    console.log("✅ Tech Team Login Success");

    const invRes = await axios.post(`${API}/auth/investor/login`, {
      mobile: "+919876543210", password: "investor@123"
    });
    const investorId = invRes.data.user.id;
    console.log("✅ Investor Login Success (Password)");

    // 2. Feature Flags (Tech Team)
    console.log("\n--- Feature Flags (Tech Team) ---");
    const flagsRes = await axios.get(`${API}/flags`, { headers: { Authorization: `Bearer ${techToken}` } });
    const smsFlag = flagsRes.data.flags.find((f: any) => f.key === "SMS_ALERTS");
    console.log(`✅ Fetched Flags. SMS_ALERTS is ${smsFlag.isEnabled ? 'ON' : 'OFF'}`);

    // 3. Investment Creation (Employee)
    console.log("\n--- Deposit Processing (Employee) ---");
    const invCreateRes = await axios.post(`${API}/investments`, {
      investorId,
      principalAmount: 100000,
      interestRate: 10,
      leadSource: "Direct"
    }, { headers: { Authorization: `Bearer ${employeeToken}` } });
    const investmentId = invCreateRes.data.id;
    console.log(`✅ Investment Tranche created by Employee: ${investmentId}`);

    // 4. Rate Update (Manager/Admin)
    console.log("\n--- Interest Rate Revision (Manager) ---");
    const rateRes = await axios.patch(`${API}/investments/${investmentId}/rate`, {
      newRate: 12,
      reason: "Loyalty Bonus"
    }, { headers: { Authorization: `Bearer ${managerToken}` } });
    console.log(`✅ Rate updated to ${rateRes.data.updatedInvestment.currentRate}% by Manager`);

    // 5. Referrals (Employee)
    console.log("\n--- Referral Commission (Manager) ---");
    // Create Priya to link
    const newUserRes = await axios.post(`${API}/users`, {
      name: "Priya Sharma Test",
      mobile: "+911122334455",
      password: "password123"
    }, { headers: { Authorization: `Bearer ${employeeToken}` } });
    const ranjan = newUserRes.data;
    
    if (ranjan) {
      const refCreateRes = await axios.post(`${API}/referrals`, {
        referrerId: investorId, // Abhishek
        referredUserId: ranjan.id, // Priya Test
        commissionAmount: 500
      }, { headers: { Authorization: `Bearer ${managerToken}` } });
      const referralId = refCreateRes.data.id;
      console.log(`✅ Referral Link created: Abhishek -> Priya Test`);

      // Credit Earnings
      const earnRes = await axios.post(`${API}/referrals/${referralId}/earnings`, {
        amount: 500, note: "First Month Match"
      }, { headers: { Authorization: `Bearer ${managerToken}` } });
      console.log(`✅ Commission earning credited: ₹${earnRes.data.amount}`);
    } else {
      console.log("⚠️ Target investor 'Priya Sharma' not found in seed data for this test.");
    }

    console.log("\n🎉 All Product Engineer backend tests completed successfully!");

  } catch (error: any) {
    console.error("❌ E2E Test Failed:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTests();
