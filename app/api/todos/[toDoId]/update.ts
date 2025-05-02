import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { updateClassicToDoSchema } from "@/validation/toDoValidation";
import { sanitizeData } from "@/lib/sanitize"; 

export async function PATCH(req: NextRequest, {params}: {params: {toDoId: string}}) {
    const data = await req.json();
    
    const resolvedParams = await params;
    
    const toDoId = resolvedParams.toDoId;
    const user = await currentUser()
  

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const toDo = await db.toDo.findUnique({
      where: { id: toDoId },
      select: { authorClerkId: true },
    });
  
    if (!toDo) {
      return new NextResponse("To do introuvable", { status: 404 });
    }
  
    if (toDo.authorClerkId !== user.id) {
      return new NextResponse("Accès interdit", { status: 403 });
    }

  try {

    // Validation avec Zod
    const parsedData = updateClassicToDoSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
              console.log("id du todo : "+toDoId)      
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    const updatedToDo = await db.toDo.update({
        where: { id: toDoId },
        data: sanitizedData,
      });

      return NextResponse.json({ success: true, toDo: updatedToDo });

  } catch (error) {
    console.error("Error with to do's check:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
