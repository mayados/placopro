export const fetchVatRates = async (): Promise<VatRateType[]> => {
  try {
    const response = await fetch(`/api/vatRates`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

    const data: VatRateType[] = await response.json();
    console.log("Données reçues après le fetch :", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des unités :", error);
    throw error;
  }
};

export const updateVatRate = async (vatRateId: string, updatedValues: VatRateUpdateType, csrfToken: string): Promise<VatRateType> => {
  try {
    const response = await fetch(`/api/vatRates/${vatRateId}`, {
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
    const data: VatRateType = await response.json();
    console.log("Updated unit :", data);

    return data;
  } catch (error) {
    console.error("Error with unit's update :", error);
    throw error;
  }
};


// Delete a unit
export const deleteVatRate = async (vatRateId: string,csrfToken: string): Promise<void> => {
  try {
      const response = await fetch(`/api/vatRates/${vatRateId}`, {
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
export const createVatRate = async (unit: VatRateCreationType, csrfToken: string): Promise<VatRateType> => {
  try {
      const response = await fetch(`/api/vatRates`, {
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

      const data: VatRateType = await response.json();
      console.log("Created unit :", data);

      return data; 
  } catch (error) {
      console.error("Erreur with unit creation :", error);
      throw error; 
  }
};