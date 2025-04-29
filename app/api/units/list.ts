import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const units = await db.unit.findMany(
            {
                select: {
                    id: true,
                    label: true
                  },
            }
        );

        return NextResponse.json(
            units,
        )

    } catch (error) {
        console.log("[UNITS]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}