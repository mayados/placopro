import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updatePlanningSchema } from "@/validation/planningValidation";


export async function PUT(req: NextRequest) {
  const data = await req.json();
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
        const validatedData = parsedData.data;
    // construct dynamically update's object
    const updateData: Record<string, any> = {};


    // console.log("start : "+start)
    // console.log("end : "+end)
    // console.log("title : "+title)
    // console.log("clerkUserId : "+clerkUserId)
    // console.log("workSiteId : "+workSiteId)
    console.log("id : "+id)
    if (validatedData.start !== null){
        updateData.startTime = new Date(validatedData.start)
        console.log("start n'est pas null")
    }

    if (validatedData.end !== null){
        updateData.endTime = new Date(validatedData.end)
        console.log("end n'est pas null")

    }

    if (validatedData.clerkUserId !== null){
        updateData.clerkUserId = validatedData.clerkUserId
        console.log("cler user id n'est pas null")

    }

    if (validatedData.title !== null){
        updateData.task = validatedData.title
        console.log("title n'est pas null")

    }

    if (validatedData.workSiteId !== null){
        updateData.workSiteId = validatedData.workSiteId
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
