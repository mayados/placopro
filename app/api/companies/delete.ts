import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {companyId: string}})
{
    const resolvedParams = await params;
    const companyId = resolvedParams.companyId;

    try{

        await db.company.delete({
            where: {
                id: companyId
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