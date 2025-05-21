import { NextRequest, NextResponse } from 'next/server';
import { ContactFormValidationSchema } from '@/validation/contactFormValidation';
import { sendMail } from '@/lib/mail/send-mail';

export async function POST(req: NextRequest) {
  try {
    const data = ContactFormValidationSchema.parse(await req.json());

    // Honeypot : vérif côté serveur
    if (data.honeyPot) {
      return NextResponse.json({ error: 'Bot détecté.' }, { status: 400 });
    }

    const adminHtml = `
      <h2>Nouveau message</h2>
      <p><b>Nom :</b> ${data.firstName} ${data.lastName}</p>
      <p><b>Email :</b> ${data.email}</p>
      <p><b>Tél :</b> ${data.phone}</p>
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
    `;

    const userHtml = `
      <p>Bonjour ${data.firstName},</p>
      <p>Nous avons bien reçu votre message et reviendrons vers vous rapidement.</p>
      <p>— L’équipe Placopro</p>
    `;

    await Promise.all([
      sendMail({
        to: `${process.env.SMTP_USER}`,
        subject: 'Nouveau message via Placopro',
        html: adminHtml,
      }),
      sendMail({
        to: data.email,
        subject: 'Accusé de réception • Placopro',
        html: userHtml,
      }),
    ]);

    console.log("deux mails envoyés")

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
