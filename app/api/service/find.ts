import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {value: string}})
{
    const resolvedParams = await params;
    const serviceInputValue = resolvedParams.value;

    try{

        const suggestions = await db.service.findMany({
            where: {
                        label: {
                            contains: serviceInputValue,
                            mode: 'insensitive',
                      },
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