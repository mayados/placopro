"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import {Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { fetchCreditNotes } from "@/services/api/creditNoteService";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";

const LIMIT = 15;

const CreditNotes = () =>{

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
            try{
                const data = await fetchCreditNotes({
                    page,
                    pageSettled,
                    pageNotSettled,
                    limit: LIMIT,  
                });
                console.log("données reçues après le fetch : "+data)
                // We hydrate each const with the datas
                setCreditNotes(data['creditNotes'])
                setSettledCreditNotes(data['settledCreditNotes'])
                setNotSettledCreditNotes(data['notSettledCreditNotes'])
                  
                setTotalCreditNotes(data['totalCreditNotes'] || 0)
                setTotalSettledCreditNotes(data['totalSettledCreditNotes'] || 0)
                setTotalNotSettledCreditNotes(data['totalNotSettledCreditNotes'] || 0)
            }catch(error){
                console.error("Impossible to load credit notes :", error);
            }
        }
            
        loadCreditNotes()
    },[page, pageSettled, pageNotSettled]);

    const renderPagination = (total: number, pageParam: string) => {
        if (total > 0) {
            return <Pagination pageParam={pageParam} total={total} limit={LIMIT} />;
         }
            // Don't display anything it there are no datas
        return null; 
    };

  return (

    <>
    <div className="flex w-screen">

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">Avoirs</h1>
            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Tous ({totalCreditNotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Traités ({totalSettledCreditNotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Non traités ({totalNotSettledCreditNotes})</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Raison</th>
                                    <th>Facture</th>
                                    <th>Etat</th>
                                    <th>Emis le</th>
                                    <th>Modifier</th>
                                    <th>Supprimer</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                creditNotes.map((creditNote) => {
                                
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
                                    <td>
                                        <Link href={`/director/creditNotes/${creditNote?.number}/update`}>
                                            Modifier
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
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Raison</th>
                                        <th>Facture</th>
                                        <th>Emis le</th>
                                        <th>Modifier</th>
                                        <th>Supprimer</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    settledCreditNotes.map((creditNote) => {
                                    
                                    return (
                                        <tr key={creditNote.id}>
                                            <td>{creditNote.number}</td>
                                            <td>{creditNote.reason}</td>
                                            <td>{creditNote.bill.number}</td>
                                            <td>{formatDate(creditNote.issueDate)}</td>
                                            <td>
                                            <Link href={`/director/creditNotes/${creditNote?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td>
                                            <Link href={`/director/creditNotes/${creditNote?.number}/update`}>
                                                Modifier
                                            </Link>
                                        </td>
                                    </tr>
                                    );
                                    })
                                }
                                </tbody>
                        </table>   
                        {renderPagination(totalSettledCreditNotes, "page")}

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                    <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Raison</th>
                                        <th>Facture</th>
                                        <th>Emis le</th>
                                        <th>Modifier</th>
                                        <th>Supprimer</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    notSettledCreditNotes.map((creditNote) => {
                                    
                                    return (
                                        <tr key={creditNote.id}>
                                            <td>{creditNote.number}</td>
                                            <td>{creditNote.reason}</td>
                                            <td>{creditNote.bill.number}</td>
                                            <td>{formatDate(creditNote.issueDate)}</td>
                                            <td>
                                            <Link href={`/director/creditNotes/${creditNote?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td>
                                            <Link href={`/director/creditNotes/${creditNote?.number}/update`}>
                                                Modifier
                                            </Link>
                                        </td>
                                    </tr>
                                    );
                                    })
                                }
                                </tbody>
                        </table>    
                        {renderPagination(totalNotSettledCreditNotes, "page")}
                    </TabPanel>
                </TabPanels>
            </TabGroup>  
        </section>  

    </div>
    </>

  )
}

export default CreditNotes

