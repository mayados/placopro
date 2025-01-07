"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';

const createQuote = () => {

    const [quote, setQuote] = useState({
        title: "",
        description: "",
        beginsThe: "",
        status: "",
        road: "",
        addressNumber: "",
        postalCode: "",
        city: "",
        additionnalAddress: "",
        clientId: null as string | null,
    })
    // Define options for select
    const router = useRouter();
    // Display suggestions for : service, unit, tvaRate, client, worksite 
    const [suggestions, setSuggestions] = useState<ClientSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const [workSiteInput, setWorkSiteInput] = useState(""); 


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setQuote({
            ...quote,
            [name]: value,
        });
          
    };

    
    const handleDisplaySuggestions = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setClientInput(value)

        // trim() allows to manage blank spaces. If the value isn't null and doesn't contain white spaces, we execute te code below
        if (value.trim().length < 2) {
            // Re initialize suggestions if the field is empty
            setSuggestions(null); 
            console.log("input client : "+clientInput)
            console.log("value après avoir vidé le champ : "+value)
            console.log("les suggestions lorsque le champs est vide : "+JSON.stringify(suggestions))
            // Delete id from client if the field is null
            setWorkSite((prev) => ({ ...prev, clientId: null })); 

            return;
        }

        try {
            console.log("value :"+value)
            const response = await fetch(`/api/director/clients/find/${value}`);
            const data = await response.json();
            if (response.ok) {
                setSuggestions(data.suggestions); 
            }
        } catch (error) {
            console.log("Erreur lors de la récupération des suggestions :", error);
        }
          
    };

    const handleClickSuggestion = (id: string, fieldValue: string) => {
        console.log("j'ai cliqué sur le client qui a l'id :"+id)
        console.log("valeur visible du champ client : "+fieldValue)
        setClientInput(fieldValue)
        setQuote((prev) => ({
            ...prev,
            clientId: id, // Met l'ID du client sélectionné
        }));
        setSuggestions(null); // Fermez la liste des suggestions
    };

    const handleSubmit = async () => {
        try{
            console.log("Titre du chantier : "+workSite.title)
            console.log("Description : "+workSite.description)
            console.log("Commence le : "+workSite.beginsThe)
            console.log("Statut : "+workSite.status)
            console.log("Route : "+workSite.road)
            console.log("Numéro d'adresse : "+workSite.addressNumber)
            console.log("Code postal : "+workSite.postalCode)
            console.log("Ville : "+workSite.city)
            console.log("complément d'adresse : "+workSite.additionnalAddress)
            console.log("ClientId : "+workSite.clientId)

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
                    {suggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion(suggestion.id, suggestion.name+" "+suggestion.firstName)}
                                >
                                    {suggestion.name} {suggestion.firstName} - {suggestion.clientNumber}
                                </li>
                            ))}
                        </ul>
                    )}               
                </div>
                {/* WorkSite of the quote */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" value={clientInput} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleDisplaySuggestions}
                        >
                        </Input>
                    </Field>    
                    {suggestions && (
                        <ul className="bg-gray-700 rounded-md text-white">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion(suggestion.id, suggestion.name+" "+suggestion.firstName)}
                                >
                                    {suggestion.name} {suggestion.firstName} - {suggestion.clientNumber}
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
                {/* Is the quote free ? */}
                <Fieldset>
                    <Legend>Le devis est-il gratuit ?</Legend>
                    <RadioGroup 
                        onChange={(value)=> handleRadioChange("isQuoteFree",value)}

                    >
                        {isQuoteFreeChoices.map((choice) => (
                            <Field key={choice} className="flex gap-2 items-center">
                            <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                            <Label>{choice}</Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </Fieldset>

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
                <Fieldset>
                    <Legend>Y a t'il un droit de rétractation ?</Legend>
                    <RadioGroup 
                        onChange={(value)=> handleRadioChange("isQuoteFree",value)}

                    >
                        {hasRightOfWithdrawalChoices.map((choice) => (
                            <Field key={choice} className="flex gap-2 items-center">
                            <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                            <Label>{choice}</Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </Fieldset>
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
                {/* form fields the user can't change directly => work cost : priceHT, priceTTC AND quoteCostHT, quoteCostTTC */}

                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default createQuote;
