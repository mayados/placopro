// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getWorkSite} from "@/app/api/workSites/[workSiteSlug]/get"; 
import { PUT as updateWorkSite} from "@/app/api/workSites/[workSiteSlug]/update"; 

export async function GET(req: NextRequest, { params }: { params: { workSiteSlug: string }}) {
    return getWorkSite(req, {params}); 

}

export async function PUT(req: NextRequest, { params }: { params: { workSiteSlug: string }}) {
    return updateWorkSite(req); 

}



