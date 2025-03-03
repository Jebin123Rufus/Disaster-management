require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/otp_verification", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("🔴 MongoDB connection error:", err));

// OTP Schema & Model
const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, expires: 300, default: Date.now } // Auto-delete after 5 minutes
});

const OTP = mongoose.model("OTP", otpSchema);

// Verified Users Schema & Model
const verifiedUserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    verifiedAt: { type: Date, default: Date.now }
});

const VerifiedUser = mongoose.model("VerifiedUser", verifiedUserSchema);

// Twilio Client
const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Send OTP
app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }
    
    try {
        let otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.findOneAndUpdate({ phone }, { otp, createdAt: new Date() }, { upsert: true });
        console.log(`📨 OTP for ${phone}: ${otp}`);

        await client.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
        });

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("🔴 Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
    }
    
    try {
        const existingOtp = await OTP.findOne({ phone, otp });
        if (!existingOtp) {
            console.log("❌ Invalid OTP for:", phone);
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        
        await OTP.deleteOne({ phone });
        await VerifiedUser.updateOne(
            { phone },
            { $set: { phone, verifiedAt: new Date() } },
            { upsert: true }
        );
        
        console.log("✅ Phone number verified:", phone);
        res.json({ success: true, message: "Phone number verified!" });
    } catch (error) {
        console.error("🔴 Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "OTP verification failed" });
    }
});

// Root Route
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

