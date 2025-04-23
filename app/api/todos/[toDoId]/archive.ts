import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const toDoId = data.toDoId
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
