"use client";

import { useEffect, useState, use } from "react";
import { Field,Input,Select} from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchBill} from "@/services/api/billService";
import { createCreditNote } from "@/services/api/creditNoteService";
import { createCreditNoteSchema } from "@/validation/creditNoteValidation";
import { toast } from 'react-hot-toast';

// import toast, { Toaster } from 'react-hot-toast';

type CreateCreditNoteProps = {
    csrfToken: string;
    billNumber: string;
  };

export default function CreateCreditNote({csrfToken, billNumber}: CreateCreditNoteProps){

    const [bill, setBill] = useState<BillType>();

    const [createCreditNoteFormValues, setCreateCreditNoteFormValues] = useState<CreateCreditNoteFormValueType>({
        amount: 0,
        billId: null,
        reason: "",
    })

    const reasonChoices = {
        MISTAKE: "Erreur",
        CANCELLATION: "Clôture",
        DISCOUNT: "Remise",
        COMPENSATION: "Compensation",
        DUPLICATE: "Dupliqué",
        WRONG_CUSTOMER: "Erreur de client",
        DEPOSIT_REFUND: "Remboursement d'acompte",
        DEPOSIT_ADJUSTMENT: "Ajustement d'acompte",
    };

    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


    // const which allows redirection
    const router = useRouter();


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a Quote, so we need to get the Quote
        async function loadBill() {

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

    },[billNumber, csrfToken]);


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
                    // Validation des données du formulaire en fonction du statut
                    const validationResult = createCreditNoteSchema.safeParse(createCreditNoteFormValues);
                    
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

            const data = await createCreditNote(createCreditNoteFormValues, csrfToken)
            toast.success("Avoir créé avec succès");
            
            console.log("data renvoyés : "+data)
            const newCreditNote = data;
            console.log("voici l'avoir créé : "+newCreditNote.number)
            try {
    
                    router.push(`/director/creditNotes/${newCreditNote.number}`);                        
   

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.success("Erreur de la création de l'avoir");

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
            <h1 className="text-3xl text-white ml-3 text-center">Création d'avoir lié à la facture n°{bill.number}</h1>
            <p>Client : {bill.clientBackup?.name} {bill.clientBackup?.firstName}</p>
            <p>Téléphone : {bill.clientBackup?.phone}</p>
            <p>Mail : {bill.clientBackup?.mail}</p>
            <p>Adresse : {bill.clientBackup?.addressNumber} {bill.clientBackup?.road} {bill.clientBackup?.postalCode} {bill.clientBackup?.city}</p>
            <p>Complément d'adresse : {bill.clientBackup?.additionalAddress}</p>
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
                                value={createCreditNoteFormValues.amount || ""}
                                onChange={handleInputChange}
                            >
                            </Input>
                        </Field>
                        {errors.amount && <p style={{ color: "red" }}>{errors.amount}</p>}

                    </div>

                    <Select
                        name="reason"
                        value={createCreditNoteFormValues.reason || ""}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                        onChange={handleInputChange}

                        >
                        <option value="" >Raison de l'avoir</option>
                        {Object.entries(reasonChoices).map(([value, label]) => (
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
                        Finaliser l'avoir 
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

