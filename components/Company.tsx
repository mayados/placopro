"use client";

import { fetchCompany } from "@/services/api/companyService";
import { faCircleInfo, faEnvelope, faLocationDot, faPenToSquare, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

type CompanyProps = {
  csrfToken: string;
};

export default function Company({csrfToken }: CompanyProps) {

    const [company, setCompany] = useState<CompanyType | null>(null);

    
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
        }, [csrfToken]);
      
        // if (!company) return <div>Loading...</div>;
      
      


    return (
<>
  <article className="relative max-w-3xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md">
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-primary">{company?.name}</h1>

<Link
  href={`/intranet/director/companies/${company?.slug}/update`}

aria-label="Modifier la société"
  className="inline-flex items-center text-custom-gray hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary rounded"
>
  <FontAwesomeIcon icon={faPenToSquare} size="lg" />
</Link>

    </header>

    {/* Coordonnées */}
    <section aria-labelledby="company-contact-info" className="mb-6">
      <h2 id="company-contact-info" className="text-2xl font-semibold text-custom-gray mb-2">
        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-custom-gray" />
        Coordonnées
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <dt className="font-medium text-custom-gray">Téléphone</dt>
          <dd className="text-gray-900">{company?.phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">E-mail</dt>
          <dd className="text-gray-900">{company?.mail}</dd>
        </div>
      </dl>
    </section>

    {/* Adresse */}
    <section aria-labelledby="company-address-info" className="mb-6">
      <h2 id="company-address-info" className="text-2xl font-semibold text-custom-gray mb-2">
        <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-custom-gray" />
        Adresse
      </h2>
      <address className="not-italic text-gray-900 space-y-1">
        <div>Numéro : {company?.addressNumber}</div>
        <div>Voie : {company?.road}</div>
        <div>Complément : {company?.additionnalAddress ?? '/'}</div>
        <div>Code postal : {company?.postalCode}</div>
        <div>Ville : {company?.city}</div>
      </address>
    </section>

    {/* Informations juridiques */}
    <section aria-labelledby="company-legal-info" className="mb-6">
      <h2 id="company-legal-info" className="text-2xl font-semibold text-custom-gray mb-2">
        <FontAwesomeIcon icon={faCircleInfo} className="mr-2 text-custom-gray" />
        Informations légales
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-900">
        <div>
          <dt className="font-medium text-custom-gray">Type</dt>
          <dd>{company?.type}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">Capital</dt>
          <dd>{company?.capital}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">RCS</dt>
          <dd>{company?.rcs}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">SIRET</dt>
          <dd>{company?.siret}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">Code APE</dt>
          <dd>{company?.ape}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">TVA intracommunautaire</dt>
          <dd>{company?.intraCommunityVat}</dd>
        </div>
      </dl>
    </section>

    {/* Assurance décennale */}
    <section aria-labelledby="company-insurance-info" className="mb-8">
      <h2 id="company-insurance-info" className="text-2xl font-semibold text-custom-gray mb-2">
        <FontAwesomeIcon icon={faShieldHalved} className="mr-2 text-custom-gray" />
        Assurance décennale
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-900">
        <div>
          <dt className="font-medium text-custom-gray">Assureur</dt>
          <dd>{company?.decennialInsuranceName}</dd>
        </div>
        <div>
          <dt className="font-medium text-custom-gray">N° de contrat</dt>
          <dd>{company?.insuranceContractNumber}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-custom-gray">Zone couverte</dt>
          <dd>{company?.aeraCoveredByInsurance}</dd>
        </div>
      </dl>
    </section>
  </article>
</>

    );
};

