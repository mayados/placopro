import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { generateSlug } from '@/lib/utils'
import { createCreditNoteSchema } from "@/validation/creditNoteValidation";
import { CreditNoteReasonEnum } from "@prisma/client";
import { sanitizeData } from "@/lib/sanitize"; 



// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    // Explicit validation of CSRF token (in addition of the middleware)
    // const csrfToken = req.headers.get("x-csrf-token");
    // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
    //   return new Response("Invalid CSRF token", { status: 403 });
    // }
    // const { 
    //         amount,
    //         billId,
    //         reason
    //         } = data;
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
          const counter = await db.documentCounter.findFirst({
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

    const bill = await db.bill.findUnique({
      where: {id: billId},
      include: {
        client: true
    }
  })

    const CreditNoteNumber =  await generateCreditNoteNumber();
        const slug = generateSlug("avo");

        // We create the company thanks to te datas retrieved
        const creditNote = await db.creditNote.create({
            data: {
                number: CreditNoteNumber,
                amount: sanitizedData.amount,
                billId: billId,
                author: user.id,
                slug: slug,
                reason: sanitizedData.reason as CreditNoteReasonEnum,
                issueDate: new Date(),
                clientBackup: {
                  firstName: bill?.client?.firstName,
                  name: bill?.client?.name,
                  mail: bill?.client?.mail,
                  road: bill?.client?.road,
                  phone: bill?.client?.phone,
                  addressNumber: bill?.client?.addressNumber,
                  city: bill?.client?.city,
                  postalCode: bill?.client?.postalCode,
                  additionalAddress: bill?.client?.additionalAddress,
              },
              elementsBackup: {
                  bill: bill?.number,
              },
            },
        });


        console.log("Avoir créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json(creditNote);


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
