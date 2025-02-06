// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getCompany} from "@/app/api/companies/[companySlug]/get"; 

export async function GET(req: NextRequest, { params }: { params: { companySlug: string }}) {
    return getCompany(req, {params}); 

}



