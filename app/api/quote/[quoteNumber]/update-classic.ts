import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateClassicQuoteSchema } from "@/validation/quoteValidation";


export async function PUT(req: NextRequest) {
  const data = await req.json();
  // const { id, status, isSignedByClient, signatureDate } = data;

  // Mapping of french statuts to english
  const statusMapping: Record<string, string> = {
    "Prêt à l'envoi": "Ready to be send",
    "Envoyé": "Sent",
    "Accepté": "Accepted",
    "Refusé": "Refused",
  };

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
      const validatedData = parsedData.data;
            
      // Ajoute le statut aux données validées
      data.id = id;
    // construct dynamically update's object
    const updateData: Record<string, any> = {};

    // status conversion
    if (status !== null) {
        const mappedStatus = statusMapping[status];
        if (mappedStatus) {
            updateData.status = mappedStatus;
        } else {
            return new NextResponse("Invalid status value", { status: 400 });
        }
    }

    if (validatedData.isSignedByClient !== null) {
        updateData.isSignedByClient = validatedData.isSignedByClient === "Oui";
      }
    if (validatedData.signatureDate !== null){
        const parsedDate = new Date(validatedData.signatureDate);
        updateData.signatureDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedQuote = await db.quote.update({
      where: { id: id },
      data: updateData,
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

    return NextResponse.json({ updatedQuote }, { status: 200 });
  } catch (error) {
    console.error("Error with quote's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
