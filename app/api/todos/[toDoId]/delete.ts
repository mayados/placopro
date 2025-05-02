import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {toDoId: string}})
{
    const resolvedParams = await params;

    const toDoId = resolvedParams.toDoId;

    const user = await currentUser();

    if (!user) {
      return new NextResponse("Non authentifié", { status: 401 });
    }
  
    const toDo = await db.toDo.findUnique({
      where: { id: toDoId },
      select: { authorClerkId: true },
    });
  
    if (!toDo) {
      return new NextResponse("To do introuvable", { status: 404 });
    }
  
    if (toDo.authorClerkId !== user.id) {
      return new NextResponse("Accès interdit", { status: 403 });
    }

    try{

        await db.toDo.delete({
            where: {
                id: toDoId
            }            
        })

        return new NextResponse(JSON.stringify({ success: true, message: 'To do deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

        return new NextResponse("Internal error, {status: 500}")
    }


}