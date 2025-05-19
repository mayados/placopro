// modules/quote/quoteRepository.ts
/* eslint-disable */
// import { db } from "@/lib/db";

// export const quoteRepository = {
//   // CRUD  quote
//   create: (data: any) =>
//     db.quote.create({ data }),

  
//   findById: (id: string) =>
//     db.quote.findUnique({ where: { id } }),

//   update: (id: string, data: any) =>
//     db.quote.update({ where: { id }, data }),

//   // Access to the document counter
//   findCounter: (year: number, type: string) =>
//     db.documentCounter.findFirst({ where: { year, type } }),

//   createCounter: (year: number, type: string, currentNumber: number) =>
//     db.documentCounter.create({
//       data: { year, type, current_number: currentNumber },
//     }),

//   updateCounter: (id: string, currentNumber: number) =>
//     db.documentCounter.update({
//       where: { id },
//       data: { current_number: currentNumber },
//     }),

    
// };


import { PrismaClient, Prisma } from "@prisma/client";

// Accept either db (normal client) or tx (transaction client)
export const quoteRepository = (
  tx: PrismaClient | Prisma.TransactionClient
) => ({
  create: (data: Prisma.QuoteCreateInput) => tx.quote.create({ data }),

  findById: (id: string) => tx.quote.findUnique({ where: { id } }),

  update: (id: string, data: Prisma.QuoteUpdateInput) => tx.quote.update({ where: { id }, data }),

  findCounter: (year: number, type: string) =>
    tx.documentCounter.findFirst({ where: { year, type } }),

  createCounter: (year: number, type: string, currentNumber: number) =>
    tx.documentCounter.create({
      data: { year, type, current_number: currentNumber },
    }),

  updateCounter: (id: string, currentNumber: number) =>
    tx.documentCounter.update({
      where: { id },
      data: { current_number: currentNumber },
    }),
});
