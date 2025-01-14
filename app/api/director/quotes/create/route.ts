import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            validityEndDate, 
            natureOfWork, 
            description, 
            workStartDate, 
            estimatedWorkEndDate, 
            estimatedWorkDuration, 
            isQuoteFree, 
            quoteCost, 
            vatAmount,  
            priceTTC, 
            priceHT, 
            travelCosts, 
            hourlyLaborRate, 
            paymentTerms ,
            latePaymentPenalties,
            recoveryFee,
            isSignedByClient,
            signatureDate,
            hasRightOfWithdrawal,
            withdrawalPeriod,
            clientId,
            workSiteId
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

        // Generate an unique and chronological quote's number
        const generateQuoteNumber = async (type = "quote") => {
            const currentYear = new Date().getFullYear();
          
            // Chercher le compteur pour l'année en cours et le type de document
            let counter = await db.documentCounter.findFirst({
              where: {
                year: currentYear,
                type: type, // "quote" pour devis ou "bill" pour facture
              },
            });
          
            let nextNumber = 1; // Valeur par défaut si aucun compteur n'existe
          
            if (!counter) {
              // Si le compteur n'existe pas, définir un compteur basé sur des valeurs fixes
              // Par exemple, si vous savez qu'il y a déjà 2 factures en 2025
              if (type === "quote" && currentYear === 2025) {
                nextNumber = 3; // On commence à 3 si 2 factures ont déjà été créées
              }
              else {
                nextNumber = 1; // Pour les autres cas, commencer à 1
              }
          
              // Créer un nouveau compteur
              await db.documentCounter.create({
                data: {
                  year: currentYear,
                  type: type,
                  current_number: nextNumber,
                },
              });
            } else {
              // Si un compteur existe, incrémenter le numéro
              nextNumber = counter.current_number + 1;
          
              // Mettre à jour le compteur dans la base de données
              await db.documentCounter.update({
                where: { id: counter.id },
                data: { current_number: nextNumber },
              });
            }
          
            // Générer le numéro du document (par exemple, BILL-2025-3 pour la 3ème facture en 2025)
            const formattedNumber = `${"DEV"}-${currentYear}-${nextNumber}`;
          
            return formattedNumber;
          };
          


        // We create the company thanks to te datas retrieved
        const quote = await db.quote.create({
            data: {
                number: 0,
                issueDate : "", 
                validityEndDate: validityEndDate, 
                natureOfWork: natureOfWork, 
                description: description, 
                workStartDate: workStartDate, 
                estimatedWorkEndDate: estimatedWorkEndDate, 
                estimatedWorkDuration: estimatedWorkDuration, 
                isQuoteFree: isQuoteFree, 
                quoteCost: quoteCost, 
                status: "", 
                vatAmount: vatAmount,  
                priceTTC: priceTTC, 
                priceHT: priceHT, 
                travelCosts: travelCosts, 
                hourlyLaborRate: hourlyLaborRate, 
                paymentDelay: 0,
                paymentTerms: paymentTerms,
                latePaymentPenalties: latePaymentPenalties,
                recoveryFee: recoveryFee,
                isSignedByClient: isSignedByClient,
                signatureDate: signatureDate,
                hasRightOfWithdrawal: hasRightOfWithdrawal,
                withdrawalPeriod: withdrawalPeriod,
                clientId: clientId,
                workSiteId: workSiteId,
                userId: user.id,
            },
        });


        console.log("Devis créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: quote });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
