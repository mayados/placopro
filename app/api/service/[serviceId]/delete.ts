import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {serviceId: string}})
{
    const resolvedParams = await params;

    const serviceId = resolvedParams.serviceId;

    const user = await currentUser();

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });
  
    if (!service) {
      return new NextResponse("Service introuvable", { status: 404 });
    }


    try{

        await db.service.delete({
            where: {
                id: serviceId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'Service deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}