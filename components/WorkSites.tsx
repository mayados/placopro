"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { deleteWorkSite, fetchWorkSites } from "@/services/api/workSiteService";
import { Pagination } from "@/components/Pagination";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";

const LIMIT = 15;

export default function WorkSites() {
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageComming = parseInt(searchParams.get("pageComming") || "1", 10);
    const pageCompleted = parseInt(searchParams.get("pageCompleted") || "1", 10);
    const pageInProgress = parseInt(searchParams.get("pageInProgress") || "1", 10);
    const searchQuery = searchParams.get("search") || "";

    const [workSites, setWorkSites] = useState<WorkSiteForListType[]>([]);
    const [commingWorkSites, setCommingWorkSites] = useState<WorkSiteForListType[]>([]);
    const [inProgressWorkSites, setInProgressWorkSites] = useState<WorkSiteForListType[]>([]);
    const [completedWorkSites, setCompletedWorkSites] = useState<WorkSiteForListType[]>([]);
    const [totalWorkSites, setTotalWorkSites] = useState<number>(0);
    const [totalCommingWorkSites, setTotalCommingWorkSites] = useState<number>(0);
    const [totalInProgressWorkSites, setTotalInProgressWorkSites] = useState<number>(0);
    const [totalCompletedWorkSites, setTotalCompletedWorkSites] = useState<number>(0);
    const [workSiteToDelete, setWorkSiteToDelete] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(searchQuery);

    useEffect(() => {
        const loadWorkSites = async () => {
            try {
                const data = await fetchWorkSites({
                    page,
                    pageComming,
                    pageCompleted,
                    pageInProgress,
                    limit: LIMIT,
                    search
                });
                console.log("données reçues après le fetch : " + data)
                console.log("exemple d'un worksite reçu : " + data['workSites'][0])

                setWorkSites(data['workSites']);
                setCommingWorkSites(data['commingWorkSites']);
                setInProgressWorkSites(data['inProgressWorkSites']);
                setCompletedWorkSites(data['completedWorkSites']);

                setTotalWorkSites(data['totalWorkSites'] || 0);
                setTotalCommingWorkSites(data['totalCommingWorkSites'] || 0);
                setTotalInProgressWorkSites(data['totalInProgressWorkSites'] || 0);
                setTotalCompletedWorkSites(data['totalCompletedWorkSites'] || 0);
            } catch (error) {
                console.error("Impossible to load workSites :", error);
            }
        }

        loadWorkSites();
    }, [page, pageComming, pageCompleted, pageInProgress, search]);

    const handleWorkSiteDeletion = async (workSiteSlug: string) => {
        try {
            await deleteWorkSite(workSiteSlug);
            setIsOpen(false);
            toast.success('Chantier supprimé avec succès');
            setWorkSites(prevWorkSites => prevWorkSites.filter(workSite => workSite.slug !== workSiteSlug));
        } catch (error) {
            toast.error('Erreur lors de la suppression du chantier');
            console.error("Erreur avec la suppression du chantier", error);
        }
    };

    const openDeleteDialog = (workSiteSlug: string) => {
        setWorkSiteToDelete(workSiteSlug);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };

    const renderPagination = (total: number, pageParam: string) => {
        if (total > 0) {
            return <Pagination pageParam={pageParam} total={total} limit={LIMIT} />;
        }
        return null;
    };

    return (
        <>
            <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Chantiers</h1>
                </header>
                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClear={() => setSearch("")}
                    placeholder="Rechercher un chantier (titre, numéro client)"
                />
                <TabGroup className="w-full">
                    <TabList className="flex flex-wrap justify-center gap-3 mb-6">
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">Tous ({totalWorkSites})</Tab>
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">En cours ({totalInProgressWorkSites})</Tab>
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">A venir ({totalCommingWorkSites})</Tab>
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">Terminés ({totalCompletedWorkSites})</Tab>
                    </TabList>
                    <TabPanels>
                        {[workSites, inProgressWorkSites, commingWorkSites, completedWorkSites].map((list, index) => (
                            <TabPanel key={index} className="overflow-x-auto bg-white p-4 rounded-md shadow-inner mb-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1873BF] text-white">
                                            <th className="px-3 py-2">Chantier</th>
                                            <th className="px-3 py-2">Date de début</th>
                                            <th className="px-3 py-2">Ville</th>
                                            <th className="px-3 py-2">Afficher</th>
                                            {index === 1 && <th className="px-3 py-2">Modifier</th>}
                                            {index === 1 && <th className="px-3 py-2">Supprimer</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.length === 0 ? (
                                            <tr>
                                                <td colSpan={index === 1 ? 6 : 4} className="text-center py-4 text-gray-500">
                                                    Rien à afficher
                                                </td>
                                            </tr>
                                        ) : (
                                            list.map((workSite) => (
                                                <tr key={workSite.id}>
                                                    <td>{workSite.title}</td>
                                                    <td>{formatDate(workSite.beginsThe)}</td>
                                                    <td>{workSite.city}</td>
                                                    <td>
                                                        <Link href={`/director/workSites/${workSite?.slug}`}>
                                                            Consulter les détails
                                                        </Link>
                                                    </td>
                                                    {index === 1 && (
                                                        <>
                                                            <td className="px-3 py-2">
                                                                <Link
                                                                    href={`/director/workSites/${workSite?.slug}/update`}
                                                                    className="text-[#FDA821] underline hover:text-[#1873BF]">
                                                                    Modifier
                                                                </Link>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Button
                                                                    label="Remove"
                                                                    icon={faXmark}
                                                                    type="button"
                                                                    action={() => openDeleteDialog(workSite.id)}
                                                                    specifyBackground="text-red-500"
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                {list.length > 0 && renderPagination(
                                    [totalWorkSites, totalInProgressWorkSites, totalCommingWorkSites, totalCompletedWorkSites][index],
                                    ["page", "pageInProgress", "pageComming", "pageCompleted"][index]
                                )}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </section>

            {isOpen && workSiteToDelete && (
                <Dialog
                    open={isOpen}
                    onClose={closeDeleteDialog}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    aria-labelledby="workSite-delete-title"
                    aria-describedby="workSite-delete-desc"
                >
                    <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
                        <DialogTitle id="workSite-delete-title" className="text-xl font-semibold text-[#1873BF] mb-2">
                            Supprimer le chantier
                        </DialogTitle>
                        <Description id="workSite-delete-desc" className="mb-2">
                            Cette action est irréversible
                        </Description>
                        <p className="text-sm mb-4">
                            Êtes-vous sûr de vouloir supprimer ce chantier ? Toutes ses données seront supprimées de façon permanente.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => handleWorkSiteDeletion(workSiteToDelete)}
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
    );
}
