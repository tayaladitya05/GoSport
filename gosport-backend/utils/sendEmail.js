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

async function sendEmail({ to, name, subject, intro, instructions, buttonText, link, outro }) {
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

  const html = mailGenerator.generate(email);
  const text = mailGenerator.generatePlaintext(email);

  await createTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };
