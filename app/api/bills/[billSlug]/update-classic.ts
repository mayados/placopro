import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateClassicBillSchema } from "@/validation/billValidation";
import { sanitizeData } from "@/lib/sanitize";
import { BillStatusEnum } from "@prisma/client";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  // const csrfToken = req.headers.get("x-csrf-token");
  // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
  //   return new Response("Invalid CSRF token", { status: 403 });
  // }
  // const { id, status, paymentMethod, paymentDate, canceledAt } = data;

  // Mapping of french statuts to english
  const statusMapping: Record<string, string> = {
    "Prêt à l'envoi": BillStatusEnum.READY,
    "Envoyé": BillStatusEnum.SENT,
    "Clos": BillStatusEnum.CANCELED,
    "Payé": BillStatusEnum.PAID,
  };

  try {

    const parsedData = updateClassicBillSchema.safeParse(data);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
    
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
            
        // Validation réussie
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
    // construct dynamically update's object
    const updateData: Record<string, unknown> = {};

    // status conversion
    if (sanitizedData.status !== null) {
        const mappedStatus = statusMapping[sanitizedData.status];
        if (mappedStatus) {
            updateData.status = mappedStatus;
        } else {
            return new NextResponse("Invalid status value", { status: 400 });
        }
    }


    if (sanitizedData.paymentDate !== null){
        const parsedDate = new Date(sanitizedData.paymentDate);
        updateData.paymentDate = parsedDate;  
        console.log("date parsée : "+parsedDate)
    } 

    if (sanitizedData.paymentMethod !== null){
        updateData.paymentMethod = sanitizedData.paymentMethod
    }
    if (sanitizedData.canceledAt !== null){
      const parsedDate = new Date(sanitizedData.canceledAt);
      updateData.canceledAt = parsedDate;  
      console.log("date parsée : "+parsedDate)
  } 

    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedBill = await db.bill.update({
      where: { id: sanitizedData.id },
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
