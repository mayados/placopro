import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createUserSchema } from "@/validation/userValidation";
import { sanitizeData } from "@/lib/sanitize";
import { generateSlug } from "@/lib/utils";
import nodemailer from "nodemailer";
// For token's signature
import { SignJWT } from 'jose'; 

// Create a signed token which includes userId
async function createSecureToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.CLERK_SECRET_KEY || 'fallback-secret');
  
  // create token
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
    
  return token;
}

// send email invitation
async function sendInvitationEmail(email: string, link: string, firstName: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
  
  await transporter.sendMail({
    from: `"Placopro" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Définis ton mot de passe",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Bienvenue sur ton espace intranet Placopro ! Clique sur le lien ci-dessous pour te connecter et définir ton mot de passe :</p>
      <p><a href="${link}">${link}</a></p>
      <p>Ce lien est à usage unique.</p>
    `,
  });
}

type ClerkUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // validate datas with zod
    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Erreurs de validation :", parsed.error.format());
      return NextResponse.json(
        { success: false, message: parsed.error.errors },
        { status: 400 }
      );
    }
    
    const sanitized: ClerkUserParams = sanitizeData(parsed.data);
    const { firstName, lastName, email, role } = sanitized;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Adresse email requise." },
        { status: 400 }
      );
    }
    
    const slug = generateSlug(`${lastName.toLowerCase()}-${firstName.toLowerCase()}`);
    
    // Creation of clerk user
    const clerk = await clerkClient();
    
    console.log("mail : " + email);
    
    // Creation of user without password
    const user = await clerk.users.createUser({
      firstName,
      lastName,
      emailAddress: [email],
      skipPasswordRequirement: true,
      publicMetadata: { role, slug },
    });
    
    // Create our own secure token which contains userId
    const secureToken = await createSecureToken(user.id);
    
    // Generate link with the secure token
    const link = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/set-password?token=${secureToken}`;
    
    // Send invitation email with link
    await sendInvitationEmail(email, link, firstName);
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        role: role,
        slug: slug
      }
    });
  } catch (err) {
    console.error(" Erreur lors de la création :", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}