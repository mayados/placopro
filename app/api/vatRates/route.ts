// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getVatRates} from "@/app/api/vatRates/list"; 
import { POST as createVatRate } from "@/app/api/vatRates/create"; 


export async function GET(req: NextRequest) {

    return getVatRates(req); 
}

export async function POST(req: NextRequest) {

  return createVatRate(req);  
}
