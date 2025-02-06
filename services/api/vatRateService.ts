export const fetchVatRates = async (): Promise<VatRateListType> => {
    try {
      const response = await fetch(`/api/vatRates`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: VatRateListType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des taux de TVA :", error);
      throw error;
    }
  };