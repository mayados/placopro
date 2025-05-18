"use client";

import { useEffect, useState } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { fetchCompany, updateCompany } from "@/services/api/companyService";
import { toast } from 'react-hot-toast';
import { updateCompanySchema } from "@/validation/companyValidation";



type ModifyCompanyProps = {
    csrfToken: string;
    companySlug: string;
  };

export default function ModifyCompany({csrfToken, companySlug}: ModifyCompanyProps){

    const [company, setCompany] = useState<CompanyType | null>(null);
    // Define options for select
    const typeChoices = ["PME","SAS","TPE","SARL"];
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    
      

    useEffect(() => {
        async function loadCompany() {
                    
            try{
            const data = await fetchCompany()
            setCompany(data);
            }catch (error) {
                console.error("Impossible to load the company :", error);
            }
        }
                
          loadCompany();
  }, [companySlug, csrfToken]);
    
  if (!company) return <div>Chargement des détails de l&apos;entreprise...</div>;


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

            const data = await updateCompany(company, csrfToken)
            const updatedCompany = data;
            setCompany(updatedCompany);
            console.log("updated company :"+updatedCompany.slug)
            toast.success("Entreprise mise à jour ave succès !");
            try {
                // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                router.push(`/director/companies/${updatedCompany.slug}/update`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.error("Impossible de metre à jour l'entreprise");
            console.error("Impossible to update the company :", error);
        }
    }

    return (
<>
  <header className="text-center my-6">
    <h1 className="text-4xl font-bold text-primary">Modification de l&apos;entreprise : {company?.name}</h1>
  </header>
  <form
    autoComplete="off"
    onSubmit={(e) => {
      e.preventDefault();
      handleCompanyUpdate();
    }}
    className="max-w-3xl mx-auto bg-custom-white border-4 border-primary rounded-lg p-8 shadow-md"
  >
    {/* Company name */}
    <div className="mb-6">
      <label htmlFor="name" className="block mb-2 font-semibold text-primary">Nom</label>
      <Field>
        <Input
          type="text"
          name="name"
          value={company.name}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
    </div>

    {/* Type of company */}
    <div className="mb-6">
      <label htmlFor="type" className="block mb-2 font-semibold text-primary">Type d&apos;entreprise</label>
      <Select
        name="type"
        value={company.type}
        onChange={handleInputChange}
        className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Sélectionnez un type</option>
        {typeChoices.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </Select>
      {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
    </div>

    {/* Phone */}
    <div className="mb-6">
      <label htmlFor="phone" className="block mb-2 font-semibold text-primary">Téléphone</label>
      <Field>
        <Input
          type="text"
          name="phone"
          value={company.phone}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
    </div>

    {/* Mail */}
    <div className="mb-6">
      <label htmlFor="email" className="block mb-2 font-semibold text-primary">Mail</label>
      <Field>
        <Input
          type="email"
          name="email"
          value={company.mail}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
    </div>

    {/* Capital */}
    <div className="mb-6">
      <label htmlFor="capital" className="block mb-2 font-semibold text-primary">Capital de l&apos;entreprise en €</label>
      <Field>
        <Input
          type="number"
          name="capital"
          value={company.capital}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.capital && <p className="mt-1 text-sm text-red-600">{errors.capital}</p>}
    </div>

    {/* RCS */}
    <div className="mb-6">
      <label htmlFor="rcs" className="block mb-2 font-semibold text-primary">RCS de l&apos;entreprise : ville d&apos;immatriculation + numéro SIREN.</label>
      <Field>
        <Input
          type="text"
          name="rcs"
          value={company.rcs}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.rcs && <p className="mt-1 text-sm text-red-600">{errors.rcs}</p>}
    </div>

    {/* SIRET */}
    <div className="mb-6">
      <label htmlFor="siret" className="block mb-2 font-semibold text-primary">Numéro SIRET</label>
      <Field>
        <Input
          type="text"
          name="siret"
          value={company.siret}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.siret && <p className="mt-1 text-sm text-red-600">{errors.siret}</p>}
    </div>

    {/* APE */}
    <div className="mb-6">
      <label htmlFor="ape" className="block mb-2 font-semibold text-primary">code APE</label>
      <Field>
        <Input
          type="text"
          name="ape"
          value={company.ape}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.ape && <p className="mt-1 text-sm text-red-600">{errors.ape}</p>}
    </div>

    {/* TVA intracommunautaire */}
    <div className="mb-6">
      <label htmlFor="intraCommunityVat" className="block mb-2 font-semibold text-primary">Tva intracommunautaire</label>
      <Field>
        <Input
          type="text"
          name="intraCommunityVat"
          value={company.intraCommunityVat}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.intraCommunityVat && <p className="mt-1 text-sm text-red-600">{errors.intraCommunityVat}</p>}
    </div>

    {/* Address Number */}
    <div className="mb-6">
      <label htmlFor="addressNumber" className="block mb-2 font-semibold text-primary">Numéro de voie</label>
      <Field>
        <Input
          type="text"
          name="addressNumber"
          value={company.addressNumber}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.addressNumber && <p className="mt-1 text-sm text-red-600">{errors.addressNumber}</p>}
    </div>

    {/* Road */}
    <div className="mb-6">
      <label htmlFor="road" className="block mb-2 font-semibold text-primary">Nom de rue</label>
      <Field>
        <Input
          type="text"
          name="road"
          value={company.road}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.road && <p className="mt-1 text-sm text-red-600">{errors.road}</p>}
    </div>

    {/* Additional address */}
    <div className="mb-6">
      <label htmlFor="additionnalAddress" className="block mb-2 font-semibold text-primary">Adresse additionnelle</label>
      <Field>
        <Input
          type="text"
          name="additionnalAddress"
          value={company?.additionnalAddress || ""}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.additionnalAddress && <p className="mt-1 text-sm text-red-600">{errors.additionnalAddress}</p>}
    </div>

    {/* Postal Code */}
    <div className="mb-6">
      <label htmlFor="postalCode" className="block mb-2 font-semibold text-primary">Code postal</label>
      <Field>
        <Input
          type="text"
          name="postalCode"
          value={company.postalCode}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
    </div>

    {/* City */}
    <div className="mb-6">
      <label htmlFor="city" className="block mb-2 font-semibold text-primary">Ville</label>
      <Field>
        <Input
          type="text"
          name="city"
          value={company.city}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
    </div>

    {/* Insurance name */}
    <div className="mb-6">
      <label htmlFor="insuranceName" className="block mb-2 font-semibold text-primary">Assurance décennale</label>
      <Field>
        <Input
          type="text"
          name="insuranceName"
          value={company.decennialInsuranceName}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.insuranceName && <p className="mt-1 text-sm text-red-600">{errors.insuranceName}</p>}
    </div>

    {/* Insurance contract number */}
    <div className="mb-6">
      <label htmlFor="insuranceContractNumber" className="block mb-2 font-semibold text-primary">Numéro de contrat de l&apos;assurance décennale</label>
      <Field>
        <Input
          type="text"
          name="insuranceContractNumber"
          value={company.insuranceContractNumber}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.insuranceContractNumber && <p className="mt-1 text-sm text-red-600">{errors.insuranceContractNumber}</p>}
    </div>

    {/* Insurance covered zone */}
    <div className="mb-6">
      <label htmlFor="insuranceCoveredZone" className="block mb-2 font-semibold text-primary">Zone couverte par l&apos;assurance décennale</label>
      <Field>
        <Input
          type="text"
          name="insuranceCoveredZone"
          value={company.aeraCoveredByInsurance}
          onChange={handleInputChange}
          className="w-full border border-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Field>
      {errors.insuranceCoveredZone && <p className="mt-1 text-sm text-red-600">{errors.insuranceCoveredZone}</p>}
    </div>

    <Input type="hidden" name="csrf_token" value={csrfToken} />

    <button
      type="submit"
      className="w-full bg-primary text-custom-white font-bold py-3 rounded-md hover:bg-primary-dark transition-colors"
    >
      Modifier
    </button>
  </form>
</>


    );
};
