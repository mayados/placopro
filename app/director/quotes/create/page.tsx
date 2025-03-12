"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { createQuote } from "@/services/api/quoteService";
import { fetchSuggestions } from "@/services/api/suggestionService";
// import toast, { Toaster } from 'react-hot-toast';

const CreateQuote = () => {

    const [quote, setQuote] = useState<QuoteFormValueType>({
        validityEndDate: "",
        natureOfWork: "",
        description: "",
        workStartDate: "",
        estimatedWorkEndDate: "",
        estimatedWorkDuration: "",
        vatAmount: 0,
        priceTTC: 0,
        priceHT: 0,
        depositAmount: 0,
        discountAmount: 0,
        discountReason: "",
        isQuoteFree: "",
        hasRightOfWithdrawal: "",
        travelCosts: 0,
        travelCostsType: "",
        hourlyLaborRate: 0,
        paymentTerms: "Le paiement doit être effectué dans les 30 jours suivant la réception de la facture.",
        paymentDelay: 0,
        latePaymentPenalities: 0,
        recoveryFees: 0,
        withdrawalPeriod: 0,
        quoteCost: 0,
        clientId: null as string | null,
        workSiteId: null as string | null,
        services: [],
        serviceType: "",
    })
    const discountReasonChoices = ["Fidelité","Remise exceptionnelle"];
    const travelCostsTypeChoices = ["Forfait unique","Forfait journalier"];
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])

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

        loadVatRates()
        loadUnits();
    },[]);
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setQuote({
            ...quote,
            [name]: value,
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
        }
          
    };

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    const handleRadioChange = (name: string, value: string) => {
        setQuote((quote) => ({
          ...quote,
          [name]: value,
        }));
      };

      const handleDisplaySuggestions = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;
      
        if (name !== "client" && name !== "workSite") return;
      
        if (value.trim().length < 2) {
          if (name === "client") {
            setClientSuggestions(null);
            setClientInput(value);
            setQuote((prev) => ({ ...prev, clientId: null }));
          } else if (name === "workSite") {
            setWorkSiteSuggestions(null);
            setWorkSiteInput(value);
            setQuote((prev) => ({ ...prev, workSiteId: null }));
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
            setQuote((prev) => ({
                ...prev,
                // Put id from selected client
                clientId: id, 
            }));
            // Close suggestions list
            setClientSuggestions(null); 
        }else if(inputName === "workSite"){
            setWorkSiteInput(fieldValue)
            setQuote((prev) => ({
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
        const newServices = [...quote.services];
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

        setQuote({
          ...quote,
          services: newServices,
        });


        // Delete suggestions after the clic
        setServiceSuggestions([]);
      };

      const handleQuoteCreation = async () => {
        try {
            const newQuote = await createQuote(quote);
    
            console.log("Devis créé avec succès :", newQuote);
    
            try {
                // Redirection vers le devis créé
                router.push(`/director/quotes/${newQuote.number}`);
            } catch (err) {
                console.error("Échec de la redirection :", err);
            }
        } catch (error) {
            console.error("Erreur lors de la création du devis :", error);
        }
    };

    const addService = () => {
        setQuote({
          ...quote,
          services: [
            ...quote.services,
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

    const removeService = (index: number) => {
        const newServices = quote.services.filter((_, i) => i !== index);
        setQuote({
            ...quote,
            services: newServices,
        });
    };

    // We search services suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
    const loadServiceSuggestions = async (value: string) => {
        if (value.length < 2) return; 
        try{
            const data = await fetchSuggestions("service",value);
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setServiceSuggestions(data.suggestions as ServiceSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setServiceSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        }catch(error){
            console.error("Erreur lors de la récupération des suggestions de services :", error);
        }
    }


// Fonction pour gérer les changements sur les champs autres que le label
    const handleServiceFieldChange = (
        index: number,
        fieldName: string,
        value: string 
    ) => {
        console.log("Avant mise à jour : ", quote.services[index]);
        console.log("Champ modifié : ", fieldName, " Nouvelle valeur : ", value);
        // console.log("la valeur saisie dans le champ est : "+value+" qui provient du champ "+fieldName)
        
        const newServices = [...quote.services];
        newServices[index] = {
        ...newServices[index],
        // Update only targeted field
        [fieldName]: value, 
        };

        console.log("Après mise à jour : ", newServices[index]);

    
        setQuote({
        ...quote,
        services: newServices,
        });

        if(fieldName === "label"){
            loadServiceSuggestions(value);
        }
    };

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création de devis</h1>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleQuoteCreation();
                }}
            >
                {/* Client of the quote */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" value={clientInput} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                        <Input type="text" name="workSite" value={workSiteInput} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* Deposit amount */}
                <div>
                    <label htmlFor="depositAmount">Accompte demandé (en €)</label>
                    <Field className="w-full">
                        <Input type="number" name="depositAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
            <h2>Services</h2>
            {quote.services.map((service, index) => (
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
                    value={service.type || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    disabled={!!service.selectedFromSuggestions}
                >
                <option value="">Type de service</option>
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                <div>
                    <label htmlFor="discountAmount">Montant de la remise, en €</label>
                    <Field className="w-full">
                        <Input type="number" name="discountAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                <Select
                    name="discountReason"
                    onChange={handleInputChange}
                    value={quote.discountReason || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Raison de la remise</option>
                    {discountReasonChoices.map((discountReasonChoices) => (
                        <option key={discountReasonChoices} value={discountReasonChoices}>{discountReasonChoices}</option>
                    ))}
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
                </div>
                {/* Payment delay */}
                <div>
                    <label htmlFor="paymentDelay">Délais de paiement (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="paymentDelay" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                <Select
                    name="travelCostsType"
                    onChange={handleInputChange}
                    value={quote.travelCostsType || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Type de frais de déplacement</option>
                    {travelCostsTypeChoices.map((travelCostsTypeChoices) => (
                        <option key={travelCostsTypeChoices} value={travelCostsTypeChoices}>{travelCostsTypeChoices}</option>
                    ))}
                </Select>
                {/* recovery fees */}
                <div>
                    <label htmlFor="recoveryFees">Frais forfaitaires de recouvrement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="recoveryFees" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>

                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default CreateQuote;
