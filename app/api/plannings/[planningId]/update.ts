import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, startDate, startTime, endDate, endTime, task } = data;

  try {
    // construct dynamically update's object
    const updateData: Record<string, any> = {};



    if (startDate !== null){
        updateData.startDate = startDate
    }

    if (startTime !== null){
        updateData.startTime = startDate
    }

    if (endDate !== null){
        updateData.endDate = startDate
    }

    if (endTime !== null){
        updateData.endTime = startDate
    }

    if (task !== null){
        updateData.task = task
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
        user: true,

      },
    });

    return NextResponse.json({ updatedPlanning }, { status: 200 });
  } catch (error) {
    console.error("Error with planning's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
