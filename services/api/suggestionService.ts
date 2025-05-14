export const fetchSuggestions = async (
  type: "client" | "workSite" | "service",
  search: string
): Promise<SuggestionsResponse<ClientSuggestionType> | SuggestionsResponse<WorkSiteSuggestionType> | SuggestionsResponse<ServiceSuggestionType>> => {
  if (search.trim().length < 2) {
    return { suggestions: [] };
  }

  try {
    let endpoint = "";
    if (type === "client") {
      endpoint = `/api/clients?search=${search}`;
    } else if (type === "workSite") {
      endpoint = `/api/workSites?search=${search}`;
    } else if (type === "service") {
      endpoint = `/api/service?search=${search}`;
    }

    const response = await fetch(endpoint, {
            method: "GET",
            credentials: "include", 
        });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des suggestions pour ${type} :`, error);
    throw error;
  }
};
