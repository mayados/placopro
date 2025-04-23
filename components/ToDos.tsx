"use client";

import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import {checkToDo, fetchToDos } from "@/services/api/toDoService";

type ToDosProps = {
    csrfToken: string;
  };

  export default function ToDos({csrfToken}: ToDosProps){


    // a const for each workSite status
    const [toDos, setToDos] = useState<ToDoForListType[]>([])
    const [archivedToDos, setArchivedToDos] = useState<ToDoForListType[]>([])
    const [assignedToDos, setAssignedToDos] = useState<ToDoForListType[]>([])
    const [checkedToDos, setCheckedToDos] = useState<ToDoForListType[]>([])
    // const to get total of workSites by status
    const [totalToDos, setTotalToDos] = useState<number>(0)
    const [totalCheckedToDos, setTotalCheckedToDos] = useState<number>(0)
    const [totalArchivedToDos, setTotalArchivedToDos] = useState<number>(0)
    const [totalAssignedToDos, setTotalAssignedToDos] = useState<number>(0)
    // const to set a workSite if it's selected to be deleted
    const [toDoToDelete, setToDoToDelete] = useState<string | null>(null); 
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadToDos = async () => {
            try{
                const data = await fetchToDos();
                console.log("données reçues après le fetch : "+data)
                console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setToDos(data['toDos'])
                setCheckedToDos(data['checkedToDos'])
                setArchivedToDos(data['archivedToDos'])
                setAssignedToDos(data['assignedToDos'])
                  
                setTotalToDos(data['totalToDos'] || 0)
                setTotalCheckedToDos(data['totalCheckedToDos'] || 0)
                setTotalArchivedToDos(data['totalArchivedToDos'] || 0)
                setTotalAssignedToDos(data['totalAssignedToDos'] || 0)
            }catch(error){
                console.error("Impossible to load toDos :", error);
            }
        }
            
        loadToDos()
    }, [csrfToken]);

    // Delete a workSite
    const handleToDoDeletion = async (toDoId: string) => {
        try {
            await deleteToDo(toDoId);
            setIsOpen(false);  
            toast.success('To do supprimé avec succès');                 
            setToDos(prevToDos => prevToDos.filter(toDo => toDo.id !== toDoId));

        } catch (error) {
            toast.error('Erreur lors de la suppression du To do');                 
            console.error("Erreur avec la suppression du To do", error);
        }
    };


    const openDeleteDialog = (toDoId: string) => {
        setToDoToDelete(toDoId);
        setIsOpen(true);  
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);  
    };

  return (

    <>
    <div className="flex w-screen">

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">To do list</h1>
            <Link href={`/director/toDos/create`}>Créer un to do</Link>
            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">To do ({totalToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Checked ({totalCheckedToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Archivés ({totalArchivedToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Assignés ({totalAssignedToDos})</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            {
                                toDos.map((toDo) => {
                                
                                return (
                                    <article key={toDo.id}>
                                          <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-green-500"
                                            onChange={async () => {
                                            try {
                                                await checkToDo(toDo.id,csrfToken);
                                                toast.success("Tâche cochée");
                                                setToDos(prev => prev.filter(item => item.id !== toDo.id));
                                                setCheckedToDos(prev => [...prev, toDo]); 
                                                setTotalToDos(prev => prev - 1);
                                                setTotalCheckedToDos(prev => prev + 1);
                                            } catch (err) {
                                                toast.error("Erreur lors de la mise à jour"+err);
                                            }
                                            }}
                                        />
                                        <p>{toDo.task}</p>
                                        <p>{toDo.description}</p>
                                        {formatDate(toDo.createdAt)}
                                        
                                        {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                            Modifier
                                        </Link>
                                    </td>
                                        <td>
                                            <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                        </td> */}
                                    </article>
                                );
                                })
                            }
                        </section>

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            {
                                checkedToDos.map((toDo) => {
                                
                                return (
                                    <article key={toDo.id}>
                                        <p>{toDo.task}</p>
                                        <p>{toDo.description}</p>
                                        {formatDate(toDo.createdAt)}
                                        
                                        {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                            Modifier
                                        </Link>
                                    </td>
                                        <td>
                                            <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                        </td> */}
                                    </article>
                                );
                                })
                            }
                        </section>

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                    <section>
                        {
                            archivedToDos.map((toDo) => {
                                
                            return (
                                <article key={toDo.id}>
                                    <p>{toDo.task}</p>
                                    <p>{toDo.description}</p>
                                    {formatDate(toDo.createdAt)}
                                        
                                    {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                        Modifier
                                    </Link>
                                </td>
                                    <td>
                                        <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                    </td> */}
                                </article>
                            );
                            })
                        }
                    </section>

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            {
                                assignedToDos.map((toDo) => {
                                    
                                return (
                                    <article key={toDo.id}>
                                        <p>{toDo.task}</p>
                                        <p>{toDo.description}</p>
                                        {formatDate(toDo.createdAt)}
                                        <p>Assigné à {toDo.assignedToName}</p>
                                            
                                        {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                            Modifier
                                        </Link>
                                    </td>
                                        <td>
                                            <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                        </td> */}
                                    </article>
                                );
                                })
                            }
                        </section>

                    </TabPanel>
                </TabPanels>
            </TabGroup>  
        </section>  
        {/* Delete workSite Dialog */}
        {isOpen && toDoToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le to do</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce to do ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleToDoDeletion(toDoToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}

