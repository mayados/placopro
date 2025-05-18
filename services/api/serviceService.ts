export const fetchServices = async ({
  search,
  limit,
  page,
}: {
  search?: string;
  limit: number;
  page: number;
}): Promise<ServicesWithTotal> => {
  try {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search) {
      params.set("search", encodeURIComponent(search));
    }

    const response = await fetch(`/api/service?${params.toString()}`, {
      method: "GET",
      credentials: "include",
              headers: {
            "X-get-type": "services-list",

        },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: ServicesWithTotal = await response.json();
    console.log("Données reçues après le fetch :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    throw error;
  }
};

  
  export const updateService = async (serviceId: string, updatedValues: ServiceUpdateType, csrfToken: string): Promise<ServiceEntityType> => {
    try {
      const response = await fetch(`/api/service/${serviceId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(updatedValues)
      });
      if (!response.ok) {
        throw new Error("Error with unit's update");
      }
      const data: ServiceEntityType = await response.json();
      console.log("Updated unit :", data);
  
      return data;
    } catch (error) {
      console.error("Error with unit's update :", error);
      throw error;
    }
  };
  
  
  // Delete a unit
  export const deleteService = async (serviceId: string,csrfToken: string): Promise<void> => {
    try {
        const response = await fetch(`/api/service/${serviceId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
  
            },
        });
        if (!response.ok) {
            throw new Error("Error with unit  deletion");
        }
    } catch (error) {
        console.error("Error with unit deletion :", error);
        throw error;
    }
  };
  
 