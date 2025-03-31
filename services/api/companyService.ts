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

  // Retrieve all the companies
  export const fetchCompanies = async (): Promise<CompanyListType> => {
    try {
      const response = await fetch(`/api/companies`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: CompanyListType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises :", error);
      throw error;
    }
  };

  // Delete a company
export const deleteCompany = async (companySlug: string): Promise<void> => {
  try {
      const response = await fetch(`/api/companies/${companySlug}`, {
          method: "DELETE",
      });
      if (!response.ok) {
          throw new Error("Error with company deletion");
      }
  } catch (error) {
      console.error("Error with company deletion :", error);
      throw error;
  }
};

// Update company
export const updateCompany = async (company: CompanyType): Promise<CompanyType> => {
  try {
      const response = await fetch(`/api/companies/${company.slug}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
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
export const createCompany = async (company: CompanyFormValueType): Promise<CompanyType> => {
  try {
      const response = await fetch(`/api/companies`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
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
