"use client";

import { useState } from "react";
import { Field,Input } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { createProspect } from "@/services/api/clientService";
import { createClientSchema } from "@/validation/clientValidation";
import Breadcrumb from "./BreadCrumb";

// import toast, { Toaster } from 'react-hot-toast';

type ClientCreationProps = {
    csrfToken: string;
  };

export default function ClientCreation({csrfToken}: ClientCreationProps){

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

            const newClient = await createProspect(client, csrfToken);

                try {
                    // We redirect to the clients' list
                    router.push(`/intranet/common-intranet/clients/${newClient.slug}`);
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
    <Breadcrumb
      items={[
        { label: "Tableau de bord", href: "/director" },
        { label: `Création prospect` },
      ]}
    />
            <header className="text-center my-4">

  <h1 className="text-3xl text-primary font-semibold mb-8 text-center">
    Création prospect  {client.name} {client.firstName}
  </h1>
  </header>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleClientCreation();
    }}
                    className="text-primary bg-custom-white mx-auto max-w-3xl  rounded p-5 border-2 border-primary"

  >
    <fieldset className="space-y-4">
      <legend className="sr-only">Informations prospect</legend>

      {[
        { label: 'Nom', name: 'name' },
        { label: 'Prénom', name: 'firstName' },
        { label: 'Mail', name: 'mail', type: 'email' },
        { label: 'Téléphone', name: 'phone' },
        { label: "Numéro d'adresse", name: 'addressNumber' },
        { label: 'Rue', name: 'road' },
        { label: "Complément d'adresse", name: 'additionalAddress' },
        { label: 'Code postal', name: 'postalCode' },
        { label: 'Ville', name: 'city' },
      ].map(({ label, name, type = 'text' }) => {
        const errorId = `error-${name}`;
        return (
          <div key={name}>
            <label
              htmlFor={name}
            >
              {label}
            </label>
            <Field className="w-full">
              <Input
                id={name}
                type={type}
                name={name}
                                            className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                aria-describedby={errors[name] ? errorId : undefined}
                onChange={handleInputChange}
              />
            </Field>
            {errors[name] && (
              <p id={errorId} className="text-sm text-red-500 mt-1">
                {errors[name]}
              </p>
            )}
          </div>
        );
      })}
    
    </fieldset>

    <Input type="hidden" name="csrf_token" value={csrfToken} />

    <div className="pt-4 flex justify-end">
      <button
        type="submit"
        className="bg-custom-white text-primary font-semibold px-6 py-2 rounded-md hover:bg-secondary hover:text-white transition"
      >
        Créer
      </button>
    </div>
  </form>
</>


    );
};
