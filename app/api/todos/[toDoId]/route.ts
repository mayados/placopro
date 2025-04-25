import { NextRequest, NextResponse } from "next/server";
import { PATCH as checkOrUncheckToDo } from "@/app/api/todos/[toDoId]/check";
import { PATCH as archiveOrUnarchiveToDo } from "@/app/api/todos/[toDoId]/archive";
import { PATCH as updateClassicToDo } from "@/app/api/todos/[toDoId]/update";
import { PATCH as updateAssignedToDo } from "@/app/api/todos/[toDoId]/update-assigned";
import { DELETE as deleteToDo } from "@/app/api/todos/[toDoId]/delete";

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const toDoId = pathname.split("/").pop();

  if (!toDoId) {
    return NextResponse.json({ error: "To do id is required" }, { status: 400 });
  }

    if (req.headers.get('X-patch-type') === 'archiveOrUnarchive') {
      // Update draft (=all the fields)
      return archiveOrUnarchiveToDo(req);
    }else if(req.headers.get('X-patch-type') === 'update-classic'){
      return updateClassicToDo(req,{ params: { toDoId } });
    }else if(req.headers.get('X-patch-type') === 'update-assigned'){
      return updateAssignedToDo(req,{ params: { toDoId } });
    }

  return checkOrUncheckToDo(req);

}


export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const toDoId = pathname.split("/").pop();
  
    if (!toDoId) {
      return NextResponse.json({ error: "to do is required" }, { status: 400 });
    }
    return deleteToDo(req, { params: { toDoId } });  
  }
