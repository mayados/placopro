import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { createCreditNoteSchema } from "@/validation/creditNoteValidation";
import { CreditNoteReasonEnum } from "@prisma/client";
import { sanitizeData } from "@/lib/sanitize"; 



// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            amount,
            billId,
            reason
            } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()


    try {
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const { billId, ...dataWithoutProspectNumber } = data;
        data.billId = billId;

        // Validation avec Zod (sans 'status')
        const parsedData = createCreditNoteSchema.safeParse(dataWithoutProspectNumber);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
        
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
                
        // Validation réussie
        // Sanitizing datas
        const sanitizedData = sanitizeData(parsedData.data);
        console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
        // Ajoute le statut aux données validées
        sanitizedData.billId = billId;

              // Generate an unique and chronological number 
      const generateCreditNoteNumber = async (type = "credit-note") => {
            
      
        const currentYear = new Date().getFullYear();
        
          // Get the counter for current year for quote
          let counter = await db.documentCounter.findFirst({
            where: {
              year: currentYear,
              type: type, 
            },
          });
        
          // Default value if there is no existing counter
          let nextNumber = 1; 
        
          if (!counter) {
            nextNumber = 1
          } else {
            // If a coounter exists, increment the number
            nextNumber = counter.current_number + 1;
        
            // update the counter in the database
            await db.documentCounter.update({
              where: { id: counter.id },
              data: { current_number: nextNumber },
            });
          }
        
          // Generate quote's number (for example : DEV-2025-3 for the third quote of 2025)
          const formattedNumber = `${"AVO"}-${currentYear}-${nextNumber}`;
        
          return formattedNumber;
    };

    const CreditNoteNumber =  await generateCreditNoteNumber();

        // We create the company thanks to te datas retrieved
        const creditNote = await db.creditNote.create({
            data: {
                number: CreditNoteNumber,
                amount: sanitizedData.amount,
                billId: billId,
                reason: sanitizedData.reason as CreditNoteReasonEnum,
                issueDate: new Date()
            },
        });


        console.log("Avoir créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: creditNote });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
