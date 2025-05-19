/* eslint-disable */
// /modules/quote/quote.ts
import { CreateQuoteData } from "@/validation/quoteValidation";
import { buildClientBackup, buildWorkSiteBackup, formatServicesBackupForJson } from "./backup";
import { calculateQuoteTotals } from "./calulation";
import { quoteRepository } from "./quoteRepository";
import { Prisma, QuoteDiscountReasonEnum, QuoteStatusEnum, type Quote } from "@prisma/client";

export async function createQuote(
  sanitizedData: CreateQuoteData,
  userId: string,
  quoteNumber: string,
  status: string,
  slug: string,
  tx: Prisma.TransactionClient // ← injecté depuis le use case

): Promise<Quote> {
    const quoteRepo = quoteRepository(tx); 
    
const discountReasonValue = 
  sanitizedData.discountReason && Object.values(QuoteDiscountReasonEnum).includes(sanitizedData.discountReason)
    ? sanitizedData.discountReason as QuoteDiscountReasonEnum
    : undefined;

  return quoteRepo.create({
    number: quoteNumber,
    status,
    slug,
    issueDate: new Date().toISOString(),
    validityEndDate: sanitizedData.validityEndDate,
    natureOfWork: sanitizedData.natureOfWork,
    description: sanitizedData.description,
    workStartDate: sanitizedData.workStartDate,
    estimatedWorkEndDate: sanitizedData.estimatedWorkEndDate,
    estimatedWorkDuration: sanitizedData.estimatedWorkDuration,
    isQuoteFree:  true,
    quoteCost: 0,
    vatAmount: 0,
    priceTTC: 0,
    priceHT: 0,
    depositAmount: sanitizedData.depositAmount,
    discountAmount: sanitizedData.discountAmount,
    discountReason: discountReasonValue,
    travelCosts: sanitizedData.travelCosts ?? 0,
    paymentDelay: sanitizedData.paymentDelay ?? 0,
    paymentTerms: sanitizedData.paymentTerms ?? "",
    latePaymentPenalties: sanitizedData.latePaymentPenalities,
    recoveryFee: sanitizedData.recoveryFees,
    isSignedByClient: false,
    signatureDate: null,
    hasRightOfWithdrawal: sanitizedData.hasRightOfWithdrawal === "Oui",
    withdrawalPeriod: sanitizedData.withdrawalPeriod,
    // clientId: sanitizedData.clientId,
    client: { connect: { id: sanitizedData.clientId } },
    // workSiteId: sanitizedData.workSiteId,
    workSite: { connect: { id: sanitizedData.workSiteId } },
    author: userId,
  });
}

export async function updateQuote(
  sanitizedData: CreateQuoteData,
  quote: Quote,
  quoteServicesWithData: ServiceBackup[],
  serviceTotals: { totalHtQuote: number; vatAmountQuote: number; totalTTCQuote: number },
  status: QuoteStatusEnum,
  tx: Prisma.TransactionClient 

) {
  const quoteRepo = quoteRepository(tx); 


  const travelCosts = sanitizedData.travelCosts ?? 0;

  const { totalHtQuote, vatAmountQuote, totalTTCQuote } =
    calculateQuoteTotals(serviceTotals, travelCosts);

  const clientBackup = await buildClientBackup(sanitizedData.clientId, tx);
  const workSiteBackup = await buildWorkSiteBackup(sanitizedData.workSiteId,tx)
    const servicesBackup = formatServicesBackupForJson(quoteServicesWithData);
  // Log ici pour inspecter exactement ce que tu vas envoyer en backup
  console.log("Services backup to save:", JSON.stringify(servicesBackup, null, 2));
  const updatedQuote = await quoteRepo.update(quote.id, {
    vatAmount: vatAmountQuote,
    priceHT: totalHtQuote,
    priceTTC: totalTTCQuote,
    ...(status === QuoteStatusEnum.READY && {
      clientBackup,
      workSiteBackup,
      servicesBackup: servicesBackup as unknown as Prisma.JsonValue,
      elementsBackup: {
        vatAmount: vatAmountQuote,
        priceHT: totalHtQuote,
        priceTTC: totalTTCQuote,
      },
    }),
  });

  return updatedQuote;
}