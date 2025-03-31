// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createCompany } from "@/app/api/companies/create"; 
import { GET as getCompanies} from "@/app/api/companies/list"; 


export async function GET(req: NextRequest) {

    return getCompanies(req); 
}

export async function POST(req: NextRequest) {
  return createCompany(req);  
}

