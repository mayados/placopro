export const fetchServiceSuggestions = async (value:string): Promise<ServiceSuggestionsListType> => {
    try {
      const response = await fetch(`/api/service?search=${value}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data : ServiceSuggestionsListType = await response.json();
      console.log("Données retrievd after services fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions de service :", error);
      throw error;
    }
  };