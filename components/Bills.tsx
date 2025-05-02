"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { deleteBill, fetchBills } from "@/services/api/billService";
// import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import Button from "@/components/Button";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const LIMIT = 15;


type BillsProps = {
    searchParams: Record<string, string>;
  };
export default function Bills({ searchParams }: BillsProps) {
  
    const page = parseInt(searchParams.page || "1", 10);
    const pageReadyToBeSent = parseInt(searchParams.pageReadyToBeSent || "1", 10);
    const pageSent = parseInt(searchParams.pageSent || "1", 10);
    const pageDraft = parseInt(searchParams.pageDraft || "1", 10);
    const pageCanceled = parseInt(searchParams.pageCanceled || "1", 10);

    // a const for each quote status
    const [bills, setBills] = useState<BillForListType[]>([])
    // Quotes put in draft
    const [draftBills, setDraftBills] = useState<BillForListType[]>([])
    // Quotes ready to be sent (= created but not sent yet)
    const [readyToBeSentBills, setReadyToBeSentBills] = useState<BillForListType[]>([])
    // Quotes sent to the client
    const [sentBills, setSentBills] = useState<BillForListType[]>([])
    // Quotes canceled for different reasons (annulation, mistake...)
    const [canceledBills, setCanceledBills] = useState<BillForListType[]>([])
    // const to get total of quotes by status
    const [totalBills, setTotalBills] = useState<number>(0)
    const [totalDraftBills, setTotalDraftBills] = useState<number>(0)
    const [totalReadyToBeSentBills, setTotalReadyToBeSentBills] = useState<number>(0)
    const [totalSentBills, setTotalSentBills] = useState<number>(0)
    const [totalCanceledBills, setTotalCanceledBills] = useState<number>(0)
    // const to set a quote if it's selected to be deleted
    const [billToDelete, setBillToDelete] = useState<string | null>(null); 
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);  // To track if data is loading


    useEffect(() => {
        const loadBills = async () => {
            try {
                // We call API method which is contained in services/api/quoeService
              const data = await fetchBills({
                page,
                pageReadyToBeSent,
                pageSent,
                pageDraft,
                pageCanceled,
                limit: LIMIT,
            });
              
              setBills(data.bills);
              setDraftBills(data.draftBills);
              setReadyToBeSentBills(data.readyToBeSentBills);
              setSentBills(data.sentBills);
              setCanceledBills(data.canceledBills);
      
              setTotalBills(data.totalBills || 0);
              setTotalDraftBills(data.totalDraftBills || 0);
              setTotalReadyToBeSentBills(data.totalReadyToBeSentBills || 0);
              setTotalSentBills(data.totalSentBills || 0);
              setTotalCanceledBills(data.totalCanceledBills || 0);
              setIsLoading(false);  // Data is loaded, set loading state to false

            } catch (error) {
                setIsLoading(false);  // Data is loaded, set loading state to false

              console.error("Impossible to load bills :", error);
            }
          };
      
          loadBills();
    },[page, pageReadyToBeSent, pageSent, pageDraft, pageCanceled]);

    // Delete a bill
    const handleDelete = async (billId: string) => {
        try {
            await deleteBill(billId);  
            // Update local state to delete the bill
            setBills(prevBills => prevBills.filter(bill => bill.id !== billId)); 
        } catch (error) {
            console.error("Erreur avec la suppression de la facture", error);
        }
    };

    const openDeleteDialog = (billId: string) => {
        setBillToDelete(billId);
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
    if (isLoading) {
        return <div>Loading...</div>;  // Display loading state while fetching data
    }

  return (

    <>

        <div className="flex w-screen">

            <section className="border-2 border-green-800 flex-[8]">
                <h1 className="text-3xl text-white text-center">Factures</h1>
                <TabGroup className="flex flex-col items-center lg:block my-3">
                    <TabList className="my-3 flex gap-3">
                        <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Tous ({totalBills})</Tab>
                        <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Brouillons ({totalDraftBills})</Tab>
                        <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Prêtes à l&apos;envoi ({totalReadyToBeSentBills})</Tab>
                        <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Envoyées ({totalSentBills})</Tab>
                        <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Annulées ({totalCanceledBills})</Tab>
                    </TabList>
                    <TabPanels>
                        {/* All */}
                        <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>N° de facture</th>
                                        <th>Client</th>
                                        <th>Date d&apos;émission</th>
                                        <th>Date d&apos;échéance</th>
                                        <th>Statut</th>
                                        <th>Afficher</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    bills.map((bill) => {
                                        console.log("date :"+bill.issueDate)
                                    
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.number}</td>
                                            <td>{bill.client.name}</td>
                                            <td>{formatDate(bill.issueDate)}</td>
                                            <td>{formatDate(bill.dueDate)}</td>
                                            <td>{bill.status}</td>
                                            <td>Afficher</td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}`}>
                                                    Consulter les détails
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                    })
                                }
                                </tbody>
                            </table> 
                            {renderPagination(totalBills, "page")}
    
                        </TabPanel>
                        {/* Drafts */}
                        <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>N° de facture</th>
                                        <th>Client</th>
                                        <th>Date d&apos;émission</th>
                                        <th>Date d&apos;échéance</th>
                                        <th>Statut</th>
                                        <th>Afficher</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    draftBills.map((bill) => {
                                    
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.number}</td>
                                            <td>{bill.client.name}</td>
                                            <td>{formatDate(bill?.issueDate)}</td>
                                            <td>{formatDate(bill.dueDate)}</td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}`}>
                                                    Consulter les détails
                                                </Link>
                                            </td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}/update`}>
                                                    Modifier
                                                </Link>
                                            </td>
                                            <td>
                                            <Button label="Remove" icon={faXmark} type="button" action={() => openDeleteDialog(bill.id)} specifyBackground="text-red-500" />
                                            </td>
                                        </tr>
                                    );
                                    })
                                }
                                </tbody>
                            </table>   
                            {renderPagination(totalDraftBills, "page")}
    
                        </TabPanel>
                        {/* Ready */}
                        <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>N° de facture</th>
                                        <th>Client</th>
                                        <th>Date d&apos;émission</th>
                                        <th>Date d&apos;échéance</th>
                                        <th>Statut</th>
                                        <th>Afficher</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    readyToBeSentBills.map((bill) => {
                                    
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.number}</td>
                                            <td>{bill.client.name}</td>
                                            <td>{formatDate(bill?.issueDate)}</td>
                                            <td>{formatDate(bill.dueDate)}</td>
                                            <td>Afficher</td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}`}>
                                                    Consulter les détails
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                    })
                                }
                                </tbody>
                            </table>  
                            {renderPagination(totalReadyToBeSentBills, "page")}
    
                        </TabPanel>
                        {/* Sent */}
                        <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>N° de facture</th>
                                        <th>Client</th>
                                        <th>Date d&apos;émission</th>
                                        <th>Date d&apos;échéance</th>
                                        <th>Statut</th>
                                        <th>Afficher</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    sentBills.map((bill) => {
                                    
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.number}</td>
                                            <td>{bill.client.name}</td>
                                            <td>{formatDate(bill?.issueDate)}</td>
                                            <td>{formatDate(bill.dueDate)}</td>
                                            <td>Afficher</td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}`}>
                                                    Consulter les détails
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                    })
                                }
                                </tbody>
                            </table>   
                            {renderPagination(totalSentBills, "page")}
    
                        </TabPanel>
                        {/* Canceled */}
                        <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                            <table className="table-auto">
                                <thead>
                                    <tr>
                                        <th>N° de facture</th>
                                        <th>Client</th>
                                        <th>Date d&apos;émission</th>
                                        <th>Date d&apos;échéance</th>
                                        <th>Statut</th>
                                        <th>Afficher</th>
                                    </tr>  
                                </thead>
                                <tbody>
                                {
                                    canceledBills.map((bill) => {
                                    
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.number}</td>
                                            <td>{bill.client.name}</td>
                                            <td>{formatDate(bill?.issueDate)}</td>
                                            <td>{formatDate(bill.dueDate)}</td>
                                            <td>
                                                <Link href={`/director/bills/${bill?.slug}`}>
                                                    Consulter les détails
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                    })
                                }
                                </tbody>
                            </table>  
                            {renderPagination(totalCanceledBills, "page")}
    
                        </TabPanel>
                    </TabPanels>
                </TabGroup>  
            </section>  
            {/* Delete quote Dialog */}
            {isOpen && billToDelete && (
            <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                <DialogTitle>Supprimer la facture</DialogTitle>
                <Description>Cette action est irréversible</Description>
                <p>Etes-vous sûr de vouloir supprimer cette facture ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => handleDelete(billToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                        <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                    </div>
                </DialogPanel>
            </Dialog>
                )}   
        </div>

    </>

  )
}


