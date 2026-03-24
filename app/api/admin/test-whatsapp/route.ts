import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!sid || !token) {
    return NextResponse.json({ error: "Twilio credentials not set in .env" }, { status: 500 });
  }

  // Normalise phone
  const digits = phone.replace(/\D/g, "");
  let e164 = digits;
  if (digits.startsWith("91") && digits.length === 12) e164 = `+${digits}`;
  else if (digits.length === 10) e164 = `+91${digits}`;
  else e164 = `+${digits}`;

  const to = `whatsapp:${e164}`;

  try {
    const client = twilio(sid, token);
    const msg = await client.messages.create({
      from,
      to,
      body: "✅ Test message from Le Rox Home-Stay booking system. WhatsApp integration is working!",
    });
    return NextResponse.json({ success: true, sid: msg.sid, to, from, status: msg.status });
  } catch (err: any) {
    console.error("Twilio test error:", err);
    return NextResponse.json({
      error: err?.message || "Twilio error",
      code: err?.code,
      moreInfo: err?.moreInfo,
    }, { status: 500 });
  }
}
