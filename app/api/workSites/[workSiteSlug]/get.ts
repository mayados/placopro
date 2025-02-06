import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {workSiteSlug: string}})
{
    const resolvedParams = await params;
    const workSiteSlug = resolvedParams.workSiteSlug;

    try{

        const workSite = await db.workSite.findUnique({
            where: {
                slug: workSiteSlug
            },    
            // get the Client object
            include: {
                client: true, 
            },
        })


        return NextResponse.json({ 
            success: true, 
            workSite: workSite,
            status: 200,
        })

    } catch (error) {
        console.log("[WORKSITE]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}