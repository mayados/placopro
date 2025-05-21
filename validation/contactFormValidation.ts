import { z } from 'zod';

export const ContactFormValidationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('L\'email n\'est pas valide'),
  phone: z.string().min(10, 'Le téléphone doit comporter au moins 10 chiffres'),
  message: z.string().min(20, 'Votre message doit comporter au moins 20 caractères'),
  privacyPolicy: z.boolean().refine(val => val === true, 'Vous devez accepter la politique de confidentialité'),
  honeyPot: z.string().optional() 
})
