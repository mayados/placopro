// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getVatRates} from "@/app/api/vatRates/list"; 

export async function GET(req: NextRequest) {

    return getVatRates(req); 
}
