import axios from "axios";

async function testLogin() {
  try {
    const res = await axios.post("http://127.0.0.1:4000/api/auth/login", {
      email: "customer@rgt.com",
      password: "password123"
    });
    console.log("Login Success:", res.data.token ? "TOKEN_RECEIVED" : "NO_TOKEN");
    console.log("User:", res.data.user.name);
  } catch (err: any) {
    console.error("Login Failed:", err.response?.data || err.message);
  }
}

testLogin();
