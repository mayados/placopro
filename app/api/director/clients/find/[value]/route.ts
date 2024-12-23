import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {value: string}})
{
    const resolvedParams = await params;
    const clientInputValue = resolvedParams.value;

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


        return NextResponse.json({ 
            success: true, 
            suggestions: suggestions,
            status: 200,
        })

    } catch (error) {
        // console.log("[Suggestions]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}