import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function sendMail(opts: { to: string; subject: string; html: string }) {
  return transporter.sendMail({ from: process.env.SMTP_USER, ...opts });
}
