import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "JustDoStuff <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`[Email Skipped - No API Key] To: ${to}, Subject: ${subject}`);
    return { success: true, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error]", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email Error]", err);
    return { success: false, error: err };
  }
}

// ─── Email Templates ───

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <!-- Header -->
        <div style="background:#18181b;padding:24px 32px;">
          <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
            Just<span style="color:#3b82f6;">Do</span>Stuff
          </span>
        </div>
        <!-- Content -->
        <div style="padding:32px;">
          ${content}
        </div>
        <!-- Footer -->
        <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">
            You received this email because of your JustDoStuff account.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buttonHtml(text: string, url: string) {
  return `
    <a href="${url}" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0;">
      ${text}
    </a>
  `;
}

export function bookingRequestedEmail(params: {
  providerName: string;
  seekerName: string;
  experienceTitle: string;
  date: string;
  time: string;
  bookingsUrl: string;
}) {
  return {
    subject: `New booking request: ${params.experienceTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">New Booking Request!</h2>
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;">
        Hi ${params.providerName}, you have a new booking request.
      </p>
      <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Experience:</strong> ${params.experienceTitle}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Seeker:</strong> ${params.seekerName}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Date:</strong> ${params.date}</p>
        <p style="margin:0;font-size:14px;"><strong>Time:</strong> ${params.time}</p>
      </div>
      <p style="margin:0 0 16px;color:#71717a;font-size:14px;">
        Please confirm or decline this booking at your earliest convenience.
      </p>
      ${buttonHtml("View Bookings", params.bookingsUrl)}
    `),
  };
}

export function bookingConfirmedEmail(params: {
  seekerName: string;
  providerName: string;
  experienceTitle: string;
  date: string;
  time: string;
  bookingsUrl: string;
}) {
  return {
    subject: `Booking confirmed: ${params.experienceTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Booking Confirmed! 🎉</h2>
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;">
        Hi ${params.seekerName}, great news! Your booking has been confirmed.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Experience:</strong> ${params.experienceTitle}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Provider:</strong> ${params.providerName}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Date:</strong> ${params.date}</p>
        <p style="margin:0;font-size:14px;"><strong>Time:</strong> ${params.time}</p>
      </div>
      <p style="margin:0 0 16px;color:#71717a;font-size:14px;">
        Make sure to arrive on time. You can message your provider for any questions.
      </p>
      ${buttonHtml("View Booking Details", params.bookingsUrl)}
    `),
  };
}

export function bookingDeclinedEmail(params: {
  seekerName: string;
  experienceTitle: string;
  date: string;
  exploreUrl: string;
}) {
  return {
    subject: `Booking update: ${params.experienceTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Booking Update</h2>
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;">
        Hi ${params.seekerName}, unfortunately your booking for <strong>${params.experienceTitle}</strong> on ${params.date} was declined by the provider.
      </p>
      <p style="margin:0 0 16px;color:#71717a;font-size:14px;">
        Don't worry — there are plenty of other amazing experiences to explore!
      </p>
      ${buttonHtml("Browse More Experiences", params.exploreUrl)}
    `),
  };
}

export function verificationSubmittedEmail(params: {
  userName: string;
}) {
  return {
    subject: "Verification request received",
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Verification Request Received</h2>
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;">
        Hi ${params.userName}, we've received your verification request.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;color:#1e40af;">
          Our team will review your information within 24-48 hours. You'll receive an email once your profile is verified.
        </p>
      </div>
      <p style="margin:0;color:#71717a;font-size:14px;">
        In the meantime, you can continue using JustDoStuff. A verified badge will appear on your profile once approved.
      </p>
    `),
  };
}

export function verificationApprovedEmail(params: {
  userName: string;
  dashboardUrl: string;
}) {
  return {
    subject: "You're verified! ✓",
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">You're Verified! ✓</h2>
      <p style="margin:0 0 20px;color:#71717a;font-size:14px;">
        Congratulations ${params.userName}! Your profile has been verified.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;color:#166534;">
          A verified badge will now appear on your profile and experience listings, helping build trust with seekers.
        </p>
      </div>
      ${buttonHtml("Go to Dashboard", params.dashboardUrl)}
    `),
  };
}
