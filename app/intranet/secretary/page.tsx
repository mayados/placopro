"use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

const SecretaryDashboard = () =>{

    // const [companies, setCompanies] = useState<CompanyType[]>([])
    // const [companyToDelete, setCompanyToDelete] = useState<string | null>(null); 
    // const [isOpen, setIsOpen] = useState(false);

    // useEffect(() => {
    //     const loadCompanies = async () => {
    //         try{
    //             const data = await fetchCompanies();
    //             console.log("données reçues après le fetch : "+data)
    //             setCompanies(data.companies)                
    //         }catch(error){
    //             console.error("Impossible to load companies :", error);
    //         }
    //     }
    
    //     loadCompanies()
    // },[]);

    //     // Delete a company
    //     const handleDeleteCompany = async (companySlug: string) => {
    //         try {
    //             await deleteCompany(companySlug);
    //             setIsOpen(false);  
    //             // toast.success('Entreprise supprimée avec succès');                 
    //             setCompanies(prevCompanies => prevCompanies.filter(company => company.slug !== companySlug));  
    //         } catch (error) {
    //             console.error("Erreur avec la suppression du devis", error);
    //         }
    //     };
    
    // const openDeleteDialog = (companySlug: string) => {
    //     setCompanyToDelete(companySlug);
    //     setIsOpen(true);  
    // };

    // const closeDeleteDialog = () => {
    //     setIsOpen(false);  
    // };

  return (

    <>
        {/* <div><Toaster/></div> */}
        <h1>Tableau de bord secrétaire</h1>
    </>

  )
}

export default SecretaryDashboard

