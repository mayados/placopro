import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const vatRates = await db.vatRate.findMany(
            {
                select: {
                    id: true,
                    rate: true
                  },
            }
        );

        return NextResponse.json(vatRates)

    } catch (error) {
        console.log("[VATRATES]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}