// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as findServices} from "@/app/api/service/find"; 

export async function GET(req: NextRequest) {
    if(req.nextUrl.searchParams.get('search')){
        return findServices(req);
    }
 
}
