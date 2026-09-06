const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function buildVerificationEmail({ name, verifyUrl }) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "GoSport",
      link: process.env.FRONTEND_URL || "http://localhost:3000",
    },
  });

  const email = {
    body: {
      name: name || "Spectator",
      intro: "Welcome to GoSport. Confirm your email to finish creating your spectator account.",
      action: {
        instructions: "Click the button below to verify your email:",
        button: {
          color: "#7C6AF7",
          text: "Verify email",
          link: verifyUrl,
        },
      },
      outro: "This link expires in 24 hours. If you did not sign up, you can ignore this email.",
    },
  };

  return {
    html: mailGenerator.generate(email),
    text: mailGenerator.generatePlaintext(email),
  };
}

async function sendVerificationEmail({ to, name, verifyUrl }) {
  const transporter = createTransporter();
  const { html, text } = buildVerificationEmail({ name, verifyUrl });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Verify your GoSport spectator account",
    text,
    html,
  });
}

module.exports = { sendVerificationEmail };
