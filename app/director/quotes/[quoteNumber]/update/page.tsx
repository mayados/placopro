"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { formatDateForInput } from '@/lib/utils'
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';

// import toast, { Toaster } from 'react-hot-toast';

const UpdatedDraftQuote = ({ params }: { params: Promise<{ quoteNumber: string }>}) => {

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
        isQuoteFree: null,
        hasRightOfWithdrawal: null,
        travelCosts: null,
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


    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, tvaRate, client, worksite 
    const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [workSiteSuggestions, setWorkSiteSuggestions] = useState<WorkSiteSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
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
        const fetchQuote = async () => {
            const resolvedParams = await params;
            const quoteNumber = resolvedParams.quoteNumber;
            const response = await fetch(`/api/director/quotes/${quoteNumber}`)
            const data: QuoteTypeSingle =  await response.json()
              console.log("données reçues après le fetch du quote récupéré en database : "+data)
            //   const retrievedQuote = data.quote;
            setUpdatedQuoteFormValues({
                ...updatedQuoteFormValues,
                number: data.quote.number,
            });
              setQuote(data.quote);

        }
        const fetchVatRates = async () => {
              const response = await fetch(`/api/director/vatRates`)
              const data: VatRateListType =  await response.json()
                console.log("données reçues après le fetch : "+data)
                setVatRateChoices(data.vatRates)
        }
        const fetchUnits = async () => {
            const response = await fetch(`/api/director/units`)
            const data: UnitListType =  await response.json()
              console.log("données reçues après le fetch : "+data)
              setUnitChoices(data.units)
      }
        fetchQuote();
        fetchVatRates();
        fetchUnits();
    },[]);

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
          const endpoint =
            name === "client"
              ? `/api/director/clients/find/${value}`
              : `/api/director/workSites/find/${value}`;
          const response = await fetch(endpoint);
          const data = await response.json();
      
          if (response.ok) {
            if (name === "client") {
              setClientSuggestions(data.suggestions);
            } else if (name === "workSite") {
              setWorkSiteSuggestions(data.suggestions);
            }
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

    const handleSubmit = async (statusReady?: string) => {
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
            console.log("ce qui est envoyé à la route de modification : "+JSON.stringify(updatedQuoteWithStatus))
            console.log("valeur envoyée de saveMode : "+status)
            const response = await fetch(`/api/director/quotes/update/${quote?.number}/draft`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedQuoteWithStatus),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data)
                const updatedQuote = data.updatedQuote;
                console.log("voici le devis updaté : "+updatedQuote.number)
                try {
                    // Redirect to the updated Quote
                    router.push(`/director/quotes/${updatedQuote.number}`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la création du devis :", error);
        }

    };

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
            const response = await fetch(`/api/director/services/find/${value}`);
            const data = await response.json();
            console.log("API response data for services :", data); 
            console.log("Longueur des datas du tableau de datas de services : "+data.suggestions.length)
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setServiceSuggestions(data.suggestions); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setServiceSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        } catch (error) {
            console.error("Erreur lors de la récupération des suggestions de services :", error);
        }
    };


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
                    handleSubmit();
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
                <h2>Chantier</h2>
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
                </div>
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
                </div>
                {/* Is the quote free ? */}
                <Field>
                    <Legend>Le devis est-il gratuit ?</Legend>
                    <RadioGroup 
                        name="isQuoteFree"
                        value={quote.isQuoteFree ? "Oui": "Non"}
                        onChange={(value)=> handleRadioChange("isQuoteFree",value)}

                    >
                        {isQuoteFreeChoices.map((choice) => (
                            <Field key={choice} className="flex gap-2 items-center">
                                <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                                <Label>{choice}</Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </Field>

                {/* If the quote isn't free display an other form field : quoteCost */}
                <div>
                    <label htmlFor="quoteCost">Coût de création du devis (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="quoteCost" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.quoteCost !== null
                                ? updatedQuoteFormValues.quoteCost
                                : quote.quoteCost ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
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
                </div>
                {/* hourly labor rate */}
                <div>
                    <label htmlFor="hourlyLaborRate">Taux horaire main d'oeuvre (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="hourlyLaborRate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updatedQuoteFormValues.hourlyLaborRate !== null
                                ? updatedQuoteFormValues.hourlyLaborRate
                                : quote.hourlyLaborRate ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
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
                </div>

                <button 
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleSubmit(); 
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
                                handleSubmit("Ready"); 
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


export default UpdatedDraftQuote;
