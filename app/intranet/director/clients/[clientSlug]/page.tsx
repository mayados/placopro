"use client";

import { fetchClient } from "@/services/api/clientService";
import { faCircleInfo, faFileInvoice, faFileLines, faHelmetSafety, faPenToSquare, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
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




    return (
        <>
            <article className="relative max-w-3xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-primary">{client?.clientNumber}</h1>
                    <button
                        //   onClick={onEdit}
                        aria-label="Modifier le client"
                        className="text-custom-gray hover:text-primary transition focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                    </button>
                </header>


                <section aria-labelledby="details-info" className="mb-6">
                    <h2 id="details-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faCircleInfo} className="mr-2 text-custom-gray" />Détails
                    </h2>
                    <ul className="list-disc list-inside text-gray-900 space-y-1">
                        <li>Pseudonymisé : {client?.isPseudonymized ? 'Oui' : 'Non'}</li>
                    </ul>
                </section>

                <section aria-labelledby="balances-info" className="mb-6">
                    <h2 id="balances-info" className="text-2xl font-semibold text-custom-gray mb-2">
                        <FontAwesomeIcon icon={faPiggyBank} className="mr-2 text-custom-gray" />Avoirs
                    </h2>
 
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

            </article>
        </>

    );
};

export default Client;
