import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { updateVatRateSchema } from "@/validation/vatRateValidation";
import { sanitizeData } from "@/lib/sanitize"; 

export async function PATCH(req: NextRequest, {params}: {params: {vatRateId: string}}) {
    const data = await req.json();
    
    const resolvedParams = await params;
    
    const vatRateId = resolvedParams.vatRateId;
    const user = await currentUser()
  

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const vatRate = await db.vatRate.findUnique({
      where: { id: vatRateId },
    });
  
    if (!vatRate) {
      return new NextResponse("Unité introuvable", { status: 404 });
    }


  try {

    // Validation avec Zod
    const parsedData = updateVatRateSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
              console.log("id de l'unité : "+vatRateId)      
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    const updatedVatRate = await db.vatRate.update({
        where: { id: vatRateId },
        data: sanitizedData,
      });

      return NextResponse.json(updatedVatRate);

  } catch (error) {
    console.error("Error with unit's update", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
