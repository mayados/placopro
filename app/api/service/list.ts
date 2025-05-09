import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const services = await db.service.findMany(
            {
                select: {
                    id: true,
                    label: true,
                    unitPriceHT: true,
                    type: true,
                  },
            }
        );

        return NextResponse.json(services)

    } catch (error) {
        console.log("[SERVICES]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}