"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';

const modifyClient = ({ params }: { params: Promise<{ clientSlug: string }>}) => {

    const [client, setClient] = useState<ClientType | null>(null);
    // Define options for select
    const router = useRouter();
      

    useEffect(() => {
        async function fetchClient() {
          // Params is now asynchronous. It's a Promise
          // So we need to await before access its properties
          const resolvedParams = await params;
          const clientSlug = resolvedParams.clientSlug;
    
          const response = await fetch(`/api/director/clients/${clientSlug}`);
          const data: ClientTypeSingle = await response.json();
          setClient(data.client);
        }
    
        fetchClient();
  }, [params]);
    
  if (!client) return <div>Chargement des détails du client...</div>;


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
          
        setClient((prev) => {
            if (!prev) {
                // Prevent state updates if company is null
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


    const handleSubmit = async () => {
        try{
            console.log("Nom du client : "+client.name)

            const response = await fetch(`/api/director/clients/update/${client.slug}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(client),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data)
                const updatedClient = data.updatedClient;
                setClient(updatedClient);
                console.log("essai de lecture des données : "+data)
                console.log("updated client :"+updatedClient.slug)
                // toast.success("Recipe updated successfully !");
                try {
                    // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                    router.push(`/director/clients/${updatedClient.slug}/update`);
                } catch (err) {
                    console.log('le fetch ne se fait pas')
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            // console.error("Erreur lors de la modification du client :", error);
            console.log(error)
            // toast.error("There was a problem with updating your recipe. Please try again!");
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
                    handleSubmit();
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
                </div>
                <button type="submit">Modifier</button>
            </form>
        </>
    );
};

export default modifyClient;
