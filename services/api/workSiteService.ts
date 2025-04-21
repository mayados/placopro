// Retrieve all the workSites
// export const fetchWorkSites = async (): Promise<WorkSiteWithTotalsAndStatus> => {
//     try {
//       const response = await fetch(`/api/workSites`);
//       if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
//       const data: WorkSiteWithTotalsAndStatus = await response.json();
//       console.log("Données reçues après le fetch :", data);
//       return data;
//     } catch (error) {
//       console.error("Erreur lors de la récupération des chantiers :", error);
//       throw error;
//     }
// };

// Retrieve all the workSites with pagination
export const fetchWorkSites = async ({
    page,
    pageComming,
    pageCompleted,
    pageInProgress,
    limit,
  }: {
    page: number;
    pageComming: number;
    pageCompleted: number;
    pageInProgress: number;
    limit: number;
  }): Promise<WorkSiteWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/workSites?page=${page}&pageComming=${pageComming}&pageCompleted=${pageCompleted}&pageInProgress=${pageInProgress}&limit=${limit}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: WorkSiteWithTotalsAndStatus = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des chantiers :", error);
      throw error;
    }
  };
  

// Retrieve a specific WorkSite
export const fetchWorkSite = async (workSiteSlug: string): Promise<WorkSiteTypeSingle> => {
    try {
        const response = await fetch(`/api/workSites/${workSiteSlug}`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
        const data: WorkSiteTypeSingle = await response.json();
        console.log("Données reçues après le fetch :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération du chantier :", error);
        throw error;
    }
};

// Delete a workSite
export const deleteWorkSite = async (workSiteSlug: string): Promise<void> => {
    try {
        const response = await fetch(`/api/workSites/${workSiteSlug}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Error with workSite deletion");
        }
    } catch (error) {
        console.error("Error with workSite deletion :", error);
        throw error;
    }
};

// Create workSite
export const createWorkSite = async (workSite: WorkSiteCreationType, csrfToken: string): Promise<WorkSiteType> => {
    try {
        const response = await fetch(`/api/clients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(workSite),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: WorkSiteType = await response.json();
        console.log("Created workSite :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with workSite creation :", error);
        throw error; 
    }
};

// Update workSite
export const updateWorkSite = async (workSite: WorkSiteType, csrfToken: string): Promise<WorkSiteType> => {
    try {
        const response = await fetch(`/api/workSites/${workSite.slug}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(workSite),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: WorkSiteType = await response.json();
        console.log("Updated workSite :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with workSite update :", error);
        throw error; 
    }
  };