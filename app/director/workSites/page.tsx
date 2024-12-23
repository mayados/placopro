"use client";

import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";

const WorkSites = () =>{

    const [WorkSites, setWorkSites] = useState<WorkSiteType[]>([])
    const [workSiteToDelete, setWorkSiteToDelete] = useState<string | null>(null); 
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchWorkSites = async () => {
          const response = await fetch(`/api/director/workSites`)
          const data =  await response.json()
          console.log("données reçues après le fetch : "+data)
          setWorkSites(data)
    
        }
    
        fetchWorkSites()
    },[]);

    const deleteWorkSite = async (workSiteId: string) => {
        try {
            const response = await fetch(`/api/director/workSites/delete/${workSiteId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setIsOpen(false);  
                // toast.success('Chantier supprimé avec succès');                 
                setWorkSites(prevWorkSites => prevWorkSites.filter(workSite => workSite.id !== workSiteId));
            }
        } catch (error) {
            // console.error("Error with workSite deletion :", error);
            // toast.error("Quelque chose s'est mal passé lors de la suppression du chantier. Veuillez réessayer !");                 
        }
    }

    const openDeleteDialog = (workSiteId: string) => {
        setWorkSiteToDelete(workSiteId);
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
            <Link href={`/director/workSites/create`}>Créer un chantier</Link>
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Chantier</th>
                        <th>Date de début</th>
                        <th>Ville</th>
                        <th>Afficher</th>
                        <th>Modifier</th>
                        <th>Supprimer</th>
                    </tr>  
                </thead>
                <tbody>
                {
                    WorkSites.map((workSite) => {
                        const workSiteId = workSite.id;
                    
                    return (
                        <tr key={workSite.id}>
                            <td>{workSite.title}</td>
                            <td>{formatDate(workSite.beginsThe)}</td>
                            <td>{workSite.city}</td>
                            <td>
                            <Link href={`/director/workSites/${workSite?.slug}`}>
                                Consulter les détails
                            </Link>
                          </td>
                          <td>
                            <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                Modifier
                            </Link>
                          </td>
                            <td>
                                <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(workSiteId)} specifyBackground="text-red-500" />
                            </td>
                        </tr>
                    );
                    })
                }
                </tbody>
            </table>   
        </section>  
        {/* Delete workSite Dialog */}
        {isOpen && workSiteToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le chantier</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce chantier ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => deleteWorkSite(workSiteToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}

export default WorkSites

