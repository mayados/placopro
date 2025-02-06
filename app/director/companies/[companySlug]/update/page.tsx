"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';

const modifyCompany = ({ params }: { params: Promise<{ companySlug: string }>}) => {

    const [company, setCompany] = useState<CompanyType | null>(null);
    // Define options for select
    const typeChoices = ["PME","SAS","TPE","SARL"];
    const router = useRouter();
      

    useEffect(() => {
        async function fetchCompany() {
          // Params is now asynchronous. It's a Promise
          // So we need to await before access its properties
          const resolvedParams = await params;
          const companySlug = resolvedParams.companySlug;
    
          const response = await fetch(`/api/companies/${companySlug}`);
          const data: CompanyTypeSingle = await response.json();
          setCompany(data.company);
        }
    
        fetchCompany();
  }, [params]);
    
  if (!company) return <div>Chargement des détails de l'entreprise...</div>;


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
          
        setCompany((prev) => {
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
            console.log("Nom de l entreprise : "+company.name)

            const response = await fetch(`/api//companies/${company.slug}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(company),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data)
                const updatedCompany = data.updatedCompany;
                setCompany(updatedCompany);
                console.log("updated entreprise :"+updatedCompany.slug)
                // toast.success("Recipe updated successfully !");
                try {
                    // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                    router.push(`/director/companies/${updatedCompany.slug}/update`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la modification de l'entreprise :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
        }

    };


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification de l'entreprise : {company?.name}</h1>
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
                            value={company.name}
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
                        value={company.type}
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
                            value={company.phone}                           
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
                            value={company.mail}                            
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
                            value={company.capital}
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
                            value={company.rcs}
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
                            value={company.siret}
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
                            value={company.ape}
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
                            value={company.intraCommunityVat}
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
                            value={company.addressNumber}
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
                            value={company.road}
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
                            value={company?.additionnalAddress || ""}
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
                            value={company.postalCode}
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
                            value={company.city}
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
                            value={company.decennialInsuranceName}
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
                            value={company.insuranceContractNumber}
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
                            value={company.aeraCoveredByInsurance}
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

export default modifyCompany;
