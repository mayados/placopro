// /validation/billValidation.ts
import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    type: z.string().min(2, "Le type est requis"),
    phone: z.string().min(10, "Le numéro de téléphone est requis"),
    rcs: z.string().min(5, "Le rcs est requis"),
    siret: z.string().min(5, "Le siret est requis"),
    ape: z.string().min(5, "L'ape est requis"),
    capital: z.string().min(5, "Le capital est requis"),
    intraCommunityVat: z.string().min(2, "Le taux de tva intracommunautaire est requis"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceName: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceContractNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceCoveredZone: z.string().min(1, "Le numéro de bâtiment est requis"),
    road: z.string().min(1, "La rue est requise"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionnalAddress: z.string().nullable(),
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
})

export const updateCompanySchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    type: z.string().min(2, "Le type est requis"),
    phone: z.string().min(10, "Le numéro de téléphone est requis"),
    rcs: z.string().min(5, "Le rcs est requis"),
    siret: z.string().min(5, "Le siret est requis"),
    ape: z.string().min(5, "L'ape est requis"),
    capital: z.string().min(5, "Le capital est requis"),
    intraCommunityVat: z.string().min(2, "Le taux de tva intracommunautaire est requis"),
    addressNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceName: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceContractNumber: z.string().min(1, "Le numéro de bâtiment est requis"),
    insuranceCoveredZone: z.string().min(1, "Le numéro de bâtiment est requis"),
    road: z.string().min(1, "La rue est requise"),
    postalCode: z.string().min(5, "Le code postal est requis"),
    city: z.string().min(1, "La ville est requise"),
    additionalAddress: z.string().nullable(),
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
})


