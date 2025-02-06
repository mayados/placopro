import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {quoteNumber: string}})
{
    const resolvedParams = await params;
    const quoteNumber = resolvedParams.quoteNumber;

    try{

        const quote = await db.quote.findUnique({
            where: {
                number: quoteNumber
            },
            include: {
                client: true,
                workSite: true,
                // services: true,
                services: {
                    include: {
                      service: true
                    },
                }
            },         
        })

        console.log("Je récupère un certain devis : "+quote)

        return NextResponse.json({ 
            success: true, 
            quote: quote,
            status: 200,
        })

    } catch (error) {
        console.log("[QUOTE]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}