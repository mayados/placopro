// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as createClient } from "@/app/api/clients/create";
import { POST as createProspect } from "@/app/api/clients/create-prospect";
import { GET as getClients } from "@/app/api/clients/list";
import { GET as getPseudonymized } from "@/app/api/clients/pseudonymized-list";
import { GET as getProspects } from "@/app/api/clients/prospects";
import { GET as findClient } from "@/app/api/clients/find";

export async function GET(req: NextRequest) {
  if (req.headers.get('X-get-type') === 'clients-list') {
    return getClients(req);

  } else if (req.headers.get('X-get-type') === 'prospects-list') {
    return getProspects(req);

  } else if (req.headers.get('X-get-type') === 'pseudonymized-list') {
    return getPseudonymized(req);

  }
  return findClient(req);

}

export async function POST(req: NextRequest) {
    if (req.headers.get('X-post-type') === 'create-prospect') {
    return createProspect(req);

  } 
  return createClient(req);
}




