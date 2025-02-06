  // Retrieve a specific Company
  export const fetchCompany = async (companySlug: string): Promise<CompanyTypeSingle> => {
    try {
      const response = await fetch(`/api/companies/${companySlug}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: CompanyTypeSingle = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Error when retrieving the company :", error);
      throw error;
    }
  };
