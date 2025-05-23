// Create Credit Note
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

export const updateCreditNote = async (creditNoteNumber: string, formValues: UpdateCreditNoteFormValueType, csrfToken: string): Promise<CreditNoteType> => {
    try {
        const response = await fetch(`/api/creditNotes/${creditNoteNumber}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(formValues),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: CreditNoteType = await response.json();
        console.log("Updated credit note :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with credit note update :", error);
        throw error; 
    }
};

// Retrieve a specific credit note
export const fetchCreditNote = async (creditNoteNumber: string): Promise<CreditNoteType> => {
    try {
        const response = await fetch(`/api/creditNotes/${creditNoteNumber}`, {
            method: "GET",
            credentials: "include", 
        });
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
        const data: CreditNoteType = await response.json();
        console.log("Données reçues après le fetch :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'avoir :", error);
        throw error;
    }
};

// Retrieve all the credit notes
// Return a promise with object of type CreditNotesWithTotalsAndStatus
export const fetchCreditNotes = async ({
  page,
  pageSettled,
  pageNotSettled,
  limit,
  search = "",
}: {
  page: number;
  pageSettled: number;
  pageNotSettled: number;
  limit: number;
  search?: string;
}): Promise<CreditNotesWithTotalsAndStatus> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSettled: pageSettled.toString(),
      pageNotSettled: pageNotSettled.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(`/api/creditNotes?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: CreditNotesWithTotalsAndStatus = await response.json();
    console.log("Données reçues après le fetch :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des credit notes :", error);
    throw error;
  }
};


// Delete a credit note
export const deleteCreditNote = async (creditNoteNumber: string): Promise<void> => {
    try {
        const response = await fetch(`/api/creditNotes/${creditNoteNumber}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (!response.ok) {
            throw new Error("Error with credit note deletion");
        }
    } catch (error) {
        console.error("Error with credit note deletion :", error);
        throw error;
    }
};
