import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token ou mot de passe manquant.' }, { status: 400 });
    }

    console.log("le token reçu : " + JSON.stringify(token));

    // Vérify token and extract userId
    const secret = new TextEncoder().encode(process.env.CLERK_SECRET_KEY || 'fallback-secret');
    
    try {
      // Verify token
      const { payload } = await jwtVerify(token, secret);
      
      // Extraction of userId of payload verified
      const userId = payload.userId as string;
      
      if (!userId) {
        throw new Error("ID utilisateur non trouvé dans le token");
      }
      
      // Obtain clerkClient instance
      const clerk = await clerkClient();
      
      // Update password 
      await clerk.users.updateUser(userId, {
        password,
      });
      
      return NextResponse.json({ success: true });
    } catch (tokenError) {
      console.error("Erreur de vérification du token:", tokenError);
      return NextResponse.json({
        success: false,
        error: "Token invalide ou expiré",
        details: tokenError instanceof Error ? tokenError.message : "Erreur inconnue"
      }, { status: 401 });
    }
  } catch (err) {
    console.error("Erreur set-password:", err);
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la mise à jour du mot de passe",
      details: err instanceof Error ? err.message : "Erreur inconnue"
    }, { status: 500 });
  }
}