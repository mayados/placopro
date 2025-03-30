import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {creditNoteNumber: string}})
{
    const resolvedParams = await params;
    const creditNoteNumber = resolvedParams.creditNoteNumber;

    try{

        await db.creditNote.delete({
            where: {
                number: creditNoteNumber
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Credit note deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}