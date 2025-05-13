import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const clients = await db.client.findMany({
            where :{
                isPseudonymized: true
            },
            select: {
                id: true,
                clientNumber: true,
                slug: true,
                pseudonymizedAt: true
            }
        });


        return NextResponse.json({
            clients: clients,
        })

    } catch (error) {
        console.log("[CLIENTS]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}