import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
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
  isPseudonymized: true,
  ...(search
    ? {
        OR: [
          { clientNumber: { startsWith: search, mode: "insensitive" } },

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
            },
            skip,
            take: limit,
            orderBy: {
                clientNumber: "asc",
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