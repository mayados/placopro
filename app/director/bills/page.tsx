"use client";

import { useEffect, useState } from "react";
import { Trash2 } from 'lucide-react';
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { deleteBill, fetchBills } from "@/services/api/billService";

const Bills = () =>{

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

    useEffect(() => {
        const loadBills = async () => {
            try {
                // We call API method which is contained in services/api/quoeService
              const data = await fetchBills();
              
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
      
            } catch (error) {
              console.error("Impossible to load bills :", error);
            }
          };
      
          loadBills();
    },[]);

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

  return (

    <>
    <div className="flex w-screen">
        {/* <div><Toaster/></div> */}

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">Factures</h1>
            <Link href={`/director/bills/create`}>Créer une facture</Link>
            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Tous ({totalBills})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Brouillons ({totalDraftBills})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Prêtes à l'envoi ({totalReadyToBeSentBills})</Tab>
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
                                    <th>Date d'émission</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                bills.map((bill) => {
                                    const billId = bill.id;
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
                                            <Link href={`/director/bills/${bill?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>  
                    </TabPanel>
                    {/* Drafts */}
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de facture</th>
                                    <th>Client</th>
                                    <th>Date d'émission</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                draftBills.map((bill) => {
                                    const billId = bill.id;
                                
                                return (
                                    <tr key={bill.id}>
                                        <td>{bill.number}</td>
                                        <td>{bill.client.name}</td>
                                        <td>{formatDate(bill?.issueDate)}</td>
                                        <td>{formatDate(bill.dueDate)}</td>
                                        <td>
                                            <Link href={`/director/bills/${bill?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td>
                                            <Link href={`/director/bills/${bill?.number}/update`}>
                                                Modifier
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>    
                    </TabPanel>
                    {/* Ready */}
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de facture</th>
                                    <th>Client</th>
                                    <th>Date d'émission</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                readyToBeSentBills.map((bill) => {
                                    const billId = bill.id;
                                
                                return (
                                    <tr key={bill.id}>
                                        <td>{bill.number}</td>
                                        <td>{bill.client.name}</td>
                                        <td>{formatDate(bill?.issueDate)}</td>
                                        <td>{formatDate(bill.dueDate)}</td>
                                        <td>Afficher</td>
                                        <td>
                                            <Link href={`/director/bills/${bill?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>   
                    </TabPanel>
                    {/* Sent */}
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de facture</th>
                                    <th>Client</th>
                                    <th>Date d'émission</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                sentBills.map((bill) => {
                                    const billId = bill.id;
                                
                                return (
                                    <tr key={bill.id}>
                                        <td>{bill.number}</td>
                                        <td>{bill.client.name}</td>
                                        <td>{formatDate(bill?.issueDate)}</td>
                                        <td>{formatDate(bill.dueDate)}</td>
                                        <td>Afficher</td>
                                        <td>
                                            <Link href={`/director/bills/${bill?.number}`}>
                                                Consulter les détails
                                            </Link>
                                        </td>
                                    </tr>
                                );
                                })
                            }
                            </tbody>
                        </table>     
                    </TabPanel>
                    {/* Canceled */}
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <table className="table-auto">
                            <thead>
                                <tr>
                                    <th>N° de facture</th>
                                    <th>Client</th>
                                    <th>Date d'émission</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Afficher</th>
                                </tr>  
                            </thead>
                            <tbody>
                            {
                                canceledBills.map((bill) => {
                                    const billId = bill.id;
                                
                                return (
                                    <tr key={bill.id}>
                                        <td>{bill.number}</td>
                                        <td>{bill.client.name}</td>
                                        <td>{formatDate(bill?.issueDate)}</td>
                                        <td>{formatDate(bill.dueDate)}</td>
                                        <td>
                                            <Link href={`/director/bills/${bill?.number}`}>
                                                Consulter les détails
                                            </Link>
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

export default Bills

