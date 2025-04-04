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



export const createPlanningSchema = z.object({
    start: createDateSchema("La date de début est requise"),
    end: createDateSchema("La date de fin est requise"),
    title: z.string().min(3, "Le titre requis"),
    clerkUserId: z.string().min(3, "L'employé est requis"),
    workSiteId: z.string().min(3, "Le chantier est requis"),
})

export const updatePlanningSchema = z.object({
    start: createDateSchemaWithoutMessage().nullable(),
    end: createDateSchemaWithoutMessage().nullable(),
    title: z.string().nullable(),
    clerkUserId: z.string().nullable(),
    workSiteId: z.string().nullable(),
})

