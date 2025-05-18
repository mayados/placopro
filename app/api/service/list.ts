import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereClause: Prisma.ServiceWhereInput = search
      ? {
          label: {
            contains: search,
            mode: Prisma.QueryMode.insensitive, // <-- ici
          },
        }
      : {};

    const services = await db.service.findMany({
      where: whereClause,
      select: {
        id: true,
        label: true,
        unitPriceHT: true,
        type: true,
      },
      skip,
      take: limit,
    });

    const totalServices = await db.service.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      services,
      totalServices,
    });
  } catch (error) {
    console.error("[SERVICES]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
