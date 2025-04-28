import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {creditNoteNumber: string}})
{
    const resolvedParams = await params;
    const creditNoteNumber = resolvedParams.creditNoteNumber;

    try{

        const creditNote = await db.creditNote.findUnique({
            where: {
                number: creditNoteNumber
            },
            include: {
                bill: true,
            },         
        })

        console.log("Je récupère un avoir : "+creditNote)

        return NextResponse.json(creditNote)

    } catch (error) {
        console.log("[CREDITNOTE]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}