import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {companySlug: string}})
{
    const resolvedParams = await params;
    const companySlug = resolvedParams.companySlug;

    try{

        const company = await db.company.findUnique({
            where: {
                slug: companySlug
            }            
        })


        return NextResponse.json(company)

    } catch (error) {
        console.log("[COMPANY]", error)

        return new NextResponse("Internal error, {status: 500}")
    }
}