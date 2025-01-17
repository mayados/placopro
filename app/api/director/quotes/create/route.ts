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
            workSiteId,
            services,
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

      // for each data.services : see if it already exists. If it's the case, it has an id. In the other case, the Id is null.
      // we wait for all the promises to be resolved before to continue
      const servicesManaged = await Promise.all(
        data.services.map(async (service: ServiceType) => {

          // First, we find the unit and tvaRate in the database because we need it after
          const serviceUnit = await db.unit.findUnique({
            where: {
              label: service.unit
            },
          })

          const serviceVatRate = await db.vatRate.findUnique({
            where: {
              rate: parseFloat(service.vatRate)
            },
          })

          if (service.id === null && serviceUnit != undefined && serviceVatRate != undefined) {
            //if the id is null, we create a new service, ServiceUnit and ServiceVatRate
 
            await db.$transaction(async (tx) => {
              // 1 : Service's creation
              const createdService = await tx.service.create({
                data: {
                  label: service.label,
                  unitPriceHT: parseFloat(service.unitPriceHT),
                  type: service.type,
                },
              });
            
              // Get id of createdService
              const serviceId = createdService.id; 
            
              // 2 : ServiceUnit's creation
              const createdServiceUnit = await tx.serviceUnit.create({
                data: {
                  unitId: serviceUnit.id,
                  serviceId, 
                },
              });
            
              // 3 : ServiceVatRate's creation
              const createdServiceVatRate = await tx.serviceVatRate.create({
                data: {
                  vatRateId: serviceVatRate.id,
                  serviceId, 
                },
              });
            
              console.log("Toutes les entités ont été créées avec succès.");
            });
            
          } else {
          // If the id is not null, we update
            const existingService = await db.service.findUnique({
              where: { id: service.id },
              // get the Client object
              include: {
                units: true, 
                vatRates: true,
              },
            });
      
            if (!existingService) {
              console.error("Le service avec cet ID n'existe pas :", service.id);
              return null; 
            }
      
            // Verify if the unit or the vatRate is in the service or if we need to update
            // existingService.units is an object Array, so we need to 
            if (serviceUnit && !existingService.units.some(unit => unit.id === serviceUnit.id)) {
              // We create a ServiceUnit
              const newServiceUnit = await db.serviceUnit.create({
                data: {
                  unitId: serviceUnit.id, 
                  serviceId: existingService.id,
                },
              });
              // We create a ServiceVatRate
              if (serviceVatRate && !existingService.vatRates.some(vatRate => vatRate.id === serviceVatRate.id)) {
                // We create a ServiceUnit
                const newServiceVatRate = await db.serviceVatRate.create({
                  data: {
                    vatRateId: serviceVatRate.id, 
                    serviceId: existingService.id,
                  },
                });
      
              console.log("ServiceVatRate / serviceUnit créé(s) :", newServiceUnit);
            }
      
            // Aucun changement nécessaire
            console.log("Aucune mise à jour requise pour le service :", service.id);
            return existingService; // Retournez le service existant
          }
        }})
      
      );
    
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
                vatAmount: 0,  
                priceTTC: 0, 
                priceHT: 0, 
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

      // global variables to use later in the code for Quote update
      let totalHtQuote = 0;
      let vatAmountQuote = 0;
      let totalTTCQuote = 0;


      // now we know each service is in the database, and the quote is created we can make operations on it
      const qoteServices = await Promise.all(
        servicesManaged.map(async (service: ServiceType) => {

          // Calculs for each service to put datas in quoteService
          let totalHTService = sanitizedData.service.unitPriceHT * sanitizedData.service.quantity;
          console.log("total HT pour le service "+service.label+" : "+totalHTService+" €")
          let vatRateService = parseFloat(service.vatRate);
          let vatAmountService = totalHTService * (vatRateService / 100);
          console.log("total montant de la TVA pour le service "+service.label+" : "+vatAmountService+" €")
          let totalTTCService = totalHTService+vatAmountService; 
          console.log("total TTC pour le service "+service.label+" : "+totalTTCService+" €")

          // Each service count for the total of the Quote
          totalHtQuote += totalHTService;
          vatAmountQuote += vatAmountService;
          totalTTCQuote += totalTTCService

          // Create QuoteService
          const quoteService = await db.quoteService.create({
            data: {
              quantity: sanitizedData.service.quantity,
              totalHT: totalHTService,
              vatAmount: vatAmountService,
              totalTTC: totalTTCService,
              detailsService: sanitizedData.service.detailsService,
              quoteId: quote.id,
              serviceId: service.id,
            },
          });
        
        })
      )


        //update Quote

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
