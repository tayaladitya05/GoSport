const { Resend } = require("resend");
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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured in server environment variables.");
  }

  const { html, text } = createMailContent({ name, intro, instructions, buttonText, link, outro });
  const resend = new Resend(apiKey);
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
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return data;
}

module.exports = { sendEmail };
