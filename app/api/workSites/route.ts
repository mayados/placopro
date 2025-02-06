// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createWorkSite } from "@/app/api/workSites/create"; 
import { GET as getWorkSites} from "@/app/api/workSites/list"; 
import { GET as findWorkSite} from "@/app/api/workSites/find"; 
import { DELETE as deleteWorkSite} from "@/app/api/workSites/delete"; 

export async function GET(req: NextRequest, { params }: { params: { value: string }}) {
    if(req.nextUrl.searchParams.get('search')){
        return findWorkSite(req); 

    }
    return getWorkSites(req); 
}

export async function POST(req: NextRequest) {
  return createWorkSite(req);  
}

export async function DELETE(req: NextRequest, { params }: { params: { workSiteId: string }}) {
  return deleteWorkSite(req, {params});  
}

