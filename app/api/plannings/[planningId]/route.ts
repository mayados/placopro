import { NextRequest, NextResponse } from "next/server";
import { PUT as updatePlanning } from "@/app/api/plannings/[planningId]/update";
import { DELETE as deletePlanning } from "@/app/api/plannings/[planningId]/delete";


export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const planningId = pathname.split("/").pop();

  if (!planningId) {
    return NextResponse.json({ error: "planning id is required" }, { status: 400 });
  }

  return updatePlanning(req);
}

export async function DELETE(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const planningId = pathname.split("/").pop(); 
  
  if (!planningId) {
    return NextResponse.json({ error: "planning id is required" }, { status: 400 });
  }
  
  return deletePlanning(req, { params: { planningId } });
}