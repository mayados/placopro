"use client";

import { useEffect, useState } from "react";
import { RadioGroup,Select, Input} from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchCreditNote, updateCreditNote, deleteCreditNote} from "@/services/api/creditNoteService";
import { updateCreditNoteSchema } from "@/validation/creditNoteValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "./BreadCrumb";
import { formatDate } from "@/lib/utils";

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
       <>
  <Breadcrumb
    items={[
      { label: "Tableau de bord", href: "/director" },
      { label: "Avoirs", href: "/director/creditNotes" },
      { label: `Avoir facture n°${creditNote.bill.number}` },
    ]}
  />

  <article className="max-w-5xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md space-y-8">
    {/* Titre ------------------------------------------------------------- */}
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold text-primary">
        Avoir lié à la facture n°{creditNote.bill.number}
      </h1>
    </header>

    <section className="space-y-1 text-gray-800">
      <p><strong>Client :</strong> {creditNote?.clientBackup?.name} {creditNote?.clientBackup?.firstName}</p>
      <p><strong>Téléphone :</strong> {creditNote?.clientBackup?.phone}</p>
      <p><strong>Mail :</strong> {creditNote?.clientBackup?.mail}</p>
      <p><strong>Adresse :</strong> {creditNote?.clientBackup?.addressNumber} {creditNote?.clientBackup?.road}, {creditNote?.clientBackup?.postalCode} {creditNote?.clientBackup?.city}</p>
      {creditNote?.clientBackup?.additionalAddress && (
        <p><strong>Complément d&apos;adresse :</strong> {creditNote?.clientBackup?.additionalAddress}</p>
      )}
    </section>

    <form
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreditNoteUpdate();
      }}
      className="space-y-6"
    >
      <div>
        <p className="block mb-2 text-sm font-medium text-gray-700">
          L&apos;avoir a-t-il été réglé&nbsp;?
        </p>

        <RadioGroup
          value={updateCreditNoteFormValues.isSettled}
          onChange={(value) =>
            setUpdateCreditNoteFormValues({ ...updateCreditNoteFormValues, isSettled: value })
          }
          className="flex gap-4"
        >
          {errors.isSettled && <p className="text-red-600">{errors.isSettled}</p>}

          {/* Oui */}
          <div
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md
              ${
                updateCreditNoteFormValues.isSettled === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-custom-gray"
              }`}
            onClick={() =>
              setUpdateCreditNoteFormValues({ ...updateCreditNoteFormValues, isSettled: true })
            }
          >
            <div
              className={`w-4 h-4 flex items-center justify-center rounded-full border
                ${
                  updateCreditNoteFormValues.isSettled === true
                    ? "border-white"
                    : "border-custom-gray"
                }`}
            >
              {updateCreditNoteFormValues.isSettled === true && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span>Oui</span>
          </div>

          {/* Non */}
          <div
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md
              ${
                updateCreditNoteFormValues.isSettled === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-custom-gray"
              }`}
            onClick={() =>
              setUpdateCreditNoteFormValues({ ...updateCreditNoteFormValues, isSettled: false })
            }
          >
            <div
              className={`w-4 h-4 flex items-center justify-center rounded-full border
                ${
                  updateCreditNoteFormValues.isSettled === false
                    ? "border-white"
                    : "border-custom-gray"
                }`}
            >
              {updateCreditNoteFormValues.isSettled === false && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span>Non</span>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Select
          name="settlementType"
          value={updateCreditNoteFormValues.settlementType || ""}
          onChange={handleInputChange}
          className="border-2 border-custom-gray w-full rounded-md text-custom-gray pl-3"
        >
          <option value="" disabled>Sélectionnez un règlement</option>
          {Object.entries(settlementTypeChoices).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        {errors.reason && <p className="text-red-600">{errors.reason}</p>}
      </div>

      <Input type="hidden" name="csrf_token" value={csrfToken} />

      <button
        type="button"
        onClick={openChoiceDialog}
        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
      >
        Enregistrer les modifications
      </button>
    </form>

    <button
      type="button"
      onClick={handleCreditNoteUpdate}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
    >
      Supprimer l&apos;avoir
    </button>

<section className="space-y-2">
  <h2 className="text-lg font-semibold text-custom-gray">Détails de l&apos;avoir</h2>
  <ul className="text-gray-800">
    <li><strong>Numéro&nbsp;:</strong> {creditNote.number}</li>
    <li><strong>Émis le&nbsp;:</strong> {formatDate(creditNote.issueDate)}</li>
    <li><strong>Montant&nbsp;:</strong> {creditNote.amount} €</li>
    <li>
    <strong>Raison :</strong> {creditNote.reason}



    </li>
    <li><strong>Réglé&nbsp;:</strong> {creditNote.isSettled ? "Oui" : "Non"}</li>


  </ul>
</section>


  </article>

  {isOpen && (
    <Dialog
      open={isOpen}
      onClose={closeChoiceDialog}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-labelledby="credit-delete-title"
      aria-describedby="credit-delete-desc"
    >
      <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
        <DialogTitle
          id="credit-delete-title"
          className="text-xl font-semibold text-[#1873BF] mb-2"
        >
          Etes-vous sûr de vouloir supprimer l&apos;avoir&nbsp;?
        </DialogTitle>

        <Description id="credit-delete-desc" className="mb-2">
          Cette action est irréversible
        </Description>

        <p className="text-sm mb-4">
          L&apos;avoir n&apos;existera plus.
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
              handleCreditNoteDeletion();
              closeChoiceDialog();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
          >
            Supprimer
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  )}
</>

    );

};


