"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";
import { deleteCompany, fetchCompanies } from "@/services/api/companyService";
import Breadcrumb from "@/components/BreadCrumb";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Companies = () =>{

    const [companies, setCompanies] = useState<CompanyType[]>([])
    const [companyToDelete, setCompanyToDelete] = useState<string | null>(null); 
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadCompanies = async () => {
            try{
                const data = await fetchCompanies();
                console.log("données reçues après le fetch : "+data)
                setCompanies(data.companies)                
            }catch(error){
                console.error("Impossible to load companies :", error);
            }
        }
    
        loadCompanies()
    },[]);

        // Delete a company
        const handleDeleteCompany = async (companySlug: string) => {
            try {
                await deleteCompany(companySlug);
                setIsOpen(false);  
                // toast.success('Entreprise supprimée avec succès');                 
                setCompanies(prevCompanies => prevCompanies.filter(company => company.slug !== companySlug));  
            } catch (error) {
                console.error("Erreur avec la suppression du devis", error);
            }
        };
    
    const openDeleteDialog = (companySlug: string) => {
        setCompanyToDelete(companySlug);
        setIsOpen(true);  
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);  
    };

  return (

    <>
    <div className="flex w-screen">
        {/* <div><Toaster/></div> */}

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">Entreprises</h1>
            <Breadcrumb
                items={[
                    { label: "Tableau de bord", href: "/director" },
                    { label: "Entreprises"},
                ]}
            />
            <Link href={`/director/companies/create`}>Créer une entreprise</Link>
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Afficher</th>
                        <th>Modifier</th>
                        <th>Supprimer</th>
                    </tr>  
                </thead>
                <tbody>
                {
                    companies.map((company) => {
                        const companySlug = company.slug;
                    
                    return (
                        <tr key={company.id}>
                            <td>{company.name}</td>
                            <td>
                            <Link href={`/director/companies/${company?.slug}`}>
                                Consulter les détails
                            </Link>
                          </td>
                          <td>
                            <Link href={`/director/companies/${company?.slug}/update`}>
                                Modifier
                            </Link>
                          </td>
                            <td>
                                <Button label="Remove" icon={faXmark} type="button" action={() => openDeleteDialog(companySlug)} specifyBackground="text-red-500" />
                            </td>
                        </tr>
                    );
                    })
                }
                </tbody>
            </table>   
        </section>  
        {/* Delete category Dialog */}
        {isOpen && companyToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer l&apos;entreprise</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer cette entreprise ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleDeleteCompany(companyToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}

export default Companies

