// /validation/quoteValidation.ts
import { QuoteDiscountReasonEnum, QuoteTravelCostsTypeEnum } from '@prisma/client';
import { z } from 'zod';

export type DraftQuoteData = z.infer<typeof createQuoteDraftSchema>;
export type FinalQuoteData = z.infer<typeof createQuoteFinalSchema>;
export type ServiceFormData = z.infer<typeof serviceFormQuoteSchema>;

export type CreateQuoteData = DraftQuoteData | FinalQuoteData;

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
  id: z.string().nullable().optional(),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "La quantité est requise" })
  ),
  label: z.string().min(1, "Le label du service est requis"),
  unitPriceHT: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le prix unitaire HT du service est requis" })
  ),
  type: z.string().min(1, "Le type du service est requis"),
  vatRate: z.string().min(1, "Le taux de tva du service est requis"),
  unit: z.string().min(1, "L'unité du service est requise"),
  selectedFromSuggestions: z.boolean().optional().refine(val => val === true || val === false, {
    message: "La sélection depuis les suggestions doit être true ou false",  // Message personnalisé
  }),
  detailsService: z.string().min(1, "Le détail du service est requis"),
});

export const createQuoteDraftSchema = z.object({
  validityEndDate: createDateSchemaWithoutMessage().nullable(),
  natureOfWork: z.string().min(5, "Le type de travail est requis"),
  description: z.string().nullable(),
  workStartDate: createDateSchemaWithoutMessage().nullable(),
  estimatedWorkEndDate: createDateSchemaWithoutMessage().nullable(),
  estimatedWorkDuration: z.preprocess(
    (val) => Number(val),
    z.number()
      .int({ message: "La durée doit être un entier." })
      .min(1, { message: "Le nombre de jours de travail estimé est requis" })
  ).nullable(),
  isQuoteFree: z.string().nullable(),
  hasRightOfWithdrawal: z.string().nullable(),
  travelCosts: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le montant de frais de déplacement est requis" })
  ).nullable(),
  travelCostsType: z.string().nullable(),
  depositAmount: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(0, { message: "Le montant d'accompte est requis" })
  ).nullable(),
  discountAmount: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le montant de réduction est requis" })
  ).nullable(),
  discountReason: z.nativeEnum(QuoteDiscountReasonEnum).nullable(),
  paymentTerms: z.string().nullable(),
  paymentDelay: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le délais de paiement est requis" })
  ).nullable(),
  latePaymentPenalities: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Les pénalités de retard de paiement est requis" })
  ).nullable(),
  recoveryFees: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Les frais de recouvrement sont requis" })
  ).nullable(),
  withdrawalPeriod: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le délais de réatraction est requis" })
  ).nullable(),
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
  estimatedWorkDuration: z.preprocess(
    (val) => Number(val),
    z.number()
      .int({ message: "La durée doit être un entier." })
      .min(1, { message: "Le nombre de jours de travail estimé est requis" })
  ),
  hasRightOfWithdrawal: z.string().min(1, "Le choix de droit de rétractation est requis"),
  travelCosts: z.preprocess(
    (val) => Number(val),
    z.number()
      .nullable()
  ),
  travelCostsType: z.nativeEnum(QuoteTravelCostsTypeEnum),
  depositAmount: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(0, { message: "Le montant d'accompte est requis" })
  ),
  discountAmount: z.preprocess(
    (val) => Number(val),
    z.number()
      .nullable()
  ),
  discountReason: z.nativeEnum(QuoteDiscountReasonEnum).nullable().optional(),
  paymentTerms: z.string().min(10, "Les conditions de paiement sont requises"),
  paymentDelay: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le délais de paiement est requis" })
  ),
  latePaymentPenalities: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Les pénalités de retard de paiement est requis" })
  ),
  recoveryFees: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Les frais de recouvrement sont requis" })
  ),
  withdrawalPeriod: z.preprocess(
    (val) => Number(val),
    z.number()
      .min(1, { message: "Le délais de réatraction est requis" })
  ),
  clientId: z.string().min(1, "Le client est requis"),
  workSiteId: z.string().min(1, "Le chantier est requis"),
  services: z.array(serviceFormQuoteSchema).min(1, "Au moins un service est requis"),
})



export const updateClassicQuoteSchema = z.object({
  status: z.string().nullable().optional(),
  isSignedByClient: z.boolean().nullable().optional(),
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

