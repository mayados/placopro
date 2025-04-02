// /validation/billValidation.ts
import { z } from 'zod';

// Fonction utilitaire pour la transformation de Date avec message personnalisé
const createDateSchema = (message: string) => 
    z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().min(new Date(0), message)
    );
  

const serviceFormQuoteSchema = z.object({
  id: z.string().optional(),
  quantity: z.number().min(1,"La quantité est requise"),
  label: z.string().min(1,"Le label du service est requis"),
  unitPriceHT: z.string().min(1,"Le prix unitaire HT du service est requis"),
  type: z.string().min(1,"Le type du service est requis"),
  vatRate: z.string().min(1,"Le taux de tva du service est requis"),
  unit: z.string().min(1,"L'unité du service est requise"),
  selectedFromSuggestions: z.boolean().optional().refine(val => val === true || val === false, {
      message: "La sélection depuis les suggestions doit être true ou false",  // Message personnalisé
  }),
  detailsService: z.string().min(1,"Le détail du service est requis"),
});

const serviceFormBillSchema = z.object({
    serviceId: z.string().optional(),
    quantity: z.number().min(1,"La quantité est requise"),
    label: z.string().min(1,"Le label du service est requis"),
    unitPriceHT: z.string().min(1,"Le prix unitaire HT du service est requis"),
    type: z.string().min(1,"Le type du service est requis"),
    vatRate: z.string().min(1,"Le taux de tva du service est requis"),
    unit: z.string().min(1,"L'unité du service est requise"),
    selectedFromSuggestions: z.boolean().optional().refine(val => val === true || val === false, {
        message: "La sélection depuis les suggestions doit être true ou false",  // Message personnalisé
    }),
    detailsService: z.string().min(1,"Le détail du service est requis"),
  });
  

export const createBillDraftSchema = z.object({
  dueDate: z.date().nullable(),
  natureOfWork: z.string().min(5, "La nature du travail est requise"),
  description: z.string().min(5, "La description du travail est requise"),
  discountAmount: z.number().nullable().optional(),
  workSiteId: z.string().min(5, "Le chantier est requis"),
  quoteId: z.string().nullable().optional(),
  clientId: z.string().min(5, "Le client est requis"),
  services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
  servicesToUnlink: z.array(serviceFormQuoteSchema).optional(),
  servicesAdded: z.array(serviceFormQuoteSchema).optional(),
  status: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  travelCosts: z.number().nullable(),
  travelCostsType: z.string().nullable(),
  workStartDate: z.date().nullable(),
  workEndDate: z.date().nullable(),
  workDuration: z.number().nullable(),
  discountReason: z.string().nullable().optional(),
});

export const createBillFinalSchema = z.object({
    dueDate: createDateSchema("La date limite de paiement est requise"),
    natureOfWork: z.string().min(5, "Le type de travail est requis"),
    description: z.string().min(10, "La description est requise"),
    discountAmount: z.number().min(0).nullable(),  // Can still be optional if not provided
    // serviceType: z.string().min(1, "Le type de service est requis"),
    workSiteId: z.string().min(1, "Le chantier est requis"),
    clientId: z.string().min(1, "Le client est requis"),
    services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
    servicesToUnlink: z.array(serviceFormQuoteSchema).optional(),
    servicesAdded: z.array(serviceFormQuoteSchema).optional(),
    // status: z.string().min(1, "Le statuts"),
    paymentTerms: z.string().min(1, "Les conditions de paiement sont requises"),
    travelCosts: z.number().min(0).optional(),
    travelCostsType: z.string().min(1, "Le type de frais de déplacement est requis"),
    workStartDate: createDateSchema("La date de commencement de chantier est requise"),
    workEndDate: createDateSchema("La date de fin de chantier est requise"),
    workDuration: z.number().min(1, "Le nombre de jours de travail est requis"),
    discountReason: z.string().nullable(),
  })

  export const updateClassicBillSchema = z.object({
    status: z.string().nullable(),
    paymentMethod: z.string().nullable(),
    paymentDate: z.date().nullable(),
    canceledAt: z.date().nullable(),
    paymentTerms: z.string().min(1, "Les conditions de paiement sont requises"),
    travelCosts: z.number().min(0).optional(),
    travelCostsType: z.string().min(1, "Le type de frais de déplacement est requis"),
  })
  

  export const updateDraftBillSchema = z.object({
    services: z.array(serviceFormBillSchema).min(1, "Au moins un service est requis"),
    workStartDate: z.date().min(new Date(0), "La date de commencement de chantier est requise"),
    workEndDate: z.date().nullable(),
    workDuration: z.number().nullable(),
    discountAmount: z.number().min(0).optional(),  
    discountReason: z.string().nullable(),
  })

