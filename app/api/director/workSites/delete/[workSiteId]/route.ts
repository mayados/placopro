import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {workSiteId: string}})
{
    const resolvedParams = await params;
    const workSiteId = resolvedParams.workSiteId;

    try{

        await db.workSite.delete({
            where: {
                id: workSiteId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Worksite deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}