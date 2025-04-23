// /validation/toDoValidation.ts
import { z } from 'zod';

export const createClassicToDoSchema = z.object({
    task: z.string().min(3, "La tâche est requise avec un minimum de 3 caractères"),
    description: z.string().nullable(),
})


