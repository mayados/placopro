import { db } from "@/lib/db";
import { Prisma, WorkSiteStatusEnum } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageComming = parseInt(searchParams.get("pageComming") || "1", 10);
    const pageCompleted = parseInt(searchParams.get("pageCompleted") || "1", 10);
    const pageInProgress = parseInt(searchParams.get("pageInProgress") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;
    const skipComming = (pageComming - 1) * limit;
    const skipCompleted = (pageCompleted - 1) * limit;
    const skipInProgress = (pageInProgress - 1) * limit;

    // Filtre de recherche
    const searchFilter: Prisma.WorkSiteWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            {
              client: {
                OR: [
                  { clientNumber: { contains: search, mode: "insensitive" } },
                  { name: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {};

    const getWorkSitesByStatus = async (
      status: WorkSiteStatusEnum,
      skipValue: number
    ) => {
      return db.workSite.findMany({
        where: {
          status,
          ...searchFilter,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          city: true,
          beginsThe: true,
          client: {
            select: {
              id: true,
              name: true,
              clientNumber: true,
            },
          },
        },
        skip: skipValue,
        take: limit,
        orderBy: { beginsThe: "desc" },
      });
    };

    const countByStatus = async (status: WorkSiteStatusEnum) => {
      return db.workSite.count({
        where: {
          status,
          ...searchFilter,
        },
      });
    };

    const workSites = await db.workSite.findMany({
      where: searchFilter,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        beginsThe: true,
        client: {
          select: {
            id: true,
            name: true,
            clientNumber: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { beginsThe: "desc" },
    });

    // Grouped by status
    const [commingWorkSites, totalCommingWorkSites] = await Promise.all([
      getWorkSitesByStatus(WorkSiteStatusEnum.COMING, skipComming),
      countByStatus(WorkSiteStatusEnum.COMING),
    ]);

    const [completedWorkSites, totalCompletedWorkSites] = await Promise.all([
      getWorkSitesByStatus(WorkSiteStatusEnum.COMPLETED, skipCompleted),
      countByStatus(WorkSiteStatusEnum.COMPLETED),
    ]);

    const [inProgressWorkSites, totalInProgressWorkSites] = await Promise.all([
      getWorkSitesByStatus(WorkSiteStatusEnum.PROGRESS, skipInProgress),
      countByStatus(WorkSiteStatusEnum.PROGRESS),
    ]);

    const totalWorkSites = await db.workSite.count({
      where: searchFilter,
    });

    return NextResponse.json({
      success: true,
      workSites,
      commingWorkSites,
      completedWorkSites,
      inProgressWorkSites,
      totalWorkSites,
      totalCommingWorkSites,
      totalCompletedWorkSites,
      totalInProgressWorkSites,
    });
  } catch (error) {
    console.error("Erreur dans l'API GET /api/workSites :", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
