import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateClassicBillSchema } from "@/validation/billValidation";


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

    const parsedData = updateClassicBillSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
    
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
            
    // Validation réussie, traiter les données avec le statut
    const validatedData = parsedData.data;
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


    if (validatedData.paymentDate !== null){
        const parsedDate = new Date(validatedData.paymentDate);
        updateData.paymentDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    if (paymentMethod !== null){
        updateData.paymentMethod = validatedData.paymentMethod
    }
    if (validatedData.canceledAt !== null){
      const parsedDate = new Date(validatedData.canceledAt);
      updateData.canceledAt = parsedDate;  
      console.log("date parsée : "+parsedDate)
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
