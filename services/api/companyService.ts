const baseUrl = process.env.NEXT_PUBLIC_API_URL  
// (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  // Retrieve a specific Company
  export const fetchCompany = async (): Promise<CompanyType> => {
    try {
      const response = await fetch(`${baseUrl}/api/companies`, {
            method: "GET",
            credentials: "include", 
        });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: CompanyType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Error when retrieving the company :", error);
      throw error;
    }
  };


// Update company
export const updateCompany = async (company: CompanyType, csrfToken: string): Promise<CompanyType> => {
  try {
      const response = await fetch(`/api/companies/${company.slug}`, {
          method: "PUT",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,

          },
          body: JSON.stringify(company),
      });

      if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CompanyType = await response.json();
      console.log("Updated company :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with company update :", error);
      throw error; 
  }
};

// Create company
export const createCompany = async (company: CompanyFormValueType, csrfToken: string): Promise<CompanyType> => {
  try {
      const response = await fetch(`/api/companies`, {
          method: "POST",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,

          },
          body: JSON.stringify(company),
      });

      if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: CompanyType = await response.json();
      console.log("Created company :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with company creation :", error);
      throw error; 
  }
};
