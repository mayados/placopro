// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { GET as getDashboardDatas} from "@/app/api/dashboards/secretary/get"; 

export async function GET(req: NextRequest) {

    return getDashboardDatas(req); 
}



