import { createQuoteServiceFactory } from "./quoteServiceRepository";
import { calculateServiceTotals } from "@/modules/quote/calulation";
import { buildServiceBackup } from "@/modules/quote/backup";
import { findServiceByLabelFactory } from "@/modules/quote/serviceRepository";
import { Prisma, PrismaClient } from "@prisma/client";

export async function createQuoteServicesAndBackup(
  services: ServiceAndQuoteServiceType[],
  quoteId: string,
  tx: Prisma.TransactionClient | PrismaClient

) {

  const createQuoteService = createQuoteServiceFactory(tx);
  const findServiceByLabel = findServiceByLabelFactory(tx);
  const backup: ServiceBackup[] = [];
  let totalHT = 0;
  let totalTTC = 0;
  let totalVAT = 0;
console.log("Services à traiter pour backup:", services);

  for (const service of services) {
    const serviceRetrieved = await findServiceByLabel(service.label);
    if (!serviceRetrieved) continue;

    const { totalHT: ht, vatAmount: vat, totalTTC: ttc } = calculateServiceTotals(service);

    const quoteService = await createQuoteService({
      vatRate: service.vatRate,
      unit: service.unit,
      quantity: Number(service.quantity),
      totalHT: ht,
      vatAmount: vat,
      totalTTC: ttc,
      detailsService: service.detailsService || "",
      quote: { connect: { id: quoteId } },
      service: { connect: { id: serviceRetrieved.id } },
    });

    totalHT += ht;
    totalTTC += ttc;
    totalVAT += vat;

    backup.push(buildServiceBackup(quoteService));
  }

  return {
    backup,
    totals: {
      totalHtQuote: totalHT, 
      vatAmountQuote: totalVAT, 
      totalTTCQuote: totalTTC,  
    },
  };
}
