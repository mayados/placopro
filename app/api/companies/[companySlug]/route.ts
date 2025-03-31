// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getCompany} from "@/app/api/companies/[companySlug]/get"; 


export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const companySlug = pathname.split("/").pop(); // Get companySlug from the URL

  if (!companySlug) {
    return NextResponse.json({ error: "companySlug is required" }, { status: 400 });
  }

  return getCompany(req, { params: { companySlug } });
}


