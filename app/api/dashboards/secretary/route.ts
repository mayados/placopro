// This file allows to handle different actions based on the http method retrieved
import { GET as getDashboardDatas} from "@/app/api/dashboards/secretary/get"; 

export async function GET() {

    return getDashboardDatas(); 
}



