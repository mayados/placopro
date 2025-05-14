
const baseUrl = process.env.NEXT_PUBLIC_API_URL 
// (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
// Retrieve all the quotes
// Return a promise with object of type QuoteWithTotalsAndStatus
export const fetchQuotes = async ({
    page,
    pageDraft,
    pageReadyToBeSent,
    pageSent,
    pageAccepted,
    pageRefused,
    limit,
  }: {
    page: number;
    pageDraft: number;
    pageReadyToBeSent: number;
    pageSent: number;
    pageAccepted: number;
    pageRefused: number;
    limit: number;
}): Promise<QuotesWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/quote?page=${page}&pageDraft=${pageDraft}&pageReadyToBeSent=${pageReadyToBeSent}&pageSent=${pageSent}&pageAccepted=${pageAccepted}&pageRefused=${pageRefused}&limit=${limit}`, {
            method: "GET",
            credentials: "include", 
        });
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
  export const fetchQuote = async (quoteSlug: string): Promise<QuoteType> => {
    try {
    const url = `${baseUrl}/api/quote/${quoteSlug}`
      console.log("Fetching quote from:", url);

      const response = await fetch(`${baseUrl}/api/quote/${quoteSlug}`, {
            method: "GET",
            credentials: "include", 
        });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: QuoteType = await response.json();
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
            credentials: "include",
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
export const createQuote = async (quote: QuoteFormValueType, csrfToken: string): Promise<QuoteType> => {
  try {
      const response = await fetch(`/api/quote`, {
          method: "POST",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,

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

// send quote to client with email
export const sendQuote = async (quoteSlug: string, emailClient: string, csrfToken: string): Promise<ApiResponse> => {
    try {
        const response = await fetch(`/api/quote`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-post-type": "send-quote",
  
            },
            body: JSON.stringify({quoteSlug, emailClient}),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ApiResponse = await response.json();
        console.log("Created quote :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with quote creation :", error);
        throw error; 
    }
  };

// Update draft quote
export const updateDraftQuote = async (quoteSlug: string, updatedQuoteWithStatus: UpdatedQuoteFormValueType, csrfToken: string): Promise<QuoteType> => {
  try {
      const response = await fetch(`/api/quote/${quoteSlug}`, {
          method: "PUT",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
              "X-Update-Type": "draft",
              "X-CSRF-Token": csrfToken,

          },
          body: JSON.stringify(updatedQuoteWithStatus),
      });

      if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: QuoteType = await response.json();
      console.log("Created quote :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with quote update :", error);
      throw error; 
  }
};

// Update classic quote
export const updateClassicQuote = async (quoteSlug: string, formValues: FormValuesUpdateNotDraftQuote, csrfToken: string): Promise<QuoteType> => {
  try {
      const response = await fetch(`/api/quote/${quoteSlug}`, {
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

      const data: QuoteType = await response.json();
      console.log("Created quote :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with quote update :", error);
      throw error; 
  }
};