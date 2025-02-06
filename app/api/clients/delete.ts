import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {clientId: string}})
{
    const resolvedParams = await params;
    const clientId = resolvedParams.clientId;

    try{

        await db.client.delete({
            where: {
                id: clientId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Client deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}