// /validation/vatRateValidation.ts
import { z } from 'zod';

export const createVatRateSchema = z.object({
    rate: z.preprocess(
        (val) => Number(val),
        z.number()
          .min(1, { message: "Le taux est requis" })
      ),
})

export const updateVatRateSchema = z.object({
    rate: z.preprocess(
        (val) => Number(val),
        z.number()
          .min(1, { message: "Le taux est requis" })
      ).optional(),
})

