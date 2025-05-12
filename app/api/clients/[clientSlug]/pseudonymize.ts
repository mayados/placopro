import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, {params}: {params: {clientSlug: string}}) {
    
    const resolvedParams = await params;
    
    const clientSlug = resolvedParams.clientSlug;
  
    const existingClient = await db.client.findUnique({
        where: { slug: clientSlug }
      });

    if (!existingClient) {
      return new NextResponse("Service introuvable", { status: 404 });
    }


  try {

    const pseudonymizedClient = await db.client.update({
        where: { slug: clientSlug },
        data: {
          name: "Client supprimé",
          firstName: null,
          mail: null,
          phone: null
        }
      });
    

      return NextResponse.json(pseudonymizedClient);

  } catch (error) {
    console.error("Error with service's update", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
