"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";
import { deleteClient, fetchClients } from "@/services/api/clientService";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const Clients = () =>{

    const [clients, setClients] = useState<ClientType[]>([])
    const [clientToDelete, setClientToDelete] = useState<string | null>(null); 
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadClients = async () => {
            try{
                const data = await fetchClients();
                console.log("données reçues après le fetch : "+data)
                setClients(data.clients)                
            }catch(error){
                console.error("Impossible to load clients :", error);
            }
        }
    
        loadClients()
    },[]);

    const handleClientDeletion = async (clientSlug: string) => {
        try {
            await deleteClient(clientSlug);
            setIsOpen(false);  
            toast.success('Client supprimé avec succès');                 
            setClients(prevClients => prevClients.filter(client => client.slug !== clientSlug));
        } catch (error) {
            toast.success('Erreur avec la suppression du client');                 
            console.error("Impossible to delete client :", error);               
        }
    }

    const openDeleteDialog = (clientSlug: string) => {
        setClientToDelete(clientSlug);
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
            <h1 className="text-3xl text-white text-center">Clients</h1>
            <Link href={`/director/clients/create`}>Créer un client</Link>
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Ville</th>
                        <th>Afficher</th>
                        <th>Modifier</th>
                        <th>Supprimer</th>
                    </tr>  
                </thead>
                <tbody>
                {
                    clients.map((client: ClientType) => {
                        const clientSlug = client.slug;
                    
                    return (
                        <tr key={client.id}>
                            <td>{client.name}</td>
                            <td>{client.firstName}</td>
                            <td>{client.city}</td>
                            <td>
                            <Link href={`/director/clients/${client?.slug}`}>
                                Consulter les détails
                            </Link>
                          </td>
                          <td>
                            <Link href={`/director/clients/${client?.slug}/update`}>
                                Modifier
                            </Link>
                          </td>
                            <td>
                                <Button label="Remove" icon={faXmark} type="button" action={() => openDeleteDialog(clientSlug)} specifyBackground="text-red-500" />
                            </td>
                        </tr>
                    );
                    })
                }
                </tbody>
            </table>   
        </section>  
        {/* Delete client Dialog */}
        {isOpen && clientToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le client</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce client ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleClientDeletion(clientToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}

export default Clients

