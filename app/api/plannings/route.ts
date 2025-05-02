// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as createPlanning } from "@/app/api/plannings/create"; 
import { GET as getPlannings} from "@/app/api/plannings/list"; 

export async function GET() {

    return getPlannings(); 
}

export async function POST(req: NextRequest) {
  return createPlanning(req);  
}

