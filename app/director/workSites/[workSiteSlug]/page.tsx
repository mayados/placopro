"use client";

import { useEffect, useState, use } from "react";
import { formatDate } from '@/lib/utils'
import { fetchWorkSite } from "@/services/api/workSiteService";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const WorkSite = ({ params }: { params: Promise<{ workSiteSlug: string }>}) => {

    const [workSite, setWorkSite] = useState<WorkSiteType | null>(null);

    
        useEffect(() => {
            async function loadWorkSite() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const workSiteSlug = resolvedParams.workSiteSlug;
          
            try{
                const data = await fetchWorkSite(workSiteSlug)
                setWorkSite(data.workSite);

            }catch (error) {
                    console.error("Impossible to load the workSite :", error);
                }
            }
      
          loadWorkSite();

        }, [params]);
      
        if (!workSite) return <div>Loading...</div>;
      

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">{workSite.title}</h1>
            {/* <div><Toaster /></div> */}
            {/* General Informations */}
            <section>
                <h2>Informations générales</h2>
                <p>status : {workSite.status}</p>
                <p>Date de début : {formatDate(workSite.beginsThe)}</p>
                <p>Terminé le : 
                {workSite.completionDate === null
                    ? <span>non définie</span> 
                    : <span>{formatDate(workSite.completionDate)}</span>
                }
                </p>
                {/* Display others informations about client if necessary */}
                <p>Client : {workSite.client.name} {workSite.client.firstName}</p>
            </section>
            {/*  Address informations */}
            <section>
                <h2>Adresse</h2>
                <p>Numéro : {workSite.addressNumber}</p>
                <p>Voie : </p>
                <p>Complément d'adresse : 
                {workSite.additionnalAddress === undefined
                    ? <span>/</span> 
                    : <span>{workSite.additionnalAddress}</span>
                }
                </p>
                <p>Code postal : {workSite.postalCode}</p>
                <p>Ville : {workSite.city}</p>
            </section>
            {/* Quotes */}
            <section>

            </section>
            {/* Plannings */}
            <section>

            </section>
        </>
    );
};

export default WorkSite;
