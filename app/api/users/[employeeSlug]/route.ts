// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getUser} from "@/app/api/users/[employeeSlug]/get"; 

export async function GET(req: NextRequest, { params }: { params: { employeeSlug: string }}) {
    return getUser(req, {params}); 

}



