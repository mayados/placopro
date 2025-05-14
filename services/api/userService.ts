// Retrieve all the employees
export const fetchEmployees = async (): Promise<ClerkUserListType> => {
    try {
      const response = await fetch(`/api/users`, {
            method: "GET",
            credentials: "include", 
        });
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
        const response = await fetch(`/api/users/${employeeSlug}`, {
            method: "GET",
            credentials: "include", 
        });
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
            credentials: "include",
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
export const createEmployee = async (employee: UserFormValueType, csrfToken: string): Promise<UserType> => {
    try {
        const response = await fetch(`/api/users`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

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

// set password
export const setUserPassword = async (password: string, csrfToken: string, token: string): Promise<ApiResponse> => {
    try {
        const response = await fetch(`/api/users`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-post-type": "set-password"

            },
            body: JSON.stringify({ token, password }),

        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ApiResponse = await response.json();
        console.log("Created user :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with employee creation :", error);
        throw error; 
    }
  };


// Update employee
export const updateUser = async (employee: UserType, csrfToken: string): Promise<UserType> => {
    try {
        const response = await fetch(`/api/users/${employee.slug}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

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