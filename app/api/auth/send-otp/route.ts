import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Delete any existing OTP for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    // Store hashed OTP
    await prisma.verificationToken.create({
      data: { identifier: email, token: hashedOtp, expires },
    });

    // Always log to terminal for dev/testing
    console.log("\n========================================");
    console.log("🔐  OTP LOGIN");
    console.log(`📧  Email: ${email}`);
    console.log(`🔢  OTP:   ${otp}`);
    console.log(`⏰  Expires in 10 minutes`);
    console.log("========================================\n");

    // Attempt SMTP delivery
    try {
      const transport = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM || "leroxstay@gmail.com",
        subject: "Your OTP for Le Rox Home-Stay",
        text: `Your OTP is: ${otp}\n\nValid for 10 minutes. Do not share this with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px;">
            <h2 style="color:#1a1a2e;margin-bottom:8px;">Le Rox Home-Stay</h2>
            <p style="color:#555;margin-bottom:16px;">Your one-time password (OTP) for sign in:</p>
            <div style="background:#fff;border:2px solid #2563eb;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;">${otp}</span>
            </div>
            <p style="color:#888;font-size:13px;">Valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
          </div>
        `,
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (err: any) {
      console.log(`⚠️  SMTP failed — use terminal OTP above to log in.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
