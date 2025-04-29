// /validation/serviceValidation.ts
import { z } from 'zod';

export const createServiceSchema = z.object({
    label: z.string().min(3, "Le label est requis avec un minimum de 3 caractères"),
    type: z.string().min(3, "Le type est requis avec un minimum de 3 caractères"),
    unitPriceHT: z.preprocess(
        (val) => Number(val),
        z.number()
          .min(1, { message: "Le prix unitaire Hors taxes est requis" })
      ),
})

export const updateServiceSchema = z.object({
    label: z.string().min(3).optional(),
    type: z.string().min(3).optional(),
    unitPriceHT: z.preprocess(
        (val) => Number(val),
        z.number()
          .min(1, { message: "Le prix unitaire Hors taxes est requis" })
      ).optional(),
})

