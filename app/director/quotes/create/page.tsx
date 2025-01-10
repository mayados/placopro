"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
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
        isQuoteFree: "",
        hasRightOfWithdrawal: "",
        travelCosts: 0,
        hourlyLaborRate: 0,
        paymentTerms: "",
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
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, tvaRate, client, worksite 
    const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [workSiteSuggestions, setWorkSiteSuggestions] = useState<WorkSiteSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const [workSiteInput, setWorkSiteInput] = useState(""); 
    const [serviceInput, setServiceInput] = useState(""); 
    // Choices for boolean properties
    const isQuoteFreeChoices = ["Oui","Non"];
    const hasRightOfWithdrawalChoices = ["Oui","Non"];


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

    const handleSubmit = async () => {
        try{
            // console.log("Titre du chantier : "+workSite.title)
            // console.log("Description : "+workSite.description)
            // console.log("Commence le : "+workSite.beginsThe)
            // console.log("Statut : "+workSite.status)
            // console.log("Route : "+workSite.road)
            // console.log("Numéro d'adresse : "+workSite.addressNumber)
            // console.log("Code postal : "+workSite.postalCode)
            // console.log("Ville : "+workSite.city)
            // console.log("complément d'adresse : "+workSite.additionnalAddress)
            // console.log("ClientId : "+workSite.clientId)

            const response = await fetch(`/api/director/quotes/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(quote),
            });
            if (response.ok) {
                try {
                    // We redirect to the quotes' list
                    router.push(`/director/quotes`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la création du devis :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
        }

    };


    const addService = () => {
        setQuote({
          ...quote,
          services: [
            ...quote.services,
            {
              label: "",
              unitPriceHT: "",
              type: "",
              unit: "",
              tvaRate: "",
              selectedFromSuggestions: false,
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

    // We search ingredient suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
    const fetchServiceSuggestions = async (value: string) => {
        if (value.length < 2) return; 
        try {
            const response = await fetch(`/api/director/services/find/${value}`);
            const data = await response.json();
            console.log("API response data for services :", data); 
            console.log("Longueur des datas du tableau de datas : "+data.suggestions.length)
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
            fetchServiceSuggestions(value);
        }
    };

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création de devis</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
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
                    type="number"
                    name="unitPriceHT"
                    placeholder="Prix unitaire"
                    value={service.unitPriceHT || ""}
                    // onChange={(event) => handleServiceChange(index, event)}
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
                    type="text"
                    name="unit"
                    placeholder="Unité (ex: m2, m3, piece...)"
                    value={service.unit || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    // onChange={(event) => handleServiceChange(index, event)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                    <Input
                    type="number"
                    name="tvaRate"
                    placeholder="Taux de tva en % (ex: 5.5, 20...)"
                    value={service.tvaRate || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    // onChange={(event) => handleServiceChange(index, event)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
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
                {/* Is the quote free ? */}
                <Field>
                    <Legend>Le devis est-il gratuit ?</Legend>
                    <RadioGroup 
                        name="isQuoteFree"
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
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
                    <label htmlFor="paymentPenalities">Frais de retard de paiement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="paymentPenalities" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                {/* hourly labor rate */}
                <div>
                    <label htmlFor="hourlyLaborRate">Taux horaire main d'oeuvre (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="hourlyLaborRate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
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
