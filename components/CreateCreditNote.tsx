"use client";

import { useEffect, useState } from "react";
import { Field,Input,Select} from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchBill} from "@/services/api/billService";
import { createCreditNote } from "@/services/api/creditNoteService";
import { createCreditNoteSchema } from "@/validation/creditNoteValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "./BreadCrumb";

// import toast, { Toaster } from 'react-hot-toast';

type CreateCreditNoteProps = {
    csrfToken: string;
    billSlug: string;
  };

export default function CreateCreditNote({csrfToken, billSlug}: CreateCreditNoteProps){

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
                    const data = await fetchBill(billSlug)
    
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

    },[billSlug, csrfToken]);


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
       <>
  {/* Fil d’Ariane */}
  <Breadcrumb
    items={[
      { label: "Tableau de bord", href: "/director" },
      { label: "Factures", href: "/director/bills" },
      { label: `Avoir facture n°${bill.number}` },
    ]}
  />

  <article className="max-w-5xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md space-y-8">
    {/* Titre --------------------------------------------------------------- */}
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold text-primary">
        Création d&apos;avoir lié à la facture n°{bill.number}
      </h1>
    </header>

    {/* Infos client -------------------------------------------------------- */}
    <section className="space-y-1 text-gray-800">
      <p><strong>Client :</strong> {bill.clientBackup?.name} {bill.clientBackup?.firstName}</p>
      <p><strong>Téléphone :</strong> {bill.clientBackup?.phone}</p>
      <p><strong>Mail :</strong> {bill.clientBackup?.mail}</p>
      <p><strong>Adresse :</strong> {bill.clientBackup?.addressNumber} {bill.clientBackup?.road}, {bill.clientBackup?.postalCode} {bill.clientBackup?.city}</p>
      {bill.clientBackup?.additionalAddress && (
        <p><strong>Complément d&apos;adresse :</strong> {bill.clientBackup?.additionalAddress}</p>
      )}
    </section>

    {/* Formulaire --------------------------------------------------------- */}
    <form
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreditNoteCreation();
      }}
      className="space-y-6"
    >
      {/* Montant ---------------------------------------------------------- */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Montant de l&apos;avoir
        </label>
        <Field>
          <Input
            id="amount"
            type="number"
            name="amount"
            className="border-2 border-custom-gray w-full rounded-md text-custom-gray pl-3"
            value={createCreditNoteFormValues.amount || ""}
            onChange={handleInputChange}
          />
        </Field>
        {errors.amount && <p className="text-red-600">{errors.amount}</p>}
      </div>

      {/* Raison ----------------------------------------------------------- */}
      <div>
        <Select
          name="reason"
          value={createCreditNoteFormValues.reason || ""}
          onChange={handleInputChange}
          className="border-2 border-custom-gray w-full rounded-md text-custom-gray pl-3"
        >
          <option value="">Raison de l&apos;avoir</option>
          {Object.entries(reasonChoices).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        {errors.reason && <p className="text-red-600">{errors.reason}</p>}
      </div>

      <Input type="hidden" name="csrf_token" value={csrfToken} />

      <button
        type="button"                /* on évite submit auto */
        onClick={openChoiceDialog}
        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
      >
        Finaliser l&apos;avoir
      </button>
    </form>
  </article>

  {/* Dialog de confirmation ---------------------------------------------- */}
  {isOpen && (
    <Dialog
      open={isOpen}
      onClose={closeChoiceDialog}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-labelledby="credit-final-title"
      aria-describedby="credit-final-desc"
    >
      <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
        <DialogTitle
          id="credit-final-title"
          className="text-xl font-semibold text-[#1873BF] mb-2"
        >
          Etes-vous sûr de vouloir enregistrer l&apos;avoir en version finale&nbsp;?
        </DialogTitle>

        <Description id="credit-final-desc" className="mb-2">
          Cette action est irréversible
        </Description>

        <p className="text-sm mb-4">
          L&apos;avoir ne pourra plus être modifié ultérieurement.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeChoiceDialog}
            className="bg-gray-200 hover:bg-gray-300 text-[#637074] px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
          >
            Annuler
          </button>

          <button
            onClick={() => {
              handleCreditNoteCreation();
              closeChoiceDialog();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
          >
            Finaliser l&apos;avoir
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  )}
</>

    );

};

