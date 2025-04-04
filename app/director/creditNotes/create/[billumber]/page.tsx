"use client";

import { useEffect, useState, use } from "react";
import { Field,Input,Select} from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchBill} from "@/services/api/billService";
import { createCreditNote } from "@/services/api/creditNoteService";
import { CreditNoteReasonEnum } from "@prisma/client";

// import toast, { Toaster } from 'react-hot-toast';

const CreateCreditNote = ({ params }: { params: Promise<{ billNumber: string }>}) => {

    const [bill, setBill] = useState<BillType>();

    const [createCreditNoteFormValues, setCreateCreditNoteFormValues] = useState<CreateCreditNoteFormValueType>({
        amount: 0,
        billId: null,
        reason: null,
    })

    const [isOpen, setIsOpen] = useState(false);


    // const which allows redirection
    const router = useRouter();


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a Quote, so we need to get the Quote
        async function loadBill() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const billNumber = resolvedParams.billNumber;

                try{
                    const data = await fetchBill(billNumber)
    
                    setCreateCreditNoteFormValues({
                        ...createCreditNoteFormValues,
                        billId: data.bill.id
                    });
                      setBill(data.bill);

                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
        }


        loadBill();

    },[params]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setCreateCreditNoteFormValues({
            ...createCreditNoteFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });


    }


    const handleCreditNoteCreation = async () => {
        try{

            if(!bill?.number){
                return
            }

            const data = await createCreditNote(createCreditNoteFormValues)
            console.log("data renvoyés : "+data)
            const newCreditNote = data;
            console.log("voici l'avoir créé : "+newCreditNote.number)
            try {
    
                    router.push(`/director/bills/${newCreditNote.number}/update`);                        
   

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            console.error("Impossible to create the credit note :", error);
        }
    }


    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };


    if (!bill) return <div>Loading...</div>;

    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création d'avoir lié au devis n°{bill.number}</h1>
            <p>Client : {bill.client.name} {bill.client.firstName}</p>
            <p>Téléphone : {bill.client.phone}</p>
            <p>Mail : {bill.client.mail}</p>
            <p>Adresse : {bill.client.addressNumber} {bill.client.road} {bill.client.postalCode} {bill.client.city}</p>
            <p>Complément d'adresse : {bill.client.additionalAddress}</p>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreditNoteCreation();
                }}
            >
                    <div>
                        <label htmlFor="amount">Montant de l'avoir</label>
                        <Field className="w-full">
                            <Input type="number" name="amount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                value={createCreditNoteFormValues.amount || 0}
                                onChange={handleInputChange}
                            >
                            </Input>
                        </Field>
                    </div>
                <Select
                    name="reason"
                    value={createCreditNoteFormValues.reason || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    onChange={handleInputChange}
                    >
                    <option value="" disabled>-- Sélectionner un motif --</option>
                        {Object.values(CreditNoteReasonEnum).map((reasonKey) => (
                            <option key={reasonKey} value={reasonKey}>
                                {reasonKey}
                    </option>
                ))}
                </Select>
                    <button
                        // type="button" avoid the form to be automatically submitted
                        type="button"
                        onClick={openChoiceDialog}
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                        Finaliser la facture 
                    </button>
            </form>
            {/* Dialog to save as final version of CreditNote*/}
            {/* className=" top-[50%] left-[25%]" */}
            {/* {isOpen ?? ( */}
                <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir enregistrer l'avoir en version finale ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>L'avoir ne pourra plus être modifié ultérieurement. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize quote
                            onClick={() => {
                                handleCreditNoteCreation(); 
                                closeChoiceDialog(); 
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Finaliser l'avoir
                        </button>
                            <button onClick={closeChoiceDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                        </div>
                    </DialogPanel>
                </Dialog>
            {/* )}  */}

        </div>
    );

};



export default CreateCreditNote;


