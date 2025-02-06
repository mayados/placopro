import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest)
{

    const workSiteInputValue = req.nextUrl.searchParams.get('search');
    if (!workSiteInputValue) {
        return new NextResponse("Missing 'search' query parameter for worksites suggestions", { status: 400 });
    }

    try{

        const suggestions = await db.workSite.findMany({
            where: {
                OR: [
                    {
                      title: {
                        contains: workSiteInputValue,
                        mode: 'insensitive',
                      },
                    },
                    { 
                        client: { 
                            firstName: {
                                startsWith: workSiteInputValue, 
                                mode: 'insensitive',                                
                            },
                            name: {
                                startsWith: workSiteInputValue, 
                                mode: 'insensitive',                                
                            }
                        } 
                    },
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