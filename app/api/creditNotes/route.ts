// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as createCreditNote } from "@/app/api/creditNotes/create"; 
import { GET as getCreditNotes} from "@/app/api/creditNotes/list"; 

export async function GET(req: NextRequest) {

    return getCreditNotes(req); 
}

export async function POST(req: NextRequest) {
  return createCreditNote(req);  
}

