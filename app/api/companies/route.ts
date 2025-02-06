// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createCompany } from "@/app/api/companies/create"; 
import { GET as getCompanies} from "@/app/api/companies/list"; 
import { DELETE as deleteCompany} from "@/app/api/companies/delete"; 
import { PUT as updateCompany} from "@/app/api/companies/update"; 

export async function GET(req: NextRequest) {

    return getCompanies(req); 
}

export async function POST(req: NextRequest) {
  return createCompany(req);  
}

export async function DELETE(req: NextRequest, { params }: { params: { companyId: string }}) {
  return deleteCompany(req, {params});  
}

export async function UPDATE(req: NextRequest, { params }: { params: { companyId: string }}) {
  return updateCompany(req);  
}
