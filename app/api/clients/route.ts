// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createClient } from "@/app/api/clients/create"; 
import { GET as getClients} from "@/app/api/clients/list"; 
import { GET as findClient} from "@/app/api/clients/find"; 
import { DELETE as deleteClient} from "@/app/api/clients/delete"; 
import { PUT as updateClient} from "@/app/api/clients/update"; 

export async function GET(req: NextRequest) {
    if(req.nextUrl.searchParams.get('search')){
        return findClient(req); 

    }
    return getClients(req); 
}

export async function POST(req: NextRequest) {
  return createClient(req);  
}

export async function DELETE(req: NextRequest, { params }: { params: { clientId: string }}) {
  return deleteClient(req, {params});  
}

export async function UPDATE(req: NextRequest, { params }: { params: { clientId: string }}) {
  return updateClient(req);  
}
