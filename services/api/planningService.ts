// Retrieve all the plannings
// Return a promise with object of type ?
export const fetchPlannings = async (): Promise<PlanningsListType> => {
    try {
      const response = await fetch(`/api/plannings`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: PlanningsListType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings :", error);
      throw error;
    }
};

// Create a Planning
export const createPlanning = async (planning : CalendarEvent, csrfToken: string): Promise<PlanningType> => {
    try {
        const response = await fetch(`/api/plannings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(planning),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: PlanningType = await response.json();
        console.log("Created planning :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with planningcreation :", error);
        throw error; 
    }
};

export const updatePlanning = async (PlanningId: string, formValues: UpdateCalendarEventType, csrfToken: string): Promise<PlanningType> => {
    try {
        const response = await fetch(`/api/plannings/${PlanningId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(formValues),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: PlanningType = await response.json();
        console.log("Updated planning :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with planning update :", error);
        throw error; 
    }
};

// Delete a planning
export const deletePlanning = async (PlanningId: string, csrfToken: string): Promise<void> => {
    try {
        const response = await fetch(`/api/plannings/${PlanningId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
        });
        if (!response.ok) {
            throw new Error("Error with planning deletion");
        }
    } catch (error) {
        console.error("Error with planning deletion :", error);
        throw error;
    }
};