// /validation/billValidation.ts
import { z } from 'zod';


export const createClientSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    firstName: z.string().min(2, "Le prénom est requis"),
    phone: z.string().min(10, "Le numéro de téléphone est requis"),
    road: z.string().min(5, "La rue est requise"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().nullable(),
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


