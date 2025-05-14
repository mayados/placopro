import { createQuoteService } from "./quoteServiceRepository";
import { calculateServiceTotals } from "@/modules/quote/calulation";
import { buildServiceBackup } from "@/modules/quote/backup";
import { findServiceByLabel } from "@/modules/quote/serviceRepository";

export async function createQuoteServicesAndBackup(
  services: ServiceAndQuoteServiceType[],
  quoteId: string
) {
  const backup: ServiceBackup[] = [];
  let totalHT = 0;
  let totalTTC = 0;
  let totalVAT = 0;

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
