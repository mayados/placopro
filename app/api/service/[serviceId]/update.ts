import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { updateServiceSchema } from "@/validation/serviceValidation";
import { sanitizeData } from "@/lib/sanitize"; 

export async function PATCH(req: NextRequest, {params}: {params: {serviceId: string}}) {
    const data = await req.json();
    
    const resolvedParams = await params;
    
    const serviceId = resolvedParams.serviceId;
    const user = await currentUser()
  

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });
  
    if (!service) {
      return new NextResponse("Service introuvable", { status: 404 });
    }


  try {

    // Validation avec Zod
    const parsedData = updateServiceSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
              console.log("id de service : "+serviceId)      
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    const updatedService = await db.service.update({
        where: { id: serviceId },
        data: sanitizedData,
      });

      return NextResponse.json(updatedService);

  } catch (error) {
    console.error("Error with service's update", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
