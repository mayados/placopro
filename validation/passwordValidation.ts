import { z } from "zod";

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "L’ancien mot de passe est requis"),
    newPassword: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirm"],
  });
export type PasswordSchemaData = z.infer<typeof passwordSchema>;
