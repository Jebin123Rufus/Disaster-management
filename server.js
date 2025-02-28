require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const otpStore = {}; // Temporary in-memory storage (Use Redis for production)

app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    if (!phone.match(/^\d{10}$/)) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    try {
        // Check if OTP already exists for this number
        if (otpStore[phone]) {
            console.log(`Reusing existing OTP for ${phone}:`, otpStore[phone]);
        } else {
            otpStore[phone] = Math.floor(100000 + Math.random() * 900000); // Generate OTP
            console.log(`Generated new OTP for ${phone}:`, otpStore[phone]);
        }

        await client.messages.create({
            body: `Your OTP code is ${otpStore[phone]}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
        });

        res.json({ success: true, message: "OTP sent!" });

        // Clear OTP after 5 minutes
        setTimeout(() => delete otpStore[phone], 300000);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(5000, () => console.log("Server running on port 5000"));
