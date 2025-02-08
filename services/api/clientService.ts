// Retrieve all the clients
// Return a promise with object of type QuoteWithTotalsAndStatus
export const fetchClients = async (): Promise<ClientTypeList> => {
    try {
      const response = await fetch(`/api/clients`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: ClientTypeList = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des clients :", error);
      throw error;
    }
  };


// Retrieve a specific Client
export const fetchClient = async (clientSlug: string): Promise<ClientTypeSingle> => {
    try {
        const response = await fetch(`/api/clients/${clientSlug}`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
        const data: ClientTypeSingle = await response.json();
        console.log("Données reçues après le fetch :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération du client :", error);
        throw error;
    }
};


// Delete a client
export const deleteClient = async (clientId: string): Promise<void> => {
    try {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Error with client deletion");
        }
    } catch (error) {
        console.error("Error with client deletion :", error);
        throw error;
    }
};

// Create client
export const createClient = async (client: ClientFormValueType): Promise<ClientType> => {
    try {
        const response = await fetch(`/api/clients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(client),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ClientType = await response.json();
        console.log("Created client :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with client creation :", error);
        throw error; 
    }
};

// Update client
export const updateClient = async (client: ClientType): Promise<ClientType> => {
    try {
        const response = await fetch(`/api/clients/${client.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(client),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ClientType = await response.json();
        console.log("Created quote :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with quote update :", error);
        throw error; 
    }
  };