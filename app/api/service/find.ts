import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest)
{

    const serviceInputValue = req.nextUrl.searchParams.get('search');
    if (!serviceInputValue) {
        return new NextResponse("Missing 'search' query parameter to find services suggestions", { status: 400 });
    }

    try{

        const suggestions = await db.service.findMany({
            where: {
                        label: {
                            contains: serviceInputValue,
                            mode: 'insensitive',
                      },
            }            
        })

        console.log("suggestions retrouvées dans l'api : "+JSON.stringify(suggestions))

        return NextResponse.json({ 
            success: true, 
            suggestions: suggestions,
            status: 200,
        })

    } catch{
        // console.log("[Suggestions]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}