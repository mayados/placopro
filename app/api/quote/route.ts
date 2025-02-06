// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
// Logic creation of a quote with POST. Rename POST function as createQuote to avoid conflicts of name
import { POST as createQuote } from "@/app/api/quote/create"; 
// Logic retrieve of quotes list with GET
import { GET as getQuotes} from "@/app/api/quote/get-list"; 

export async function GET(req: NextRequest) {
  return getQuotes(req); 
}

export async function POST(req: NextRequest) {
  return createQuote(req);  
}
