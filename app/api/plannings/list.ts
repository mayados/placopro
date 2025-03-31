import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const plannings = await db.planning.findMany({
            select: {
                id: true,
                startDate: true,
                startTime: true,
                task: true,
                workSite: true,
                user: true
              }
        });


    console.log("plannings retrieved : "+plannings)
          
    return NextResponse.json({
            success: true,
            plannings: plannings,
        })

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}