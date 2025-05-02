import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updatePlanningSchema } from "@/validation/planningValidation";
import { sanitizeData } from "@/lib/sanitize"; 


export async function PUT(req: NextRequest) {
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    return new Response("Invalid CSRF token", { status: 403 });
  }
  // const { id, start, end, title, clerkUserId, workSiteId } = data;
  console.log("datas reçues :  "+JSON.stringify(data))
  try {

        const { id, ...dataWithoutId } = data;
        data.id = id;
        
        // Validation avec Zod (sans 'status')
        const parsedData = updatePlanningSchema.safeParse(dataWithoutId);
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


    // console.log("start : "+start)
    // console.log("end : "+end)
    // console.log("title : "+title)
    // console.log("clerkUserId : "+clerkUserId)
    // console.log("workSiteId : "+workSiteId)
    console.log("id : "+id)
    if (sanitizedData.start !== null){
        updateData.startTime = new Date(sanitizedData.start)
        console.log("start n'est pas null")
    }

    if (sanitizedData.end !== null){
        updateData.endTime = new Date(sanitizedData.end)
        console.log("end n'est pas null")

    }

    if (sanitizedData.clerkUserId !== null){
        updateData.clerkUserId = sanitizedData.clerkUserId
        console.log("cler user id n'est pas null")

    }

    if (sanitizedData.title !== null){
        updateData.task = sanitizedData.title
        console.log("title n'est pas null")

    }

    if (sanitizedData.workSiteId !== null){
        updateData.workSiteId = sanitizedData.workSiteId
        console.log("worksietid n'est pas null")

    }

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    console.log("updateData : "+JSON.stringify(updateData))

    // Update in database
    const updatedPlanning = await db.planning.update({
      where: { id: id },
      data: updateData,
      include: {
        workSite: true, 
      },
    });

    // Log détaillé de la réponse
console.log("Updated planning response:", updatedPlanning);

        // Vérifier si la mise à jour a échoué
        if (!updatedPlanning) {
          return new NextResponse("Failed to update planning", { status: 400 });
        }

    return NextResponse.json({ updatedPlanning }, { status: 200 });
  } catch (error) {
    console.error("Error with planning's update in the api:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
