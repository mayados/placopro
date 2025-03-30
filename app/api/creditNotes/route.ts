// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createCreditNote } from "@/app/api/creditNotes/create"; 
import { POST as createDepositBillFromQuote } from "@/app/api/bills/create-deposit"; 
import { GET as getCreditNotes} from "@/app/api/creditNotes/list"; 

export async function GET(req: NextRequest) {

    return getCreditNotes(req); 
}

export async function POST(req: NextRequest) {
  return createCreditNote(req);  
}

