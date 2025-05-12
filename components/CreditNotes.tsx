"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { fetchCreditNotes } from "@/services/api/creditNoteService";
// import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "next/navigation";


const LIMIT = 15;


export default function CreditNotes() {


    // const page = parseInt(searchParams.page || "1", 10);
    // const pageSettled = parseInt(searchParams.pageSettled || "1", 10);
    // const pageNotSettled = parseInt(searchParams.pageNotSettled|| "1", 10);

    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSettled = parseInt(searchParams.get("pageSettled") || "1", 10);
    const pageNotSettled = parseInt(searchParams.get("pageNotSettled") || "1", 10);

    // a const for each workSite status
    const [creditNotes, setCreditNotes] = useState<CreditNoteForListType[]>([])
    const [settledCreditNotes, setSettledCreditNotes] = useState<CreditNoteForListType[]>([])
    const [notSettledCreditNotes, setNotSettledCreditNotes] = useState<CreditNoteForListType[]>([])
    const [totalCreditNotes, setTotalCreditNotes] = useState<number>(0)
    const [totalSettledCreditNotes, setTotalSettledCreditNotes] = useState<number>(0)
    const [totalNotSettledCreditNotes, setTotalNotSettledCreditNotes] = useState<number>(0)
    // const for the modal
    // const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadCreditNotes = async () => {
            try {
                const data = await fetchCreditNotes({
                    page,
                    pageSettled,
                    pageNotSettled,
                    limit: LIMIT,
                });
                console.log("données reçues après le fetch : " + data)
                // We hydrate each const with the datas
                setCreditNotes(data['creditNotes'])
                setSettledCreditNotes(data['settledCreditNotes'])
                setNotSettledCreditNotes(data['notSettledCreditNotes'])

                setTotalCreditNotes(data['totalCreditNotes'] || 0)
                setTotalSettledCreditNotes(data['totalSettledCreditNotes'] || 0)
                setTotalNotSettledCreditNotes(data['totalNotSettledCreditNotes'] || 0)
            } catch (error) {
                console.error("Impossible to load credit notes :", error);
            }
        }

        loadCreditNotes()
    }, [page, pageSettled, pageNotSettled]);

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
                    <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Avoirs</h1>
                </header>
                <TabGroup className="w-full">
                    <TabList className="flex flex-wrap justify-center gap-3 mb-6" >

                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">Tous ({totalCreditNotes})</Tab>
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">Traités ({totalSettledCreditNotes})</Tab>
                        <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">Non traités ({totalNotSettledCreditNotes})</Tab>
                    </TabList>
                    <TabPanels>
                        {[creditNotes, settledCreditNotes, notSettledCreditNotes].map((list, index) => (
                            <TabPanel
                                key={index}
                                className="overflow-x-auto bg-white p-4 rounded-md shadow-inner mb-6"
                            >
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1873BF] text-white">
                                            <th className="px-3 py-2">Numéro</th>
                                            <th className="px-3 py-2">Raison</th>
                                            <th className="px-3 py-2">Facture</th>
                                            <th className="px-3 py-2">Etat</th>
                                            <th className="px-3 py-2">Emis le</th>
                                            <th className="px-3 py-2">Afficher</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            list.map((creditNote) => {

                                                return (
                                                    <tr key={creditNote.id}>
                                                        <td>{creditNote.number}</td>
                                                        <td>{creditNote.reason}</td>
                                                        <td>{creditNote.bill.number}</td>
                                                        <td>{creditNote.isSettled ? "Traité" : "Non traité"}</td>
                                                        <td>{formatDate(creditNote.issueDate)}</td>
                                                        <td>
                                                            <Link href={`/director/creditNotes/${creditNote?.number}`}>
                                                                Consulter les détails
                                                            </Link>
                                                        </td>

                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                                {renderPagination(totalCreditNotes, "page")}

                            </TabPanel>
                        ))}

                    </TabPanels>
                </TabGroup>
            </section>

        </>

    )
}


