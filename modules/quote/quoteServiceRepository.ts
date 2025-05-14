import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export function createQuoteService(data: Prisma.QuoteServiceCreateInput) {
  return db.quoteService.create({
    data,
    include: {
      service: true, // mandatory for backup
    },
  });
}
