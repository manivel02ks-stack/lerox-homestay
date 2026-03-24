import twilio from "twilio";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    console.warn("Twilio credentials not configured — WhatsApp skipped");
    return null;
  }
  return twilio(sid, token);
}

// Normalise phone to E.164 format (+91XXXXXXXXXX)
function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export interface WhatsAppBookingParams {
  guestName:    string;
  guestPhone:   string;
  bookingId:    string;
  roomName:     string;
  checkIn:      Date | string;
  checkOut:     Date | string;
  guests:       number;
  nights:       number;
  totalPrice:   number;
  advancePaid?: number;
}

export async function sendBookingConfirmationWhatsApp(params: WhatsAppBookingParams) {
  const client = getClient();
  if (!client) return;

  const from    = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const to      = `whatsapp:${normalisePhone(params.guestPhone)}`;
  const shortId = params.bookingId.slice(-8).toUpperCase();
  const balance = params.advancePaid != null ? params.totalPrice - params.advancePaid : null;

  const message = [
    `✅ *Booking Confirmed – Le Rox Home-Stay*`,
    ``,
    `Dear ${params.guestName},`,
    `Your reservation has been confirmed!`,
    ``,
    `📋 *Booking Details*`,
    `• Ref: #${shortId}`,
    `• Room: ${params.roomName}`,
    `• Check-in:  ${format(new Date(params.checkIn),  "EEE, dd MMM yyyy")}`,
    `• Check-out: ${format(new Date(params.checkOut), "EEE, dd MMM yyyy")}`,
    `• Guests: ${params.guests} · Nights: ${params.nights}`,
    ``,
    `💳 *Payment Summary*`,
    `• Total Amount: ${formatPrice(params.totalPrice)}`,
    ...(params.advancePaid != null ? [
      `• ✅ Advance Paid: ${formatPrice(params.advancePaid)}`,
      ...(balance && balance > 0 ? [
        `• ⚠️ Balance at Check-in: ${formatPrice(balance)} (Cash/UPI)`,
      ] : []),
    ] : []),
    ``,
    `📍 *Le Rox Home-Stay*`,
    `66, 7th Cross Rd, Velrampet`,
    `Puducherry – 605004`,
    `📞 +91 93422 22799`,
    ``,
    `We look forward to welcoming you! 🙏`,
  ].join("\n");

  await client.messages.create({ from, to, body: message });
}

export async function sendBookingCancellationWhatsApp(params: {
  guestName:  string;
  guestPhone: string;
  bookingId:  string;
  roomName:   string;
  checkIn:    Date | string;
  checkOut:   Date | string;
}) {
  const client = getClient();
  if (!client) return;

  const from    = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const to      = `whatsapp:${normalisePhone(params.guestPhone)}`;
  const shortId = params.bookingId.slice(-8).toUpperCase();

  const message = [
    `❌ *Booking Cancelled – Le Rox Home-Stay*`,
    ``,
    `Dear ${params.guestName},`,
    `Your booking *#${shortId}* for *${params.roomName}* has been cancelled.`,
    ``,
    `• Check-in:  ${format(new Date(params.checkIn),  "EEE, dd MMM yyyy")}`,
    `• Check-out: ${format(new Date(params.checkOut), "EEE, dd MMM yyyy")}`,
    ``,
    `If you have any questions please contact us:`,
    `📞 +91 93422 22799 | leroxstay@gmail.com`,
  ].join("\n");

  await client.messages.create({ from, to, body: message });
}

export async function sendBookingCompletionWhatsApp(params: {
  guestName:  string;
  guestPhone: string;
  bookingId:  string;
  roomName:   string;
}) {
  const client = getClient();
  if (!client) return;

  const from    = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const to      = `whatsapp:${normalisePhone(params.guestPhone)}`;

  const message = [
    `🙏 *Thank You – Le Rox Home-Stay*`,
    ``,
    `Dear ${params.guestName},`,
    `Thank you for your stay at *Le Rox Home-Stay*.`,
    `We hope your stay was happy and comfortable with Le Rox.`,
    ``,
    `We'd love to see you again! Next time you plan a visit to Pondicherry, Le Rox Home-Stay will be here for you.`,
    ``,
    `⭐ If you enjoyed your stay, please leave us a review!`,
    `📞 +91 93422 22799 | leroxstay@gmail.com`,
  ].join("\n");

  await client.messages.create({ from, to, body: message });
}
