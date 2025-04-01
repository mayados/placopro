import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, start, end, title, clerkUserId, workSiteId } = data;

  try {
    // construct dynamically update's object
    const updateData: Record<string, any> = {};



    if (start !== null){
        updateData.startDate = start
    }

    if (end !== null){
        updateData.endTime = end
    }

    if (clerkUserId !== null){
        updateData.clerkUserId = clerkUserId
    }

    if (title !== null){
        updateData.task = title
    }

    if (workSiteId !== null){
        updateData.worksiteId = workSiteId
    }

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedPlanning = await db.planning.update({
      where: { id: id },
      data: updateData,
      include: {
        workSite: true, 
      },
    });

    return NextResponse.json({ updatedPlanning }, { status: 200 });
  } catch (error) {
    console.error("Error with planning's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
