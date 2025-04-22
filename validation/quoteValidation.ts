// /validation/billValidation.ts
import { QuoteDiscountReasonEnum, QuoteStatusEnum } from '@prisma/client';
import { z } from 'zod';

// Transformation of string into Date with personnalized message (Because when retrieving Date in JSON in API route they became string)
const createDateSchema = (message: string) => 
    z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().min(new Date(0), message)
);
  
const createDateSchemaWithoutMessage = () => 
    z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().nullable()
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

export const createQuoteDraftSchema = z.object({
  validityEndDate: createDateSchemaWithoutMessage().nullable(),
  natureOfWork: z.string().min(5, "Le type de travail est requis"),
  description: z.string().nullable(),
  workStartDate: createDateSchemaWithoutMessage().nullable(),
  estimatedWorkEndDate: createDateSchemaWithoutMessage().nullable(),
  estimatedWorkDuration: z.number().nullable(),
  isQuoteFree: z.string().nullable(),
  hasRightOfWithdrawal: z.string().nullable(),
  travelCosts: z.number().nullable(),
  travelCostsType: z.string().nullable(),
  depositAmount: z.number().nullable(),
  discountAmount: z.number().nullable(),
  discountReason: z.nativeEnum(QuoteDiscountReasonEnum).nullable(),
  hourlyLaborRate: z.string().nullable().optional(),
  paymentTerms: z.string().nullable(),
  paymentDelay: z.number().nullable(),
  latePaymentPenalities: z.number().nullable(),
  recoveryFees: z.number().nullable(),
  withdrawalPeriod: z.number().nullable(),
  clientId: z.string().min(1, "Le client est requis"),
  workSiteId: z.string().min(1, "Le chantier est requis"),
  services: z.array(serviceFormQuoteSchema).nullable(),
  servicesToUnlink: z.array(serviceFormQuoteSchema).nullable().optional(),

});

export const createQuoteFinalSchema = z.object({
    validityEndDate: createDateSchema("La date de fin de validité du devis est requise"),
    natureOfWork: z.string().min(5, "Le type de travail est requis"),
    description: z.string().min(5, "La description est requise - min 10 caractères"),
    workStartDate: createDateSchema("La date de commencement de chantier est requise"),
    estimatedWorkEndDate: createDateSchema("La date estimée de fin de chantier est requise"),
    estimatedWorkDuration: z.number().min(1, "Le nombre de jours de travail estimé est requis"),
    isQuoteFree: z.string().min(1, "Le choix de gratuité de devis est requis"),
    hasRightOfWithdrawal: z.string().min(1, "Le choix de droit de rétractation est requis"),
    travelCosts: z.number().min(0, "Le montant de TVA est requis"),
    travelCostsType: z.string().min(1, "Le type de frais de déplacement est requis"),
    depositAmount: z.number().min(0, "Le montant d'accompte est requis"),
    discountAmount: z.number().min(0, "Le montant de réduction est requis"),
    discountReason: z.nativeEnum(QuoteDiscountReasonEnum).nullable(),
    hourlyLaborRate: z.string().nullable().optional(),
    paymentTerms: z.string().min(10, "Les conditions de paiement sont requises"),
    paymentDelay: z.number().min(0, "Le délais de paiement est requis"),
    latePaymentPenalities: z.number().min(0, "Les pénalités de retard de paiement est requis"),
    recoveryFees: z.number().min(0, "Les frais recouvrement sont requis"),
    withdrawalPeriod: z.number().min(0, "Le délais de réatraction est requis"),
    clientId: z.string().min(1, "Le client est requis"),
    workSiteId: z.string().min(1, "Le chantier est requis"),
    services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
  })

export const updateClassicQuoteSchema = z.object({
    status: z.nativeEnum(QuoteStatusEnum).nullable(),
    isSignedByClient: z.string().nullable(),
    signatureDate: createDateSchemaWithoutMessage(),
})
  
// When a user select to save the draft bill as DRAFT again
export const updateDraftQuoteSchema = z.object({
    dueDate: createDateSchemaWithoutMessage(),
    natureOfWork: z.string().min(5, "La nature du travail est requise"),
    description: z.string().min(5, "La description du travail est requise"),
    discountAmount: z.number().nullable().optional(),
    workSiteId: z.string().min(5, "Le chantier est requis"),
    quoteId: z.string().nullable().optional(),
    clientId: z.string().min(5, "Le client est requis"),
    services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
    servicesToUnlink: z.array(serviceFormQuoteSchema).optional(),
    servicesAdded: z.array(serviceFormQuoteSchema).optional(),
    paymentTerms: z.string().nullable(),
    travelCosts: z.number().min(0).optional(),
    travelCostsType: z.string().nullable(),
    workStartDate: createDateSchemaWithoutMessage(),
    workEndDate: createDateSchemaWithoutMessage(),
    workDuration: z.number().nullable().optional(),
    discountReason: z.string().nullable().optional(),
})

// When a user select to save the draft bill as READY
export const updateDraftFinalQuoteSchema = z.object({
    dueDate: createDateSchema("La date limite de paiement est requise"),
    natureOfWork: z.string().min(5, "Le type de travail est requis"),
    description: z.string().min(10, "La description est requise"),
    discountAmount: z.number().min(0).nullable(),  // Can still be optional if not provided
    workSiteId: z.string().min(1, "Le chantier est requis"),
    clientId: z.string().min(1, "Le client est requis"),
    services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
    servicesToUnlink: z.array(serviceFormQuoteSchema).optional(),
    servicesAdded: z.array(serviceFormQuoteSchema).optional(),
    paymentTerms: z.string().min(1, "Les conditions de paiement sont requises"),
    travelCosts: z.number().min(0).optional(),
    travelCostsType: z.string().min(1, "Le type de frais de déplacement est requis"),
    workStartDate: createDateSchema("La date de commencement de chantier est requise"),
    workEndDate: createDateSchema("La date de fin de chantier est requise"),
    workDuration: z.number().min(1, "Le nombre de jours de travail est requis"),
    discountReason: z.nativeEnum(QuoteDiscountReasonEnum).nullable(),
    quoteId: z.string().nullable().optional(),
    // paymentMethod: z.string().nullable().optional(),

})

