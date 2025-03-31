// Retrieve all the employees
export const fetchEmployees = async (): Promise<ClerkUserListType> => {
    try {
      const response = await fetch(`/api/users`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: ClerkUserListType = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des employés :", error);
      throw error;
    }
};

// Retrieve a specific Employee
export const fetchEmployee = async (employeeSlug: string): Promise<UserType> => {
    try {
        const response = await fetch(`/api/users/${employeeSlug}`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
        const data: UserType = await response.json();
        console.log("Données reçues après le fetch :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'employé :", error);
        throw error;
    }
};

// Delete an employee
export const deleteEmployee = async (employeeSlug: string): Promise<void> => {
    try {
        const response = await fetch(`/api/users/${employeeSlug}`, {
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

// Create employee
export const createEmployee = async (employee: UserFormValueType): Promise<UserType> => {
    try {
        const response = await fetch(`/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employee),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: UserType = await response.json();
        console.log("Created user :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with employee creation :", error);
        throw error; 
    }
  };


// Update employee
export const updateUser = async (employee: UserType): Promise<UserType> => {
    try {
        const response = await fetch(`/api/users/${employee.slug}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employee),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: UserType = await response.json();
        console.log("Updated user :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with user update :", error);
        throw error; 
    }
  };