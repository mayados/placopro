"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";
import { deleteClient, fetchClients } from "@/services/api/clientService";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Pagination } from "./Pagination";
import SearchBar from "./SearchBar";

const LIMIT = 2;


export default function Clients() {

    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const searchQuery = searchParams.get("search") || "";


    const [clients, setClients] = useState<ClientForListType[]>([])
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [totalClients, setTotalClients] = useState<number>(0)
    const [search, setSearch] = useState(searchQuery);



    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await fetchClients({
                    page,
                    limit: LIMIT,
                    search
                });
                console.log("données reçues après le fetch : " + data)
                setClients(data.clients)
                setTotalClients(data.totalClients)
            } catch (error) {
                console.error("Impossible to load clients :", error);
            }
        }

        loadClients()
    }, [page, search]);

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

    const renderPagination = (total: number, pageParam: string) => {
        if (total > 0) {
            return <Pagination pageParam={pageParam} total={total} limit={LIMIT} />;
        }
        // Don't display anything it there are no datas
        return null;
    };
    return (

        <>

            <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Clients</h1>
                </header>
                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClear={() => setSearch("")}
                    placeholder="Rechercher un client (nom, ville, numéro client...)"
                />
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1873BF] text-white">
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
                              (clients ?? []).map((client: ClientForListType) => {

                                const clientSlug = client.slug;

                                return (
                                    <tr key={client.id} className="even:bg-[#F5F5F5]">
                                        <td className="px-3 py-2">{client.name}</td>
                                        <td className="px-3 py-2">{client.firstName}</td>
                                        <td className="px-3 py-2">{client.city}</td>
                                        <td className="px-3 py-2">
                                            <Link
                                                href={`/director/clients/${client?.slug}`}
                                                className="text-[#1873BF] underline hover:text-[#FDA821]"

                                            >
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Link
                                                href={`/director/clients/${client?.slug}/update`}
                                                className="text-[#FDA821] underline hover:text-[#1873BF]"

                                            >
                                                Modifier
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Button label="Remove" icon={faXmark} type="button" action={() => openDeleteDialog(clientSlug)} specifyBackground="text-red-500" />
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                {renderPagination(totalClients, "page")}

            </section>
            {/* Delete client Dialog */}

            {isOpen && clientToDelete && (
                <Dialog
                    open={isOpen}
                    onClose={closeDeleteDialog}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    aria-labelledby="client-delete-title"
                    aria-describedby="client-delete-desc"
                >
                    <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
                        <DialogTitle id="client-delete-title" className="text-xl font-semibold text-[#1873BF] mb-2">
                            Supprimer le client
                        </DialogTitle>
                        <Description id="client-delete-desc" className="mb-2">
                            Cette action est irréversible
                        </Description>
                        <p className="text-sm mb-4">
                            Êtes-vous sûr de vouloir supprimer ce client ? Toutes ses données seront supprimées de façon permanente.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => handleClientDeletion(clientToDelete)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                            >
                                Supprimer
                            </button>
                            <button
                                onClick={closeDeleteDialog}
                                className="bg-gray-200 hover:bg-gray-300 text-[#637074] px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                            >
                                Annuler
                            </button>
                        </div>
                    </DialogPanel>
                </Dialog>
            )}
        </>

    )
}


