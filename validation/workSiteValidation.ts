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



export const createWorkSiteSchema = z.object({
    title: z.string().min(2, "Le titre est requis"),
    description: z.string().min(2, "Le prénom est requis"),
    beginsThe: createDateSchemaWithoutMessage().nullable().optional(),
    road: z.string().min(5, "La rue est requise"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().min(1, "Le complément d'adresse est requis"),
    clientId: z.string().min(1, "Le client est requis"),
    status: z.string().min(1, "Le statut est requis"),

})

export const updateWorkSiteSchema = z.object({
    title: z.string().min(2, "Le titre est requis"),
    description: z.string().min(2, "Le prénom est requis"),
    beginsThe: createDateSchemaWithoutMessage(),
    road: z.string().min(5, "La rue est requise"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().min(1, "Le complément d'adresse est requis"),
    clientId: z.string().min(1, "Le client est requis"),
    status: z.string().min(1, "Le statut est requis"),
    completionDate: createDateSchemaWithoutMessage().nullable(),

})


