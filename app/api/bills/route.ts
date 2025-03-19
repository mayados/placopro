// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createBillFromQuote } from "@/app/api/bills/create"; 
import { POST as createDepositBillFromQuote } from "@/app/api/bills/create-deposit"; 
import { GET as getBills} from "@/app/api/bills/list"; 

export async function GET(req: NextRequest) {

    return getBills(req); 
}

export async function POST(req: NextRequest) {
    // Decide which type of POST to call
    if (req.headers.get('X-create-Type') === 'deposit') {
      // Update draft (=all the fields)
      return createDepositBillFromQuote(req);
    }
  return createBillFromQuote(req);  
}

