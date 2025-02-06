import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const vatRates = await db.vatRate.findMany(
            {
                select: {
                    id: true,
                    rate: true
                  },
            }
        );

        return NextResponse.json({
            vatRates: vatRates,
        })

    } catch (error) {
        console.log("[VATRATES]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}