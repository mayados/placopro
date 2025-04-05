"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { formatDateToInput } from '@/lib/utils'
import { fetchWorkSite, updateWorkSite } from "@/services/api/workSiteService";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { updateWorkSiteSchema } from "@/validation/workSiteValidation";

// import toast, { Toaster } from 'react-hot-toast';

const modifyWorkSite = ({ params }: { params: Promise<{ workSiteSlug: string }>}) => {

    const [workSite, setWorkSite] = useState<WorkSiteType | null>(null);
    // Define options for select
    const statusChoices = ["En cours","A venir","Terminé"];
    const [suggestions, setSuggestions] = useState<ClientSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    


    useEffect(() => {
        async function loadWorkSite() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const workSiteSlug = resolvedParams.workSiteSlug;
          
        try{
            const data = await fetchWorkSite(workSiteSlug)
            setWorkSite(data.workSite);

        }catch (error) {
                console.error("Impossible to load the workSite :", error);
            }
        }
      
        loadWorkSite();
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
            console.log("value :"+value)
            const data = await fetchSuggestions("client", value);
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setSuggestions(data.suggestions as ClientSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setSuggestions([]); 
                console.log("Pas de datas reçues")

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
    
    const handleWorkSitetUpdate = async () => { 
                
        try{


            // Validation des données du formulaire en fonction du statut
            const validationResult = updateWorkSiteSchema.safeParse(workSite);

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
        
            const data = await updateWorkSite(workSite)
            const updatedWorkSite = data;
            setWorkSite(updatedWorkSite);
            console.log("updated worksite :"+updatedWorkSite.slug)
            // toast.success("Recipe updated successfully !");
            try {
                // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                router.push(`/director/workSites/${updatedWorkSite.slug}/update`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }
    
                        
        }catch (error) {
            console.error("Erreur lors de la mise à jour du devis :", error);
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
                    handleWorkSitetUpdate();
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
                    {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}

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
                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

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
                    {errors.beginsThe && <p style={{ color: "red" }}>{errors.beginsThe}</p>}

                </div>
                {/* statut */}
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
                    {errors.status && <p style={{ color: "red" }}>{errors.status}</p>}

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
                    {errors.addressNumber && <p style={{ color: "red" }}>{errors.addressNumber}</p>}

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
                    {errors.road && <p style={{ color: "red" }}>{errors.road}</p>}

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
                    {errors.additionnalAddress && <p style={{ color: "red" }}>{errors.additionnalAddress}</p>}

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
                    {errors.postalCode && <p style={{ color: "red" }}>{errors.postalCode}</p>}

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
                    {errors.city && <p style={{ color: "red" }}>{errors.citys}</p>}

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
                    {errors.clientId && <p style={{ color: "red" }}>{errors.clientId}</p>}

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
