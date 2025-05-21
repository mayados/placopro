import { db } from "@/lib/db";
import { ClientOrProspectEnum, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    try {
        const { searchParams } = new URL(req.url);

        // Retrieve parameters
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;



const whereClause: Prisma.ClientWhereInput = {
  status: ClientOrProspectEnum.PROSPECT,
  ...(search
    ? {
        OR: [
          { clientNumber: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }
    : {}),
};


        const clients = await db.client.findMany({
            where: whereClause,
            select: {
                id: true,
                clientNumber: true,
                slug: true,
                name: true,
                firstName: true,
                city: true,
            },
            skip,
            take: limit,
            orderBy: {
                name: "asc",
            },
        });


        const totalClients: number = await db.client.count({
            where: whereClause
        });

        return NextResponse.json({
            success: true,
            clients: clients,
            totalClients: totalClients,

        })

    } catch (error) {
        console.log("[CLIENTS]", error)

        return new NextResponse("Internal error, {status: 500}")
    }

}