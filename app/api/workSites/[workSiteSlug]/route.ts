// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getWorkSite} from "@/app/api/workSites/[workSiteSlug]/get"; 
import { PUT as updateWorkSite} from "@/app/api/workSites/[workSiteSlug]/update"; 
import { DELETE as deleteWorkSite} from "@/app/api/workSites/[workSiteSlug]/delete"; 

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

export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const workSiteSlug = pathname.split("/").pop();
  
    if (!workSiteSlug) {
      return NextResponse.json({ error: "workSiteSlug is required" }, { status: 400 });
    }
    return deleteWorkSite(req, { params: { workSiteSlug } });  
  }
  

