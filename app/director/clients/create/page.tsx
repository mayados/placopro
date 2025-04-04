"use client";

import { useEffect, useState, use } from "react";
import { Field,Input } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { createClient } from "@/services/api/clientService";
import { createClientSchema } from "@/validation/clientValidation";

// import toast, { Toaster } from 'react-hot-toast';

const clientCreation = () => {

    const [client, setClient] = useState<ClientFormValueType>({
        name: "",
        firstName: "",
        mail: "",
        phone: "",
        road: "",
        addressNumber: "",
        postalCode: "",
        city: "",
        additionalAddress: "",
        prospectNumber: "",
    })
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setClient({
            ...client,
            [name]: value,
        });
          
    };


    const handleClientCreation = async () => {
        try{
            console.log("Nom du client : "+client.name)
            console.log("Prénom du client : "+client.firstName)
            console.log("mail du client : "+client.mail)
            console.log("Téléphone du client : "+client.phone)
            console.log("rue du client : "+client.road)
            console.log("Numéro d'adresse du client : "+client.addressNumber)
            console.log("Code postal du client : "+client.postalCode)
            console.log("Ville du client : "+client.city)
            console.log("Complément d'adresse du client : "+client.additionalAddress)
            console.log("Numéro de prospect : "+client.prospectNumber)

            // Validation des données du formulaire en fonction du statut
            const validationResult = createClientSchema.safeParse(client);

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

            const newClient = await createClient(client);

                try {
                    // We redirect to the clients' list
                    router.push(`/director/clients/${newClient.slug}`);
                } catch (err) {
                    console.error("Redirection failed :", err);
            }
        }catch (error) {
            console.error("Erreur lors de la création du client :", error);
            // toast.error("There was a problem with updating the client. Please try again!");
        }

    };


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création client : {client.name} {client.firstName}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleClientCreation();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="name">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="name" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}

                </div>
                {/* mail */}
                <div>
                    <label htmlFor="mail">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="mail" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.road && <p style={{ color: "red" }}>{errors.road}</p>}

                </div>
                {/* additionnalAddress */}
                <div>
                    <label htmlFor="additionalAddress">Complément d'adresse</label>
                    <Field className="w-full">
                        <Input type="text" name="additionalAddress" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.additionalAddress && <p style={{ color: "red" }}>{errors.additionalAddress}</p>}

                </div>
                {/* postalCode */}
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
                {/* city */}
                <div>
                    <label htmlFor="city">Ville</label>
                    <Field className="w-full">
                        <Input type="text" name="city" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.prospectNumber && <p style={{ color: "red" }}>{errors.prospectNumber}</p>}

                </div>
                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default clientCreation;
