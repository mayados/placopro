import { db } from "@/lib/db";
import { WorkSiteStatusEnum } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Retrieve parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageComming = parseInt(searchParams.get("pageComming") || "1", 10);
    const pageCompleted = parseInt(searchParams.get("pageCompleted") || "1", 10);
    const pageInProgress = parseInt(searchParams.get("pageInProgress") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;
    const skipComming = (pageComming - 1) * limit;
    const skipCompleted = (pageCompleted - 1) * limit;
    const skipInProgress = (pageInProgress - 1) * limit;

    // All the workSites (paginated)
    const workSites = await db.workSite.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        beginsThe: true,
      },
      skip,
      take: limit,
      orderBy: {
        beginsThe: "desc",
      },
    });

    // Coming workSites
    const commingWorkSites = await db.workSite.findMany({
      where: {
        status: WorkSiteStatusEnum.COMING,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        beginsThe: true,
      },
      skip: skipComming,
      take: limit,
      orderBy: {
        beginsThe: "desc",
      },
    });

    // Completed workSites
    const completedWorkSites = await db.workSite.findMany({
      where: {
        status: WorkSiteStatusEnum.COMPLETED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        beginsThe: true,
      },
      skip: skipCompleted,
      take: limit,
      orderBy: {
        beginsThe: "desc",
      },
    });

    // In progress workSites
    const inProgressWorkSites = await db.workSite.findMany({
      where: {
        status: WorkSiteStatusEnum.PROGRESS,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        city: true,
        beginsThe: true,
      },
      skip: skipInProgress,
      take: limit,
      orderBy: {
        beginsThe: "desc",
      },
    });

    // Total counts
    const totalWorkSites = await db.workSite.count();
    const totalCommingWorkSites = await db.workSite.count({
      where: {
        status: WorkSiteStatusEnum.COMING,
      },
    });
    const totalCompletedWorkSites = await db.workSite.count({
      where: {
        status: WorkSiteStatusEnum.COMPLETED,
      },
    });
    const totalInProgressWorkSites = await db.workSite.count({
      where: {
        status: WorkSiteStatusEnum.PROGRESS,
      },
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
