
import { QuoteStatusEnum, Prisma } from "@prisma/client";
import { createQuote, updateQuote } from "@/modules/quote/quote";
import { generateQuoteNumber } from "@/modules/quote/generateQuoteNumber";
import { createQuoteServicesAndBackup } from "@/modules/quote/quoteService";
import { createOrUpdateServices } from "@/modules/quote/services";
import { generateSlug } from "@/lib/utils";
import { CreateQuoteData } from "@/validation/quoteValidation";
import { mapToServiceAndQuoteServiceType, mapToServiceType } from "@/modules/quote/mappers/serviceMapper";

interface CreateQuoteDTO {
  tx: Prisma.TransactionClient;
  sanitizedData: CreateQuoteData;
  userId: string;
  status: QuoteStatusEnum;
}


export async function createQuoteUseCase({
  tx,
  sanitizedData,
  userId,
  status
}: CreateQuoteDTO) {
  const isDraft = status === QuoteStatusEnum.DRAFT;
//   sanitizedData.status = status;
  const rawServices = sanitizedData.services ?? []; // ← sécurisé pour draft sans services
  const services: ServiceType[] = rawServices.map(mapToServiceType);
  const servicesForQuoteServicesAndBackup: ServiceAndQuoteServiceType[] = rawServices.map(mapToServiceAndQuoteServiceType);
  const quoteNumber = await generateQuoteNumber("quote", isDraft,tx);
  
  await createOrUpdateServices(services, tx);

  const slug = generateSlug("dev");
  const quote = await createQuote(sanitizedData, userId, quoteNumber, status, slug, tx);

  const { backup, totals } = await createQuoteServicesAndBackup(servicesForQuoteServicesAndBackup, quote.id, tx);
  const newQuote = await updateQuote(sanitizedData, quote, backup, totals,status, tx);

  return newQuote;
}
