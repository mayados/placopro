import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateCreditNoteSchema } from "@/validation/creditNoteValidation";


export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, isSettled, settlementType } = data;
  

  // Mapping of french statuts to english
  const statusMapping: Record<string, string> = {
    "Remboursement": "REFUND",
    "Compensation": "COMPENSATION",
  };

  try {

    const { id, ...dataWithoutProspectNumber } = data;
    data.id = id;
    
    // Validation avec Zod (sans 'status')
    const parsedData = updateCreditNoteSchema.safeParse(dataWithoutProspectNumber);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
                    
    // Validation réussie, traiter les données avec le statut
    const validatedData = parsedData.data;
    
    // construct dynamically update's object
    const updateData: Record<string, any> = {};

    // status conversion
    if (validatedData.settlementType !== null) {
        const mappedStatus = statusMapping[settlementType];
        if (mappedStatus) {
            updateData.status = mappedStatus;
        } else {
            return new NextResponse("Invalid settlement type value", { status: 400 });
        }
    }

    if (validatedData.isSettled !== null){
        updateData.isSettled = isSettled
    }


    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedCreditNote = await db.creditNote.update({
      where: { id: id },
      data: updateData,
      include: {
        bill: true, 

      },
    });

    return NextResponse.json({ updatedCreditNote }, { status: 200 });
  } catch (error) {
    console.error("Error with credit note's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
