
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const EligibleStudent = require("./eligibleStudent");
const router = express.Router();

const otpRecords = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

function normalizeEmail(email) {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashOtp(email, otp) {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}`)
    .digest("hex");
}


// SEND OTP
router.post("/send", async (req, res) => {
  try {
    const { name, registerNumber, email } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (
      typeof name !== "string" ||
      typeof registerNumber !== "string" ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Please provide valid student details."
      });
    }

   


// Check Admin uploaded student details
const normalizedRegisterNumber = registerNumber.trim().toUpperCase();
console.log("Searching register number:", normalizedRegisterNumber);
console.log("MongoDB collection:", EligibleStudent.collection.name);
const eligible = await EligibleStudent.findOne({
  registerNumber: normalizedRegisterNumber
});

const nameMatched =
  eligible &&
  eligible.studentName.trim().toLowerCase() === name.trim().toLowerCase();

const emailMatched =
  eligible &&
  normalizeEmail(eligible.email) === normalizedEmail;

console.log("OTP eligibility check:", {
  studentFound: !!eligible,
  nameMatched,
  emailMatched,
  alreadyRegistered: eligible?.isRegistered
});

if (
  !eligible ||
  !nameMatched ||
  !emailMatched ||
  eligible.isRegistered
) {
  return res.status(403).json({
    message: "Student details could not be verified."
  });
}




    // OTP goes to the email stored by Admin
    const existing = otpRecords.get(normalizedEmail);
    const now = Date.now();

    if (
      existing &&
      now - existing.lastSentAt < RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        message: "Please wait 60 seconds before resending OTP."
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

 await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: eligible.email,
  subject: "Student Project Analyzer - Email Verification",
  text: `Your verification OTP is ${otp}. It expires in 5 minutes. Do not share this code.`
});

otpRecords.set(normalizedEmail, {
  otpHash: hashOtp(normalizedEmail, otp),
  expiresAt: now + OTP_EXPIRY_MS,
  lastSentAt: now,
  attempts: 0,
  verified: false
});

    return res.json({
      message: "OTP sent to your registered email."
    });

  } catch (error) {
    console.error("OTP send error:", error.message);

    return res.status(500).json({
      message: "Unable to send OTP. Please try again."
    });
  }
});


// VERIFY OTP
router.post("/verify", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = req.body.otp;

  if (!isValidEmail(email) || !/^\d{6}$/.test(String(otp))) {
    return res.status(400).json({
      message: "Valid email and 6-digit OTP are required.",
    });
  }

  const record = otpRecords.get(email);

  if (!record) {
    return res.status(400).json({
      message: "Please request an OTP first.",
    });
  }

  if (Date.now() > record.expiresAt) {
    otpRecords.delete(email);
    return res.status(400).json({
      message: "OTP expired. Please request a new OTP.",
    });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpRecords.delete(email);
    return res.status(429).json({
      message: "Too many attempts. Request a new OTP.",
    });
  }

  const suppliedHash = hashOtp(email, String(otp));

  const matches = crypto.timingSafeEqual(
    Buffer.from(suppliedHash, "hex"),
    Buffer.from(record.otpHash, "hex")
  );

  if (!matches) {
    record.attempts += 1;

    return res.status(400).json({
      message: "Incorrect OTP.",
    });
  }

  record.verified = true;
  record.otpHash = null;

  return res.json({
    message: "Email verified successfully.",
    verified: true,
  });
});

// CHECK VERIFICATION DURING REGISTRATION
function consumeVerifiedEmail(email) {
  const normalized = normalizeEmail(email);
  const record = otpRecords.get(normalized);

  if (
    !record ||
    !record.verified ||
    Date.now() > record.expiresAt
  ) {
    return false;
  }

  otpRecords.delete(normalized);
  return true;
}

module.exports = {
  otpRouter: router,
  consumeVerifiedEmail,
};
