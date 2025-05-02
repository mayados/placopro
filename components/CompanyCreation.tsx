"use client";

import { useState } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { createCompany } from "@/services/api/companyService";
// import toast, { Toaster } from 'react-hot-toast';
import { createCompanySchema } from "@/validation/companyValidation";


type CompanyCreationProps = {
    csrfToken: string;
  };

export default function CompanyCreation({csrfToken}: CompanyCreationProps){

    const [company, setCompany] = useState<CompanyFormValueType>({
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
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    
      

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setCompany({
            ...company,
            [name]: value,
        });
          
    };

        const handleCompanyCreation = async () => {
            try{
            // Validation des données du formulaire en fonction du statut
            const validationResult = createCompanySchema.safeParse(company);

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
    
                const newCompany = await createCompany(company, csrfToken);
    
                try {
                    // We redirect to the companies' list
                    router.push(`/director/companies/${newCompany.slug}`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }catch (error) {
                console.error("Erreur lors de la création de l'entreprise :", error);
                // toast.error("There was a problem with updating the client. Please try again!");
            }
    
        };

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création d&apos;entreprise : {company?.name}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCompanyCreation();
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
                    {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

                </div>
                {/* type of company */}
                <div>
                    <label htmlFor="type">Type d&apos;entreprise</label>
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
                    {errors.type && <p style={{ color: "red" }}>{errors.type}</p>}

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
                {/* mail */}
                <div>
                    <label htmlFor="email">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="email" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

                </div>
                {/* Company's capital */}
                <div>
                    <label htmlFor="capital">Capital de l&pos;entreprise en € </label>
                    <Field className="w-full">
                        <Input type="number" name="capital" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.capital && <p style={{ color: "red" }}>{errors.capital}</p>}

                </div>
                {/* Company's RCS */}
                <div>
                    <label htmlFor="rcs">RCS de l&apos;entreprise : ville d&apos;immatriculation + numéro SIREN.</label>
                    <Field className="w-full">
                        <Input type="text" name="rcs" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.rcs && <p style={{ color: "red" }}>{errors.rcs}</p>}

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
                    {errors.siret && <p style={{ color: "red" }}>{errors.siret}</p>}

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
                    {errors.ape && <p style={{ color: "red" }}>{errors.ape}</p>}

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
                    {errors.intraCommunityVat && <p style={{ color: "red" }}>{errors.intraCommunityVat}</p>}

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
                    {errors.addressNumber && <p style={{ color: "red" }}>{errors.addressNumber}</p>}

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
                    {errors.road && <p style={{ color: "red" }}>{errors.road}</p>}

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
                    {errors.additionnalAddress && <p style={{ color: "red" }}>{errors.additionalAddress}</p>}

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
                    {errors.postalCode && <p style={{ color: "red" }}>{errors.postalCode}</p>}

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
                    {errors.city && <p style={{ color: "red" }}>{errors.city}</p>}

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
                    {errors.insuranceName && <p style={{ color: "red" }}>{errors.insuranceName}</p>}

                </div>
                {/* Insurance contract number */}
                <div>
                    <label htmlFor="insuranceContractNumber">Numéro de contrat de l&apos;assurance décennale</label>
                    <Field className="w-full">
                        <Input type="text" name="insuranceContractNumber" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.insuranceContractNumber && <p style={{ color: "red" }}>{errors.insuranceContractNumber}</p>}

                </div>
                {/* Aera covered by insurance */}
                <div>
                    <label htmlFor="insuranceCoveredZone">Zone couverte par l&apos;assurance décennale</label>
                    <Field className="w-full">
                        <Input type="text" name="insuranceCoveredZone" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.insuranceCoveredZone && <p style={{ color: "red" }}>{errors.insuranceCoveredZone}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />
                
                <button type="submit">Créer</button>
            </form>
        </>
    );
};

