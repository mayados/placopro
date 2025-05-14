// Retrieve to dos list
export const fetchToDos = async (): Promise<ToDosWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/todos`, {
            method: "GET",
            credentials: "include", 
        });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: ToDosWithTotalsAndStatus = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des to dos :", error);
      throw error;
    }
  };
  
// Check or uncheck a to do
export const checkOrUncheckToDo = async (toDoId: string,csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify({ toDoId })
        });
        if (!response.ok) {
            throw new Error("Error with to do's check");
        }
        const data: ToDoForListType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with to do's check :", error);
        throw error;
    }
  };
// Check a to do
export const archiveOrUnarchiveToDo = async (toDoId: string,csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-patch-type": "archiveOrUnarchive"

            },
            body: JSON.stringify({ toDoId })
        });
        if (!response.ok) {
            throw new Error("Error with to do's check");
        }
        const data: ToDoForListType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with to do's check :", error);
        throw error;
    }
  };

  export const updateClassicToDo = async (toDoId: string,updatedValues: ClassicToDoUpdateType,csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-patch-type": "update-classic"

            },
            body: JSON.stringify(updatedValues )
        });
        if (!response.ok) {
            throw new Error("Error with to do's check");
        }
        const data: ToDoForListType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with to do's check :", error);
        throw error;
    }
  };

  export const updateAssignedToDo = async (toDoId: string,updatedValues: ClassicToDoUpdateType,csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-patch-type": "update-assigned"

            },
            body: JSON.stringify(updatedValues )
        });
        if (!response.ok) {
            throw new Error("Error with to do's check");
        }
        const data: ToDoForListType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with to do's check :", error);
        throw error;
    }
  };


// Delete a to do 
export const deleteToDo = async (toDoId: string,csrfToken: string): Promise<void> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
        });
        if (!response.ok) {
            throw new Error("Error with to do deletion");
        }
    } catch (error) {
        console.error("Error with to do deletion :", error);
        throw error;
    }
};

// Create classic to do 
export const createClassicToDo = async (toDo: ClassicToDoCreationType, csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(toDo),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ToDoForListType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with to do creation :", error);
        throw error; 
    }
};

// Create classic to do 
export const createAssignedToDo = async (toDo: AssignedToDoCreationType, csrfToken: string): Promise<AssignedToDoType> => {
    try {
        const response = await fetch(`/api/todos`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
                "X-create-Type": "create-for-secretary"

            },
            body: JSON.stringify(toDo),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: AssignedToDoType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with to do creation :", error);
        throw error; 
    }
};

// Update to Do
// export const updateWorkSite = async (workSite: WorkSiteType, csrfToken: string): Promise<WorkSiteType> => {
//     try {
//         const response = await fetch(`/api/workSites/${workSite.slug}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRF-Token": csrfToken,

//             },
//             body: JSON.stringify(workSite),
//         });
  
//         if (!response.ok) {
//             throw new Error(`Erreur HTTP: ${response.status}`);
//         }
  
//         const data: WorkSiteType = await response.json();
//         console.log("Updated workSite :", data);
  
//         return data; 
//     } catch (error) {
//         console.error("Erreur with workSite update :", error);
//         throw error; 
//     }
//   };