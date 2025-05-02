import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {quoteSlug: string}})
{
    const resolvedParams = await params;
    const quoteSlug = resolvedParams.quoteSlug;

    try{

        const quote = await db.quote.findUnique({
            where: {
                slug: quoteSlug
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

        return NextResponse.json(quote)

    } catch (error) {
        console.log("[QUOTE]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}