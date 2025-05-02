import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateClassicQuoteSchema } from "@/validation/quoteValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { QuoteStatusEnum } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function PUT(req: NextRequest, {params}: {params: {quoteSlug: string}}) {
  const resolvedParams = await params;
  const quoteSlug = resolvedParams.quoteSlug; 

  const data = await req.json();
    // Explicit validation of CSRF token (in addition of the middleware)
    // const csrfToken = req.headers.get("x-csrf-token");
    // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    //   return new Response("Invalid CSRF token", { status: 403 });
    // }
  console.log("data "+JSON.stringify(data))
  // const { id, status, isSignedByClient, signatureDate } = data;

  // Mapping of french statuts to english
  // const statusMapping: Record<string, string> = {
  //   "Prêt à l'envoi": QuoteStatusEnum.READY,
  //   "Envoyé": QuoteStatusEnum.SENT,
  //   "Accepté": QuoteStatusEnum.ACCEPTED,
  //   "Refusé": QuoteStatusEnum.REFUSED,
  //   "Clos" : QuoteStatusEnum.CANCELED
  // };

  const user = await currentUser();
  

  try {

      // Détecter si la facture est enregistrée en tant que "brouillon" ou en "final"
      // Exclure 'status' du schéma de validation Zod
      const { id, ...dataWithoutId } = data;
      console.log(" ID extrait:", id); // Vérifie s'il est bien défini
    
      // Choisir le schéma en fonction du statut (avant ou après validation)
            
      // Validation avec Zod (sans 'status')
      const parsedData = updateClassicQuoteSchema.safeParse(dataWithoutId);
      if (!parsedData.success) {
          console.error("Validation Zod échouée :", parsedData.error.format());
    
          return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
      }
            
    // Validation réussie, traiter les données avec le statut
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
    // Ajoute le statut aux données validées
    sanitizedData.id = id;
            
    // construct dynamically update's object
    const updateData: Record<string, unknown> = {};

    // status conversion
    if (sanitizedData.status !== null) {

            updateData.status = sanitizedData.status;
            console.log("statut sanitize  : "+updateData.status)

    }

    if (sanitizedData.isSignedByClient !== null) {
        updateData.isSignedByClient = sanitizedData.isSignedByClient === "Oui";
      }
    if (sanitizedData.signatureDate !== null){
        const parsedDate = new Date(sanitizedData.signatureDate);
        updateData.signatureDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedQuote = await db.quote.update({
      where: { slug: quoteSlug },
      data: {
        ...updateData,
        updatedAt : new Date().toISOString(),
        modifiedBy: user?.id
      },
      include: {
        client: true, 
        workSite: true,
        services: {
          include: {
            service: true, 
          },
        },
      },
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error("Error with quote's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
