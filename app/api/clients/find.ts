import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest)
{

    const clientInputValue = req.nextUrl.searchParams.get('search');
    if (!clientInputValue) {
        return new NextResponse("Missing 'search' query parameter", { status: 400 });
    }

    try{

        const suggestions = await db.client.findMany({
            where: {
                OR: [
                    {
                      name: {
                        startsWith: clientInputValue,
                        mode: 'insensitive',
                      },
                    },
                    { firstName: { startsWith: clientInputValue, mode: 'insensitive', } },
                  ],
            }            
        })

        console.log("suggestions retrouvées pour le cliennInput : "+suggestions)


        return NextResponse.json({ 
            success: true, 
            suggestions: suggestions || [],
            status: 200,
        })

    } catch (error) {
        // console.log("[Suggestions]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}