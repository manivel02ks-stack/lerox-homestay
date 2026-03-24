import nodemailer from "nodemailer";
import { format } from "date-fns";

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

interface BookingConfirmationData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  totalPrice: number;
  advancePaid?: number;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const {
    guestName,
    guestEmail,
    bookingId,
    roomName,
    checkIn,
    checkOut,
    guests,
    nights,
    totalPrice,
    advancePaid,
  } = data;

  const checkInStr   = format(new Date(checkIn),  "EEEE, MMMM dd, yyyy");
  const checkOutStr  = format(new Date(checkOut), "EEEE, MMMM dd, yyyy");
  const shortId      = bookingId.slice(-8).toUpperCase();
  const priceStr     = `₹${totalPrice.toLocaleString("en-IN")}`;
  const advance      = advancePaid ?? Math.round(totalPrice * 0.5);
  const balance      = totalPrice - advance;
  const advanceStr   = `₹${advance.toLocaleString("en-IN")}`;
  const balanceStr   = `₹${balance.toLocaleString("en-IN")}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed – Le Rox Home-Stay</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Le Rox Home-Stay</h1>
            <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">@ Pondicherry</p>
          </td>
        </tr>

        <!-- Green confirmed banner -->
        <tr>
          <td style="background:#dcfce7;padding:18px 40px;text-align:center;border-bottom:1px solid #bbf7d0;">
            <p style="margin:0;color:#15803d;font-size:15px;font-weight:700;">
              ✅ &nbsp;Your Booking is Confirmed!
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">

            <p style="margin:0 0 20px;color:#374151;font-size:15px;">
              Dear <strong>${guestName}</strong>,
            </p>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
              We're delighted to confirm your reservation at <strong>Le Rox Home-Stay</strong>.
              We look forward to welcoming you and making your stay memorable.
            </p>

            <!-- Booking reference -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 20px;text-align:center;">
                  <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
                  <p style="margin:4px 0 0;color:#1d4ed8;font-size:22px;font-weight:700;letter-spacing:2px;">#${shortId}</p>
                </td>
              </tr>
            </table>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              <tr style="background:#f9fafb;">
                <td colspan="2" style="padding:12px 20px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">Reservation Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;width:40%;">Room</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${roomName}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Check-in</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${checkInStr} &nbsp;<span style="color:#6b7280;font-weight:400;">(from 2:00 PM)</span></td>
              </tr>
              <tr>
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Check-out</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${checkOutStr} &nbsp;<span style="color:#6b7280;font-weight:400;">(by 11:00 AM)</span></td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Duration</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${nights} night${nights !== 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Guests</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${guests} guest${guests !== 1 ? "s" : ""}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Total Amount</td>
                <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${priceStr}</td>
              </tr>
              <tr style="background:#eff6ff;">
                <td style="padding:12px 20px;color:#1d4ed8;font-size:13px;font-weight:700;border-bottom:1px solid #bfdbfe;">✅ Advance Paid (50%)</td>
                <td style="padding:12px 20px;color:#1d4ed8;font-size:13px;font-weight:700;border-bottom:1px solid #bfdbfe;">${advanceStr}</td>
              </tr>
              <tr style="background:#fef9c3;">
                <td style="padding:14px 20px;color:#92400e;font-size:14px;font-weight:700;">⚠️ Balance Due at Check-in</td>
                <td style="padding:14px 20px;color:#92400e;font-size:18px;font-weight:700;">${balanceStr}</td>
              </tr>
            </table>

            <!-- Property info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:700;">📍 Property Address</p>
                  <p style="margin:0;color:#78350f;font-size:13px;line-height:1.6;">
                    66, 7th Cross Rd, Nainar Mandapam,<br/>
                    Velrampet, Puducherry – 605004
                  </p>
                  <p style="margin:10px 0 0;color:#78350f;font-size:13px;">
                    📞 <a href="tel:+919342222799" style="color:#78350f;">+91 93422 22799</a>
                    &nbsp;&nbsp;
                    ✉️ <a href="mailto:leroxstay@gmail.com" style="color:#78350f;">leroxstay@gmail.com</a>
                  </p>
                </td>
              </tr>
            </table>

            <!-- Balance due reminder -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:20px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">💰 Balance Payment Reminder</p>
                <p style="margin:0;color:#78350f;font-size:13px;line-height:1.7;">
                  You have paid <strong>${advanceStr}</strong> as advance (50%). The remaining balance of
                  <strong>${balanceStr}</strong> is to be paid at the time of Check-in at the property.
                  We accept Cash and UPI payments.
                </p>
              </td></tr>
            </table>

            <!-- Cancellation note -->
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
              <strong style="color:#374151;">Cancellation Policy:</strong>
              Free cancellation up to 24 hours before check-in. After that, a one-night fee applies.
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
              If you have any questions, feel free to reach out to us at
              <a href="mailto:leroxstay@gmail.com" style="color:#2563eb;">leroxstay@gmail.com</a>
              or call us at <a href="tel:+919342222799" style="color:#2563eb;">+91 93422 22799</a>.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © ${new Date().getFullYear()} Le Rox Home-Stay, Pondicherry. All rights reserved.
            </p>
            <p style="margin:6px 0 0;color:#d1d5db;font-size:11px;">
              This is an automated confirmation email. Please do not reply directly to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
  `;

  const text = `
Booking Confirmed – Le Rox Home-Stay

Dear ${guestName},

Your booking is confirmed! Reference: #${shortId}

Room: ${roomName}
Check-in:  ${checkInStr} (from 2:00 PM)
Check-out: ${checkOutStr} (by 11:00 AM)
Duration:  ${nights} night${nights !== 1 ? "s" : ""}
Guests:    ${guests}
Total:     ${priceStr}

PAYMENT SUMMARY:
  Advance Paid (50%):       ${advanceStr}  [Paid online]
  Balance Due at Check-in:  ${balanceStr}  [Cash / UPI at property]

Address: 66, 7th Cross Rd, Nainar Mandapam, Velrampet, Puducherry – 605004
Phone: +91 93422 22799
Email: leroxstay@gmail.com

We look forward to welcoming you!
Le Rox Home-Stay
  `.trim();

  const transport = getTransport();
  await transport.sendMail({
    from: `"Le Rox Home-Stay" <${process.env.EMAIL_FROM || "leroxstay@gmail.com"}>`,
    to: guestEmail,
    subject: `✅ Booking Confirmed – #${shortId} | Le Rox Home-Stay`,
    text,
    html,
  });

  console.log(`✅ Confirmation email sent to ${guestEmail} for booking #${shortId}`);
}

