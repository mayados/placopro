export const fetchUnits = async (): Promise<UnitType[]> => {
  try {
    const response = await fetch(`/api/units`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

    const data: UnitType[] = await response.json();
    console.log("Données reçues après le fetch :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des unités :", error);
    throw error;
  }
};

export const updateUnit = async (unitId: string, updatedValues: UnitUpdateType, csrfToken: string): Promise<UnitType> => {
  try {
    const response = await fetch(`/api/units/${unitId}`, {
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
    const data: UnitType = await response.json();
    console.log("Updated unit :", data);

    return data;
  } catch (error) {
    console.error("Error with unit's update :", error);
    throw error;
  }
};


// Delete a unit
export const deleteUnit = async (unitId: string,csrfToken: string): Promise<void> => {
  try {
      const response = await fetch(`/api/units/${unitId}`, {
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

// Create unit
export const createUnit = async (unit: UnitCreationType, csrfToken: string): Promise<UnitType> => {
  try {
      const response = await fetch(`/api/units`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,

          },
          body: JSON.stringify(unit),
      });

      if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: UnitType = await response.json();
      console.log("Created unit :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with unit creation :", error);
      throw error; 
  }
};