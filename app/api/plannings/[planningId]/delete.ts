import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {planningId: string}})
{
    const resolvedParams = await params;

    const planningId = resolvedParams.planningId;

    try{

        await db.planning.delete({
            where: {
                id: planningId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Planning deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}