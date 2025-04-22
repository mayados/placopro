import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {clientSlug: string}})
{
    const resolvedParams = await params;
    const clientSlug = resolvedParams.clientSlug;

    try{

        await db.client.delete({
            where: {
                slug: clientSlug
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Client deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}