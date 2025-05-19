import { ServiceFormData } from "@/validation/quoteValidation";

export function mapToServiceType(service: ServiceFormData): ServiceType {
  return {
    id: service.id ?? undefined,
    label: service.label,
    unitPriceHT: String(service.unitPriceHT),
    type: service.type,
    vatRate: service.vatRate,
    unit: service.unit,
  };
}


export function mapToServiceAndQuoteServiceType(service: ServiceFormData): ServiceAndQuoteServiceType {
  return {
    id: service.id ?? "",                 // tu peux ajuster selon ta logique
    label: service.label,
    unitPriceHT: service.unitPriceHT,    // ici c’est number, direct
    type: service.type,
    vatRate: service.vatRate,
    unit: service.unit,
    quantity: service.quantity,
    detailsService: service.detailsService,
    serviceId: service.id ?? "",         // idem, à vérifier selon ton modèle
  };
}
