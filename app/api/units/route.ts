// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { GET as getUnits} from "@/app/api/units/list"; 
import { POST as createUnit } from "@/app/api/units/create"; 


export async function GET() {

    return getUnits(); 
}

export async function POST(req: NextRequest) {

  return createUnit(req);  
}
