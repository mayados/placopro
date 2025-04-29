import { NextRequest, NextResponse } from "next/server";
import { PATCH as updateUnit } from "@/app/api/units/[unitId]/update";
import { DELETE as deleteUnit } from "@/app/api/units/[unitId]/delete";

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const unitId = pathname.split("/").pop();

  if (!unitId) {
    return NextResponse.json({ error: "Unit is required" }, { status: 400 });
  }

  return updateUnit(req, { params: { unitId } });

}


export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const unitId = pathname.split("/").pop();
  
    if (!unitId) {
      return NextResponse.json({ error: "unit is required" }, { status: 400 });
    }
    return deleteUnit(req, { params: { unitId } });  
  }
