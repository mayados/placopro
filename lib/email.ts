import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  text,
  pdfBuffer,
  pdfFilename
}: {
  to: string;
  subject: string;
  text: string;
  pdfBuffer: Buffer;
  pdfFilename: string; 
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
