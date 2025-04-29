import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {quoteSlug: string}})
{
    const resolvedParams = await params;
    const quoteSlug = resolvedParams.quoteSlug;

    try{

        await db.quote.delete({
            where: {
                slug: quoteSlug
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Quote deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}