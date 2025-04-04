"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { fetchCompany, updateCompany } from "@/services/api/companyService";
// import toast, { Toaster } from 'react-hot-toast';
import { updateCompanySchema } from "@/validation/companyValidation";


const modifyCompany = ({ params }: { params: Promise<{ companySlug: string }>}) => {

    const [company, setCompany] = useState<CompanyType | null>(null);
    // Define options for select
    const typeChoices = ["PME","SAS","TPE","SARL"];
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    
      

    useEffect(() => {
        async function loadCompany() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const companySlug = resolvedParams.companySlug;
                    
            try{
            const data = await fetchCompany(companySlug)
            setCompany(data.company);
            }catch (error) {
                console.error("Impossible to load the company :", error);
            }
        }
                
          loadCompany();
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

  const handleCompanyUpdate = async () => {

        try{

            // Validation des données du formulaire en fonction du statut
            const validationResult = updateCompanySchema.safeParse(company);
            
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

            const data = await updateCompany(company)
            const updatedCompany = data;
            setCompany(updatedCompany);
            console.log("updated company :"+updatedCompany.slug)
            // toast.success("Recipe updated successfully !");
            try {
                // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                router.push(`/director/companies/${updatedCompany.slug}/update`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            console.error("Impossible to update the company :", error);
        }
    }

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification de l'entreprise : {company?.name}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCompanyUpdate();
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
                    {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

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
                    {errors.type && <p style={{ color: "red" }}>{errors.type}</p>}

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
                    {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

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
                    {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

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
                    {errors.capital && <p style={{ color: "red" }}>{errors.capital}</p>}

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
                    {errors.rcs && <p style={{ color: "red" }}>{errors.rcs}</p>}

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
                    {errors.siret && <p style={{ color: "red" }}>{errors.siret}</p>}

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
                    {errors.ape && <p style={{ color: "red" }}>{errors.ape}</p>}

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
                    {errors.intraCommunityVat && <p style={{ color: "red" }}>{errors.intraCommunityVat}</p>}

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
                    {errors.addressNumber && <p style={{ color: "red" }}>{errors.addressNumber}</p>}

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
                    {errors.road && <p style={{ color: "red" }}>{errors.road}</p>}

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
                    {errors.additionnalAddress && <p style={{ color: "red" }}>{errors.additionalAddress}</p>}

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
                    {errors.postalCode && <p style={{ color: "red" }}>{errors.postalCode}</p>}

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
                    {errors.city && <p style={{ color: "red" }}>{errors.city}</p>}

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
                    {errors.insuranceName && <p style={{ color: "red" }}>{errors.insuranceName}</p>}

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
                    {errors.insuranceContractNumber && <p style={{ color: "red" }}>{errors.insuranceContractNumber}</p>}

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
                    {errors.insuranceCoveredZone && <p style={{ color: "red" }}>{errors.insuranceCoveredZone}</p>}

                </div>
                <button type="submit">Modifier</button>
            </form>
        </>
    );
};

export default modifyCompany;
