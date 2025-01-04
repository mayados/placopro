"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { formatDateToInput } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';

const modifyWorkSite = ({ params }: { params: Promise<{ workSiteSlug: string }>}) => {

    const [workSite, setWorkSite] = useState<WorkSiteType | null>(null);
    // Define options for select
    const statusChoices = ["En cours","A venir","Terminé"];
    const [suggestions, setSuggestions] = useState<ClientSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const router = useRouter();


    useEffect(() => {
        async function fetchWorkSite() {
            const resolvedParams = await params;
            const workSiteSlug = resolvedParams.workSiteSlug;
            const response = await fetch(`/api/director/workSites/${workSiteSlug}`);
            const data: WorkSiteTypeSingle = await response.json();
            setWorkSite(data.workSite);
            if (data.workSite.client) {
                setClientInput(`${data.workSite.client.name} ${data.workSite.client.firstName} ${data.workSite.client.clientNumber}`);
            }
        }
        fetchWorkSite();
    }, [params]);
    
    
      if (!workSite) return <div>Loading...</div>;

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setWorkSite({
            ...workSite,
            [name]: value,
        });
          
    };

    
    const handleDisplaySuggestions = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setClientInput(value);
    
        if (value.trim().length === 0) {
            setSuggestions(null);
            setWorkSite((prev) => prev ? { ...prev, client: { ...prev.client, id: null } } : null);
            return;
        }
    
        // Fetch suggestions for non-empty input
        try {
            const response = await fetch(`/api/director/clients/find/${value}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des suggestions :", error);
        }
    };
    

    const handleClickSuggestion = (id: string, fieldValue: string) => {
        setClientInput(fieldValue);
        setWorkSite((prev) => prev ? { ...prev, client: { ...prev.client, id } } : null);
        setSuggestions(null);
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
            console.log("ClientId : "+workSite.client.id)
            console.log("slug : "+workSite.slug)

            const response = await fetch(`/api/director/workSites/update/${workSite.slug}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(workSite),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data)
                const updatedWorkSite = data.updatedworkSite;
                setWorkSite(updatedWorkSite);
                console.log("updated worksite :"+updatedWorkSite.slug)
                // toast.success("Recipe updated successfully !");
                try {
                    // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                    router.push(`/director/workSites/${updatedWorkSite.slug}/update`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }

            }
        }catch (error) {
            console.error("Erreur lors de la modification du chantier :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
        }

    };


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Mise à jour de chantier</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {/* WorkSite title */}
                <div>
                    <label htmlFor="title">Titre</label>
                    <Field className="w-full">
                        <Input type="text" name="title" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.title}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* WorkSite description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <Field className="w-full">
                    <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                        value={workSite.description}
                       onChange={handleInputChange}
                    >
                    </Textarea>
                    </Field>
                </div>
                {/* WorkSite beginning */}
                <div>
                    <label htmlFor="beginsThe">Date de début</label>
                    <Field className="w-full">
                        <Input type="date" name="beginsThe" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={formatDateToInput(workSite.beginsThe)}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* type of company */}
                <div>
                    <label htmlFor="status">Statut du chantier</label>
                    <Select
                        name="status"
                        value={workSite.status}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Sélectionnez un statut</option>
                        {statusChoices.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </Select>
                </div>
                {/* WorkSite addressNumber */}
                <div>
                    <label htmlFor="addressNumber">Numéro d'adresse du chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="addressNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.addressNumber}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* WorkSite road */}
                <div>
                    <label htmlFor="road">Rue</label>
                    <Field className="w-full">
                        <Input type="text" name="road" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.road}
                           onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* WorkSite additionnalAddress */}
                <div>
                    <label htmlFor="additionnalAddress">Complément d'adresse</label>
                    <Field className="w-full">
                        <Input type="text" name="additionnalAddress" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.additionnalAddress}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* WorkSite postalCode */}
                <div>
                    <label htmlFor="postalCode">Code postal</label>
                    <Field className="w-full">
                        <Input type="text" name="postalCode" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.postalCode}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* WorkSite city */}
                <div>
                    <label htmlFor="city">Ville</label>
                    <Field className="w-full">
                        <Input type="text" name="city" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={workSite.city}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* Client who has the workSite */}
                <div>
                    <label htmlFor="client">Propriétaire du chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="client" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={clientInput} 
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


                <button type="submit">Modifier</button>
            </form>
        </>
    );

};

export default modifyWorkSite;
