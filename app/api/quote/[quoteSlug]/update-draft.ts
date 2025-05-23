import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { updateDraftQuoteSchema, updateDraftFinalQuoteSchema } from "@/validation/quoteValidation";
import { sanitizeData } from "@/lib/sanitize";
import { QuoteStatusEnum } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { buildServiceBackup } from "@/modules/quote/backup";


export async function PUT(req: NextRequest) {
  const data = await req.json();
  // Explicit validation of CSRF token (in addition of the middleware)
  // const csrfToken = req.headers.get("x-csrf-token");
  // if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
  //   return new Response("Invalid CSRF token", { status: 403 });
  // }
  // const { 
  //       quoteId,
  //       number,
  //       validityEndDate,
  //       natureOfWork, 
  //       description,
  //       workStartDate,
  //       estimatedWorkEndDate,
  //       estimatedWorkDuration,
  //       vatAmount,
  //       isQuoteFree,
  //       hasRightOfWithdrawal,
  //       priceTTC,
  //       priceHT,
  //       travelCosts,
  //       hourlyLaborRate,
  //       paymentTerms,
  //       paymentDelay,
  //       latePaymentPenalities,
  //       recoveryFee,
  //       withdrawalPeriod,
  //       quoteCost,
  //       clientId,
  //       workSiteId,
  //       services,
  //       servicesToUnlink,
  //       serviceType,
  //       status,
  //       discountAmount,
  //       discountReason
  // } = data;

  const user = await currentUser();


  // Détecter si la facture est enregistrée en tant que "brouillon" ou en "final"
  // Exclure 'status' du schéma de validation Zod
  const { status, quoteId, ...dataWithoutStatus } = data;
  console.log("Quote ID extrait:", quoteId); // Vérifie s'il est bien défini

  // Choisir le schéma en fonction du statut (avant ou après validation)
  const schema = status === QuoteStatusEnum.READY ? updateDraftFinalQuoteSchema : updateDraftQuoteSchema;

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
  // sanitizedData.status = status;
  sanitizedData.quoteId = quoteId;
  // sanitizedData.number = number;

  console.log(data)
  console.log("valeur de saveMode  : " + data.status)

  // Utils functions for simple properties
  const isNotNull = (value: string | number | boolean): boolean => value !== null && value !== undefined;

  const updateIfNotNull = (updateData: Record<string, string | number | boolean>, field: string, value: string | number | boolean) => {
    if (isNotNull(value)) {
      updateData[field] = typeof value === 'string' && !isNaN(Number(value))
        ? parseFloat(value)
        : value;
    }
  };

  // Calculations : vatAmount and priceTTC
  const calculateTotals = (baseAmount: number, vatRate: number = 0.2) => {
    const vatAmount = baseAmount * vatRate;
    const totalTTC = baseAmount + vatAmount;
    return { vatAmount, totalTTC };
  };

  // Creation of a quoteService for an existing service (=serviceId retrieved form data not null)
  const handleExistingService = async (
    service: ServiceAndQuoteServiceType,
    quoteId: string,
    // updateData: Record<string, string | number | boolean>
  ) => {
    const totalHTService = service.unitPriceHT * service.quantity;
    const vatRateService = parseFloat(service.vatRate);
    const { vatAmount: vatAmountService, totalTTC: totalTTCService } = calculateTotals(totalHTService, vatRateService / 100);

    await db.quoteService.create({
      data: {
        quantity: parseFloat(service.quantity.toString()),
        totalHT: totalHTService,
        totalTTC: totalTTCService,
        vatAmount: vatAmountService,
        unit: service.unit,
        vatRate: service.vatRate,
        detailsService: service.detailsService,
            quote: {
      connect: { id: quoteId }
    },
    service: {
      connect: { id: service.id }
    }
      
      }
    });

    return { totalHTService, vatAmountService, totalTTCService };
  };

  // Creation of a new Service for (=serviceId retrieved form data is null)
  const createNewService = async (
    service: ServiceAndQuoteServiceType,
    quoteId: string,
    // updateData: Record<string, string | number | boolean>
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

    return handleExistingService({
      ...service,
      id: createdService.id
    }, quoteId);
  };

  // Generate an unique and chronological quote's number if the status is Ready / fictive number if the status is draft
  const generateQuoteNumber = async (type = "quote", isDraft = false) => {

    // If it was saved as a draft, we generate a fictive number
    if (isDraft) {
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

  // Update(s)
  try {

    // Retrieve initialQuote from database (quote to modify)
    const initialQuote = await db.quote.findUnique({
      where: { id: data.quoteId },
    });

    if (!initialQuote) {
      return new NextResponse("Quote not found", { status: 404 });
    }

    const existingQuoteServices = await db.quoteService.findMany({
      where: { quoteId: data.quoteId },
      include: {
        service: true,
      },
    });

    const serviceIdsToRemove = data.servicesToUnlink.map((s: QuoteServiceType) => s.id);
    const remainingQuoteServices = existingQuoteServices.filter(
      (qs) => !serviceIdsToRemove.includes(qs.id)
    );
    const remainingServicesForBackup: ServiceBackup[] = remainingQuoteServices.map(qs => buildServiceBackup(qs));




    // Financial initial values allowing to calcul the different prices
    let totalHTQuote = initialQuote.priceHT;
    let vatAmountQuote = initialQuote.vatAmount;
    let totalTTCQuote = initialQuote.priceTTC;

    const updateData: Record<string, string | number | boolean> = {};

    // // Check if we're changing from draft to ready status
    // const isChangingToReady = initialQuote.status === QuoteStatusEnum.DRAFT && data.status === QuoteStatusEnum.READY;

    // Generate new number if status is draft and we're creating a new quote or changing to ready
    if (data.status === QuoteStatusEnum.READY && (initialQuote.status === QuoteStatusEnum.DRAFT || !initialQuote.number)) {
      const newQuoteNumber = await generateQuoteNumber();
      updateData.number = newQuoteNumber;
    } else {
      // Keep the original number for updates that don't change status from draft to ready
      updateIfNotNull(updateData, 'number', data.number);
    }

    const isFinalizingQuote =
      initialQuote.status === QuoteStatusEnum.DRAFT &&
      data.status === QuoteStatusEnum.READY;


    // Update simple fields 
    const fieldsToUpdate = [
      'status', 'number', 'validityEndDate', 'natureOfWork', 'description',
      'workStartDate', 'estimatedWorkEndDate', 'estimatedWorkDuration',
      'paymentTerms', 'paymentDelay', 'latePaymentPenalties', 'recoveryFee',
      'withdrawalPeriod', 'clientId', 'workSiteId', 'serviceType', 'discountAmount', 'discountReason'
    ];

    // For each simple field, if it's not null, we update it (by placing it into the const updateData)
    fieldsToUpdate.forEach(field => updateIfNotNull(updateData, field, sanitizedData[field]));

    // Manage travelCosts (if data retrieved are ot null)
    if (isNotNull(data.travelCosts)) {
      const newTravelCosts = parseFloat(data.travelCosts.toString());
      updateData.travelCosts = newTravelCosts;

      const priceHTWithoutFormerTravelCosts = totalHTQuote - initialQuote.travelCosts;
      totalHTQuote = priceHTWithoutFormerTravelCosts + newTravelCosts;

      const { vatAmount: newVatAmount } = calculateTotals(newTravelCosts);
      vatAmountQuote = vatAmountQuote - (initialQuote.travelCosts * 0.2) + newVatAmount;
      totalTTCQuote = totalHTQuote + vatAmountQuote;

      Object.assign(updateData, {
        priceHT: Math.max(0, totalHTQuote),
        vatAmount: Math.max(0, vatAmountQuote),
        priceTTC: Math.max(0, totalTTCQuote)
      });
    }

    // Manage services to add
    if (data.servicesToAdd.length > 0) {
      for (const service of data.services) {
        const totals = service.id
          ? await handleExistingService(service, data.quoteId)
          : await createNewService(service, data.quoteId);

        totalHTQuote += totals.totalHTService;
        vatAmountQuote += totals.vatAmountService;
        totalTTCQuote += totals.totalTTCService;

        Object.assign(updateData, {
          priceHT: totalHTQuote,
          priceTTC: totalTTCQuote,
          vatAmount: vatAmountQuote
        });

        const backupItem = buildServiceBackup(service);
        remainingServicesForBackup.push(backupItem);

      }
    }

    // Manage services to delete
    if (data.servicesToUnlink.length > 0) {
      for (const quoteService of data.servicesToUnlink) {
        const totalHTService = quoteService.unitPriceHT * quoteService.quantity;
        const vatRateService = parseFloat(quoteService.vatRate);
        const { vatAmount: vatAmountService, totalTTC: totalTTCService } =
          calculateTotals(totalHTService, vatRateService / 100);

        totalHTQuote -= totalHTService;
        vatAmountQuote -= vatAmountService;
        totalTTCQuote -= totalTTCService;

        await db.quoteService.delete({
          where: { id: quoteService.id },
        });
      }

      Object.assign(updateData, {
        priceHT: totalHTQuote,
        priceTTC: totalTTCQuote,
        vatAmount: vatAmountQuote
      });
    }


    // Before udpate, apply discount
    const finalTotalHT = totalHTQuote;
    const finalVatAmount = vatAmountQuote;
    const finalTotalTTC  = finalTotalHT + finalVatAmount;
    // let finalTotalTTC = totalTTCQuote;
    // finalTotalTTC = finalTotalHT + finalVatAmount;


    // Apply discount if it exists
    // let discountAmountValue = 0;
    // if (isNotNull(sanitizedData.discountAmount)) {
    //   discountAmountValue = parseFloat(sanitizedData.discountAmount.toString());

    //   // HT after discount
    //   // const htAfterDiscount = Math.max(0, finalTotalHT - discountAmountValue);

    //   // // Recalculer la TVA sur le montant après remise
    //   // finalVatAmount = htAfterDiscount * 0.2; // Supposant une TVA à 20%

    //   // Count TTC
    //   finalTotalTTC = finalTotalHT + finalVatAmount;
    // }

    // Final values stored in updateDate
    Object.assign(updateData, {
      // We keep BRUT Ht before discount
      priceHT: finalTotalHT,
      vatAmount: finalVatAmount,
      priceTTC: finalTotalTTC,
      discountReason: sanitizedData.discountReason,
      discountAmount: sanitizedData.discountAmount ?? null
      // discountAmount is already in updateData thanks to fieldsToUpdate
    });


    // If updateData is less or equal 2 values, there is nothing to update. (Indeed, in every case we'll alaways have quote's number and saveMode's value)
    if (Object.keys(updateData).length <= 2) {
      return new NextResponse("No data to update", { status: 400 });
    }

    // Determine where clause based on whether a new number was generated
const whereClause = { id: sanitizedData.quoteId };


    const workSiteBackup = await db.workSite.findUnique({
      where: {
        id: updateData.workSiteId  as string
      }
    })

    const clientBackup = await db.client.findUnique({
      where: {
        id: updateData.clientId  as string
      }
    })

    // Update the quote
    const updatedQuote = await db.quote.update({
      where: whereClause,
      data: {
        ...updateData,
        ...(isFinalizingQuote && {
          servicesBackup: JSON.parse(JSON.stringify(remainingServicesForBackup)),
          clientBackup: {
            firstName: clientBackup?.firstName,
            name: clientBackup?.name,
            mail: clientBackup?.mail,
            road: clientBackup?.road,
            addressNumber: clientBackup?.addressNumber,
            city: clientBackup?.city,
            postalCode: clientBackup?.postalCode,
            additionalAddress: clientBackup?.additionalAddress,
          },
          workSiteBackup: {
            road: workSiteBackup?.road,
            addressNumber: workSiteBackup?.addressNumber,
            city: workSiteBackup?.city,
            postalCode: workSiteBackup?.postalCode,
            additionalAddress: workSiteBackup?.additionalAddress,
          },
          elementsBackup: {
            totalHtQuote: updateData.priceHT,
            vatAmountQuote: updateData.vatAmount,
            totalTTCQuote: updateData.priceTTC,
            discountReason: updateData.discountReason,
          },
        }),
        updatedAt: new Date().toISOString(),
        modifiedBy: user?.id
      }
    });

    const fullUpdatedQuote = await db.quote.findUnique({
      where: { id: updatedQuote.id },
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

    return NextResponse.json({ fullUpdatedQuote }, { status: 200 });

  } catch (error) {
    console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
