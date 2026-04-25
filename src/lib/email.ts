import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USERNAME ||
    !process.env.EMAIL_PASSWORD
  ) {
    console.log("Email env are not available");
    return;
  }

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
