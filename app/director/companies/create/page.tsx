"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';

const createCompany = () => {

    const [company, setCompany] = useState({
        name: "",
        type: "",
        phone:"",
        email: "",
        capital: "",
        rcs: "",
        siret: "",
        ape: "",
        intraCommunityVat: "",
        addressNumber: "",
        road: "",
        additionnalAddress: "",
        postalCode: "",
        city: "",
        insuranceName: "",
        insuranceContractNumber: "",
        insuranceCoveredZone: "",
    })
    // Define options for select
    const typeChoices = ["PME","SAS","TPE","SARL"];
    const router = useRouter();
      

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setCompany({
            ...company,
            [name]: value,
        });
          
    };


    const handleSubmit = async () => {
        try{
            console.log("Nom de l entreprise : "+company.name)

            const response = await fetch(`/api/director/companies/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(company),
            });
            if (response.ok) {
                try {
                    // We redirect to the companies' list
                    router.push(`/director/companies`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la création de l'entreprise :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
        }

    };


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création d'entreprise : {company?.name}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {/* Company name */}
                <div>
                    <label htmlFor="name">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="name" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* type of company */}
                <div>
                    <label htmlFor="type">Type d'entreprise</label>
                    <Select
                        name="type"
                        // value={employee.role}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Sélectionnez un type</option>
                        {typeChoices.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>
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
                {/* mail */}
                <div>
                    <label htmlFor="email">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="email" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Company's capital */}
                <div>
                    <label htmlFor="capital">Capital de l'entreprise en € </label>
                    <Field className="w-full">
                        <Input type="number" name="capital" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Company's RCS */}
                <div>
                    <label htmlFor="rcs">RCS de l'entreprise : ville d'immatriculation + numéro SIREN.</label>
                    <Field className="w-full">
                        <Input type="text" name="rcs" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* SIRET number */}
                <div>
                    <label htmlFor="siret">Numéro SIRET</label>
                    <Field className="w-full">
                        <Input type="text" name="siret" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* APE code */}
                <div>
                    <label htmlFor="ape">code APE</label>
                    <Field className="w-full">
                        <Input type="text" name="ape" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Intra community VAT */}
                <div>
                    <label htmlFor="intraCommunityVat">Tva intracommunautaire</label>
                    <Field className="w-full">
                        <Input type="text" name="intraCommunityVat" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Address number */}
                <div>
                    <label htmlFor="addressNumber">Numéro de voie</label>
                    <Field className="w-full">
                        <Input type="text" name="addressNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Company's road */}
                <div>
                    <label htmlFor="road">Nom de rue</label>
                    <Field className="w-full">
                        <Input type="text" name="road" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Additionnal address */}
                <div>
                    <label htmlFor="additionnalAddress">Adresse additionnelle</label>
                    <Field className="w-full">
                        <Input type="text" name="additionnalAddress" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Company's postal code */}
                <div>
                    <label htmlFor="postalCode">Code postal</label>
                    <Field className="w-full">
                        <Input type="text" name="postalCode" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Company's city */}
                <div>
                    <label htmlFor="city">Ville</label>
                    <Field className="w-full">
                        <Input type="text" name="city" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Decennial insurance name */}
                <div>
                    <label htmlFor="insuranceName">Assurance décennale</label>
                    <Field className="w-full">
                        <Input type="text" name="insuranceName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Insurance contract number */}
                <div>
                    <label htmlFor="insuranceContractNumber">Numéro de contrat de l'assurance décennale</label>
                    <Field className="w-full">
                        <Input type="text" name="insuranceContractNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* Aera covered by insurance */}
                <div>
                    <label htmlFor="insuranceCoveredZone">Zone couverte par l'assurance décennale</label>
                    <Field className="w-full">
                        <Input type="text" name="insuranceCoveredZone" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
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

export default createCompany;
