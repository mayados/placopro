import { NextRequest, NextResponse } from "next/server";
import { generateQuotePDF } from '@/lib/pdf-quote'; 
import { sendEmail } from '@/lib/email'; 
import { db } from "@/lib/db";



export async function POST(req: NextRequest) {
//   const { slug, clientEmail } = await req.json();
  const data = await req.json();
const slug = data.quoteSlug
console.log("le slug de data : "+slug)
const clientEmail = data.emailClient
console.log("le mail de data : "+clientEmail)

  // Fonction pour récupérer un devis par son slug
async function getQuoteBySlug(slug: string) {
    return db.quote.findUnique({
      where: { slug },
      include: {
          client: true,
          workSite: true,
          services: true
      }
    });
  }
  
  // Fonction pour mettre à jour le statut du devis
  async function updateQuoteStatus(slug: string, status: string) {
    return db.quote.update({
      where: { slug },
      data: { status },
    });
  }
  console.log("slug : "+slug)
  console.log("email : "+clientEmail)
  if (!slug || !clientEmail) {
    console.log("slug ou emails manquants")
    return NextResponse.json({ success: false, message: "Slug ou emails manquants." }, { status: 400 });
}

  try {
    // 1. Récupérer les données du devis
    const devisData = await getQuoteBySlug(slug);
    if (!devisData) {
        return NextResponse.json({ success: false, message: "Devis non trouvé." }, { status: 400 });

    }

    // 2. Générer le PDF du devis
    const pdfBuffer = await generateQuotePDF(devisData);

    // 3. Envoyer l'email avec le PDF en pièce jointe
    const fileName = `devis-${devisData.number}.pdf`;

    await sendEmail({
    to: clientEmail,
    subject: `Votre devis ${devisData.number}`,
    text: 'Veuillez trouver ci-joint votre devis au format PDF.',
    pdfBuffer,
    pdfFilename: fileName,
    });

    // 4. Mettre à jour le statut du devis à "SENT"
    await updateQuoteStatus(slug, 'SENT');

    // Retourner une réponse de succès
    return NextResponse.json({ success: false, message: "Devis envoyé avec succès." }, { status: 200 });

  } catch (error) {
         console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
   
         return NextResponse.json({
               success: false,
               error: error
           }, { status: 500 });
  }
}
