"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
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
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setQuote({
            ...quote,
            [name]: value,
        });
          
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
      

    const handleClickClientSuggestion = (id: string, fieldValue: string) => {
        console.log("j'ai cliqué sur le client qui a l'id :"+id)
        console.log("valeur visible du champ client : "+fieldValue)
        setClientInput(fieldValue)
        setQuote((prev) => ({
            ...prev,
            // Put id from selected client
            clientId: id, 
        }));
        // Close suggestions list
        setClientSuggestions(null); 
    };

    const handleClickWorkSiteSuggestion = (id: string, fieldValue: string) => {
        console.log("j'ai cliqué sur le chantier qui a l'id :"+id)
        console.log("valeur visible du champ workSite : "+fieldValue)
        setWorkSiteInput(fieldValue)
        setQuote((prev) => ({
            ...prev,
            // Put id from selected client
            workSiteId: id, 
        }));
        // Close suggestions list
        setWorkSiteSuggestions(null); 
    };

    const handleClickServiceSuggestion = (index: number, suggestion: ServiceSuggestionType) => {
        // Vérifier l'objet ingredient avant et après modification
        console.log('Avant mise à jour:', quote.services[index]);
    
        // Créer une copie des services pour éviter la mutation directe
        const newServices = [...quote.services];
    
        // Mise à jour de l'ingrédient à l'index spécifique
        newServices[index] = {
            ...newServices[index],
            label: suggestion.label, 
        };
    
        // Vérifier l'objet après modification
        console.log('Après mise à jour:', newServices[index]);
    
        // Mettre à jour l'état global avec la copie modifiée
        setQuote({
            ...quote,
            services: newServices,
        });
    
        // Fermer les suggestions après la sélection
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

    // add a service 
    const addService = () => {
        setQuote({
            ...quote,
            services: [...quote.services, { label: ""}],
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

    const handleServiceLabelChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const newServices = [...quote.services];
        newServices[index] = {
            ...newServices[index],
            label: value,
        };

        setQuote({
            ...quote,
            services: newServices,
        });

        // Call the function to get suggestions
        fetchServiceSuggestions(value);
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
                            onChange={handleDisplaySuggestions}
                        >
                        </Input>
                    </Field>    
                    {clientSuggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {clientSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickClientSuggestion(suggestion.id, suggestion.name+" "+suggestion.firstName)}
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
                            onChange={handleDisplaySuggestions}
                        >
                        </Input>
                    </Field>    
                    {workSiteSuggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {workSiteSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickWorkSiteSuggestion(suggestion.id, suggestion.title)}
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
                    name="serviceLabel"
                    placeholder="Label du service"
                    value={service.label}
                    onChange={(event) => handleServiceLabelChange(index, event)}
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

                {/* <Input
                    type="number"
                    name="unitPrice"
                    placeholder="Prix unitaire"
                    value={service.unitPrice}
                    onChange={(event) => handleServiceChange(index, event)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
               <label htmlFor="serviceType">Type de service</label>
                    <Select
                        name="serviceType"
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Sélectionnez un type</option>
                        {serviceTypeChoices.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select> */}
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
                        onChange={handleInputChange}

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
                        <Textarea name="paymentTerms" value={"Le paiement doit être effectué dans les 30 jours suivant la réception de la facture."} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                    <label htmlFor="paymentPenalities">Frais de déplacement (HT), en €</label>
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
                        onChange={handleInputChange}

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
                {/* form fields the user can't change directly. Automatic calculation => work cost : priceHT, priceTTC AND quoteCostHT, quoteCostTTC */}

                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default CreateQuote;
