import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { updateUnitSchema } from "@/validation/unitValidation";
import { sanitizeData } from "@/lib/sanitize"; 

export async function PATCH(req: NextRequest, {params}: {params: {unitId: string}}) {
    const data = await req.json();
    
    const resolvedParams = await params;
    
    const unitId = resolvedParams.unitId;
    const user = await currentUser()
  

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const unit = await db.unit.findUnique({
      where: { id: unitId },
    });
  
    if (!unit) {
      return new NextResponse("Unité introuvable", { status: 404 });
    }


  try {

    // Validation avec Zod
    const parsedData = updateUnitSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
              console.log("id de l'unité : "+unitId)      
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    const updatedUnit = await db.unit.update({
        where: { id: unitId },
        data: sanitizedData,
      });

      return NextResponse.json({ success: true, unit: updatedUnit });

  } catch (error) {
    console.error("Error with unit's update", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
