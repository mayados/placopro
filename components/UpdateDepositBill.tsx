"use client";

import { useEffect, useState } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import {  formatDateToInput } from "@/lib/utils";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
// import { fetchbill, updateInvoiceDraftBill } from "@/services/api/bill/Service";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { fetchBill, updateDepositDraftBill } from "@/services/api/billService";
import { updateDraftBillDepositSchema, updateDraftFinalDepositBillSchema } from "@/validation/billValidation";
import { toast } from 'react-hot-toast';

type UpdateDepositBillProps = {
    csrfToken: string;
    billSlug: string;
  };

export default function UpdateDepositBill({csrfToken, billSlug}: UpdateDepositBillProps){

    const [bill, setBill] = useState<BillType>();
    const [updateBillFormValues, setUpdateBillFormValues] = useState<UpdatedDepositBillFormValueType>({
        dueDate: null,
        paymentTerms: "Le paiement doit être effectué dans les 30 jours suivant la réception de la facture.",
        // client: null,
        id: null as string | null,
        status: null,
    })

    // Allows to know if a bill is registered as a draft or ready (to be send)
    // const [status, setStatus] = useState<"Draft" | "Ready">("Draft");
    const [isOpen, setIsOpen] = useState(false);
    // for zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    // cont which allows redirection
    const router = useRouter();


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a bill?, so we need to get the bill?
        async function loadBill() {

                try{
                    const data = await fetchBill(billSlug)
                    // const isDiscountFrombill = false
                  
                    setUpdateBillFormValues({
                        ...updateBillFormValues,
                        id: data.bill.id,
                    });
                      setBill(data.bill);

                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
        }

        const loadVatRates = async () => {
                try{
                    await fetchVatRates();

                }catch (error) {
                    console.error("Impossible to load VAT rates :", error);
                    }
        };

        const loadUnits = async () => {
                try{
                    await fetchUnits();
            
                }catch (error) {
                    console.error("Impossible to load units :", error);
                }     
        };

        loadBill();
        loadVatRates();
        loadUnits();
    },[billSlug, csrfToken]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setUpdateBillFormValues({
            ...updateBillFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });
    }

    const handleBillUpdate = async (statusReady?: string) => {
        // console.log("Le bill? intial : "+JSON.stringify(bill?.services))        
        // console.log("lors du submit, le status est : "+statusReady)

        const status = statusReady ? "READY": "DRAFT"

        try{
            const updateBillWithStatus = {
                ...updateBillFormValues,
                status,
            };

            if(!bill?.number){
                return
            }

            // Choisir le schéma de validation en fonction du statut
            const schema = statusReady === "READY" ? updateDraftFinalDepositBillSchema : updateDraftBillDepositSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(updateBillFormValues);

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

            const data = await updateDepositDraftBill(bill.slug,updateBillWithStatus, csrfToken)
            // console.log("data renvoyés : "+data)
            const updatedBill = data;
            toast.success("La facture d'accompte a été mise à jour avec succès");

            // console.log("voici la bill crééé : "+createdBill.number)
            // console.log("status du devis updaté "+createdBill.status)
            try {
                if(updatedBill.status === "DRAFT"){
                    // Redirect to the page of bill's update
                    router.push(`/director/bills/${updatedBill.number}/update`);                        
                }else{
                    router.push(`/director/bills/${updatedBill.number}`);                        
                }

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.error("erreur lors de la mise à jour de la facture d'accompte");

            console.error("Impossible to modify the bill :", error);
        }
    }

    // console.log("Les services de la facture à créer : "+JSON.stringify(updateBillFormValues.services))

    // console.log("Les services du bill? : "+JSON.stringify(updateBillFormValues.services))


    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };


    if (!bill) return <div>Loading...</div>;

    // console.log("Les services contenus dans bill :", JSON.stringify(bill.services));

    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification de facture d&apos;accompte n°{bill?.number}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleBillUpdate();
                }}
            >
                {/* Client of the bill */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" 
                            value={bill?.client.name+" "+bill?.client.firstName}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>                
                </div>
                {/* WorkSite of the bill? */}
                <div>
                    <label htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" 
                            value={`${bill?.workSite.addressNumber} ${bill?.workSite.road} ${bill?.workSite.additionalAddress ? bill?.workSite.additionalAddress + " " : ""}${bill?.workSite.postalCode} ${bill?.workSite.city}`}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>                
                </div>
                {/* Nature of work */}
                <div>
                    <label htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={bill?.natureOfWork ?? ""} 
                            readOnly
                        >
                        </Input>
                    </Field>
                </div>
                {/* Work description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <Field className="w-full">
                        <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={bill?.description ?? ""} 
                            readOnly
                        >
                        </Textarea>
                    </Field>
                </div>
                {/* travelCosts */}
                <div>
                    <label htmlFor="travelCosts">Frais de déplacement</label>
                    <Field className="w-full">
                        <Input type="text" name="travelCosts" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={bill?.travelCosts ?? ""} 
                            readOnly
                        >
                        </Input>
                    </Field>
                </div>
                {/* Sélection du type de frais de déplacements */}
                <Select
                name="travelCostsType"
                value={bill.travelCostsType || ""}
                className="w-full rounded-md bg-gray-700 text-white pl-3"
                disabled
                >
                <option value={bill.travelCostsType || ""}>{bill.travelCostsType || ""}</option>
                </Select>

            <h2>Services</h2>
            {bill.services.map((service, index) => (
                
  <div key={index} className="p-4 border border-gray-600 rounded-md mb-4">
    {/* Label : Lecture seule pour services existants, modifiable pour nouveaux services */}
    <Input
      type="text"
      name="label"
      placeholder="Label du service"
      value={service.service.label}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled={!!service.id} // Si le service a un id, le label est en lecture seule
    />


    {/* Détails du service */}
    <Input
      type="text"
      name="detailsService"
      placeholder="Détails du service"
      value={service.detailsService}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
    disabled
/>

    {/* Prix unitaire */}
    <Input
      type="number"
      name="unitPriceHT"
      placeholder="Prix unitaire"
      value={service.service.unitPriceHT || ""}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled
    />

    {/* Sélection du type */}
    <Select
      name="type"
      value={service.service.type || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled={!!service.id} // Désactivé si c'est un service existant
    >
      <option value={service.service.type || ""}>{service.service.type || ""}</option>
 
    </Select>

    {/* Quantité */}
    <Input
      type="number"
      name="quantity"
      placeholder="Quantité"
      value={service.quantity || ""}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled
    />

    {/* Sélection de l'unité */}
    <Select
      name="unit"
      value={service.unit || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled
    >
      <option value={service.unit || ""}>{service.unit || ""}</option>
    </Select>

    {/* Sélection du taux de TVA */}
    <Select
      name="vatRate"
      value={service.vatRate || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled
    >
      <option value={service.vatRate || ""}>{service.vatRate || ""}</option>
    </Select>
  </div>
))}

{/* discount */}
    <div>
        <label htmlFor="discountAmount">Montant remise</label>
        <Field className="w-full">
            <Input type="number" name="discountAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                value={bill.discountAmount || ""}
                readOnly
            >
            </Input>
        </Field>
    </div>
    {/* Sélection du type de frais de déplacements */}
    <Select
        name="discountReason"
        value={bill.discountReason || ""}
        className="w-full rounded-md bg-gray-700 text-white pl-3"
        disabled
        >
        <option value={bill.discountReason || "Pas de remise"}>{bill.discountReason || "Pas de remise"}</option>
    </Select>
                {/* payment Terms */}
                <div>
                    <label htmlFor="paymentTerms">Conditions de paiement</label>
                    <Field className="w-full">
                        <Textarea name="paymentTerms" 
                            defaultValue={"Le paiement doit être effectué dans les 30 jours suivant la réception de la facture."} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.paymentTerms && <p style={{ color: "red" }}>{errors.paymentTerms}</p>}

                </div>



                {/* Bill : due date payment */}
                <div>
                    <label htmlFor="dueDate">Date limite de paiement</label>
                    <Field className="w-full">
                        <Input type="date" name="dueDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updateBillFormValues.dueDate ? formatDateToInput(updateBillFormValues.dueDate) : formatDateToInput(bill.dueDate)}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.dueDate && <p style={{ color: "red" }}>{errors.dueDate}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />
                
                <button 
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleBillUpdate(); 
                    }}
                    >Enregistrer à l&apos;état de brouillon
                </button>
                <button
                    // type="button" avoid the form to be automatically submitted
                    type="button"
                    onClick={openChoiceDialog}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                    Finaliser la facture 
                </button>
            </form>
            {/* Dialog to save as final version of bill*/}
            {/* className=" top-[50%] left-[25%]" */}
            {/* {isOpen ?? ( */}
                <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir enregistrer la facture en version finale ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>La facture ne pourra plus être modifiée ultérieurement. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize bill?
                            onClick={() => {
                                handleBillUpdate("Ready"); 
                                closeChoiceDialog(); 
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Finaliser la facture
                        </button>
                            <button onClick={closeChoiceDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                        </div>
                    </DialogPanel>
                </Dialog>
            {/* )}  */}

        </div>
    );

};

