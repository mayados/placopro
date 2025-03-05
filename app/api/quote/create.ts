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
            discountAmount,
            depositAmount,
            discountReason
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
        discountAmount: parseFloat(data.discountAmount) || 0,
        discountReason: data.discountReason || null,
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
          // Retrieve unit from database for each service : already existing because we have a list of it when creating the quote
          const serviceUnit = await db.unit.findUnique({
            where: { label: service.unit },
          });
      
          // Retrieve vatRate from database for each service : already existing because we have a list of it when creating the quote
          const serviceVatRate = await db.vatRate.findUnique({
            where: { rate: parseFloat(service.vatRate) },
          });
      
          // If the service has an id = already exists. We retrieve it from the database
          if (service.id) {
            console.log("je rentre dans le cas où l'id du service existe");
      
            const existingService = await db.service.findUnique({
              where: { id: service.id },
              include: {
                units: true,
                vatRates: true,
              },
            });
      
            if (!existingService) {
              console.error("Le service avec cet ID n'existe pas :", service.id);
              return null;
            }
      
            // if the unit isn't contained in the list of the units of the service, we create it (entity ServiceUnint)
            if (serviceUnit && !existingService.units.some(unit => unit.id === serviceUnit.id)) {
              await db.serviceUnit.create({
                data: {
                  unitId: serviceUnit.id,
                  serviceId: existingService.id,
                },
              });
            }
      
            // if the vatRate isn't contained in the list of the vatRates of the service, we create it (entity ServiceVatRate)
            if (serviceVatRate && !existingService.vatRates.some(vatRate => vatRate.id === serviceVatRate.id)) {
              await db.serviceVatRate.create({
                data: {
                  vatRateId: serviceVatRate.id,
                  serviceId: existingService.id,
                },
              });
            }
      
            console.log("VatRate added to the list of vatRates of the service (new serviceVatRate created):", service.id);
            return existingService;
      
          } else {
            //  If the service doesn't have an ID, we create it but also create : ServiceUnit, ServiceVatRate,
            console.log("je rentre dans le cas où l'id du service est null ou undefined");
      
            try {
              await db.$transaction(async (tx) => {
                const createdService = await tx.service.create({
                  data: {
                    label: service.label,
                    unitPriceHT: parseFloat(service.unitPriceHT),
                    type: service.type,
                  },
                });
      
                const serviceId = createdService.id;
      
                if (serviceUnit) {
                  await tx.serviceUnit.create({
                    data: {
                      unitId: serviceUnit.id,
                      serviceId,
                    },
                  });
                }
      
                if (serviceVatRate) {
                  await tx.serviceVatRate.create({
                    data: {
                      vatRateId: serviceVatRate.id,
                      serviceId,
                    },
                  });
                }
      
                console.log("Toutes les entités ont été créées avec succès pour le service :", service.label);
              });
            } catch (error) {
              console.error("Erreur lors de la création du service :", error);
            }
          }
        })
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
                status: "Ready", 
                vatAmount: 0,  
                priceTTC: 0, 
                priceHT: 0, 
                depositAmount: depositAmount,
                discountAmount: discountAmount,
                discountReason: discountReason,
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
      const quoteServices = await Promise.all(
        data.services.map(async (service: ServiceAndQuoteServiceType) => {
          // First, we retrieve the id of the service, because now, all services have an ID. We can retrieve it thanks to its unique label. 
          const serviceRetrieved = await db.service.findUnique({
            where: {
              label:service.label
            },
            select : {
              id: true,
            }
          })

          if(serviceRetrieved){

            console.log("le service "+service)
            console.log("prix unitaire "+service.unitPriceHT)
            // Calculs for each service to put datas in quoteService
            console.log("type de données de unitPriceHt du service : "+typeof(service.unitPriceHT))
            console.log("Type de quantity :", typeof service.quantity, "Valeur :", service.quantity);

            let totalHTService = service.unitPriceHT * service.quantity;
            console.log("total HT pour le service "+service.label+" : "+totalHTService+" €")
            let vatRateService = parseFloat(service.vatRate);
            let vatAmountService = totalHTService * (vatRateService / 100);
            console.log("total montant de la TVA pour le service "+service.label+" : "+vatAmountService+" €")
            let totalTTCService = totalHTService+vatAmountService; 
            console.log("total TTC pour le service "+service.label+" : "+totalTTCService+" €")


            console.log("les premieres variables de  calculs ont été effectués")
            // Each service count for the total of the Quote
            totalHtQuote += totalHTService;
            vatAmountQuote += vatAmountService;
            totalTTCQuote += totalTTCService
            console.log("dans les services, affichage ttc du devis  : "+totalTTCQuote)
            console.log("les calculs de la premiere version ont été effectués")
            // Create QuoteService

  
            const quoteService = await db.quoteService.create({
              data: {
                vatRate: service.vatRate,
                unit: service.unit,
                quantity: Number(service.quantity),
                totalHT: totalHTService,
                vatAmount: vatAmountService,
                totalTTC: totalTTCService,
                detailsService: service.detailsService,
                quoteId: quote.id,
                serviceId: serviceRetrieved.id,
              },
            });  
            
          }

        
        })
      )

      // add travelCosts to totalHtQuote (which contains services costs HT)
      totalHtQuote += parseFloat(travelCosts)
      totalHtQuote-= discountAmount
      // Count vatAmount for travelCosts and add the result to vatAmountQuote
      const vatAmountForTravelCosts = travelCosts * (20 / 100);
      console.log("montant tva pour les trajets : "+vatAmountForTravelCosts)
      vatAmountQuote += vatAmountForTravelCosts
      console.log("montant tva du devis : "+vatAmountQuote)
      // add totalTTC travelCosts to totalTTCQuote
      totalTTCQuote += parseFloat(travelCosts) + Number(vatAmountForTravelCosts)
      console.log("total du prix du devis : "+totalTTCQuote)

        //update Quote
        const newQuote = await db.quote.update({
              where: { id: quote.id },
              data: {
                vatAmount: vatAmountQuote,
                priceHT: Number(totalHtQuote),
                priceTTC: totalTTCQuote,
              }
        })

        console.log("Quote created with success.");
        
        return NextResponse.json({ success: true, data: newQuote });


    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

      return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
