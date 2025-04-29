import { NextRequest, NextResponse } from "next/server";
import { PATCH as updateService } from "@/app/api/service/[serviceId]/update";
import { DELETE as deleteService } from "@/app/api/service/[serviceId]/delete";

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const serviceId = pathname.split("/").pop();

  if (!serviceId) {
    return NextResponse.json({ error: "Service is required" }, { status: 400 });
  }

  return updateService(req, { params: { serviceId } });

}


export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const serviceId = pathname.split("/").pop();
  
    if (!serviceId) {
      return NextResponse.json({ error: "Service is required" }, { status: 400 });
    }
    return deleteService(req, { params: { serviceId } });  
  }
