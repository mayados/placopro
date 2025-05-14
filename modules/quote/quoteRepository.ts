// modules/quote/quoteRepository.ts
/* eslint-disable */
import { db } from "@/lib/db";

export const quoteRepository = {
  // CRUD  quote
  create: (data: any) =>
    db.quote.create({ data }),

  
  findById: (id: string) =>
    db.quote.findUnique({ where: { id } }),

  update: (id: string, data: any) =>
    db.quote.update({ where: { id }, data }),

  // Access to the document counter
  findCounter: (year: number, type: string) =>
    db.documentCounter.findFirst({ where: { year, type } }),

  createCounter: (year: number, type: string, currentNumber: number) =>
    db.documentCounter.create({
      data: { year, type, current_number: currentNumber },
    }),

  updateCounter: (id: string, currentNumber: number) =>
    db.documentCounter.update({
      where: { id },
      data: { current_number: currentNumber },
    }),

    
};
