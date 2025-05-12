// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getClient} from "@/app/api/clients/[clientSlug]/get"; 
import { DELETE as deleteClient} from "@/app/api/clients/[clientSlug]/delete"; 
import { PUT as updateClient} from "@/app/api/clients/[clientSlug]/update"; 
import { PATCH as pseudonymize} from "@/app/api/clients/[clientSlug]/pseudonymize"; 

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const clientSlug = pathname.split("/").pop();

  if (!clientSlug) {
    return NextResponse.json({ error: "client slug is required" }, { status: 400 });
  }

  return getClient(req, { params: { clientSlug } });
}

export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const clientSlug = pathname.split("/").pop();
  
    if (!clientSlug) {
      return NextResponse.json({ error: "client slug is required" }, { status: 400 });
    }
    return deleteClient(req, { params: { clientSlug } });  
  }
  
  export async function PUT(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const clientSlug = pathname.split("/").pop();
  
    if (!clientSlug) {
      return NextResponse.json({ error: "client slug is required" }, { status: 400 });
    }
    return updateClient(req);  
  }

export async function PATCH(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const clientSlug = pathname.split("/").pop();

  if (!clientSlug) {
    return NextResponse.json({ error: "client is required" }, { status: 400 });
  }

  return pseudonymize(req, { params: { clientSlug } });

}

