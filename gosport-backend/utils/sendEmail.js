const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

function createMailContent({ name, intro, instructions, buttonText, link, outro }) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "GoSport",
      link: process.env.FRONTEND_URL || "http://localhost:3000",
    },
  });

  const email = {
    body: {
      name: name || "there",
      intro,
      action: {
        instructions,
        button: {
          color: "#7C6AF7",
          text: buttonText,
          link,
        },
      },
      outro,
    },
  };

  return {
    html: mailGenerator.generate(email),
    text: mailGenerator.generatePlaintext(email),
  };
}

async function sendEmail({ to, name, subject, intro, instructions, buttonText, link, outro }) {
  const { html, text } = createMailContent({ name, intro, instructions, buttonText, link, outro });

  // 1. Primary: Resend HTTPS API (Works 100% on Render, Vercel, and Cloud - Port 443)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.MAIL_FROM || "GoSport <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message || "Failed to send email via Resend API");
    }

    return data;
  }

  // 2. Fallback: Nodemailer SMTP
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("No email provider configured. Please set RESEND_API_KEY in environment variables.");
  }

  const port = Number(SMTP_PORT) || 587;
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: isSecure,
    family: 4,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };
