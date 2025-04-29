import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {vatRateId: string}})
{
    const resolvedParams = await params;

    const vatRateId = resolvedParams.vatRateId;

    const user = await currentUser();

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const vatRate = await db.vatRate.findUnique({
      where: { id: vatRateId },
    });
  
    if (!vatRate) {
      return new NextResponse("Vat rate introuvable", { status: 404 });
    }


    try{

        await db.vatRate.delete({
            where: {
                id: vatRateId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Vat rate deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}