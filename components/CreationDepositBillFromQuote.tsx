"use client";

import { useEffect, useState } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchQuote } from "@/services/api/quoteService";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
// import { fetchSuggestions } from "@/services/api/suggestionService";
import { createDepositBillFromQuote } from "@/services/api/billService";
import { createDepositBillDraftSchema, createDepositBillFinalSchema } from "@/validation/billValidation";

// import toast, { Toaster } from 'react-hot-toast';

type CreationDepositBillFromQuoteProps = {
    csrfToken: string;
    quoteSlug: string;
  };

export default function CreationDepositBillFromQuote({csrfToken, quoteSlug}: CreationDepositBillFromQuoteProps){

    const [quote, setQuote] = useState<QuoteType>();
    const [createBillFormValues, setCreateBillFormValues] = useState<CreateDepositBillFormValueType>({
        dueDate: null,
        natureOfWork: null,
        paymentTerms: "Le paiement doit être effectué dans les 30 jours suivant la réception de la facture.",
        travelCosts: null,
        travelCostsType: null,
        description: null,
        issueDate: null,
        vatAmount: null,
        totalTtc: null,
        totalHt: null,
        clientId: null as string | null,
        services: [],
        serviceType: null,
        workSiteId: null,
        // client: null,
        quoteId: null as string | null,
        status: null,
        number: null,
        discountAmount: null,
        workStartDate: null,
        workEndDate: null,
        workDuration: null,
        isDiscountFromQuote: false,
        discountReason: null,
    })
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    const travelCostsTypeChoices = ["forfait unique","forfait journalier"];
    const discountReasonChoices = ["fidélité","offre spéciale"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])
    // Allows to know if a bill is registered as a draft or ready (to be send)
    // const [status, setStatus] = useState<"Draft" | "Ready">("Draft");
    const [isOpen, setIsOpen] = useState(false);
    // For zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, vatRate, client, worksite 
    // const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    // const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    // text visible in the client field
    // const [clientInput, setClientInput] = useState(""); 
    const [, setUnitInput] = useState(""); 
    const [, setVatRateInput] = useState(""); 
    // const [serviceInput, setServiceInput] = useState(""); 


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a Quote, so we need to get the Quote
        async function loadQuote() {

                try{
                    const data = await fetchQuote(quoteSlug)
                    let isDiscountFromQuote = false
                    if(data?.discountAmount !== 0 || data?.discountAmount !== null){
                        isDiscountFromQuote = true;
                    }
                    setCreateBillFormValues({
                        ...createBillFormValues,
                        number: data.number,
                        totalTtc: data.priceTTC,
                        totalHt: data.priceHT,
                        clientId: data.client.id,
                        workSiteId: data.workSite.id,
                        quoteId: data.id,
                        isDiscountFromQuote: isDiscountFromQuote,
                        discountReason: data.discountReason,
                        discountAmount: data.discountAmount,
                        travelCosts: data.travelCosts,
                        travelCostsType: data.travelCostsType,
                        vatAmount: data.vatAmount,
                        natureOfWork: data.natureOfWork,
                        description: data.description,
                        // services: data.services
                        services: data.services.map(service => ({
                            id: service.id,
                            label: service.service.label, // Accès à `label` à l'intérieur de `service`
                            unitPriceHT: service.service.unitPriceHT?.toString() || "", // Assurer que c'est une string
                            type: service.service.type || "",
                            unit: service.unit || "",
                            vatRate: service.vatRate || "",
                            selectedFromSuggestions: false, // Ajout d'un champ par défaut si nécessaire
                            quantity: service.quantity || 0,
                            detailsService: service.detailsService || "",
                        }))
                    });
                      setQuote(data);

                }catch (error) {
                    console.error("Impossible to load the quote :", error);
                }
        }

        const loadVatRates = async () => {
                try{
                    const data = await fetchVatRates();
                    setVatRateChoices(data)

                }catch (error) {
                    console.error("Impossible to load VAT rates :", error);
                    }
        };

        const loadUnits = async () => {
                try{
                    const data = await fetchUnits();
                    setUnitChoices(data)
            
                }catch (error) {
                    console.error("Impossible to load units :", error);
                }     
        };

        loadQuote();
        loadVatRates();
        loadUnits();
    },[quoteSlug, csrfToken]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setCreateBillFormValues({
            ...createBillFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });

        if(name === "unit"){
            setUnitInput(value)
        }else if(name === "vatRate"){
            setVatRateInput(value)
        }
    }

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    // const handleRadioChange = (name: string, value: string) => {
    //     setCreateBillFormValues({
    //         ...createBillFormValues,
    //         [name]: value,
    //     });
    // }


    const handleBillCreation = async (statusReady?: string) => {
        console.log("La facture crééé : "+JSON.stringify(createBillFormValues.services))
        console.log("Le quote intial : "+JSON.stringify(quote?.services))        
        console.log("lors du submit, le status est : "+statusReady)

        const status = statusReady ? "READY": "DRAFT"
        const quoteId = quote?.id

        try{
            const createBillWithStatus = {
                ...createBillFormValues,
                status,
                quoteId,
            };

            if(!quote?.number){
                return
            }

            // Choisir le schéma de validation en fonction du statut
            const schema = statusReady === "READY" ? createDepositBillFinalSchema : createDepositBillDraftSchema;
            
            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(createBillFormValues);
            
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

            const data = await createDepositBillFromQuote(createBillWithStatus, csrfToken)
            console.log("data renvoyés : "+data)
            const createdBill = data;
            console.log("voici la bill crééé : "+createdBill.number)
            console.log("status du devis updaté "+createdBill.status)
            try {
                if(createdBill.status === "DRAFT"){
                    // Redirect to the page of bill's update
                    router.push(`/director/bills/${createdBill.number}/update`);                        
                }else{
                    router.push(`/director/bills/${createdBill.number}`);                        
                }

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            console.error("Impossible to create the bill :", error);
        }
    }

    // console.log("Les services de la facture à créer : "+JSON.stringify(createBillFormValues.services))

    // console.log("Les services du quote : "+JSON.stringify(createBillFormValues.services))


    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };



      
    if (!quote) return <div>Loading...</div>;

    console.log("Les services contenus dans bill :", JSON.stringify(createBillFormValues.services));

    return (
        <div className="relative">
              <header className="text-center my-4">
    <h1 className="text-3xl text-primary font-semibold mb-8 text-center">Création de facture d&apos;acompte liée au devis n°{quote.number}</h1>
  </header>

            <form 
                        className="text-primary bg-custom-white mx-auto max-w-3xl  rounded p-5 border-2 border-primary"

                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleBillCreation();
                }}
            >
                {/* Client of the bill */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" 
                            value={quote.client.name+" "+quote.client.firstName}
                                                    className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            readOnly
                        >
                        </Input>
                    </Field>  
                    {errors.clientId && <p style={{ color: "red" }}>{errors.clientId}</p>}              
                </div>
                {/* WorkSite of the quote */}
                <div>
                    <label htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" 
                            value={`${quote?.workSite.addressNumber} ${quote?.workSite.road} ${quote?.workSite.additionalAddress ? quote?.workSite.additionalAddress + " " : ""}${quote?.workSite.postalCode} ${quote?.workSite.city}`}
                                                    className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            readOnly
                        >
                        </Input>
                    </Field>   
                    {errors.workSiteId && <p style={{ color: "red" }}>{errors.workSiteId}</p>}
             
                </div>
                {/* Nature of work */}
                <div>
                    <label htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            value={createBillFormValues.natureOfWork !== null
                                ? createBillFormValues.natureOfWork
                                : quote.natureOfWork ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.natureOfWork && <p style={{ color: "red" }}>{errors.natureOfWork}</p>}

                </div>
                {/* Work description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <Field className="w-full">
                        <Textarea name="description" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            value={createBillFormValues.description !== null
                                ? createBillFormValues.description
                                : quote.description ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

                </div>
                {/* Work start date */}
                <div>
                    <label htmlFor="workStartDate">Date de début des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workStartDate" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workStartDate && <p style={{ color: "red" }}>{errors.workStartDate}</p>}

                </div>
                {/* work end date */}
                <div>
                    <label htmlFor="workEndDate">Date de fin des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workEndDate"
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workEndDate && <p style={{ color: "red" }}>{errors.workEndDate}</p>}

                </div>
                {/* work duration */}
                <div>
                    <label htmlFor="workDuration">Durée des travaux (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="workDuration" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workDuration && <p style={{ color: "red" }}>{errors.workDuration}</p>}

                </div>
                {/* Sélection du type de frais de déplacements */}
                <Select
                    name="travelCostsType"
                    value={createBillFormValues.travelCostsType || ""}
                                            className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                    disabled
                    >
                    <option value="">Type de frais de déplacement</option>
                    {travelCostsTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                {errors.travelCostsType && <p style={{ color: "red" }}>{errors.travelCostsType}</p>}

                {/* travelCosts */}
                <div>
                    <label htmlFor="travelCosts">Frais de déplacement</label>
                    <Field className="w-full">
                        <Input type="text" name="travelCosts" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            value={createBillFormValues.travelCosts !== null
                                ? createBillFormValues.travelCosts
                                : quote.travelCosts ?? ""} 
                            readOnly
                        >
                        </Input>
                    </Field>
                    {errors.travelCosts && <p style={{ color: "red" }}>{errors.travelCosts}</p>}

                </div>
            <h2>Services</h2>
            {createBillFormValues.services.map((service, index) => (
                
  <div key={index} className=" mb-4">
    {/* Label : Lecture seule pour services existants, modifiable pour nouveaux services */}
    <Input
      type="text"
      name="label"
      placeholder="Label du service"
      value={service.label}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id} // Si le service a un id, le label est en lecture seule
    />
    
    {/* Détails du service */}
    <Input
      type="text"
      name="detailsService"
      placeholder="Détails du service"
      value={service.detailsService}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    />

    {/* Prix unitaire */}
    <Input
      type="number"
      name="unitPriceHT"
      placeholder="Prix unitaire"
      value={service.unitPriceHT || ""}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id || !!service.selectedFromSuggestions} // Désactivé si existant ou sélectionné via suggestion
    />

    {/* Sélection du type */}
    <Select
      name="type"
      value={service.type || ""}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id} // Désactivé si c'est un service existant
    >
      <option value="">Type de service</option>
      {serviceTypeChoices.map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
    </Select>

    {/* Quantité */}
    <Input
      type="number"
      name="quantity"
      placeholder="Quantité"
      value={service.quantity || ""}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    />

    {/* Sélection de l'unité */}
    <Select
      name="unit"
      value={service.unit || ""}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    >
      <option value="">Unité</option>
      {unitChoices.map((unit) => (
        <option key={unit.id} value={unit.label}>{unit.label}</option>
      ))}
    </Select>

    {/* Sélection du taux de TVA */}
    <Select
      name="vatRate"
      value={service.vatRate || ""}
                              className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    >
      <option value="">Taux de TVA</option>
      {vatRateChoices.map((vatRate) => (
        <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
      ))}
    </Select>
  </div>
))}

