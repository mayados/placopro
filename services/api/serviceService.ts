export const fetchServices = async (): Promise<ServiceEntityType[]> => {
    try {
      const response = await fetch(`/api/service`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: ServiceEntityType[] = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des unités :", error);
      throw error;
    }
  };
  
  export const updateService = async (serviceId: string, updatedValues: ServiceUpdateType, csrfToken: string): Promise<ServiceEntityType> => {
    try {
      const response = await fetch(`/api/service/${serviceId}`, {
        method: "PATCH",
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
  
 