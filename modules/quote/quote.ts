/* eslint-disable */
// /modules/quote/quote.ts
import { buildClientBackup, buildWorkSiteBackup, formatServicesBackupForJson } from "./backup";
import { calculateQuoteTotals } from "./calulation";
import { quoteRepository } from "./quoteRepository";
import { Prisma, QuoteStatusEnum, type Quote } from "@prisma/client";

export async function createQuote(
  sanitizedData: any,
  userId: string,
  quoteNumber: string,
  status: string,
  slug: string
): Promise<Quote> {
  return quoteRepository.create({
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
    isQuoteFree: sanitizedData.isQuoteFree === "Oui",
    quoteCost: 0,
    vatAmount: 0,
    priceTTC: 0,
    priceHT: 0,
    depositAmount: sanitizedData.depositAmount,
    discountAmount: sanitizedData.discountAmount,
    discountReason: sanitizedData.discountReason,
    travelCosts: sanitizedData.travelCosts ?? 0,
    paymentDelay: sanitizedData.paymentDelay ?? 0,
    paymentTerms: sanitizedData.paymentTerms ?? "",
    latePaymentPenalties: sanitizedData.latePaymentPenalities,
    recoveryFee: sanitizedData.recoveryFees,
    isSignedByClient: false,
    signatureDate: null,
    hasRightOfWithdrawal: sanitizedData.hasRightOfWithdrawal === "Oui",
    withdrawalPeriod: sanitizedData.withdrawalPeriod,
    clientId: sanitizedData.clientId,
    workSiteId: sanitizedData.workSiteId,
    author: userId,
  });
}

export async function updateQuote(
  sanitizedData: any,
  quote: any,
  quoteServicesWithData: ServiceBackup[],
  serviceTotals: { totalHtQuote: number; vatAmountQuote: number; totalTTCQuote: number }
) {
  const travelCosts = sanitizedData.travelCosts ?? 0;

  const { totalHtQuote, vatAmountQuote, totalTTCQuote } =
    calculateQuoteTotals(serviceTotals, travelCosts);

  const clientBackup = await buildClientBackup(sanitizedData.clientId);
  const workSiteBackup = await buildWorkSiteBackup(sanitizedData.workSiteId);
    const servicesBackup = formatServicesBackupForJson(quoteServicesWithData);

  const updatedQuote = await quoteRepository.update(quote.id, {
    vatAmount: vatAmountQuote,
    priceHT: totalHtQuote,
    priceTTC: totalTTCQuote,
    ...(sanitizedData.status === QuoteStatusEnum.READY && {
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