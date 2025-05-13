"use client";

import { fetchClient } from "@/services/api/clientService";
import { faCircleInfo, faEnvelope, faFileInvoice, faFileLines, faHelmetSafety, faLocationDot, faPenToSquare, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Client = ({ params }: { params: Promise<{ clientSlug: string }> }) => {

    const [client, setClient] = useState<ClientType | null>(null);


    useEffect(() => {
        async function loadClient() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const { clientSlug } = resolvedParams;

            try {
                const data = await fetchClient(clientSlug)
                setClient(data.client);
            } catch (error) {
                console.error("Impossible to load the client :", error);
            }
        }

        loadClient();
    }, [params]);

    // if (!employee) return <div>Loading...</div>;




    return (
        // <>
        //     {/* <div><Toaster/></div> */}
        //     <h1 className="text-3xl text-white ml-3 text-center">{client?.name} {client?.firstName}</h1>
        //     {/* <div><Toaster /></div> */}
        //     <section>
        //         {/* Contact informations */}
        //         <h2>Coordonnées</h2>
        //         <div>
        //             <p>E-mail : {client?.mail}</p>
        //             <p>Téléphone : {client?.phone}</p>
        //         </div>
        //     </section>
        //     <section>
        //         {/* Address */}
        //         <h2>Adresse</h2>
        //         <div>
        //             <p>Numéro : {client?.addressNumber}</p>
        //             <p>Voie : {client?.road}</p>
        //             {/* Display "/" if the additionnalAddress is null or undefined */}
        //             <p>Complément d&apos;adresse : {client?.additionalAddress ?? '/'}</p>
        //             <p>Code postal : {client?.postalCode}</p>
        //             <p>Ville : {client?.city}</p>
        //         </div>
        //     </section>
        //     <section>
        //         {/* Specific details about the client : if he is a former prospect and if he is anonymized */}
        //         <h2>Détails</h2>
        //         <div>
        //             <p>Le client est-il anonymisé ? {client?.isPseudonymized ? "Oui": "Non"}</p>
        //             <p>
        //                 {/* If the client is a former prospect, we display his prospect number. If not, we display Non */}
        //                 Ancien prospect ? : {client?.prospect ? `Oui, numéro prospect : ${client?.prospect.prospectNumber}` : 'Non'}
        //             </p>
        //         </div>
        //     </section>
        //     <section>
        //         {/* WorkSites belonging to the client */}
        //         <h2>Chantiers</h2>
        //         {client?.workSites && client?.workSites.length > 0 ? (
        //             <ul>
        //                 {client?.workSites.map((workSite, index) => (
        //                     <li key={index}>
        //                         {workSite.title} - {workSite.status}
        //                     </li>
        //                 ))}
        //             </ul>
        //         ) : (
        //             <p>Pas encore de chantiers</p>
        //         )}
        //     </section>
        //     <section>
        //         {/* Quotes made for the client */}
        //         <h2>Devis</h2>
        //         {client?.quotes && client?.quotes.length > 0 ? (
        //             <ul>
        //                 {client?.quotes.map((quote, index) => (
        //                     <li key={index}>
        //                         {quote.number} 
        //                     </li>
        //                 ))}
        //             </ul>
        //         ) : (
        //             <p>Pas encore de devis effectués</p>
        //         )}
        //     </section>
        //     <section>
        //         {/* Bills made for the client */}
        //         <h2>Factures</h2>
        //         {client?.bills && client?.bills.length > 0 ? (
        //             <ul>
        //                 {client?.bills.map((bill, index) => (
        //                     <li key={index}>
        //                         {bill.number} 
        //                     </li>
        //                 ))}
        //             </ul>
        //         ) : (
        //             <p>Pas encore de factures effectuées</p>
        //         )}
        //     </section>
        // </>
        <>
            <article className="relative max-w-3xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-primary">{client?.name} {client?.firstName}</h1>
                    <button
                        //   onClick={onEdit}
                        aria-label="Modifier le client"
                        className="text-custom-gray hover:text-primary transition focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                    </button>
                </header>

                <section aria-labelledby="contact-info" className="mb-6">
                    <h2 id="contact-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-custom-gray" />Coordonnées
                    </h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt className="font-medium text-custom-gray">E-mail</dt>
                            <dd className="text-gray-900">{client?.mail}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-custom-gray">Téléphone</dt>
                            <dd className="text-gray-900">{client?.phone}</dd>
                        </div>
                    </dl>
                </section>

                <section aria-labelledby="address-info" className="mb-6">
                    <h2 id="address-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-custom-gray" />Adresse
                    </h2>
                    <address className="not-italic text-gray-900 space-y-1">
                        <div>Numéro : {client?.addressNumber}</div>
                        <div>Voie : {client?.road}</div>
                        <div>Complément : {client?.additionalAddress ?? '/'}</div>
                        <div>Code postal : {client?.postalCode}</div>
                        <div>Ville : {client?.city}</div>
                    </address>
                </section>

                <section aria-labelledby="details-info" className="mb-6">
                    <h2 id="details-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faCircleInfo} className="mr-2 text-custom-gray" />Détails
                    </h2>
                    <ul className="list-disc list-inside text-gray-900 space-y-1">
                        <li>Anonymisé : {client?.isPseudonymized ? 'Oui' : 'Non'}</li>
                        <li>Ancien prospect : {client?.prospect ? `Oui, n° ${client?.prospect.prospectNumber}` : 'Non'}</li>
                    </ul>
                </section>

                <section aria-labelledby="balances-info" className="mb-6">
                    <h2 id="balances-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faPiggyBank} className="mr-2 text-custom-gray" />Avoirs
                    </h2>
                    {/* <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {balances.map(({ label, amount }) => (
            <div key={label}>
              <dt className="font-medium text-custom-gray">{label}</dt>
              <dd className="text-gray-900">{amount} €</dd>
            </div>
          ))}
        </dl> */}
                </section>

                <section aria-labelledby="projects-info" className="mb-6">
                    <h2 id="projects-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faHelmetSafety} className="mr-2 text-custom-gray" />Chantiers
                    </h2>
                    {client?.workSites?.length ? (
                        <ul className="list-disc list-inside text-gray-900 space-y-1">
                            {client?.workSites.map((ws) => (
                                <li key={ws.id}>{ws.title} - {ws.status}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700">Pas encore de chantiers</p>
                    )}
                </section>

                <section aria-labelledby="quotes-info" className="mb-6">
                    <h2 id="quotes-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faFileLines} className="mr-2 text-custom-gray" />Devis
                    </h2>
                    {client?.quotes?.length ? (
                        <ul className="list-disc list-inside text-gray-900 space-y-1">
                            {client?.quotes.map((q) => (
                                <li key={q.id}>{q.number}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700">Pas encore de devis effectués</p>
                    )}
                </section>

                <section aria-labelledby="bills-info" className="mb-8">
                    <h2 id="bills-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faFileInvoice} className="mr-2 text-custom-gray" />Factures
                    </h2>
                    {client?.bills?.length ? (
                        <ul className="list-disc list-inside text-gray-900 space-y-1">
                            {client?.bills.map((b) => (
                                <li key={b.id}>{b.number}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700">Pas encore de factures effectuées</p>
                    )}
                </section>

                <div className="text-center">
                    <button
                        //   onClick={handleDeletePersonalData}
                        className="bg-secondary text-custom-gray font-semibold px-6 py-2 rounded-md hover:bg-secondary/90 transition"
                    >
                        Supprimer les données personnelles
                    </button>
                </div>
            </article>
        </>

    );
};

export default Client;
