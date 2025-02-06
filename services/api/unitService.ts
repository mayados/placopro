export const fetchUnits = async (): Promise<UnitListType> => {
    try {
      const response = await fetch(`/api/units`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: UnitListType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des unités :", error);
      throw error;
    }
  };