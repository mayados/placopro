import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, status, isSignedByClient, signatureDate } = data;

  try {
    // construct dynamically update's object
    const updateData: Record<string, any> = {};

    if (status !== null) updateData.status = status;
    if (isSignedByClient !== null) {
        updateData.isSignedByClient = isSignedByClient === "Oui";
      }
    if (signatureDate !== null){
        const parsedDate = new Date(signatureDate);
        updateData.signatureDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedQuote = await db.quote.update({
      where: { id: id },
      data: updateData,
      include: {
        client: true, 
        workSite: true,
        services: {
          include: {
            service: true, 
          },
        },
      },
    });

    return NextResponse.json({ updatedQuote: updatedQuote }, { status: 200 });
  } catch (error) {
    console.error("Error with quote's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
