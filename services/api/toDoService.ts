// Retrieve to dos list
export const fetchToDos = async (): Promise<ToDosWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/todos`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: ToDosWithTotalsAndStatus = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des to dos :", error);
      throw error;
    }
  };
  
// Check a to do
export const checkToDo = async (toDoId: string,csrfToken: string): Promise<ToDoForListType> => {
    try {
        const response = await fetch(`/api/todos/${toDoId}`, {
            method: "PATCH",
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

// Retrieve a specific WorkSite
// export const fetchWorkSite = async (workSiteSlug: string): Promise<WorkSiteTypeSingle> => {
//     try {
//         const response = await fetch(`/api/workSites/${workSiteSlug}`);
//         if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
//         const data: WorkSiteTypeSingle = await response.json();
//         console.log("Données reçues après le fetch :", data);
//         return data;
//     } catch (error) {
//         console.error("Erreur lors de la récupération du chantier :", error);
//         throw error;
//     }
// };

// // Delete a workSite
// export const deleteWorkSite = async (workSiteSlug: string): Promise<void> => {
//     try {
//         const response = await fetch(`/api/workSites/${workSiteSlug}`, {
//             method: "DELETE",
//         });
//         if (!response.ok) {
//             throw new Error("Error with workSite deletion");
//         }
//     } catch (error) {
//         console.error("Error with workSite deletion :", error);
//         throw error;
//     }
// };

// Create classic to do 
export const createToDo = async (toDo: ClassicToDoCreationType, csrfToken: string): Promise<ToDoType> => {
    try {
        const response = await fetch(`/api/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(toDo),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: ToDoType = await response.json();
        console.log("Created to do :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with to do creation :", error);
        throw error; 
    }
};

// Create classic to do 
export const createAssignedToDo = async (toDo: AssignedToDoCreationType, csrfToken: string): Promise<ToDoType> => {
    try {
        const response = await fetch(`/api/todos`, {
            method: "POST",
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
  
        const data: ToDoType = await response.json();
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