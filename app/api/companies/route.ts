// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as createCompany } from "@/app/api/companies/create"; 
import { GET as getCompany} from "@/app/api/companies/get"; 


export async function GET() {

    return getCompany(); 
}

export async function POST(req: NextRequest) {
  return createCompany(req);  
}

