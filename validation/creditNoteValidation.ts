// /validation/billValidation.ts
import { z } from 'zod';
import { CreditNoteReasonEnum } from '@prisma/client';
import { CreditNoteSettlementTypeEnum } from '@prisma/client';

export const createCreditNoteSchema = z.object({
    amount: z.preprocess(
        (val) => Number(val),
        z.number()
          .min(1, { message: "Le montant est requis" })
      ),
    reason: z.nativeEnum(CreditNoteReasonEnum),

})

export const updateCreditNoteSchema = z.object({
    isSettled: z.boolean().nullable(),
    settlementType: z.nativeEnum(CreditNoteSettlementTypeEnum).nullable(),

})


