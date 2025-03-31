import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {companySlug: string}})
{
    const resolvedParams = await params;
    const companySlug = resolvedParams.companySlug;

    try{

        await db.company.delete({
            where: {
                slug: companySlug
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Company deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}