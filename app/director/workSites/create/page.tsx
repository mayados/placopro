"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { createWorkSite } from "@/services/api/workSiteService";
import { createWorkSiteSchema } from "@/validation/workSiteValidation";

// import toast, { Toaster } from 'react-hot-toast';

const CreateWorkSite = () => {

    const [workSite, setWorkSite] = useState<WorkSiteCreationType>({
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
    const statusChoices = ["En cours","A venir","Terminé"];
    const router = useRouter();
    const [suggestions, setSuggestions] = useState<ClientSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setWorkSite({
            ...workSite,
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
            const data = await fetchSuggestions("client", value);
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setSuggestions(data.suggestions as ClientSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        } catch (error) {
            console.log("Erreur lors de la récupération des suggestions :", error);
        }
          
    };

    const handleClickSuggestion = (id: string, fieldValue: string) => {
        console.log("j'ai cliqué sur le client qui a l'id :"+id)
        // const value = e.currentTarget.dataset.value as string; // Récupère la value
        // console.log("Pour le champ client :"+value)
        // setWorkSite({
        //     ...workSite,
        //     clientId: value,
        // });
        console.log("valeur visible du champ client : "+fieldValue)
        setClientInput(fieldValue)
        setWorkSite((prev) => ({
            ...prev,
            clientId: id, // Met l'ID du client sélectionné
        }));
        setSuggestions(null); // Fermez la liste des suggestions
    };

    const handleWorkSiteCreation = async () => {
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
    

                // Validation des données du formulaire en fonction du statut
                const validationResult = createWorkSiteSchema.safeParse(workSite);

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

                const newWorkSite = await createWorkSite(workSite);
  
                try {
                    router.push(`/director/workSites/${newWorkSite.slug}`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }

            }catch (error) {
                console.error("Erreur lors de la création du chantier :", error);
                // toast.error("There was a problem with updating the client. Please try again!");
            }
    
    };
    

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création de chantier</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleWorkSiteCreation();
                }}
            >
                {/* WorkSite title */}
                <div>
                    <label htmlFor="title">Titre</label>
                    <Field className="w-full">
                        <Input type="text" name="title" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.beginsThe && <p style={{ color: "red" }}>{errors.beginsThe}</p>}

                </div>
                {/* type of company */}
                <div>
                    <label htmlFor="status">Statut du chantier</label>
                    <Select
                        name="status"
                        // value={employee.role}
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
                        <Input type="text" name="client" value={clientInput} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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


                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default CreateWorkSite;
