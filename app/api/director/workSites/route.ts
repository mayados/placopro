import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const workSitesFound = await db.workSite.findMany({});
        const workSites = workSitesFound.map((workSite: WorkSiteForListType) => ({
            id: workSite.id,
            title: workSite.title,
            slug: workSite.slug,
            status: workSite.status,
            city: workSite.city,
            beginsThe: workSite.beginsThe
          }));

        return NextResponse.json(
            workSites,
        )

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}