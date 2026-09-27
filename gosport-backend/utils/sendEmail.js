const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in server environment variables.");
  }

  const isGmail = !SMTP_HOST || SMTP_HOST.toLowerCase().includes("gmail");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
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
