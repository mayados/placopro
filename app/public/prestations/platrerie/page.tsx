// app/platrerie/page.tsx (ou pages/platrerie.tsx selon Next.js version)

import { Metadata } from 'next';
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Placopro • Plâtrerie',
  description: 'Bienvenue sur Placopro, services de plâtrerie sur strasbourg et vallée de la Bruche.',
};

export default function PlatreriePage() {
  return (
    <div className="bg-custom-white text-primary">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center text-white px-6"
        style={{ backgroundImage: 'url(/images/trowel.webp)' }}>
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos prestations en plâtrerie</h1>
          <p className="text-lg md:text-xl">
            Cloisons, faux plafonds, isolation thermique et phonique : nous façonnons vos espaces avec précision.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Un savoir-faire reconnu</h2>
            <p className="mb-4">
              Notre entreprise met à votre disposition une équipe de plaquistes expérimentés pour tous vos travaux de plâtrerie : création de cloisons, doublages, faux plafonds, gaines techniques, travaux d’isolation...
            </p>
            <p>
              Grâce à notre expertise, nous intervenons aussi bien dans la construction neuve que dans la rénovation, pour les particuliers comme pour les professionnels.
            </p>
            <Link href="/devis" className="inline-block mt-6 px-5 py-3 bg-primary text-white rounded hover:bg-primary/90 transition">
              Estimer mon projet
            </Link>
          </div>
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image
              src="/images/trowel.webp"
              alt="Travaux de plâtrerie"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10">Pourquoi faire appel à nous ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Finitions soignées</h3>
              <p>Des murs parfaitement lisses, prêts à peindre ou à décorer selon vos envies.</p>
            </div>
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Respect des délais</h3>
              <p>Une équipe ponctuelle, organisée, pour des chantiers livrés dans les temps.</p>
            </div>
            <div className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">Matériaux certifiés</h3>
              <p>Nous utilisons des produits de qualité professionnelle (Placo®, Knauf, etc.).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 px-6 text-center bg-primary text-white">
        <h2 className="text-3xl font-semibold mb-4">Vous avez un projet ?</h2>
        <p className="mb-6">Contactez-nous pour bénéficier d’un devis gratuit personnalisé.</p>
        <Link
          href="/contact"
          className="inline-block px-6 py-3 bg-white text-primary rounded shadow hover:bg-gray-100 transition"
        >
          Nous contacter
        </Link>
      </section>
    </div>
  )
}
