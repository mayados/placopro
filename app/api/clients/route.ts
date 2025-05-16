// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as createClient } from "@/app/api/clients/create"; 
import { GET as getClients} from "@/app/api/clients/list"; 
import { GET as findClient} from "@/app/api/clients/find"; 

export async function GET(req: NextRequest) {
    if(req.headers.get('X-get-type') === 'clients-list'){
      return getClients(req); 

    }
      return findClient(req); 

}

export async function POST(req: NextRequest) {
  return createClient(req);  
}


