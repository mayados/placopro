// /validation/toDoValidation.ts
import { z } from 'zod';

export const createClassicToDoSchema = z.object({
    task: z.string().min(3, "La tâche est requise avec un minimum de 3 caractères"),
    description: z.string().nullable(),
})

export const updateClassicToDoSchema = z.object({
    task: z.string().min(3).optional(),
    description: z.string().nullable().optional()
})


export const createAssignedToDoSchema = z.object({
    task: z.string().min(3, "La tâche est requise avec un minimum de 3 caractères"),
    description: z.string().nullable(),
    assignedToClerkId: z.string().min(3, "Le ou la secrétaire est requis(e)"),
})
