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
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import SearchBar from "./SearchBar";
import Breadcrumb from "./BreadCrumb";

const LIMIT = 2;



  export default function Bills() {
  

    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageReadyToBeSent = parseInt(searchParams.get("pageReadyToBeSent") || "1", 10);
    const pageSent = parseInt(searchParams.get("pageSent") || "1", 10);
    const pageDraft = parseInt(searchParams.get("pageDraft") || "1", 10);
    const pageCanceled = parseInt(searchParams.get("pageCanceled") || "1", 10);
    const searchQuery = searchParams.get("search") || "";


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
        const [search, setSearch] = useState(searchQuery);


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
                search
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
    },[page, pageReadyToBeSent, pageSent, pageDraft, pageCanceled, search]);

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
        return <LoadingSpinner />;  // Display loading state while fetching data
    }

  return (

<>
    <Breadcrumb
      items={[
        { label: "Tableau de bord", href: "/director" },
        { label: `Factures` },
      ]}
    />
  <div className="w-full px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
    <section className="flex-[8]">
      <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-4">Factures</h1>
                      <SearchBar
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onClear={() => setSearch("")}
                          placeholder="Rechercher une facture (numéro de facture, nom client)"
                      />
      <TabGroup>
        <TabList className="flex flex-wrap justify-center gap-3 mb-6">
          <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">
            Tous ({totalBills})
          </Tab>
          <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">
            Brouillons ({totalDraftBills})
          </Tab>
          <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">
            Prêtes à l&apos;envoi ({totalReadyToBeSentBills})
          </Tab>
          <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">
            Envoyées ({totalSentBills})
          </Tab>
          <Tab className="text-base font-medium text-[#637074] data-[selected]:bg-[#1873BF] data-[selected]:text-white data-[hover]:bg-[#1873BF]/80 py-2 px-4 rounded-md">
            Annulées ({totalCanceledBills})
          </Tab>
        </TabList>

        <TabPanels>
          {[
            { bills: bills, paginationTotal: totalBills },
            { bills: draftBills, paginationTotal: totalDraftBills },
            { bills: readyToBeSentBills, paginationTotal: totalReadyToBeSentBills },
            { bills: sentBills, paginationTotal: totalSentBills },
            { bills: canceledBills, paginationTotal: totalCanceledBills },
          ].map((panel, idx) => (
            <TabPanel key={idx} className="overflow-x-auto bg-white p-4 rounded-md shadow-inner mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1873BF] text-white">
                    <th className="px-3 py-2">N° de facture</th>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Date d&apos;émission</th>
                    <th className="px-3 py-2">Date d&apos;échéance</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Afficher</th>
                    {idx === 1 && <th className="px-3 py-2">Modifier</th>}
                    {idx === 1 && <th className="px-3 py-2">Supprimer</th>}
                  </tr>
                </thead>
                <tbody>
                  {panel.bills.map((bill) => (
                    <tr key={bill.id} className="even:bg-[#F5F5F5]">
                      <td className="px-3 py-2">{bill.number}</td>
                      <td className="px-3 py-2">{bill.client.name}</td>
                      <td className="px-3 py-2">{formatDate(bill.issueDate)}</td>
                      <td className="px-3 py-2">{formatDate(bill.dueDate)}</td>
                      <td className="px-3 py-2">{bill.status}</td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/intranet/common-intranet/bills/${bill?.slug}`}
                          className="text-[#1873BF] underline hover:text-[#FDA821]"
                        >
                          Consulter les détails
                        </Link>
                      </td>
                      {idx === 1 && (
                        <>
                          <td className="px-3 py-2">
                            <Link
                              href={`/intranet/common-intranet/bills/${bill?.slug}/update`}
                              className="text-[#FDA821] underline hover:text-[#1873BF]"
                            >
                              Modifier
                            </Link>
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              label="Remove"
                              icon={faXmark}
                              type="button"
                              action={() => openDeleteDialog(bill.id)}
                              specifyBackground="text-red-500"
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(panel.paginationTotal, "page")}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </section>

    {/* Delete Dialog */}
    {isOpen && billToDelete && (
      <Dialog
        open={isOpen}
        onClose={closeDeleteDialog}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        aria-labelledby="bill-delete-title"
        aria-describedby="bill-delete-desc"
      >
        <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
          <DialogTitle id="bill-delete-title" className="text-xl font-semibold text-[#1873BF] mb-2">
            Supprimer la facture
          </DialogTitle>
          <Description id="bill-delete-desc" className="mb-2">
            Cette action est irréversible
          </Description>
          <p className="text-sm mb-4">
            Êtes-vous sûr de vouloir supprimer cette facture ? Toutes ses données seront supprimées de façon permanente.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleDelete(billToDelete)}
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
  </div>
</>

  )
}


