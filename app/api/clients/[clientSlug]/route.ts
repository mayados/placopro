// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getClient} from "@/app/api/clients/[clientSlug]/get"; 


export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const clientSlug = pathname.split("/").pop();

  if (!clientSlug) {
    return NextResponse.json({ error: "client slug is required" }, { status: 400 });
  }

  return getClient(req, { params: { clientSlug } });
}



