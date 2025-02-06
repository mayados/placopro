"use client";

import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import Button from "@/components/Button";
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";

const Clients = () =>{

    const [clients, setClients] = useState<ClientType[]>([])
    const [clientToDelete, setClientToDelete] = useState<string | null>(null); 
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
          const response = await fetch(`/api/clients`)
          const data: ClientTypeList =  await response.json()
          console.log("données reçues après le fetch : "+data)
          setClients(data.clients)
    
        }
    
        fetchClients()
    },[]);

    const deleteClient = async (clientId: string) => {
        try {
            const response = await fetch(`/api/director/clients/${clientId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setIsOpen(false);  
                // toast.success('Entreprise supprimée avec succès');                 
                setClients(prevClients => prevClients.filter(client => client.id !== clientId));
            }
        } catch (error) {
            // console.error("Error with company deletion :", error);
            // toast.error("Quelque chose s'est mal passé lors de la suppression de l'entreprise. Veuillez réessayer !");                 
        }
    }

    const openDeleteDialog = (clientId: string) => {
        setClientToDelete(clientId);
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
                        const clientId = client.id;
                    
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
                                <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(clientId)} specifyBackground="text-red-500" />
                            </td>
                        </tr>
                    );
                    })
                }
                </tbody>
            </table>   
        </section>  
        {/* Delete category Dialog */}
        {isOpen && clientToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le client</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce client ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => deleteClient(clientToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
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

