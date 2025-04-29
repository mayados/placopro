// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getUnits} from "@/app/api/units/list"; 
import { POST as createUnit } from "@/app/api/units/create"; 


export async function GET(req: NextRequest) {

    return getUnits(req); 
}

export async function POST(req: NextRequest) {

  return createUnit(req);  
}
