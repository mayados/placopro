import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    try{
        const company = await db.company.findFirst({});


        return NextResponse.json(company)

    } catch (error) {
        console.log("[COMPANIES]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}