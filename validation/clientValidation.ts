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



export const createClientSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    firstName: z.string().min(2, "Le prénom est requis"),
    phone: z.string().min(10, "Le numéro de téléphone est requis"),
    road: z.string().min(5, "La rue est requise"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().min(1, "Le complément d'adresse est requis"),
    mail: z.string().min(1, "L'email est requis").email("Format d'email invalide"),

})

export const updateClientSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    firstname: z.string().min(2, "Le prénom est requis"),
    phone: z.string().min(10, "Le numéro de téléphone est requis"),
    road: z.string().min(5, "La rue est requise"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().min(1, "Le complément d'adresse est requis"),
    mail: z.string().min(1, "L'email est requis").email("Format d'email invalide"),

})


