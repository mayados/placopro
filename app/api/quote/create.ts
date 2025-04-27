import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createQuoteDraftSchema, createQuoteFinalSchema } from "@/validation/quoteValidation";
import { sanitizeData } from "@/lib/sanitize"; 
import { QuoteStatusEnum } from "@prisma/client";


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
      // Explicit validation of CSRF token (in addition of the middleware)
      // const csrfToken = req.headers.get("x-csrf-token");
      // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
      //   return new Response("Invalid CSRF token", { status: 403 });
      // }
    console.log("Données reçues dans la requête :", data);

  

        
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

      // Détecter si la facture est en "brouillon" ou en "final"
        // Exclure 'status' du schéma de validation Zod
        const { status, ...dataWithoutStatus } = data;
      
        // Choisir le schéma en fonction du statut (avant ou après validation)
        const schema = status === QuoteStatusEnum.READY ? createQuoteFinalSchema : createQuoteDraftSchema;
              
        // Validation avec Zod (sans 'status')
        const parsedData = schema.safeParse(dataWithoutStatus);
        if (!parsedData.success) {
            console.error("Validation Zod échouée :", parsedData.error.format());
      
            return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
        }
       
      // Validation réussie, traiter les données avec le statut
      // Sanitizing datas
      const sanitizedData = sanitizeData(parsedData.data);
      console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
      // Ajoute le statut aux données validées
      sanitizedData.status = status;
              




      // Generate an unique and chronological quote's number if the status is Ready / fictive number if the status is draft
      const generateQuoteNumber = async (type = "quote", isDraft = false) => {
            
          // If it was saved as a draft, we generate a fictive number
          if(isDraft){
            return `DRAFT-DEV-${Date.now()}`
          }
        
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

      // We have to know if the quote was saved as a draft
      const isDraft = status === QuoteStatusEnum.DRAFT;
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
                status: status,
                issueDate : new Date().toISOString(), 
                validityEndDate: sanitizedData.validityEndDate, 
                natureOfWork: sanitizedData.natureOfWork, 
                description: sanitizedData.description, 
                workStartDate: sanitizedData.workStartDate, 
                estimatedWorkEndDate: sanitizedData.estimatedWorkEndDate, 
                estimatedWorkDuration: sanitizedData.estimatedWorkDuration, 
                isQuoteFree: sanitizedData.isQuoteFree === "Oui" ? true : false, 
                quoteCost: 0, 
                vatAmount: 0,  
                priceTTC: 0, 
                priceHT: 0, 
                depositAmount: sanitizedData.depositAmount,
                discountAmount: sanitizedData.discountAmount,
                discountReason: sanitizedData.discountReason,
                travelCosts: sanitizedData.travelCosts ?? 0, 
                // hourlyLaborRate: 0, 
                paymentDelay: sanitizedData.paymentDelay ?? 0,
                paymentTerms: sanitizedData.paymentTerms ?? "",
                latePaymentPenalties: sanitizedData.latePaymentPenalities,
                recoveryFee: sanitizedData.recoveryFees,
                isSignedByClient: false,
                signatureDate: null,
                hasRightOfWithdrawal: sanitizedData.hasRightOfWithdrawal=== "Oui" ? true : false,
                withdrawalPeriod: sanitizedData.withdrawalPeriod,
                clientId: sanitizedData.clientId,
                workSiteId: sanitizedData.workSiteId,
                userId: user.id,

            },
        });

      // stock datas for backup for quoteServices
      const quoteServicesWithData = [];


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

            const totalHTService = service.unitPriceHT * service.quantity;
            console.log("total HT pour le service "+service.label+" : "+totalHTService+" €")
            const vatRateService = parseFloat(service.vatRate);
            const vatAmountService = totalHTService * (vatRateService / 100);
            console.log("total montant de la TVA pour le service "+service.label+" : "+vatAmountService+" €")
            const totalTTCService = totalHTService+vatAmountService; 
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
                detailsService: service.detailsService || "",
                quoteId: quote.id,
                serviceId: serviceRetrieved.id,
              },
              include: {
                // essential to access service object for backup
                service: true 
            }
          });  
          // we add services to the backup's datas
          quoteServicesWithData.push({
            // datas of the associated service
            label: quoteService.service.label,
            unitPriceHT: quoteService.service.unitPriceHT,
            type: quoteService.service.type,
            // datas of billService
            quantity: quoteService.quantity,
            unit: quoteService.unit,
            vatRate: quoteService.vatRate,
            totalHT: quoteService.totalHT,
            vatAmount: quoteService.vatAmount,
            totalTTC: quoteService.totalTTC,
            detailsService: quoteService.detailsService || '',
            discountAmount: quoteService.discountAmount || 0,
            discountReason: quoteService.discountReason || null
          });         
            
          }

        
        })
      )

      // add travelCosts to totalHtQuote (which contains services costs HT)
      totalHtQuote += sanitizedData.travelCosts ?? 0
      // totalHtQuote-= sanitizedData.discountAmount ?? 0
      // Count vatAmount for travelCosts and add the result to vatAmountQuote
      const vatAmountForTravelCosts = (sanitizedData.travelCosts ?? 0) * (20 / 100);
      console.log("montant tva pour les trajets : "+vatAmountForTravelCosts)
      vatAmountQuote += vatAmountForTravelCosts
      console.log("montant tva du devis : "+vatAmountQuote)
      // add totalTTC travelCosts to totalTTCQuote
      totalTTCQuote += (sanitizedData.travelCosts ?? 0) + Number(vatAmountForTravelCosts)
      console.log("total du prix du devis : "+totalTTCQuote)

      const clientId = sanitizedData.clientId

      const workSiteId = sanitizedData.workSiteId

      const client = await db.client.findUnique({
        where: {id: clientId},
      })

      const workSite = await db.workSite.findUnique({
        where: {id: workSiteId},
      })
      
        //update Quote
        const newQuote = await db.quote.update({
              where: { id: quote.id },
              data: {
                vatAmount: vatAmountQuote,
                priceHT: Number(totalHtQuote),
                priceTTC: totalTTCQuote,
                     // Add backup fields only for FINAL bills
                    ...(status === QuoteStatusEnum.READY && {
                        clientBackup: {
                            firstName: client?.firstName,
                            name: client?.name,
                            mail: client?.mail,
                            road: client?.road,
                            addressNumber: client?.addressNumber,
                            city: client?.city,
                            postalCode: client?.postalCode,
                            additionalAddress: client?.additionalAddress,
                        },
                        workSiteBackup: {
                            road: workSite?.road,
                            addressNumber: workSite?.addressNumber,
                            city: workSite?.city,
                            postalCode: workSite?.postalCode,
                            additionalAddress: workSite?.additionalAddress,
                        },
                        servicesBackup: quoteServicesWithData,
                        elementsBackup: {
                          vatAmount: vatAmountQuote,
                          priceHT: Number(totalHtQuote),
                          priceTTC: totalTTCQuote,
                        },
                    }),
              }
        })

        console.log("Quote created with success.");
        
        return NextResponse.json(newQuote);


    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

      return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
