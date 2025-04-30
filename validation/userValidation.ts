// /validation/billValidation.ts
import { z } from 'zod';


export const createUserSchema = z.object({
    lastName: z.string().min(2, "Le nom est requis"),
    firstName: z.string().min(2, "Le prénom est requis"),
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    role: z.string().min(2, "Le role est requis"),

})

export const updateUserSchema = z.object({
    lastName: z.string().min(2, "Le nom est requis"),
    firstName: z.string().min(2, "Le prénom est requis"),
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    role: z.string().min(2, "Le role est requis"),

})


