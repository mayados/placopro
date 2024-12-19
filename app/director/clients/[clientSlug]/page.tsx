"use client";

import { useEffect, useState, use } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Client = ({ params }: { params: Promise<{ clientSlug: string }>}) => {

    const [client, setClient] = useState<ClientType | null>(null);

    
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
      
        // if (!employee) return <div>Loading...</div>;
      
      


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">{client?.name} {client?.firstName}</h1>
            {/* <div><Toaster /></div> */}
            <section>
                {/* Contact informations */}
                <h2>Coordonnées</h2>
                <div>
                    <p>E-mail : {client?.mail}</p>
                    <p>Téléphone : {client?.phone}</p>
                </div>
            </section>
            <section>
                {/* Address */}
                <h2>Adresse</h2>
                <div>
                    <p>Numéro : {client?.addressNumber}</p>
                    <p>Voie : {client?.road}</p>
                    {/* Display "/" if the additionnalAddress is null or undefined */}
                    <p>Complément d'adresse : {client?.additionalAddress ?? '/'}</p>
                    <p>Code postal : {client?.postalCode}</p>
                    <p>Ville : {client?.city}</p>
                </div>
            </section>
            <section>
                {/* Specific details about the client : if he is a former prospect and if he is anonymized */}
                <h2>Détails</h2>
                <div>
                    <p>Le client est-il anonymisé ? {client?.isAnonymized ? "Oui": "Non"}</p>
                    <p>
                        {/* If the client is a former prospect, we display his prospect number. If not, we display Non */}
                        Ancien prospect ? : {client?.prospect ? `Oui, numéro prospect : ${client.prospect.prospectNumber}` : 'Non'}
                    </p>
                </div>
            </section>
            <section>
                {/* WorkSites belonging to the client */}
                <h2>Chantiers</h2>
                {client?.workSites && client.workSites.length > 0 ? (
                    <ul>
                        {client.workSites.map((workSite, index) => (
                            <li key={index}>
                                {workSite.title} - {workSite.status}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Pas encore de chantiers</p>
                )}
            </section>
            <section>
                {/* Quotes made for the client */}
                <h2>Devis</h2>
                {client?.quotes && client.quotes.length > 0 ? (
                    <ul>
                        {client.quotes.map((quote, index) => (
                            <li key={index}>
                                {quote.number} 
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Pas encore de devis effectués</p>
                )}
            </section>
            <section>
                {/* Bills made for the client */}
                <h2>Factures</h2>
                {client?.bills && client.bills.length > 0 ? (
                    <ul>
                        {client.bills.map((bill, index) => (
                            <li key={index}>
                                {bill.number} 
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Pas encore de factures effectuées</p>
                )}
            </section>
        </>
    );
};

export default Client;
