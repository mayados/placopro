"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { deleteQuote, fetchQuotes } from "@/services/api/quoteService";
// import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import Button from "@/components/Button";
import { faXmark } from "@fortawesome/free-solid-svg-icons";


const LIMIT = 15;

type QuotesProps = {
    searchParams: Record<string, string>;
  };
export default function Quotes({ searchParams }: QuotesProps) {

  
    const page = parseInt(searchParams.page || "1", 10);
    const pageDraft = parseInt(searchParams.pageDraft || "1", 10);
    const pageReadyToBeSent = parseInt(searchParams.pageReadyToBeSent || "1", 10);
    const pageSent = parseInt(searchParams.pageSent || "1", 10);
    const pageAccepted = parseInt(searchParams.pageAccepted || "1", 10);
    const pageRefused = parseInt(searchParams.pageRefused || "1", 10);

    // a const for each quote status
    const [quotes, setQuotes] = useState<QuoteForListType[]>([])
    // Quotes put in draft
    const [draftQuotes, setDraftQuotes] = useState<QuoteForListType[]>([])
    // Quotes ready to be sent (= created but not sent yet)
    const [readyToBeSentQuotes, setReadyToBeSentQuotes] = useState<QuoteForListType[]>([])
    // Quotes sent to the client
    const [sentQuotes, setSentQuotes] = useState<QuoteForListType[]>([])
    // Quotes accepted by the client
    const [acceptedQuotes, setAcceptedQuotes] = useState<QuoteForListType[]>([])
    // Quotes refused by the client
    const [refusedQuotes, setRefusedQuotes] = useState<QuoteForListType[]>([])
    // const to get total of quotes by status
    const [totalQuotes, setTotalQuotes] = useState<number>(0)
    const [totalDraftQuotes, setTotalDraftQuotes] = useState<number>(0)
    const [totalReadyToBeSentQuotes, setTotalReadyToBeSentQuotes] = useState<number>(0)
    const [totalSentQuotes, setTotalSentQuotes] = useState<number>(0)
    const [totalAcceptedQuotes, setTotalAcceptedQuotes] = useState<number>(0)
    const [totalRefusedQuotes, setTotalRefusedQuotes] = useState<number>(0)
    // const to set a quote if it's selected to be deleted
    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null); 
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadQuotes = async () => {
            try {
                // We call API method which is contained in services/api/quoeService
              const data = await fetchQuotes({
                page,
                pageDraft,
                pageReadyToBeSent,
                pageSent,
                pageAccepted,
                pageRefused,
                limit: LIMIT,
              });
              
              setQuotes(data.quotes);
              setDraftQuotes(data.draftQuotes);
              setReadyToBeSentQuotes(data.readyToBeSentQuotes);
              setSentQuotes(data.sentQuotes);
              setAcceptedQuotes(data.acceptedQuotes);
              setRefusedQuotes(data.refusedQuotes);
      
              setTotalQuotes(data.totalQuotes || 0);
              setTotalDraftQuotes(data.totalDraftQuotes || 0);
              setTotalReadyToBeSentQuotes(data.totalReadyToBeSentQuotes || 0);
              setTotalSentQuotes(data.totalSentQuotes || 0);
              setTotalAcceptedQuotes(data.totalAcceptedQuotes || 0);
              setTotalRefusedQuotes(data.totalRefusedQuotes || 0);
      
            } catch (error) {
              console.error("Impossible to load quotes :", error);
            }
          };
      
          loadQuotes();
    },[page, pageDraft, pageReadyToBeSent, pageSent, pageAccepted,pageRefused]);

    // Delete a quote
    const handleDelete = async (quoteId: string) => {
        try {
            await deleteQuote(quoteId);  
            setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== quoteId)); // Mettre à jour l'état local pour supprimer le devis
        } catch (error) {
            console.error("Erreur avec la suppression du devis", error);
        }
    };

    const openDeleteDialog = (quoteId: string) => {
        setQuoteToDelete(quoteId);
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
    <div className="flex w-screen">

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">Devis</h1>
            <Link href={`/director/quotes/create`}>Créer un devis</Link>
            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Tous ({totalQuotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Brouillons ({totalDraftQuotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Prêts à l&apos;envoi ({totalReadyToBeSentQuotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Envoyés ({totalSentQuotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Acceptés ({totalAcceptedQuotes})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Refusés ({totalRefusedQuotes})</Tab>
                </TabList>
                {/* All */}
                <TabPanels>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                quotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>  
                        {renderPagination(totalQuotes, "page")}
                    </TabPanel>
                    {/* Drafts */}
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                    <th>Modifier</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                draftQuotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}/update`}>
                                                Modifier
                                            </Link>
                                        </td>
                                        <td>
                                            <Button label="Remove" icon={faXmark} type="button" action={() => openDeleteDialog(quote.id)} specifyBackground="text-red-500" />
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>  
                        {renderPagination(totalDraftQuotes, "page")}
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                readyToBeSentQuotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>  
                        {renderPagination(totalReadyToBeSentQuotes, "page")}
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                sentQuotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>  
                        {renderPagination(totalSentQuotes, "page")}

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                acceptedQuotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table> 
                        {renderPagination(totalAcceptedQuotes, "page")}
    
                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de devis</th>
                                    <th>Client</th>
                                    <th>Localisation</th>
                                    <th>Début travaux</th>
                                    <th>Fin de validité</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                refusedQuotes.map((quote) => {
                                
                                return (
                                    <tr key={quote.id}>
                                        <td>{quote.number}</td>
                                        <td>{quote.client.name}</td>
                                        <td>{quote.workSite.city}</td>
                                        <td>{formatDate(quote?.workStartDate)}</td>
                                        <td>{formatDate(quote.validityEndDate)}</td>
                                        <td>
                                            <Link href={`/director/quotes/${quote?.slug}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table> 
                        {renderPagination(totalRefusedQuotes, "page")}
    
                    </TabPanel>
                </TabPanels>
            </TabGroup>  
        </section>  
        {/* Delete quote Dialog */}
        {isOpen && quoteToDelete && (
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le devis</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce devis ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleDelete(quoteToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}


