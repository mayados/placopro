// src/modules/quote/generateQuoteNumber.ts
import { quoteRepository } from "@/modules/quote/quoteRepository";
import { Prisma } from "@prisma/client";

export async function generateQuoteNumber(
  type: string = "quote",
  isDraft: boolean = false,
  tx: Prisma.TransactionClient, 
): Promise<string> {
  // DRAFT : fictive number based on the date
  if (isDraft) {
    return `DRAFT-DEV-${Date.now()}`;
  }

  const quoteRepo = quoteRepository(tx); 


  const currentYear = new Date().getFullYear();
  let nextNumber = 1;

  // Récupérer dans la base le compteur pour l'année et le type
  const counter = await quoteRepo.findCounter(currentYear, type);

  if (!counter) {
    // First quote of the year 2025 (taking into account there were 3 quotes before in paper)
    if (type === "quote" && currentYear === 2025) {
      nextNumber = 3;
    }
    // Create new counter
    await quoteRepo.createCounter(currentYear, type, nextNumber);
  } else {
    // Incremente existing document counter
    nextNumber = counter.current_number + 1;
    await quoteRepo.updateCounter(counter.id, nextNumber);
  }

  // If it's a final quote we return unique chronological number based on the document counter
  return `DEV-${currentYear}-${nextNumber}`;
}
