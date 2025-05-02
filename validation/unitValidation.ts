// /validation/unitValidation.ts
import { z } from 'zod';

export const createUnitSchema = z.object({
    label: z.string().min(3, "Le label est requis avec un minimum de 2 caractères"),
})

export const updateUnitSchema = z.object({
    label: z.string().min(2).optional(),
})

