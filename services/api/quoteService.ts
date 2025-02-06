// Retrieve all the quotes
// Return a promise with object of type QuoteWithTotalsAndStatus
export const fetchQuotes = async (): Promise<QuotesWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/quote`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: QuotesWithTotalsAndStatus = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des devis :", error);
      throw error;
    }
  };

  // Retrieve a specific Quote
  export const fetchQuote = async (quoteNumber: string): Promise<QuoteTypeSingle> => {
    try {
      const response = await fetch(`/api/quote/${quoteNumber}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: QuoteTypeSingle = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération du devis :", error);
      throw error;
    }
  };

// Delete a quote
export const deleteQuote = async (quoteId: string): Promise<void> => {
    try {
        const response = await fetch(`/api/quote/${quoteId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Error with quote deletion");
        }
    } catch (error) {
        console.error("Error with quote deletion :", error);
        throw error;
    }
};

// Create quote
export const createQuote = async (quote: QuoteFormValueType): Promise<QuoteType> => {
  try {
      const response = await fetch(`/api/quotes`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(quote),
      });

      if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: QuoteType = await response.json();
      console.log("Created quote :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with quote creation :", error);
      throw error; 
  }
};