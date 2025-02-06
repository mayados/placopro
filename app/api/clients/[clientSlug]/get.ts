import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {clientSlug: string}})
{
    const resolvedParams = await params;
    const clientSlug = resolvedParams.clientSlug;

    try{

        const client = await db.client.findUnique({
            where: {
                slug: clientSlug
            }            
        })


        return NextResponse.json({ 
            success: true, 
            client: client,
            status: 200,
        })

    } catch (error) {
        console.log("[CLIENT]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}