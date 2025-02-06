"use client";

import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";

const WorkSites = () =>{

    // a const for each workSite status
    const [workSites, setWorkSites] = useState<WorkSiteForListType[]>([])
    const [commingWorkSites, setCommingWorkSites] = useState<WorkSiteForListType[]>([])
    const [inProgressWorkSites, setInProgressWorkSites] = useState<WorkSiteForListType[]>([])
    const [completedWorkSites, setCompletedWorkSites] = useState<WorkSiteForListType[]>([])
    // const to get total of workSites by status
    const [totalWorkSites, setTotalWorkSites] = useState<number>(0)
    const [totalCommingWorkSites, setTotalCommingWorkSites] = useState<number>(0)
    const [totalInProgressWorkSites, setTotalInProgressWorkSites] = useState<number>(0)
    const [totalCompletedWorkSites, setTotalCompletedWorkSites] = useState<number>(0)
    // const to set a workSite if it's selected to be deleted
    const [workSiteToDelete, setWorkSiteToDelete] = useState<string | null>(null); 
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchWorkSites = async () => {
          const response = await fetch(`/api/workSites`)
          const data: WorkSiteWithTotalsAndStatus =  await response.json()
          console.log("données reçues après le fetch : "+data)
          console.log("exemple d'un worksite reçu : "+data['workSites'][0])
          // We hydrate each const with the datas
          setWorkSites(data['workSites'])
          setCommingWorkSites(data['commingWorkSites'])
          setInProgressWorkSites(data['inProgressWorkSites'])
          setCompletedWorkSites(data['completedWorkSites'])
    
          setTotalWorkSites(data['totalWorkSites'] || 0)
          setTotalCommingWorkSites(data['totalCommingWorkSites'] || 0)
          setTotalInProgressWorkSites(data['totalInProgressWorkSites'] || 0)
          setTotalCompletedWorkSites(data['totalCompletedWorkSites'] || 0)
    
        }
    
        fetchWorkSites()
    },[]);

    const deleteWorkSite = async (workSiteId: string) => {
        try {
            const response = await fetch(`/api/workSites/${workSiteId}`, {
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
            <h1 className="text-3xl text-white text-center">Chantiers</h1>
            <Link href={`/director/workSites/create`}>Créer un chantier</Link>
            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Tous ({totalWorkSites})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">En cours ({totalInProgressWorkSites})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">A venir ({totalCommingWorkSites})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Terminés ({totalCompletedWorkSites})</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
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
                                workSites.map((workSite) => {
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
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
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
                                inProgressWorkSites.map((workSite) => {
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
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
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
                                commingWorkSites.map((workSite) => {
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
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
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
                                completedWorkSites.map((workSite) => {
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
                    </TabPanel>
                </TabPanels>
            </TabGroup>  
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

