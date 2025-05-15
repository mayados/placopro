"use client";

import Image from "next/image";
import PlanningEmployee from "./PlanningEmployee";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faHardHat,
//   faUsers,
//   faDatabase,
// } from "@fortawesome/free-solid-svg-icons";

type EmployeeDashboardDatas = {
  workSites: [],
  plannings: []
};

interface EmployeeDashboardProps {
  datas: EmployeeDashboardDatas;
}

export default function DirectorDashboard({
  datas,
}: EmployeeDashboardProps) {
  const {
    workSites,
    plannings
  } = datas;

  console.log(workSites)
  console.log(plannings)

  return (
    <div className="p-4 space-y-12">
      {/* Titre de page */}
      <h1 className="text-2xl font-bold text-primary text-center">
        Bienvenue sur votre tableau de bord
      </h1>

      {/* Interventions en cours */}
      <section
        aria-labelledby="interventions-title"
        className="space-y-4"
      >
        <h2 id="interventions-title" className="text-xl font-semibold text-primary">
          Mes interventions en cours
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
          {workSites.map((workSite: WorkSiteType) => (
            <article key={workSite.slug} className="bg-secondary rounded-lg overflow-hidden shadow-md">
              <div className="h-32 w-full relative">
                <Image
                  src="/images/plasterer_home.webp"
                  alt="image chantier"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              {/* Contenu de la carte */}
              <div className="p-4 text-center">
                <p className="text-lg font-semibold">{workSite.title}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {workSite.city} ({workSite.postalCode})
                </p>
                <p className="text-sm mt-2 line-clamp-2">
                  {workSite.description || "Aucune description"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Planning de la semaine */}
      <section
        aria-labelledby="planning-title"
        className="space-y-4"
      >
        <h2 id="planning-title" className="text-xl font-semibold text-primary">
          Planning de la semaine
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-black">
          <div className="col-span-full">
            <PlanningEmployee events={plannings} />
          </div>
        </div>
      </section>
    </div>
  );
}
