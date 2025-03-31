// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getWorkSite} from "@/app/api/workSites/[workSiteSlug]/get"; 
import { PUT as updateWorkSite} from "@/app/api/workSites/[workSiteSlug]/update"; 

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const workSiteSlug = pathname.split("/").pop(); 

  if (!workSiteSlug) {
    return NextResponse.json({ error: "workSiteSlug is required" }, { status: 400 });
  }

  return getWorkSite(req, { params: { workSiteSlug } });
}

export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const workSiteSlug = pathname.split("/").pop();

  if (!workSiteSlug) {
    return NextResponse.json({ error: "workSiteSlug is required" }, { status: 400 });
  }

  return updateWorkSite(req);
}


