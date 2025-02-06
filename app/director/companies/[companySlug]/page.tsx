"use client";

import { useEffect, useState, use } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Company = ({ params }: { params: Promise<{ companySlug: string }>}) => {

    const [company, setCompany] = useState<CompanyType | null>(null);

    
        useEffect(() => {
          async function fetchCompany() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const companySlug = resolvedParams.companySlug;
      
            const response = await fetch(`/api//companies/${companySlug}`);
            const data: CompanyTypeSingle = await response.json();
            setCompany(data.company);
          }
      
          fetchCompany();
        }, [params]);
      
        // if (!company) return <div>Loading...</div>;
      
      


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">{company?.name}</h1>
            {/* <div><Toaster /></div> */}
            {/* Contact informations section */}
            <section>
              <p>{company?.phone}</p>
              <p>{company?.mail}</p>
              <p>{company?.addressNumber}</p>
              <p>{company?.road}</p>
              <p>{company?.additionnalAddress}</p>
              <p>{company?.postalCode}</p>
              <p>{company?.city}</p>
            </section>
            {/* Informations about the structure */}
            <section>
              <p>{company?.type}</p>
              <p>{company?.capital}</p>
              <p>{company?.rcs}</p>
              <p>{company?.siret}</p>
              <p>{company?.ape}</p>
              <p>{company?.intraCommunityVat}</p>
            </section>
            {/* About decennial insurance */}
            <section>
              <p>{company?.decennialInsuranceName}</p>
              <p>{company?.insuranceContractNumber}</p>
              <p>{company?.aeraCoveredByInsurance}</p>
            </section>
        </>
    );
};

export default Company;
