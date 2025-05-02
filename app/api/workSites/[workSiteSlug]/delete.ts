import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {workSiteSlug: string}})
{
    const resolvedParams = await params;
    const workSiteSlug = resolvedParams.workSiteSlug;

    try{

        await db.workSite.delete({
            where: {
                slug: workSiteSlug
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Worksite deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}