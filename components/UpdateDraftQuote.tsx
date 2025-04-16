"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { formatDateForInput } from '@/lib/utils'
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchQuote, updateDraftQuote } from "@/services/api/quoteService";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { updateDraftQuoteSchema, updateDraftFinalQuoteSchema } from "@/validation/quoteValidation";
import { toast } from 'react-hot-toast';

type UpdateDraftQuoteProps = {
    csrfToken: string;
    quoteNumber: string;
  };

export default function Bill({csrfToken, quoteNumber}: UpdateDraftQuoteProps){

    const [quote, setQuote] = useState<QuoteType>();
    const [updatedQuoteFormValues, setUpdatedQuoteFormValues] = useState<UpdatedQuoteFormValueType>({
        validityEndDate: null,
        natureOfWork: null,
        description: null,
        workStartDate: null,
        estimatedWorkEndDate: null,
        estimatedWorkDuration: null,
        vatAmount: null,
        priceTTC: null,
        priceHT: null,
        depositAmount: null,
        discountAmount: null,
        discountReason: null,
        isQuoteFree: null,
        hasRightOfWithdrawal: null,
        travelCosts: null,
        travelCostsType: null,
        hourlyLaborRate: null,
        paymentTerms: null,
        paymentDelay: null,
        latePaymentPenalities: null,
        recoveryFee: null,
        withdrawalPeriod: null,
        quoteCost: null,
        clientId: null as string | null,
        workSiteId: null as string | null,
        services: [],
        servicesToUnlink: [],
        serviceType: null,
        workSite: null,
        client: null,
    })
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])
    // Allows to know if a quote is registered as a draft or ready (to be send)
    // const [status, setStatus] = useState<"Draft" | "Ready">("Draft");
    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    


    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, tvaRate, client, worksite 
    const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [workSiteSuggestions, setWorkSiteSuggestions] = useState<WorkSiteSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    const discountReasonChoices = ["Fidelité","Remise exceptionnelle"];
    const travelCostsTypeChoices = ["forfait unique","forfait journalier"];
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const [workSiteInput, setWorkSiteInput] = useState(""); 
    const [unitInput, setUnitInput] = useState(""); 
    const [vatRateInput, setVatRateInput] = useState(""); 
    const [serviceInput, setServiceInput] = useState(""); 
    // Choices for boolean properties
    const isQuoteFreeChoices = ["Oui","Non"];
    const hasRightOfWithdrawalChoices = ["Oui","Non"];


    useEffect(() => {

        async function loadQuote() {


                try{
                    const data = await fetchQuote(quoteNumber)
                    setUpdatedQuoteFormValues({
                        ...updatedQuoteFormValues,
                        number: data.quote.number,
                    });
                      setQuote(data.quote);

                }catch (error) {
                    console.error("Impossible to load the quote :", error);
                }
        }

        const loadVatRates = async () => {
                try{
                    const data = await fetchVatRates();
                    setVatRateChoices(data.vatRates)

                }catch (error) {
                    console.error("Impossible to load VAT rates :", error);
                    }
        };

        const loadUnits = async () => {
                try{
                    const data = await fetchUnits();
                    setUnitChoices(data.units)
            
                }catch (error) {
                    console.error("Impossible to load units :", error);
                }     
        };

        loadQuote();
        loadVatRates();
        loadUnits();
    },[quoteNumber, csrfToken]);


        console.log("name du client retrieved de la database "+quote?.client.name)
        console.log("title du worksite retrieved de la database "+quote?.workSite.title)
        console.log("Frais de retard de paiement : "+quote?.latePaymentPenalties)
        console.log("type des frais de retard de paiement : "+typeof quote?.latePaymentPenalties)
        quote?.services.map((service, index) => (
            console.log("Un des services récupérés du devis en database : " +service)
        ))


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setUpdatedQuoteFormValues({
            ...updatedQuoteFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });

        if(name === "client"){
            setClientInput(value)
            console.log("input client : "+clientInput)
        }else if(name === "workSite"){
            setWorkSiteInput(value)
        }else if(name === "unit"){
            setUnitInput(value)
        }else if(name === "vatRate"){
            setVatRateInput(value)
        }

        if(name === "client" || name === "workSite"){
            handleDisplaySuggestions(e)
        }    };

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    const handleRadioChange = (name: string, value: string) => {
        setUpdatedQuoteFormValues({
            ...updatedQuoteFormValues,
            [name]: value,
        });
    }

    const handleDisplaySuggestions = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;

        if (name !== "client" && name !== "workSite") return; // Sécurité

        if (value.trim().length < 2) {
          if (name === "client") {
            setClientSuggestions(null);
            setClientInput(value);
            setUpdatedQuoteFormValues((prev) => ({ ...prev, clientId: null }));
          } else if (name === "workSite") {
            setWorkSiteSuggestions(null);
            setWorkSiteInput(value);
            setUpdatedQuoteFormValues((prev) => ({ ...prev, workSiteId: null }));
          }
          return;
        }
      
       try {
          const data = await fetchSuggestions(name, value);
      
          if (name === "client") {
            setClientSuggestions(data.suggestions as ClientSuggestionType[]);
          } else if (name === "workSite") {
            setWorkSiteSuggestions(data.suggestions as WorkSiteSuggestionType[]);
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des suggestions pour ${name} :`, error);
        }
      };
      

    const handleClickSuggestion = (inputName: string, id: string, fieldValue: string) => {
        if(inputName === "client"){
            setClientInput(fieldValue)
            setUpdatedQuoteFormValues((prev) => ({
                ...prev,
                // Put id from selected client
                clientId: id, 
            }));
            // Close suggestions list
            setClientSuggestions(null); 
        }else if(inputName === "workSite"){
            setWorkSiteInput(fieldValue)
            setUpdatedQuoteFormValues((prev) => ({
                ...prev,
                // Put id from selected client
                workSiteId: id, 
            }));
            // Close suggestions list
            setWorkSiteSuggestions(null); 
        }
    }


    const handleClickServiceSuggestion = (
        index: number,
        suggestion: ServiceSuggestionType
      ) => {
        const newServices = [...updatedQuoteFormValues.services];
        newServices[index] = {
          ...newServices[index],
          id: suggestion.id,
          label: suggestion.label,
          // Fil unitPriceHT and type fields with the values of the suggestion
          unitPriceHT: suggestion.unitPriceHT, 
          type: capitalizeFirstLetter(suggestion.type),
          // Allows to know if a service comes from a suggestion to manage automatic fill fields
          selectedFromSuggestions: true, 
        };
      
        console.log("le type de la suggestion est "+suggestion.type)

        setUpdatedQuoteFormValues({
          ...updatedQuoteFormValues,
          services: newServices,
        });


        // Delete suggestions after the clic
        setServiceSuggestions([]);
      };

    const handleDraftQuoteUpdate = async (statusReady?: string) => {
        console.log("Le quote final à update : "+JSON.stringify(updatedQuoteFormValues.servicesToUnlink))
        console.log("Le quote intial : "+JSON.stringify(quote?.services))
        console.log("update du champ de termes de paiement lors d'un changement : "+updatedQuoteFormValues.paymentTerms)
        console.log("lors du submit, le status est : "+statusReady)

        const status = statusReady ? "Ready": "Draft"
        const quoteId = quote?.id

        try{
            const updatedQuoteWithStatus = {
                ...updatedQuoteFormValues,
                status,
                quoteId,
            };

            if(!quote?.number){
                return
            }

            // Choisir le schéma de validation en fonction du statut
            const schema = statusReady === "Ready" ? updateDraftFinalQuoteSchema : updateDraftQuoteSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(updatedQuoteWithStatus);

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

            const data = await updateDraftQuote(quote?.number, updatedQuoteWithStatus, csrfToken)
            console.log("data renvoyés : "+data)
            const updatedQuote = data;
            toast.success("Le devis a été mis à jour avec succès");
            
            console.log("voici le devis updaté : "+updatedQuote.number)
            console.log("status du devis updaté "+updatedQuote.status)
            try {
                if(updatedQuote.status === "Draft"){
                    // Redirect to the updated Quote
                    router.push(`/director/quotes/${updatedQuote.number}/update`);                        
                }else{
                    router.push(`/director/quotes/${updatedQuote.number}`);                        
                }

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.error("Erreur lors de la modification du devis");
            console.error("Impossible to update the quote :", error);
        }
    }


    // const handleSubmit = async (statusReady?: string) => {
    //     console.log("Le quote final à update : "+JSON.stringify(updatedQuoteFormValues.servicesToUnlink))
    //     console.log("Le quote intial : "+JSON.stringify(quote?.services))
    //     console.log("update du champ de termes de paiement lors d'un changement : "+updatedQuoteFormValues.paymentTerms)
    //     console.log("lors du submit, le status est : "+statusReady)

    //     const status = statusReady ? "Ready": "Draft"
    //     const quoteId = quote?.id
    //     try{
            
    //         const updatedQuoteWithStatus = {
    //             ...updatedQuoteFormValues,
    //             status,
    //             quoteId,
    //         };
    //         console.log("ce qui est envoyé à la route de modification : "+JSON.stringify(updatedQuoteWithStatus))
    //         console.log("valeur envoyée de saveMode : "+status)
    //         const response = await fetch(`/api/quote/${quote?.number}`, {
    //           method: "PUT",
    //           headers: {
    //             "Content-Type": "application/json",
    //             "X-Update-Type": "draft",
    //           },
    //           body: JSON.stringify(updatedQuoteWithStatus),
    //         });
    //         if (response.ok) {
    //             const data = await response.json();
    //             console.log("data renvoyés : "+data)
    //             const updatedQuote = data.updatedQuote;
    //             console.log("voici le devis updaté : "+updatedQuote.number)
    //             console.log("status du devis updaté "+updatedQuote.status)
    //             try {
    //                 if(updatedQuote.status === "Draft"){
    //                     // Redirect to the updated Quote
    //                     router.push(`/director/quotes/${updatedQuote.number}/update`);                        
    //                 }else{
    //                     router.push(`/director/quotes/${updatedQuote.number}`);                        
    //                 }

    //             } catch (err) {
    //                 console.error("Redirection failed :", err);
    //             }
    //         }
    //     }catch (error) {
    //         console.error("Erreur lors de la création du devis :", error);
    //     }

    // };

    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fentre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };

    const addService = () => {
        setUpdatedQuoteFormValues({
          ...updatedQuoteFormValues,
          services: [
            ...updatedQuoteFormValues.services,
            {
                id : null,
              label: "",
              unitPriceHT: "",
              type: "",
              unit: "",
              vatRate: "",
              selectedFromSuggestions: false,
              quantity: 0,
              detailsService: "",
            },
          ],
        });
      };

    const addServiceToUnlink = (quoteService: QuoteServiceType, index: number) => {
        console.log("Le service à unlink : "+JSON.stringify(quoteService))
        // Like we have to delete QuoteService (=link to quote and service), we pass the quoteService Id
        setUpdatedQuoteFormValues({
            ...updatedQuoteFormValues,
            servicesToUnlink: [
            ...updatedQuoteFormValues.servicesToUnlink,
            {
                // Pass the datas from the service
                id : quoteService.id,
                label: quoteService.label,
                unitPriceHT: quoteService.service.unitPriceHT,
                type: quoteService.type,
                unit: quoteService.unit,
                vatRate: quoteService.vatRate,
                selectedFromSuggestions: false,
                quantity: quoteService.quantity,
                detailsService: quoteService.detailsService,
            },
            ],
        });

        removeService(index)

    };

    const removeService = (index: number) => {
        if(quote){
            const newServices = quote.services.filter((_, i) => i !== index);
            setQuote({
                ...quote,
                services: newServices,
            });            
        }

    };

    // We search services suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
 
 
    const fetchServiceSuggestions = async (value: string) => {
        if (value.length < 2) return; 
        try {
            const data = await fetchSuggestions("service", value);
            console.log("API response data for services :", data); 
            console.log("Longueur des datas du tableau de datas de services : "+data.suggestions.length)
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setServiceSuggestions(data.suggestions as ServiceSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setServiceSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        } catch (error) {
            console.error("Erreur lors de la récupération des suggestions de services :", error);
        }
    };
 
 
 
    // const fetchServiceSuggestions = async (value: string) => {
    //     if (value.length < 2) return; 
    //     try {
    //         const response = await fetch(`/api/service/${value}`);
    //         const data = await response.json();
    //         console.log("API response data for services :", data); 
    //         console.log("Longueur des datas du tableau de datas de services : "+data.suggestions.length)
    //         if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
    //             setServiceSuggestions(data.suggestions); 
    //             console.log("Les datas reçues sont supérieures à 0")
    //         } else {
    //             setServiceSuggestions([]); 
    //             console.log("Pas de datas reçues")

    //         }
    //     } catch (error) {
    //         console.error("Erreur lors de la récupération des suggestions de services :", error);
    //     }
    // };


// Fonction pour gérer les changements sur les champs autres que le label
    const handleServiceFieldChange = (
        index: number,
        fieldName: string,
        value: string 
    ) => {
        console.log("Avant mise à jour : ", updatedQuoteFormValues.services[index]);
        console.log("Champ modifié : ", fieldName, " Nouvelle valeur : ", value);
        // console.log("la valeur saisie dans le champ est : "+value+" qui provient du champ "+fieldName)
        
        const newServices = [...updatedQuoteFormValues.services];
        newServices[index] = {
        ...newServices[index],
        // Update only targeted field
        [fieldName]: value, 
        };

        console.log("Après mise à jour : ", newServices[index]);

    
        setUpdatedQuoteFormValues({
        ...updatedQuoteFormValues,
        services: newServices,
        });

        if(fieldName === "label"){
            fetchServiceSuggestions(value);
        }
    };

    if (!quote) return <div>Loading...</div>;

    console.log("conditions de paiement du devis : "+quote.paymentTerms)

    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification de devis</h1>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleDraftQuoteUpdate();
                }}
            >
                {/* Client of the quote */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" 
                            value={updatedQuoteFormValues.client !== null
                                ? updatedQuoteFormValues.client
                                : quote?.client.name || ""}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>    
                    {errors.clientId && <p style={{ color: "red" }}>{errors.clientId}</p>}

                    {clientSuggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {clientSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion("client",suggestion.id, suggestion.name+" "+suggestion.firstName)}
                                >
                                    {suggestion.name} {suggestion.firstName} - {suggestion.clientNumber}
                                </li>
                            ))}
                        </ul>
                    )}               
                </div>
                {/* WorkSite of the quote */}
                <div>
                    <label htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" 
                            value={updatedQuoteFormValues.workSite !== null
                                ? updatedQuoteFormValues.workSite
                                : quote?.workSite.title || ""}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>   
                    {errors.workSiteId && <p style={{ color: "red" }}>{errors.workSiteId}</p>}
 
                    {workSiteSuggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {workSiteSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion("workSite",suggestion.id, suggestion.title)}
                                >
                                    {suggestion.title} - {suggestion.addressNumber} {suggestion.road} {suggestion.additionnalAddress} {suggestion.postalCode} {suggestion.city}
                                </li>
                            ))}
                        </ul>
                    )}               
                </div>
                {/* Nature of work */}
                <div>
                    <label htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.natureOfWork !== null
                                ? updatedQuoteFormValues.natureOfWork
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
                        <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.description !== null
                                ? updatedQuoteFormValues.description
                                : quote.description ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

                </div>
                {/* Work start date */}
                <div>
                    <label htmlFor="workStartDate">Date prévue de début des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workStartDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={formatDateForInput(quote.workStartDate)}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workStartDate && <p style={{ color: "red" }}>{errors.workStartDate}</p>}

                </div>
                {/* Estimated work end date */}
                <div>
                    <label htmlFor="estimatedWorkEndDate">Date prévue de fin des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="estimatedWorkEndDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={formatDateForInput(quote.estimatedWorkEndDate)}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.estimatedWorkEndDate && <p style={{ color: "red" }}>{errors.estimatedWorkEndDate}</p>}

                </div>
                {/* Estimated work duration */}
                <div>
                    <label htmlFor="estimatedWorkDuration">Durée estimée des travaux (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="estimatedWorkDuration" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            // Display quote.estimatedWorkDuration only if it exists 
                            value={updatedQuoteFormValues.estimatedWorkDuration !== null
                                ? updatedQuoteFormValues.estimatedWorkDuration
                                : quote.estimatedWorkDuration ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.estimatedWorkDuration && <p style={{ color: "red" }}>{errors.estimatedWorkDuration}</p>}

                </div>
                {/* Deposit amount */}
                <div>
                    <label htmlFor="depositAmount">Accompte demandé (en €)</label>
                    <Field className="w-full">
                        <Input type="number" name="depositAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            // Display quote.depositAmount only if it exists 
                            value={updatedQuoteFormValues.depositAmount !== null
                            ? updatedQuoteFormValues.depositAmount
                            : quote.depositAmount ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.depositAmount && <p style={{ color: "red" }}>{errors.depositAmount}</p>}

                </div>
                <div>
                    <label htmlFor="discountAmount">Montant de la remise, en €</label>
                    <Field className="w-full">
                        <Input type="number" name="discountAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            // Display quote.discountAmount only if it exists 
                            value={updatedQuoteFormValues.discountAmount !== null
                                ? updatedQuoteFormValues.discountAmount
                                : quote.discountAmount ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.discountAmount && <p style={{ color: "red" }}>{errors.discountAmount}</p>}

                </div>
                <Select
                    name="discountReason"
                    onChange={handleInputChange}
                    // Display quote.discountReason only if it exists 
                    value={updatedQuoteFormValues.discountReason !== null
                        ? updatedQuoteFormValues.discountReason
                        : quote.discountReason ?? ""} 
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Raison de la remise</option>
                    {discountReasonChoices.map((discountReasonChoices) => (
                        <option key={discountReasonChoices} value={discountReasonChoices}>{discountReasonChoices}</option>
                    ))}
                </Select>
                {errors.discountReason && <p style={{ color: "red" }}>{errors.discountReason}</p>}

            <h2>Services</h2>
            {/* Services retrieved form database (can't be updated, just unlinked from this quote) */}
            {quote.services.map((service, index) => (
            <div key={index}>
                <Input
                    type="text"
                    name="label"
                    placeholder="Label du service"
                    value={service.service.label}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                <Input
                    type="text"
                    name="detailsService"
                    placeholder="Détails du service"
                    value={service.detailsService}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                <Input
                    type="number"
                    name="unitPriceHT"
                    placeholder="Prix unitaire"
                    value={service.service.unitPriceHT || ""}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />

                <Select
                    name="type"
                    value={service.service.type || ""}
                    disabled
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Type de service</option>
                    {serviceTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Input
                    type="number"
                    name="quantity"
                    readOnly
                    placeholder="Quantité"
                    value={service.quantity || ""}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"

                />
                <Select
                    name="unit"
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    disabled
                    value={service.unit || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                    <option value="">Unité</option>
                        {unitChoices.map((unit) => (
                            <option key={unit.id} value={unit.label}>{unit.label}</option>
                        ))}
                </Select> 
                    <Select
                            name="vatRate"
                            disabled
                            value={service.vatRate || ""}
                            className="w-full rounded-md bg-gray-700 text-white pl-3"
                        >
                        <option value="">Taux de tva</option>
                            {vatRateChoices.map((vatRate) => (
                                <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
                            ))}
                    </Select> 
                    <Button label="Enlever le service" icon={CircleX} type="button" action={() => addServiceToUnlink(service, index)} specifyBackground="text-red-500" />
                </div>
                ))}
            {/* end of services retrieved from database */}
            {updatedQuoteFormValues.services.map((service, index) => (
            <div key={index}>
                <Input
                    type="text"
                    name="label"
                    placeholder="Label du service"
                    value={service.label}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                {/* Services suggestions */}
                {servicesSuggestions ? (
                    <ul>
                        {servicesSuggestions.map((suggestion) => (
                            <li 
                                key={suggestion.id}
                                onClick={() => handleClickServiceSuggestion(index, suggestion)} 
                                className="cursor-pointer text-blue-500 hover:text-blue-700"
                            >
                                {suggestion.label}
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p>Aucune suggestion disponible</p>
                )}
                <Input
                    type="text"
                    name="detailsService"
                    placeholder="Détails du service"
                    value={service.detailsService}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                 <Input
                    type="number"
                    name="unitPriceHT"
                    placeholder="Prix unitaire"
                    value={service.unitPriceHT || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                    disabled={!!service.selectedFromSuggestions}
                />

                <Select
                    name="type"
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    value={service.selectedFromSuggestions ? "" : service.type }
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    disabled={!!service.selectedFromSuggestions}
                >
                <option value="">{service.selectedFromSuggestions ? service.type : "Type de service"}</option>
                    {serviceTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Input
                    type="number"
                    name="quantity"
                    placeholder="Quantité"
                    value={service.quantity || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"

                />
                <Select
                        name="unit"
                        onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                        value={service.unit || ""}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Unité</option>
                        {unitChoices.map((unit) => (
                            <option key={unit.id} value={unit.label}>{unit.label}</option>
                        ))}
                </Select> 
                <Select
                        name="vatRate"
                        onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                        value={service.vatRate || ""}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Taux de tva</option>
                        {vatRateChoices.map((vatRate) => (
                            <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
                        ))}
                </Select> 
                <Button label="Enlever le service" icon={CircleX} type="button" action={() => removeService(index)} specifyBackground="text-red-500" />
            </div>
            ))}
            <Button label="Ajouter un service" icon={CirclePlus} type="button" action={() => addService()} specifyBackground="text-red-500" />


                {/* Quote : validity end date */}
                <div>
                    <label htmlFor="validityEndDate">Date de fin de validité du devis</label>
                    <Field className="w-full">
                        <Input type="date" name="validityEndDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={formatDateForInput(quote.validityEndDate)}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.validityEndDate && <p style={{ color: "red" }}>{errors.validityEndDate}</p>}

                </div>
                {/* payment Terms */}
                <div>
                    <label htmlFor="paymentTerms">Termes de paiement</label>
                    <Field className="w-full">
                        <Textarea name="paymentTerms" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.paymentTerms !== null
                                ? updatedQuoteFormValues.paymentTerms
                                : quote.paymentTerms ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.paymentTerms && <p style={{ color: "red" }}>{errors.paymentTerms}</p>}

                </div>
                {/* Payment delay */}
                <div>
                    <label htmlFor="paymentDelay">Délais de paiement (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="paymentDelay" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.paymentDelay !== null
                                ? updatedQuoteFormValues.paymentDelay
                                : quote.paymentDelay ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.paymentDelay && <p style={{ color: "red" }}>{errors.paymentDelay}</p>}

                </div>
                {/* late payment penalities */}
                 <div>
                    <label htmlFor="latePaymentPenalities">Frais de retard de paiement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="latePaymentPenalities" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.latePaymentPenalities !== null
                                ? updatedQuoteFormValues.latePaymentPenalities
                                : Number(quote.latePaymentPenalties ?? "")} 
                           onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.latePaymentPenalities && <p style={{ color: "red" }}>{errors.latePaymentPenalities}</p>}

                </div>
                {/* travel costs */}
                <div>
                    <label htmlFor="travelCosts">Frais de déplacement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="travelCosts" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.travelCosts !== null
                                ? updatedQuoteFormValues.travelCosts
                                : quote.travelCosts ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.travelCosts && <p style={{ color: "red" }}>{errors.travelCosts}</p>}

                </div>
                <Select
                    name="travelCostsType"
                    onChange={handleInputChange}
                    value={updatedQuoteFormValues.travelCostsType !== null
                        ? updatedQuoteFormValues.travelCostsType
                        : quote.travelCostsType ?? ""} 
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Type de frais de déplacement</option>
                    {travelCostsTypeChoices.map((travelCostsTypeChoices) => (
                        <option key={travelCostsTypeChoices} value={travelCostsTypeChoices}>{travelCostsTypeChoices}</option>
                    ))}
                </Select>
                {errors.travelCostsType && <p style={{ color: "red" }}>{errors.travelCostsType}</p>}

                {/* recovery fees */}
                <div>
                    <label htmlFor="recoveryFee">Frais forfaitaires de recouvrement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="recoveryFee" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.recoveryFee !== null
                                ? updatedQuoteFormValues.recoveryFee
                                : quote.recoveryFee ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.recoveryFee && <p style={{ color: "red" }}>{errors.recoveryFee}</p>}

                </div>
                {/* has right of Withdrawal ? */}
                <Field>
                    <Legend>Y a t'il un droit de rétractation ?</Legend>
                    <RadioGroup 
                        name="hasRightOfWithdrawal"
                        value={quote.hasRightOfWithdrawal ? "Oui" : "Non"}
                        onChange={(value)=> handleRadioChange("hasRightOfWithdrawal",value)}

                    >
                        {hasRightOfWithdrawalChoices.map((choice) => (
                            <Field key={choice} className="flex gap-2 items-center">
                                <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                                <Label>{choice}</Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </Field>
                {errors.hasRightOfWithrawal && <p style={{ color: "red" }}>{errors.hasRightOfWithDrawal}</p>}

                {/* In the case of hasRightOfWithdrawal is true, display form field : Withdrawal period */}
                <div>
                    <label htmlFor="withdrawalPeriod">Délai de rétractation (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="withdrawalPeriod" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.withdrawalPeriod !== null
                                ? updatedQuoteFormValues.withdrawalPeriod
                                : quote.withdrawalPeriod ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.withdrawalPeriod && <p style={{ color: "red" }}>{errors.withdrawalPeriod}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />

                <button 
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleDraftQuoteUpdate(); 
                    }}
                    >Modifier et enregistrer à l'état de brouillon
                </button>
                <button
                    // type="button" avoid the form to be automatically submitted
                    type="button"
                    onClick={openChoiceDialog}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                    Finaliser le devis
                </button>
            </form>
            {/* Dialog to save as final version of quote*/}
            {/* className=" top-[50%] left-[25%]" */}
            {/* {isOpen ?? ( */}
                <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir enregistrer le devis en version finale ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>Le devis ne pourra plus être modifié ultérieurement. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize quote
                            onClick={() => {
                                handleDraftQuoteUpdate("Ready"); 
                                closeChoiceDialog(); 
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Finaliser le devis
                        </button>
                            <button onClick={closeChoiceDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                        </div>
                    </DialogPanel>
                </Dialog>
            {/* )}  */}

        </div>
    );

};
