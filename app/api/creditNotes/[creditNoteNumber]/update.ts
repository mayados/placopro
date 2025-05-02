import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateCreditNoteSchema } from "@/validation/creditNoteValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { currentUser } from "@clerk/nextjs/server";


export async function PUT(req: NextRequest) {
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  // const csrfToken = req.headers.get("x-csrf-token");
  // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
  //   return new Response("Invalid CSRF token", { status: 403 });
  // }
  // const { id, isSettled, settlementType } = data;
  

  // Mapping of french statuts to english
  const statusMapping: Record<string, string> = {
    "Remboursement": CreditNoteSettlementTypeEnum.REFUND,
    "Compensation": CreditNoteSettlementTypeEnum.COMPENSATION,
  };

  const user = await currentUser();


  try {

    const { id, ...dataWithoutProspectNumber } = data;
    data.id = id;
    
    // Validation avec Zod (sans 'status')
    const parsedData = updateCreditNoteSchema.safeParse(dataWithoutProspectNumber);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
                    
    // Validation réussie
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));
        
    // Ajoute le statut aux données validées
    sanitizedData.id = id;
    
    // construct dynamically update's object
    const updateData: Record<string, unknown> = {};

    // status conversion
    if (sanitizedData.settlementType !== null) {
        const mappedStatus = statusMapping[sanitizedData.settlementType];
        if (mappedStatus) {
            updateData.status = mappedStatus;
        } else {
            return new NextResponse("Invalid settlement type value", { status: 400 });
        }
    }

    if (sanitizedData.isSettled !== null){
        updateData.isSettled = sanitizedData.isSettled
    }


    // Verify if there are datas to update
    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Update in database
    const updatedCreditNote = await db.creditNote.update({
      where: { id: id },
      data: {
        ...updateData,
        updatedAt : new Date().toISOString(),
        modifiedBy: user?.id
      },
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
