// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { GET as findServices} from "@/app/api/service/find"; 
import { GET as getList} from "@/app/api/service/list"; 

export async function GET(req: NextRequest) {
    if(req.nextUrl.searchParams.get('search')){
        return findServices(req);
    }else{
        return getList();
    }
}
