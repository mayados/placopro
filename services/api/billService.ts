// Retrieve all the bills
// Return a promise with object of type BillsWithTotalsAndStatus
export const fetchBills = async (): Promise<BillsWithTotalsAndStatus> => {
    try {
      const response = await fetch(`/api/bills`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
  
      const data: BillsWithTotalsAndStatus = await response.json();
      console.log("Données reçues après le fetch :", data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des factures :", error);
      throw error;
    }
  };

// Retrieve a specific Bill
export const fetchBill = async (billNumber: string): Promise<BillTypeSingle> => {
    try {
        const response = await fetch(`/api/bills/${billNumber}`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
        const data: BillTypeSingle = await response.json();
        console.log("Données reçues après le fetch :", data);
        return data;
    } catch (error) {
        console.error("Erreur lors de la récupération de la facture :", error);
        throw error;
    }
};

// Delete a bill
export const deleteBill = async (billId: string): Promise<void> => {
    try {
        const response = await fetch(`/api/bill/${billId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Error with bill deletion");
        }
    } catch (error) {
        console.error("Error with bill deletion :", error);
        throw error;
    }
};

// Create bill
export const createBillFromQuote = async (bill: CreateBillFormValueType, csrfToken: string): Promise<BillType> => {
    try {
        const response = await fetch(`/api/bills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify(bill),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: BillType = await response.json();
        console.log("Created bill :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with bill creation :", error);
        throw error; 
    }
  };

// Create DEPOSIT bill
export const createDepositBillFromQuote = async (bill: CreateDepositBillFormValueType, csrfToken: string): Promise<BillType> => {
    try {
        const response = await fetch(`/api/bills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Create-Type": "deposit",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify(bill),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: BillType = await response.json();
        console.log("Created bill :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with bill creation :", error);
        throw error; 
    }
  };

// Update draft bill
export const updateDraftBill = async (billNumber: string, updatedBillWithStatus: UpdatedBillFormValueType, csrfToken: string): Promise<BillType> => {
    try {
        const response = await fetch(`/api/bills/${billNumber}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Update-Type": "draft",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(updatedBillWithStatus),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: BillType = await response.json();
        console.log("Created bill :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with bill update :", error);
        throw error; 
    }
  };

// Update deposit draft bill
export const updateDepositDraftBill = async (billNumber: string, updatedBillWithStatus: UpdatedDepositBillFormValueType, csrfToken: string): Promise<BillType> => {
    try {
        const response = await fetch(`/api/bills/${billNumber}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Update-Type": "draft-deposit",
                "X-CSRF-Token": csrfToken,

            },
            body: JSON.stringify(updatedBillWithStatus),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: BillType = await response.json();
        console.log("Created bill :", data);
  
        return data; 
    } catch (error) {
        console.error("Erreur with bill update :", error);
        throw error; 
    }
  };

  export const updateClassicBill = async (billNumber: string, formValues: FormValuesUpdateNotDraftBill, csrfToken: string): Promise<BillType> => {
    try {
        const response = await fetch(`/api/bills/${billNumber}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify(formValues),
        });
  
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
  
        const data: BillType = await response.json();
        console.log("Updated bill :", data);
  
        return data; 
    } catch (error) {
        console.error("Error with bill update :", error);
        throw error; 
    }
  };