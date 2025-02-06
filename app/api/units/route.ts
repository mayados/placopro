// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getUnits} from "@/app/api/units/list"; 

export async function GET(req: NextRequest) {

    return getUnits(req); 
}
