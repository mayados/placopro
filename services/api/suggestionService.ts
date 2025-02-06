// Retrieve suggestions
export const fetchSuggestions = async (
    type: "client" | "workSite",
    search: string
  ): Promise<SuggestionsResponse<ClientSuggestionType> | SuggestionsResponse<WorkSiteSuggestionType>> => {
    if (search.trim().length < 2) {
      return { suggestions: [] };
    }
  
    try {
      const endpoint = `/api/${type === "client" ? "clients" : "workSites"}?search=${search}`;
      const response = await fetch(endpoint);
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des suggestions pour ${type} :`, error);
      throw error;
    }
  };