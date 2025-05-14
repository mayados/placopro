import type { Prisma, QuoteService, Service } from "@prisma/client";
import { clientRepository } from "../client/clientRepository";
import { workSiteRepository } from "../workSite/workSiteRepository";

export function buildServiceBackup(
  quoteService: QuoteService & { service: Service }
): ServiceBackup {
  return {
    label: quoteService.service.label,
    unitPriceHT: quoteService.service.unitPriceHT,
    type: quoteService.service.type,
    quantity: quoteService.quantity,
    unit: quoteService.unit,
    vatRate: quoteService.vatRate,
    totalHT: quoteService.totalHT,
    vatAmount: quoteService.vatAmount,
    totalTTC: quoteService.totalTTC,
    detailsService: quoteService.detailsService || '',
    discountAmount: quoteService.discountAmount || 0,
    discountReason: quoteService.discountReason || null
  };
}

export async function buildClientBackup(clientId: string) {
  const client = await clientRepository.findById(clientId);

  return {
    firstName: client?.firstName,
    name: client?.name,
    mail: client?.mail,
    road: client?.road,
    addressNumber: client?.addressNumber,
    city: client?.city,
    postalCode: client?.postalCode,
    additionalAddress: client?.additionalAddress,
  };
}

export async function buildWorkSiteBackup(workSiteId: string) {
  const workSite = await workSiteRepository.findById(workSiteId);

  return {
    road: workSite?.road,
    addressNumber: workSite?.addressNumber,
    city: workSite?.city,
    postalCode: workSite?.postalCode,
    additionalAddress: workSite?.additionalAddress,
  };
}

// export function buildServicesBackup(
//   quoteServicesWithData: (QuoteService & { service: Service })[]
// ): ServiceBackup[] {
//   return quoteServicesWithData.map((quoteService) =>
//     buildServiceBackup(quoteService)
//   );
// }

export function formatServicesBackupForJson(
  services: ServiceBackup[]
): Prisma.JsonValue {
  return services as unknown as Prisma.JsonValue;
}
