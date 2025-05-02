import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {unitId: string}})
{
    const resolvedParams = await params;

    const unitId = resolvedParams.unitId;

    const user = await currentUser();

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const unit = await db.unit.findUnique({
      where: { id: unitId },
    });
  
    if (!unit) {
      return new NextResponse("Unit introuvable", { status: 404 });
    }


    try{

        await db.unit.delete({
            where: {
                id: unitId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Unit deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}