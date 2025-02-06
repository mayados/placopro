import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {quoteNumber: string}})
{
    const resolvedParams = await params;
    const quoteNumber = resolvedParams.quoteNumber;

    try{

        await db.quote.delete({
            where: {
                number: quoteNumber
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Quote deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}