"use client";

import { useEffect, useState } from "react";
import { RadioGroup,Select, Input} from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchCreditNote, updateCreditNote, deleteCreditNote} from "@/services/api/creditNoteService";
import { updateCreditNoteSchema } from "@/validation/creditNoteValidation";
import { toast } from 'react-hot-toast';

type UpdateCreditNoteProps = {
    csrfToken: string;
    creditNoteNumber: string;
  };

export default function UpdateCreditNote({csrfToken, creditNoteNumber}: UpdateCreditNoteProps){

    const [creditNote, setCreditNote] = useState<CreditNoteType>();
    const settlementTypeChoices = 
    {
        REFUND: "Remboursement",
        COMPENSATION: "Compensation"
    };
    const [updateCreditNoteFormValues, setUpdateCreditNoteFormValues] = useState<UpdateCreditNoteFormValueType>({
        id: null,
        isSettled: null,
        settlementType: null,
    })

    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    // const which allows redirection
    const router = useRouter();


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a Quote, so we need to get the Quote
        async function loadBill() {

                try{
                    const data = await fetchCreditNote(creditNoteNumber)
    
                    setUpdateCreditNoteFormValues({
                        ...updateCreditNoteFormValues,
                    });
                      setCreditNote(data);

                }catch (error) {
                    console.error("Impossible to load the credit note :", error);
                }
        }


        loadBill();

    },[creditNoteNumber, csrfToken]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setUpdateCreditNoteFormValues({
            ...updateCreditNoteFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });


    }


    const handleCreditNoteUpdate = async () => {
        try{

            if(!creditNote?.number){
                return
            }

            // Validation des données du formulaire en fonction du statut
            const validationResult = updateCreditNoteSchema.safeParse(updateCreditNoteFormValues);
                    
            if (!validationResult.success) {
                // Si la validation échoue, afficher les erreurs
                console.error("Erreurs de validation :", validationResult.error.errors);
                    // Transformer les erreurs Zod en un format utilisable dans le JSX
                const formattedErrors = validationResult.error.flatten().fieldErrors;
                    
                // Afficher les erreurs dans la console pour débogage
                console.log(formattedErrors);
                                  
                // Mettre à jour l'état avec les erreurs
                setErrors(formattedErrors);
                return;  // Ne pas soumettre si la validation échoue
            }
                    
            // Delete former validation errors
            setErrors({})

            const data = await updateCreditNote(creditNote.number,updateCreditNoteFormValues, csrfToken)
            console.log("data renvoyés : "+data)
            const updatedCreditNote = data;
            toast.success("L'avoir a été mis à jour avec succès");
            
            console.log("voici l'avoir créé : "+updatedCreditNote.number)
            try {
    
                    router.push(`/director/creditNotes/${updatedCreditNote.number}/update`);                        
   

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.error("Erreur lors de la modification de l'avoir");

            console.error("Impossible to update the credit note :", error);
        }
    }

    const handleCreditNoteDeletion = async () => {
        try{

            if(!creditNote?.number){
                return
            }

            const billNumber = creditNote.bill.number

            const data = await deleteCreditNote(creditNote.id)
            console.log("data renvoyés : "+data)
            try {
    
                    router.push(`/director/bills/${billNumber}`);                        
   

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            console.error("Impossible to delete the credit note :", error);
        }
    }

    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };


    if (!creditNote) return <div>Loading...</div>;

    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création d'avoir lié à la facture n°{creditNote.bill.number}</h1>
            <p>Client : {creditNote.bill.client.name} {creditNote.bill.client.firstName}</p>
            <p>Téléphone : {creditNote.bill.client.phone}</p>
            <p>Mail : {creditNote.bill.client.mail}</p>
            <p>Adresse : {creditNote.bill.client.addressNumber} {creditNote.bill.client.road} {creditNote.bill.client.postalCode} {creditNote.bill.client.city}</p>
            <p>Complément d'adresse : {creditNote.bill.client.additionalAddress}</p>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreditNoteUpdate();
                }}
            >

                <div className="mb-4">
                        <p className="block mb-2">L'avoir a-t-il été réglé ?</p>
                        <RadioGroup
                        value={updateCreditNoteFormValues.isSettled}
                        onChange={(value) => {
                            setUpdateCreditNoteFormValues({
                            ...updateCreditNoteFormValues,
                            isSettled: value
                            });
                        }}
                        >
                        {errors.isSettled && <p style={{ color: "red" }}>{errors.isSettled}</p>}

                        <div className="flex gap-4">
                            {/* Option Oui */}
                            <div 
                            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${updateCreditNoteFormValues.isSettled === true ? 'bg-green-600 text-white' : 'bg-gray-700'}`}
                            onClick={() => {
                                setUpdateCreditNoteFormValues({
                                ...updateCreditNoteFormValues,
                                isSettled: true
                                });
                            }}
                            >    
                        <div className={`w-4 h-4 flex items-center justify-center rounded-full border ${updateCreditNoteFormValues.isSettled === true ? 'border-white' : 'border-gray-400'}`}>
                            {updateCreditNoteFormValues.isSettled === true && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span>Oui</span>
                        </div>
                        
                        {/* Option Non */}
                        <div 
                        className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${updateCreditNoteFormValues.isSettled === false ? 'bg-red-600 text-white' : 'bg-gray-700'}`}
                        onClick={() => {
                            setUpdateCreditNoteFormValues({
                            ...updateCreditNoteFormValues,
                            isSettled: false
                            });
                        }}
                        >
                        <div className={`w-4 h-4 flex items-center justify-center rounded-full border ${updateCreditNoteFormValues.isSettled === false ? 'border-white' : 'border-gray-400'}`}>
                            {updateCreditNoteFormValues.isSettled === false && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span>Non</span>
                        </div>
                    </div>
                    </RadioGroup>
                </div>  
                <Select
                    name="settlementType"
                    value={updateCreditNoteFormValues.settlementType || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    onChange={handleInputChange}
                    >
                    <option value="" disabled>Sélectionnez une raison</option>
                    {Object.entries(settlementTypeChoices).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Select>
                {errors.reason && <p style={{ color: "red" }}>{errors.reason}</p>}
                <Input type="hidden" name="csrf_token" value={csrfToken} />

                    <button
                        // type="button" avoid the form to be automatically submitted
                        type="button"
                        onClick={openChoiceDialog}
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                        Enregistrer les modifications 
                    </button>
            </form>
            <button
                // type="button" avoid the form to be automatically submitted
                type="button"
                onClick={handleCreditNoteUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
            >
                Supprimer l'avoir
            </button>
            {/* Dialog to save as final version of CreditNote*/}
            {/* className=" top-[50%] left-[25%]" */}
            {/* {isOpen ?? ( */}
                <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir supprimer l'avoir ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>L'avoir n'existera plus. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize quote
                            onClick={() => {
                                handleCreditNoteDeletion(); 
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


