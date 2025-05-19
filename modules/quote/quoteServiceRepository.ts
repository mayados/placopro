// import { db } from "@/lib/db";
// import type { Prisma } from "@prisma/client";

// export function createQuoteServiceFactory(data: Prisma.QuoteServiceCreateInput) {
//   return db.quoteService.create({
//     data,
//     include: {
//       service: true, // mandatory for backup
//     },
//   });
// }

import type { Prisma, PrismaClient } from "@prisma/client";

export function createQuoteServiceFactory(tx: PrismaClient | Prisma.TransactionClient) {
  return (data: Prisma.QuoteServiceCreateInput) => {
    return tx.quoteService.create({
      data,
      include: {
        service: true, // mandatory for backup
      },
    });
  };
}

