// /validation/billValidation.ts
import { z } from 'zod';

// Transformation of string into Date with personnalized message (Because when retrieving Date in JSON in API route they became string)
const createDateSchema = (message: string) => 
    z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().min(new Date(0), message)
);
  
const createDateSchemaWithoutMessage = () => 
    z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date().nullable()
);



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