// ── Cancellation email ────────────────────────────────────────────────────────

interface BookingCancellationData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
}

export async function sendBookingCancellation(data: BookingCancellationData) {
  const { guestName, guestEmail, bookingId, roomName, checkIn, checkOut, totalPrice } = data;

  const checkInStr  = format(new Date(checkIn),  "EEEE, MMMM dd, yyyy");
  const checkOutStr = format(new Date(checkOut), "EEEE, MMMM dd, yyyy");
  const shortId     = bookingId.slice(-8).toUpperCase();
  const priceStr    = `₹${totalPrice.toLocaleString("en-IN")}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Booking Cancelled – Le Rox Home-Stay</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Le Rox Home-Stay</h1>
      <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">@ Pondicherry</p>
    </td></tr>

    <!-- Red cancelled banner -->
    <tr><td style="background:#fee2e2;padding:18px 40px;text-align:center;border-bottom:1px solid #fecaca;">
      <p style="margin:0;color:#b91c1c;font-size:15px;font-weight:700;">❌ &nbsp;Your Booking has been Cancelled</p>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:36px 40px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">Dear <strong>${guestName}</strong>,</p>
      <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
        We regret to inform you that your booking at <strong>Le Rox Home-Stay</strong> has been cancelled.
        If you believe this is a mistake or need assistance, please contact us immediately.
      </p>

      <!-- Booking reference -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 20px;text-align:center;">
          <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
          <p style="margin:4px 0 0;color:#dc2626;font-size:22px;font-weight:700;letter-spacing:2px;">#${shortId}</p>
        </td></tr>
      </table>

      <!-- Details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
        <tr style="background:#f9fafb;"><td colspan="2" style="padding:12px 20px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">Cancelled Reservation</p>
        </td></tr>
        <tr><td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;width:40%;">Room</td>
            <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${roomName}</td></tr>
        <tr style="background:#fafafa;"><td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Check-in</td>
            <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${checkInStr}</td></tr>
        <tr><td style="padding:12px 20px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">Check-out</td>
            <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${checkOutStr}</td></tr>
        <tr style="background:#fafafa;"><td style="padding:12px 20px;color:#6b7280;font-size:13px;">Amount</td>
            <td style="padding:12px 20px;color:#111827;font-size:13px;font-weight:600;">${priceStr}</td></tr>
      </table>

      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
        To make a new booking or for any queries, please contact us:
      </p>
      <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
        📞 <a href="tel:+919342222799" style="color:#2563eb;">+91 93422 22799</a>
        &nbsp;&nbsp;
        ✉️ <a href="mailto:leroxstay@gmail.com" style="color:#2563eb;">leroxstay@gmail.com</a>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Le Rox Home-Stay, Pondicherry. All rights reserved.</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  const text = `Booking Cancelled – Le Rox Home-Stay\n\nDear ${guestName},\n\nYour booking #${shortId} for ${roomName} (${checkInStr} – ${checkOutStr}) has been cancelled.\n\nFor queries: leroxstay@gmail.com | +91 93422 22799\n\nLe Rox Home-Stay`;

  const transport = getTransport();
  await transport.sendMail({
    from: `"Le Rox Home-Stay" <${process.env.EMAIL_FROM || "leroxstay@gmail.com"}>`,
    to: guestEmail,
    subject: `❌ Booking Cancelled – #${shortId} | Le Rox Home-Stay`,
    text,
    html,
  });

  console.log(`❌ Cancellation email sent to ${guestEmail} for booking #${shortId}`);
}

