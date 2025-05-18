// Retrieve all the workSites
export const fetchWorkSitesWithoutPagination = async (): Promise<WorkSiteWithTotalsAndStatus> => {
    try {
        const response = await fetch(`/api/workSites`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-get-type": "simple",

            },
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: WorkSiteWithTotalsAndStatus = await response.json();
        console.log("Created workSite :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur lors de la récupération des chantiers :", error);
        throw error; 
    }
};

// Retrieve all the workSites with pagination
export const fetchWorkSites = async ({
  page,
  pageComming,
  pageCompleted,
  pageInProgress,
  limit,
  search = "",
}: {
  page: number;
  pageComming: number;
  pageCompleted: number;
  pageInProgress: number;
  limit: number;
  search?: string;
}): Promise<WorkSiteWithTotalsAndStatus> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageComming: pageComming.toString(),
      pageCompleted: pageCompleted.toString(),
      pageInProgress: pageInProgress.toString(),
      limit: limit.toString(),
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const response = await fetch(`/api/workSites?${params.toString()}`, {
      method: "GET",
      credentials: "include",
                  headers: {
                "X-get-type": "workSites-list",

            },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

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
        const response = await fetch(`/api/workSites/${workSiteSlug}`, {
            method: "GET",
            credentials: "include", 
        });
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
            credentials: "include",
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
        const response = await fetch(`/api/workSites`, {
            method: "POST",
            credentials: "include",
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
            credentials: "include",
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