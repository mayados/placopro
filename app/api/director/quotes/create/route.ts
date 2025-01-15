import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log("Données reçues dans la requête :", data);

    const { 
            validityEndDate, 
            natureOfWork, 
            description, 
            workStartDate, 
            estimatedWorkEndDate, 
            estimatedWorkDuration, 
            isQuoteFree, 
            quoteCost, 
            priceTTC, 
            priceHT, 
            travelCosts, 
            hourlyLaborRate, 
            paymentDelay,
            paymentTerms,
            latePaymentPenalities,
            recoveryFees,
            hasRightOfWithdrawal,
            withdrawalPeriod,
            clientId,
            workSiteId
        } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()
    if (!data) {
        return NextResponse.json({ success: false, message: "Aucune donnée reçue." }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ 
          success: false, 
          message: "Utilisateur non authentifié." 
      }, { status: 401 });
  }

    try {

      const sanitizedData = {
        ...data,
        workStartDate: data.workStartDate ? new Date(data.workStartDate).toISOString() : null,
        validityEndDate: data.validityEndDate ? new Date(data.validityEndDate).toISOString() : null,
        estimatedWorkEndDate: data.estimatedWorkEndDate ? new Date(data.estimatedWorkEndDate).toISOString() : null,
        isQuoteFree: isQuoteFree === "Oui" ? true : false,
        hasRightOfWithdrawal: hasRightOfWithdrawal=== "Oui" ? true : false,
        vatAmount: parseFloat(data.vatAmount) || 0,
        estimatedWorkDuration: parseInt(data.estimatedWorkDuration, 10) || 0,
        priceTTC: parseFloat(data.priceTTC) || 0,
        priceHT: parseFloat(data.priceHT) || 0,
        travelCosts: parseFloat(data.travelCosts) || 0,
        hourlyLaborRate: parseFloat(data.hourlyLaborRate) || 0,
        paymentDelay: parseInt(data.paymentDelay, 10) || 0,
        latePaymentPenalities: parseFloat(data.latePaymentPenalities) || 0,
        recoveryFees: parseFloat(data.recoveryFees) || 0,
        withdrawalPeriod: parseInt(data.withdrawalPeriod, 10) || 0,
        quoteCost: parseFloat(data.quoteCost) || 0,
    };


        // Generate an unique and chronological quote's number
        const generateQuoteNumber = async (type = "quote") => {
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
              // If the counter doesn't exist, define a counter base on fixed values
              // It's the case if quotes were created this year, before the release of the application. Because they won't be put in the application
              if (type === "quote" && currentYear === 2025) {
                // Begin at 3 if 2 quotes were already created
                nextNumber = 3; 
              }
              else {
                // For the other cases, begin at 1
                nextNumber = 1; 
              }
                        // Create a new counter
              await db.documentCounter.create({
                data: {
                  year: currentYear,
                  type: type,
                  current_number: nextNumber,
                },
              });
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
            const formattedNumber = `${"DEV"}-${currentYear}-${nextNumber}`;
          
            return formattedNumber;
          };

        const quoteNumber =  await generateQuoteNumber();

        // count totalHt for each QuoteService

        // count vatAmount for each QuoteService

        // count totalTTC for each QuoteService

        // count HT price
          
        // Count vat value

        //count TTC price


        // We create the quote thanks to te datas retrieved
        const quote = await db.quote.create({
            data: {
                number: quoteNumber,
                issueDate : new Date().toISOString(), 
                validityEndDate: sanitizedData.validityEndDate, 
                natureOfWork: sanitizedData.natureOfWork, 
                description: sanitizedData.description, 
                workStartDate: sanitizedData.workStartDate, 
                estimatedWorkEndDate: sanitizedData.estimatedWorkEndDate, 
                estimatedWorkDuration: sanitizedData.estimatedWorkDuration, 
                isQuoteFree: sanitizedData.isQuoteFree, 
                quoteCost: sanitizedData.quoteCost, 
                status: "Ready to be send", 
                vatAmount: 200,  
                priceTTC: 1500, 
                priceHT: 800, 
                travelCosts: sanitizedData.travelCosts, 
                hourlyLaborRate: sanitizedData.hourlyLaborRate, 
                paymentDelay: sanitizedData.paymentDelay,
                paymentTerms: sanitizedData.paymentTerms,
                latePaymentPenalties: sanitizedData.latePaymentPenalities,
                recoveryFee: sanitizedData.recoveryFees,
                isSignedByClient: false,
                signatureDate: null,
                hasRightOfWithdrawal: sanitizedData.hasRightOfWithdrawal,
                withdrawalPeriod: sanitizedData.withdrawalPeriod,
                clientId: clientId,
                workSiteId: workSiteId,
                userId: user.id,

            },
        });


        console.log("Devis créé avec succès.");
        
        return NextResponse.json({ success: true, data: quote });


    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

      return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
