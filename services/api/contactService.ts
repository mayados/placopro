import { ContactFormValidationSchema } from "@/validation/contactFormValidation";
import { z } from 'zod';


// Ajuste le type de retour selon ce que renvoie réellement l'API
type ApiContactResponse = { ok: true } | { error: string };

export const submitMessage = async (
  payload: z.infer<typeof ContactFormValidationSchema>,
  csrfToken: string,
): Promise<ApiContactResponse> => {
  // Re-valide le payload (privacyPolicy inclus)
  const body = ContactFormValidationSchema.parse(payload);

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,      
      },
      body: JSON.stringify(body),       
      cache: 'no-store',
    });

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({}));
      throw new Error(error ?? `HTTP ${response.status}`);
    }

    return (await response.json()) as ApiContactResponse;
  } catch (error) {
    console.error('Erreur lors de la soumission du message :', error);
    throw error;                        
  }
};



export const createCreditNote = async (creditNote : CreateCreditNoteFormValueType, csrfToken: string): Promise<CreditNoteType> => {
    try {
        const response = await fetch(`/api/creditNotes`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(creditNote),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: CreditNoteType = await response.json();
        console.log("Created creditNote :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with credit note creation :", error);
        throw error; 
    }
  };

