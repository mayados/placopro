"use client";

import { useEffect, useState, use } from "react";
import { Field,Input } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';

const createClient = () => {

    const [client, setClient] = useState({
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
      

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setClient({
            ...client,
            [name]: value,
        });
          
    };


    const handleSubmit = async () => {
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


            const response = await fetch(`/api/director/clients/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(client),
            });
            if (response.ok) {
                try {
                    // We redirect to the employees' list
                    router.push(`/director/clients`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la création du client :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
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
                    handleSubmit();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="name">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="name" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            // value={employee.lastName}
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
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
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
                </div>
                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default createClient;
