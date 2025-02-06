// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getClient} from "@/app/api/clients/[clientSlug]/get"; 

export async function GET(req: NextRequest, { params }: { params: { clientSlug: string }}) {
    return getClient(req, {params}); 

}