// ── Completion / Thank-you email ──────────────────────────────────────────────

interface BookingCompletionData {
  guestName: string;
  guestEmail: string;
  bookingId: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
}

export async function sendBookingCompletion(data: BookingCompletionData) {
  const { guestName, guestEmail, bookingId, roomName, checkIn, checkOut } = data;

  const checkInStr  = format(new Date(checkIn),  "MMMM dd, yyyy");
  const checkOutStr = format(new Date(checkOut), "MMMM dd, yyyy");
  const shortId     = bookingId.slice(-8).toUpperCase();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Thank You – Le Rox Home-Stay</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Le Rox Home-Stay</h1>
      <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">@ Pondicherry</p>
    </td></tr>

    <!-- Thank you banner -->
    <tr><td style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);padding:28px 40px;text-align:center;border-bottom:1px solid #bbf7d0;">
      <p style="margin:0 0 6px;font-size:32px;">🙏</p>
      <p style="margin:0;color:#15803d;font-size:18px;font-weight:700;">Thank You for Staying with Us!</p>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:36px 40px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;">Dear <strong>${guestName}</strong>,</p>

      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.8;">
        Thank you for your stay in <strong>Le Rox Home-Stay</strong>.
        We hope that your stay was happy and comfortable with Le Rox.
      </p>

      <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.8;">
        It was truly a pleasure having you with us at our home in Pondicherry.
        We hope the warm hospitality, the serene surroundings, and the comforts of
        <strong>${roomName}</strong> made your time with us truly special.
      </p>

      <!-- Stay summary card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:28px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 12px;color:#15803d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Your Stay Summary</p>
          <p style="margin:0 0 6px;color:#374151;font-size:13px;">🏠 &nbsp;<strong>${roomName}</strong></p>
          <p style="margin:0 0 6px;color:#374151;font-size:13px;">📅 &nbsp;${checkInStr} → ${checkOutStr}</p>
          <p style="margin:0;color:#6b7280;font-size:12px;">Booking Ref: <strong style="color:#374151;">#${shortId}</strong></p>
        </td></tr>
      </table>

      <!-- Come back soon -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:28px;">
        <tr><td style="padding:20px 24px;text-align:center;">
          <p style="margin:0 0 8px;color:#1d4ed8;font-size:15px;font-weight:700;">We'd Love to See You Again! 💙</p>
          <p style="margin:0;color:#3b82f6;font-size:13px;line-height:1.7;">
            Next time you plan a visit to Pondicherry, Le Rox Home-Stay will be here<br/>
            to welcome you back with the same warmth and care.
          </p>
        </td></tr>
      </table>

      <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
        For bookings or enquiries:<br/>
        📞 <a href="tel:+919342222799" style="color:#2563eb;">+91 93422 22799</a>
        &nbsp;&nbsp;
        ✉️ <a href="mailto:leroxstay@gmail.com" style="color:#2563eb;">leroxstay@gmail.com</a>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">Le Rox Home-Stay</p>
      <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">66, 7th Cross Rd, Nainar Mandapam, Velrampet, Puducherry – 605004</p>
      <p style="margin:0;color:#d1d5db;font-size:11px;">© ${new Date().getFullYear()} Le Rox Home-Stay. All rights reserved.</p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  const text = `Thank You for Your Stay – Le Rox Home-Stay\n\nDear ${guestName},\n\nThank you for your stay in Le Rox Home-Stay. We hope that your stay was happy and comfortable with Le Rox.\n\nWe look forward to welcoming you again!\n\nLe Rox Home-Stay\n66, 7th Cross Rd, Nainar Mandapam, Velrampet, Puducherry – 605004\n+91 93422 22799 | leroxstay@gmail.com`;

  const transport = getTransport();
  await transport.sendMail({
    from: `"Le Rox Home-Stay" <${process.env.EMAIL_FROM || "leroxstay@gmail.com"}>`,
    to: guestEmail,
    subject: `🙏 Thank You for Your Stay – Le Rox Home-Stay`,
    text,
    html,
  });

  console.log(`🙏 Completion email sent to ${guestEmail} for booking #${shortId}`);
}
