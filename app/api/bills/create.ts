import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    console.log("Données reçues dans la requête :", data);

    const { 
          number,
          dueDate,
          natureOfWork,
          description,
          issueDate,
          vatAmount,
          totalTtc,
          totalHt,
          serviceType,
          workSiteId,
          quoteId,
          clientId,
          services,
          servicesToUnlink,
          servicesAdded,
          status
        } = data;
            // currentUser() is a founction from Clerk which allows to retrieve the current User
            const user = await currentUser()
            console.log("le user actuel : "+user)
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
        number,
        natureOfWork,
        description,
        totalHt: parseFloat(data.totalHt) || 0,
        totalTtc: parseFloat(data.totalTtc) || 0,
        vatAmount: parseFloat(data.vatAmount) || 0,
        issueDate: data.issueDate ? new Date(data.issueDate).toISOString() : null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
        status,
        clientId,
        workSiteId,
        quoteId,
        services,
    };

    let newBill;


    const generateBillNumber = async (type = "bill") => {
      const currentYear = new Date().getFullYear();
  
      // Vérifier si le compteur existe déjà
      let counter = await db.documentCounter.findFirst({
          where: { year: currentYear, type },
      });
  
      // Si le compteur n'existe pas, le créer avec une valeur spécifique
      if (!counter) {
          let startValue = 1; // Valeur par défaut
  
          // Appliquer des valeurs fixes selon l'année et le type de document
          if (type === "bill" && currentYear === 2025) {
              startValue = 3; // Commencer à 3 pour les bills en 2025
          }
  
          counter = await db.documentCounter.create({
              data: { year: currentYear, type, current_number: startValue },
          });
      } else {
          // Sinon, on l'incrémente directement
          counter = await db.documentCounter.update({
              where: { id: counter.id },
              data: { current_number: { increment: 1 } },
          });
      }
  
      // Générer le numéro de facture (ex: FAC-2025-3)
      return `FAC-${currentYear}-${counter.current_number}`;
  };
  
      const billNumber =  await generateBillNumber();

      // Verify if servicesToUnlink and servicesAdded both = 0 
      if(servicesToUnlink.length === 0 && servicesAdded.length === 0){
          // We create the bill thanks to te datas retrieved. No counts to make because everything is the same than in the quote.
          const newBill = await db.bill.create({
            data: {
                number: billNumber,
                issueDate : new Date().toISOString(), 
                dueDate: sanitizedData.dueDate, 
                natureOfWork: natureOfWork, 
                description: sanitizedData.description, 
                status: status, 
                vatAmount: vatAmount,  
                totalTtc: totalTtc, 
                totalHt: totalHt, 
                userId: user.id,
                // clientId: clientId,
                client: {
                  connect: { id: clientId }
              },
              workSite: {
                  connect: { id: workSiteId }
              },
              quote: quoteId ? {
                  connect: { id: quoteId }
              } : undefined
            },
        });

        console.log("Bill created with success.");

      }

      // verify if there is change in servicesToUnlink and / or servicesAdded 
      if((servicesToUnlink.length > 0 && servicesAdded.length > 0) || (servicesToUnlink.length > 0 && servicesAdded.length === 0) || (servicesToUnlink.length === 0 && servicesAdded.length > 0)){

        let newTotalHt = totalHt
        let newTotalTtc = totalTtc
        let newVatAmount = vatAmount
        const updateData: Record<string, string | number | boolean> = {};


        // In all the case we create the Bill, then we will update it
        const bill = await db.bill.create({
          data: {
              number: billNumber,
              issueDate : new Date().toISOString(), 
              dueDate: sanitizedData.dueDate, 
              natureOfWork: sanitizedData.natureOfWork, 
               description: sanitizedData.description, 
              status: status, 
              vatAmount: vatAmount,  
              totalTtc: totalTtc, 
              totalHt: totalHt, 
              clientId: clientId,
              workSiteId: workSiteId,
              userId: user.id,
              quoteId: quoteId
    
          },
      });

        // If services unlinked => for each service, delete the associated billService, count and minus it to the quote's total
        if(servicesToUnlink.length > 0){
          for (const service of servicesToUnlink) {
            const totalHTService = service.unitPriceHT * service.quantity;
            const vatRateService = parseFloat(service.vatRate);
            const vatAmountService = service.vatAmount * (vatRateService/100)
            const totalTTCService = totalHTService + vatAmountService
  
            newTotalHt -= totalHTService;
            newTotalTtc -= totalTTCService;
            newVatAmount -= vatAmountService;

            Object.assign(updateData, {
              totalHtHT: Math.max(0, newTotalHt),
              vatAmount: Math.max(0, newVatAmount),
              totalTtc: Math.max(0, newTotalTtc)
            });
  
            await db.billService.delete({
              where: { id: service.id },
            });
          }
        }

        // If services added => for each service,verify if it already exists in database, create a billService, count and add it to the quote's total
        if(servicesAdded.length > 0){
          for (const service of servicesAdded) {

            const totalHTService = service.unitPriceHT * service.quantity;
            const vatRateService = parseFloat(service.vatRate);
            const vatAmountService = service.vatAmount * (vatRateService/100)
            const totalTTCService = totalHTService + vatAmountService
  
            newTotalHt += totalHTService;
            newTotalTtc += totalTTCService;
            newVatAmount += vatAmountService;

            // verify if the service already exists
            const existingService = await db.service.findUnique({
              where: { id: service.id },
              include: {
                units: true,
                vatRates: true,
              },
            });

            
            if(existingService){
              // create a billService
              const billService = await db.billService.create({
                data: {
                  vatRate: service.vatRate,
                  unit: service.unit,
                  quantity: Number(service.quantity),
                  totalHT: service.totalHt,
                  vatAmount: service.vatAmount,
                  totalTTC: service.totalTTC,
                  detailsService: service.detailsService,
                  billId: bill.id,
                  serviceId: service.id,
                },
              });  
            }
            // If the service doesn't exists, create it, then create a billService
            if(!existingService){
              const createNewService = async (
                service: ServiceAndQuoteServiceType,
                quoteId: string,
                updateData: Record<string, string | number | boolean>
              ) => {
                const serviceUnit = await db.unit.findUnique({
                  where: { label: service.unit },
                });
              
                const serviceVatRate = await db.vatRate.findUnique({
                  where: { rate: parseFloat(service.vatRate) },
                });
              
                const createdService = await db.service.create({
                  data: {
                    label: service.label,
                    unitPriceHT: parseFloat(service.unitPriceHT.toString()),
                    type: service.type,
                  },
                });
              
                if (serviceUnit) {
                  await db.serviceUnit.create({
                    data: {
                      unitId: serviceUnit.id,
                      serviceId: createdService.id,
                    },
                  });
                }
              
                if (serviceVatRate) {
                  await db.serviceVatRate.create({
                    data: {
                      vatRateId: serviceVatRate.id,
                      serviceId: createdService.id,
                    },
                  });
                }
            
              };
            }
            Object.assign(updateData, {
              totalHtHT: Math.max(0, newTotalHt),
              vatAmount: Math.max(0, newVatAmount),
              totalTtc: Math.max(0, newTotalTtc)
            });
          }

          //update bill

          const newBill = await db.bill.update({
            where: { number: bill.id },
            data: updateData,
          });
        }

      }

              
      return NextResponse.json({ success: true, data: newBill });


    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

      return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
