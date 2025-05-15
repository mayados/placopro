"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHardHat,
  faUsers,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

type SecretaryDashboardDatas = {
  toDos: number;
  bills: number;
  quotes: number;
  quotesRealized: number;
  clients: number;
  billsRealized: number;
};

interface SecretaryDashboardProps {
  datas: SecretaryDashboardDatas;
}

export default function DirectorDashboard({
  datas,
}: SecretaryDashboardProps) {
  const {
    toDos,
    bills,
    quotes,
    quotesRealized,
    clients,
    billsRealized,
  } = datas;

  return (
    <div className="p-4 space-y-12">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-primary text-center">
        Tableau de bord secrétaire
      </h1>

      {/* Aperçu cards */}
      <section
        aria-labelledby="overview-title"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-black"
      >
        <h2 id="overview-title" className="sr-only">
          Aperçu des éléments clés
        </h2>

        <article className="bg-secondary p-6 rounded-lg text-center">
          <p className="text-3xl font-semibold">{toDos}</p>
          <p className="mt-1">Tâches à effectuer</p>
        </article>

        <article className="bg-secondary p-6 rounded-lg text-center">

          <p className="text-3xl font-semibold">{bills}</p>
          <p className="mt-1">Factures brouillon</p>
        </article>

        <article className="bg-secondary p-6 rounded-lg text-center">

          <p className="text-3xl font-semibold">{quotes}</p>
          <p className="mt-1">Devis brouillon</p>
        </article>

        <article className="bg-secondary p-6 rounded-lg text-center">
          <p className="text-3xl font-semibold">{clients}</p>
          <p className="mt-1">Clients enregistrés</p>
        </article>
      </section>

      {/* datas */}
      <section aria-labelledby="data-title" className="space-y-6">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faDatabase}
            className="w-5 h-5 text-primary"
          />
          <h2 id="data-title" className="text-xl font-semibold text-primary">
            Données
          </h2>
        </div>

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 text-primary">
          <article className=" p-6 rounded-lg text-center">
            <FontAwesomeIcon
              icon={faHardHat}
              className="mx-auto w-6 h-6 mb-2"
            />
            <p className="text-2xl font-semibold">{quotesRealized}</p>
            <p className="mt-1">Devis réalisés</p>
          </article>

          <article className=" p-6 rounded-lg text-center">
            <FontAwesomeIcon icon={faUser} className="mx-auto w-6 h-6 mb-2" />
            <p className="text-2xl font-semibold">{clients}</p>
            <p className="mt-1">Clients</p>
          </article>
          <article className=" p-6 rounded-lg text-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="mx-auto w-6 h-6 mb-2"
            />
            <p className="text-2xl font-semibold">{billsRealized}</p>
            <p className="mt-1">Factures réalisées</p>
          </article>
        </div>
      </section>

    </div>
  );
}
