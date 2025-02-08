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
        recoveryFee,
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

// Utils functions for simple properties
const isNotNull = (value: string | number | boolean): boolean => value !== null && value !== undefined;

const updateIfNotNull = (updateData: Record<string,  string | number | boolean>, field: string, value: string | number | boolean) => {
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
  updateData: Record<string, string | number | boolean>
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
      quoteId: quoteId,
      serviceId: service.id,
    }
  });

  return { totalHTService, vatAmountService, totalTTCService };
};

// Creation of a new Service for (=serviceId retrieved form data is null)
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

  return handleExistingService({
    ...service,
    id: createdService.id
  }, quoteId, updateData);
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

      // Financial initial values allowing to calcul the different prices
      let totalHTQuote = initialQuote.priceHT;
      let vatAmountQuote = initialQuote.vatAmount;
      let totalTTCQuote = initialQuote.priceTTC;

      const updateData: Record<string, string | number | boolean> = {};

      // Update simple fields 
      const fieldsToUpdate = [
        'status', 'number', 'validityEndDate', 'natureOfWork', 'description',
        'workStartDate', 'estimatedWorkEndDate', 'estimatedWorkDuration',
        'paymentTerms', 'paymentDelay', 'latePaymentPenalties', 'recoveryFee',
        'withdrawalPeriod', 'clientId', 'workSiteId', 'serviceType'
      ];

      // For each simple field, if it's not null, we update it (by placing it into the const updateData)
      fieldsToUpdate.forEach(field => updateIfNotNull(updateData, field, data[field]));

      // Manage travelCosts (if data retrieved are ot null)
      if (isNotNull(data.travelCosts)) {
        const newTravelCosts = parseFloat(data.travelCosts.toString());
        updateData.travelCosts = newTravelCosts;

        const priceHTWithoutFormerTravelCosts = totalHTQuote - initialQuote.travelCosts;
        totalHTQuote = priceHTWithoutFormerTravelCosts + newTravelCosts;
        
        const { vatAmount: newVatAmount, totalTTC } = calculateTotals(newTravelCosts);
        vatAmountQuote = vatAmountQuote - (initialQuote.travelCosts * 0.2) + newVatAmount;
        totalTTCQuote = totalHTQuote + vatAmountQuote;

        Object.assign(updateData, {
          priceHT: Math.max(0, totalHTQuote),
          vatAmount: Math.max(0, vatAmountQuote),
          priceTTC: Math.max(0, totalTTCQuote)
        });
      }

      // Manage services to add
      if (data.services.length > 0) {
        for (const service of data.services) {
          const totals = service.id
            ? await handleExistingService(service, data.quoteId, updateData)
            : await createNewService(service, data.quoteId, updateData);

          totalHTQuote += totals.totalHTService;
          vatAmountQuote += totals.vatAmountService;
          totalTTCQuote += totals.totalTTCService;

          Object.assign(updateData, {
            priceHT: totalHTQuote,
            priceTTC: totalTTCQuote,
            vatAmount: vatAmountQuote
          });
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

      // If updateData is less or equal 2 values, there is nothing to update. (Indeed, in every case we'll alaways have quote's number and saveMode's value)
      if (Object.keys(updateData).length <= 2) {
        return new NextResponse("No data to update", { status: 400 });
      }

      const updatedQuote = await db.quote.update({
        where: { number: data.number },
        data: updateData,
      });

      const fullUpdatedQuote = await db.quote.findUnique({
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

      return NextResponse.json({fullUpdatedQuote }, { status: 200 });

    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);
      return new NextResponse("Internal error", { status: 500 });
    }
}
