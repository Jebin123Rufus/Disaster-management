require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/otp_verification")
    .then(() => console.log("Connected to Local MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// OTP Schema & Model
const otpSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, expires: 300, default: Date.now } // Auto-delete after 5 minutes
});

const OTP = mongoose.model("OTP", otpSchema);

// Twilio Client
const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    if (!phone.match(/^\d{10}$/)) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    try {
        let existingOtp = await OTP.findOne({ phone });

        if (existingOtp) {
            console.log(`Reusing existing OTP for ${phone}:`, existingOtp.otp);
        } else {
            const otp = Math.floor(100000 + Math.random() * 900000);
            existingOtp = await OTP.create({ phone, otp });
            console.log(`Generated new OTP for ${phone}:`, otp);
        }

        await client.messages.create({
            body: `Your OTP code is ${existingOtp.otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
        });

        res.json({ success: true, message: "OTP sent!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(5001, () => console.log("Server running on port 5001"));

