import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, status, paymentMethod, paymentDate, canceledAt } = data;

  // Mapping of french statuts to english
  const statusMapping: Record<string, string> = {
    "Prêt à l'envoi": "ready",
    "Envoyé": "sent",
    "Clos": "canceled",
    "Payé": "paid",
  };

  try {
    // construct dynamically update's object
    const updateData: Record<string, any> = {};

    // status conversion
    if (status !== null) {
        const mappedStatus = statusMapping[status];
        if (mappedStatus) {
            updateData.status = mappedStatus;
        } else {
            return new NextResponse("Invalid status value", { status: 400 });
        }
    }


    if (paymentDate !== null){
        const parsedDate = new Date(paymentDate);
        updateData.paymentDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    if (paymentMethod !== null){
        updateData.paymentMethod = paymentMethod
    }

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedBill = await db.bill.update({
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

    return NextResponse.json({ updatedBill }, { status: 200 });
  } catch (error) {
    console.error("Error with bill's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
