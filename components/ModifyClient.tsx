"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { fetchClient, updateClient } from "@/services/api/clientService";
// import toast, { Toaster } from 'react-hot-toast';
import { updateClientSchema } from "@/validation/clientValidation";
import { toast } from 'react-hot-toast';


type BillProps = {
    csrfToken: string;
    clientSlug: string;
  };

export default function ModifyClient({csrfToken, clientSlug}: BillProps){

    const [client, setClient] = useState<ClientType | null>(null);
    // Define options for select
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    
      
    useEffect(() => {
        async function loadClient() {
          
            try{
            const data = await fetchClient(clientSlug)
            setClient(data.client);
            }catch (error) {
                console.error("Impossible to load the client :", error);
            }
        }
    
        loadClient();
    }, [clientSlug,csrfToken]);
    
  if (!client) return <div>Chargement des détails du client...</div>;


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
          
        setClient((prev) => {
            if (!prev) {
                // Prevent state updates if client is null
                return null;
            }
          
            // Return a new object with the updated field
            return {
                ...prev,
                // Update only the field matching the name, because we don't want to update all the object right away
                [name]: value, 
            };
        });
          
    };

const handleClientUpdate = async () => { 
            
    try{

        // Validation des données du formulaire en fonction du statut
        const validationResult = updateClientSchema.safeParse(client);
        
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
    
        const data = await updateClient(client, csrfToken)
        const updatedClient = data;
        setClient(updatedClient);
        console.log("essai de lecture des données : "+data)
        console.log("updated client :"+updatedClient.slug)
        toast.success("Client mis à jour avec succès");
        try {
            // We redirect because it's possible the slug has changed. So we have to point to the right URL.
            router.push(`/director/clients/${updatedClient.slug}/update`);
        } catch (err) {
            console.log('le fetch ne se fait pas')
            console.error("Redirection failed :", err);
        }

                    
    }catch (error) {
        console.error("Erreur lors de la mise à jour du devis :", error);
        toast.error("Erreur lors de la mise à jour du client");
    }
        
};

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification du client : {client.name} {client.firstName}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleClientUpdate();
                }}
            >
                {/* name */}
                <div>
                    <label htmlFor="name">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="name" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.name}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

                </div>
                {/* firstName */}
                <div>
                    <label htmlFor="firstName">Prénom</label>
                    <Field className="w-full">
                        <Input type="text" name="firstName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.firstName}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.firstname && <p style={{ color: "red" }}>{errors.firstname}</p>}

                </div>
                {/* mail */}
                <div>
                    <label htmlFor="mail">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="mail" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.mail}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.mail && <p style={{ color: "red" }}>{errors.mail}</p>}

                </div>
                {/* phone */}
                <div>
                    <label htmlFor="phone">Téléphone</label>
                    <Field className="w-full">
                        <Input type="text" name="phone" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.phone}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

                </div>
                {/* addressNumber */}
                <div>
                    <label htmlFor="addressNumber">Numéro d'adresse</label>
                    <Field className="w-full">
                        <Input type="text" name="addressNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.addressNumber}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.addressNumber && <p style={{ color: "red" }}>{errors.addressNumber}</p>}

                </div>
                {/* road */}
                <div>
                    <label htmlFor="road">Rue</label>
                    <Field className="w-full">
                        <Input type="text" name="road" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.road}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.road && <p style={{ color: "red" }}>{errors.road}</p>}

                </div>
                {/* additionnalAddress */}
                <div>
                    <label htmlFor="additionnalAddress">Complément d'adresse</label>
                    <Field className="w-full">
                        <Input type="text" name="additionnalAddress" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.additionalAddress}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.additionnalAddress && <p style={{ color: "red" }}>{errors.additionalAddress}</p>}

                </div>
                {/* postalCode */}
                <div>
                    <label htmlFor="postalCode">Code postal</label>
                    <Field className="w-full">
                        <Input type="text" name="postalCode" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.postalCode}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.postalCode && <p style={{ color: "red" }}>{errors.postalCode}</p>}

                </div>
                {/* city */}
                <div>
                    <label htmlFor="city">Ville</label>
                    <Field className="w-full">
                        <Input type="text" name="city" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.city}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.city && <p style={{ color: "red" }}>{errors.city}</p>}

                </div>
                {/* If the client was a prospect */}
                <div>
                    <label htmlFor="prospectNumber">Numéro de prospect</label>
                    <Field className="w-full">
                        <Input type="text" name="prospectNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={client.prospect?.prospectNumber}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.prospectNumber && <p style={{ color: "red" }}>{errors.prospectNumber}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />

                <button type="submit">Modifier</button>
            </form>
        </>
    );
};
