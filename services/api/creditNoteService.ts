// Create Credit Note
export const createCreditNote = async (creditNote : CreateCreditNoteFormValueType): Promise<CreditNoteType> => {
    try {
        const response = await fetch(`/api/creditNotes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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