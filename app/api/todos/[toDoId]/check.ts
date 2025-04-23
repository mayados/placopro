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

    if(currentToDo?.isChecked === false){
      console.log("le to do actuel n'est pas checked donc on doit le checked")
       updatedToDo = await db.toDo.update({
          where: { id: toDoId },
          data: { isChecked: true },
        });      
    }else{
      console.log("le to do actuel est checked. Donc on doit le unchecked")

      updatedToDo = await db.toDo.update({
        where: { id: toDoId },
        data: { isChecked: false },
      });        
    }

      return NextResponse.json({ success: true, toDo: updatedToDo });

  } catch (error) {
    console.error("Error with to do's check:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
