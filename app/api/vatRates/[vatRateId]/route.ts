import { NextRequest, NextResponse } from "next/server";
import { PATCH as updateVatRate } from "@/app/api/vatRates/[vatRateId]/update";
import { DELETE as deleteVatRate } from "@/app/api/vatRates/[vatRateId]/delete";

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const vatRateId = pathname.split("/").pop();

  if (!vatRateId) {
    return NextResponse.json({ error: "Vat rate is required" }, { status: 400 });
  }

  return updateVatRate(req, { params: { vatRateId } });

}


export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const vatRateId = pathname.split("/").pop();
  
    if (!vatRateId) {
      return NextResponse.json({ error: "Vat rate is required" }, { status: 400 });
    }
    return deleteVatRate(req, { params: { vatRateId } });  
  }
