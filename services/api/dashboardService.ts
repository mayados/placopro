const baseUrl = process.env.NEXT_PUBLIC_API_URL 

// Retrieve dashboard datas for director
export const fetchDirectorDatas = async (cookie: string): Promise<DirectorDashboardDatas> => {
    try {

      const response = await fetch(`${baseUrl}/api/dashboards/director`,{
        method: "GET",
        headers: { cookie },

      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: DirectorDashboardDatas = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données du dashboard directeur :", error);
      throw error;
    }
  };

// Retrieve dashboard datas for secretary
export const fetchSecretaryDatas = async (cookie: string): Promise<SecretaryDashboardDatas> => {
    try {

      const response = await fetch(`${baseUrl}/api/dashboards/secretary`,{
        method: "GET",
        headers: { cookie },

      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: SecretaryDashboardDatas = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données du dashboard secrétaire :", error);
      throw error;
    }
  };

// Retrieve dashboard datas for secretary
export const fetchEmployeeDatas = async (cookie: string): Promise<EmployeeDashboardDatas> => {
    try {

      const response = await fetch(`${baseUrl}/api/dashboards/employee`,{
        method: "GET",
        headers: { cookie },

      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: EmployeeDashboardDatas = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données du dashboard secrétaire :", error);
      throw error;
    }
  };
