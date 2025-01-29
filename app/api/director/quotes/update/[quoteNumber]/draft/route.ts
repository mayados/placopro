import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { 
        quoteId,
        number,
        validityEndDate,
        natureOfWork, 
        description,
        workStartDate,
        estimatedWorkEndDate,
        estimatedWorkDuration,
        vatAmount,
        isQuoteFree,
        hasRightOfWithdrawal,
        priceTTC,
        priceHT,
        travelCosts,
        hourlyLaborRate,
        paymentTerms,
        paymentDelay,
        latePaymentPenalities,
        recoveryFees,
        withdrawalPeriod,
        quoteCost,
        clientId,
        workSiteId,
        services,
        servicesToUnlink,
        serviceType,
        status,
  } = data;

  console.log(data)
  console.log("valeur de saveMode  : "+data.status)

  try {

    const initialQuote = await db.quote.findUnique({
      where: { 
        id: quoteId
      },
    });

    if(initialQuote){
      let travelCosts = initialQuote.travelCosts;
      let totalHTQuote = initialQuote.priceHT
      let totalTTCQuote = initialQuote.priceTTC
      let vatAmountQuote = initialQuote.vatAmount

    
      // construct dynamically update's object
      const updateData: Record<string, any> = {};
  
      // If the status changes
      if(data.status === "Ready"){
        updateData.status = data.status;
      }
      console.log("updated data : "+JSON.stringify(updateData.status))
  
  
      if(data.number !== null){
        updateData.number = data.number
      }
  
      if(data.validityEndDate !== null){
        updateData.validityEndDate = data.validityEndDate
      }
  
      if(data.natureOfWork !== null){
        updateData.natureOfWork = data.natureOfWork
      }
  
      if(data.description !== null){
        updateData.description = data.description
      }
      
      if(data.workStartDate !== null){
        updateData.workStartDate = data.workStartDate
      }
  
      if(data.estimatedWorkEndDate !== null){
        updateData.estimatedWorkEndDate = data.estimatedWorkEndDate
      }
  
      if (data.estimatedWorkDuration !== 0){
          updateData.estimatedWorkDuration = data.estimatedWorkDuration
      }
  
      if (data.travelCosts !== 0){
        // In case of travelCosts changing, 
        updateData.travelCosts = data.travelCosts
        travelCosts = data.travelCosts
        // First we need to count the quote's cost by erasing former travelCosts value. Then we can count with new travelCosts value
        // we make for TotalHTQuote : totalHTQuote - intialQuote.travelCosts 
        let priceHTWithoutFormerTravelCosts = totalHTQuote - travelCosts;
        // Count of vatAmount : initialQuote.priceTTC - initialQuote.priceHT 
        let vatAmountWithoutFormerTravelCosts = initialQuote.priceTTC - initialQuote.priceHT; 
        // totalTTCQuote :  totalTTCQuote - (totalHTQuote + vatAmount)
        let priceTTCWithoutFormerTravelCosts = totalTTCQuote - (totalHTQuote + vatAmountQuote);

        // Now we can count for the new travelsCosts, because we have quote's cost without any travelCosts
        totalHTQuote = priceHTWithoutFormerTravelCosts + travelCosts
        vatAmountQuote = priceHTWithoutFormerTravelCosts * 0.2
        totalTTCQuote = totalHTQuote + vatAmountQuote

        // We can add the values which will update the quote
        updateData.priceHT = totalHTQuote
        updateData.vatAmount = vatAmountQuote
        updateData.priceTTC = totalTTCQuote
    }
  
      if (data.paymentTerms !== null){
        updateData.paymentTerms = data.paymentTerms
    }
  
      if (data.paymentDelay !== null){
        updateData.paymentDelay = data.paymentDelay
    }
  
    if(data.latePaymentPenalties !== 0){
      updateData.latePaymentPenalties = data.latePaymentPenalties
    }
  
    if(data.recoveryFees !== 0){
      updateData.recoveryFees = data.recoveryFees
    }
  
  
    if(data.withdrawalPeriod !== 0){
      updateData.withdrawalPeriod = data.withdrawalPeriod
    }
  
    if(data.clientId !== null){
      updateData.clientId = data.clientId
    }
  
    if(data.workSiteId !== null){
      updateData.workSiteId = data.workSiteId
    }
  
    if(data.serviceType !== null){
      updateData.serviceType = data.serviceType
    }
  
      // If there are services added
      if(data.services.length !== 0){
  
        // Verify, for each service, if it already exists or not.
        // If it doesn't exist, create the service and a quoteService
        //  If it does exist, create a quoteService
        console.log("il y a des services à ajouter")
        for (const service of data.services) {
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
  
            let totalHTService = service.unitPriceHT * service.quantity;
            let vatRateService = parseFloat(service.vatRate);
            let vatAmountService = totalHTService * (vatRateService / 100);
            let totalTTCService = totalHTService + vatAmountService; 
  
            // Create a quoteService (we need Id of the service to create it)
            const newQuoteService = await db.quoteService.create({
              data: {
                quantity: parseFloat(service.quantity),
                totalHT: totalHTService,
                totalTTC: totalTTCService,
                vatAmount: vatAmountService,
                unit: service.unit,
                vatRate: service.vatRate,
                detailsService: service.detailsService,
                quoteId: quoteId,
                serviceId:  service.id,
              }
              
            })
  
            // Each service count for the total of the Quote
            totalHTQuote += totalHTService;
            vatAmountQuote += vatAmountService;
            totalTTCQuote += totalTTCService
            // Add variables to updateData to update the quote costs
            updateData.priceHT = totalHTQuote;
            updateData.priceTTC = totalTTCQuote;
            updateData.vatAmount = vatAmountQuote;
  
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
            // return existingService;
      
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
  
                let totalHTService = createdService.unitPriceHT * service.quantity;
                let vatRateService = parseFloat(service.vatRate);
                let vatAmountService = totalHTService * (vatRateService / 100);
                let totalTTCService = totalHTService + vatAmountService; 
  
                // Create a quoteService (we need Id of the service to create it)
                const newQuoteService = await db.quoteService.create({
                  data: {
                    quantity: parseFloat(service.quantity),
                    totalHT: totalHTService,
                    totalTTC: totalTTCService,
                    vatAmount: vatAmountService,
                    unit: service.unit,
                    vatRate: service.vatRate,
                    detailsService: service.detailsService,
                    quoteId: quoteId,
                    serviceId:  serviceId,
                  }
                })

                // Each service count for the total of the Quote
                totalHTQuote += totalHTService;
                vatAmountQuote += vatAmountService;
                totalTTCQuote += totalTTCService
                // Add variables to updateData to update the quote costs
                updateData.priceHT = totalHTQuote;
                updateData.priceTTC = totalTTCQuote;
                updateData.vatAmount = vatAmountQuote;
      
                console.log("Toutes les entités ont été créées avec succès pour le service :", service.label);
              });
            } catch (error) {
              console.error("Erreur lors de la création du service :", error);
            }
  
        }
        } 
      }
  
      // If there are services to unlink
      if(data.servicesToUnlink.length !== 0){
            // If there are services to unlink, we have to delete the quoteService in question (not the entire service because it can be use an other time)
        for (const quoteService of data.servicesToUnlink) {
          let totalHTService = quoteService.unitPriceHT * quoteService.quantity;
          let vatRateService = parseFloat(quoteService.vatRate);
          let vatAmountService = totalHTService * (vatRateService / 100);
          let totalTTCService = totalHTService + vatAmountService; 
          console.log("Le total HT du devis pour les services à supprimer : "+totalHTQuote+" €. Et le total HT du service : "+totalHTService+" €")
          totalHTQuote -= totalHTService;
          console.log("Le montant de TVA du devis pour les services à supprimer : "+vatAmountQuote+" €. Et le montant de TVA du service : "+vatRateService+" €")
          vatAmountQuote -= vatAmountService;
          console.log("Le total TTC du devis pour les services à supprimer : "+totalTTCQuote+" €. Et le total TTC du service : "+totalTTCService+" €")
          totalTTCQuote -= totalTTCService
          // Add variables to updateData to update the quote costs
          updateData.priceHT = totalHTQuote;
          updateData.priceTTC = totalTTCQuote;
          updateData.vatAmount = vatAmountQuote;

          await db.quoteService.delete({
            where: {
              id: quoteService.id
            },
          });
          console.log(`Service supprimé avec succès`);
        }
      }
      // we have to verify, for each value which can be updated. If the value received is null there is no data tu update for the field. 
  
      // if a service was deleted or added, we have to re-count priceHT ans price TTC for the Quote
      // it is the same for travelCosts
  
  
      // Verify if there are datas to update
      // In all the cases, we have 2 values : the number and the saveMode. 
      // But if the status's value has changed, we have to update
      if (Object.keys(updateData).length === 2) {
        return new NextResponse("No data to update", { status: 400 });
      }
  
      
  
      // If there are services added (in services), we have to verify if the service already exists, create a quoteService linked
  
      // Update in database
      const updateOfQuote = await db.quote.update({
        where: { number: data.number },
        data: updateData,
      });
  
      const updatedQuote = await db.quote.findUnique({
        where: { number: data.number },
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
  
      return NextResponse.json({ updatedQuote: updatedQuote }, { status: 200 });
    }


  } catch (error) {
    console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
    // console.error("Error with quote's update:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
