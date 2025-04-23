import { NextRequest, NextResponse } from "next/server";
import { PATCH as checkToDo } from "@/app/api/todos/[toDoId]/check";

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const toDoId = pathname.split("/").pop();

  if (!toDoId) {
    return NextResponse.json({ error: "To do id is required" }, { status: 400 });
  }

  return checkToDo(req);
}