{/* Montant de remise */}
    <div>
        <label htmlFor="discountAmount">Montant remise</label>
        <Field className="w-full">
            <Input type="number" name="discountAmount" 
                                    className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                value={createBillFormValues.discountAmount !== null
                        ? createBillFormValues.discountAmount
                        : quote.discountAmount ?? ""}
                readOnly
            >
            </Input>
        </Field>
        {errors.discountAmount && <p style={{ color: "red" }}>{errors.discountAmount}</p>}

    </div>
    {/* Sélection du type de remise */}
    <Select
        name="discountReason"
        value={createBillFormValues.discountReason || ""}
                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

        disabled
        >
        <option value="">Type de remise</option>
        {discountReasonChoices.map((type) => (
            <option key={type} value={type}>{type}</option>

        ))}
    </Select>
    {errors.discountReason && <p style={{ color: "red" }}>{errors.discountReason}</p>}

                {/* payment Terms */}
                <div>
                    <label htmlFor="paymentTerms">Conditions de paiement</label>
                    <Field className="w-full">
                        <Textarea name="paymentTerms" 
                            defaultValue={"Le paiement doit être effectué dans les 30 jours suivant la réception de la facture."} 
                                                    className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

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
                        <Input type="date" name="dueDate"
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

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
                        handleBillCreation(); 
                    }}
                    >Enregistrer à l&aposétat de brouillon
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


            <Dialog
  open={isOpen}
  onClose={closeChoiceDialog}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  aria-labelledby="deposit-final-title"
  aria-describedby="deposit-final-desc"
>
  <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
    <DialogTitle
      id="deposit-final-title"
      className="text-xl font-semibold text-[#1873BF] mb-2"
    >
      Etes-vous sûr de vouloir enregistrer la facture d&apos;acompte en version finale&nbsp;?
    </DialogTitle>

    <Description id="deposit-final-desc" className="mb-2">
      Cette action est irréversible
    </Description>

    <p className="text-sm mb-4">
      La facture ne pourra plus être modifiée ultérieurement.
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
          handleBillCreation('READY');
          closeChoiceDialog();
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
      >
        Finaliser la facture
      </button>
    </div>
  </DialogPanel>
</Dialog>


                {/* <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir enregistrer la facture d&apos;acompte en version finale ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>La facture ne pourra plus être modifiée ultérieurement. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize quote
                            onClick={() => {
                                handleBillCreation("READY"); 
                                closeChoiceDialog(); 
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Finaliser la facture
                        </button>
                            <button onClick={closeChoiceDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                        </div>
                    </DialogPanel>
                </Dialog> */}
            {/* )} */}

        </div>
    );

};


