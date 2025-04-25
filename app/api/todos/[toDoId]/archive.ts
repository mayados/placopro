import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const toDoId = data.toDoId

  const user = await currentUser();

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

    const currentToDo = await db.toDo.findUnique({
      where: {id: toDoId}
    });

    let updatedToDo;

    if(currentToDo?.isArchived === false){
       updatedToDo = await db.toDo.update({
          where: { id: toDoId },
          data: { isArchived: true },
        });      
    }else{
      updatedToDo = await db.toDo.update({
        where: { id: toDoId },
        data: { isArchived: false },
      });  

    }

      return NextResponse.json({ success: true, toDo: updatedToDo });

  } catch (error) {
    console.error("Error with to do's check:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
