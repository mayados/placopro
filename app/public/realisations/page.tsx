import Image from 'next/image'
import Link from 'next/link'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function RealisationsPage() {
  return (
    <div className="bg-custom-white text-primary">

      {/* HERO */}
      <section
        className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center text-white px-6"
        style={{ backgroundImage: 'url(/images/trowel.webp)' }} // image d’intro
      >
        <div className="absolute inset-0 bg-black/50 z-0" aria-hidden="true"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos Réalisations</h1>
          <p className="text-lg md:text-xl">
            Découvrez nos projets réalisés en plâtrerie, carrelage et peinture. Des finitions propres, soignées et durables.
          </p>
        </div>
      </section>

      {/* GALERIE */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Quelques exemples de notre travail</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <figure key={n} className="w-full aspect-[4/3] overflow-hidden rounded-lg shadow-md">
              <Image
                src={`/images/trowel.webp`} // dossier avec vos photos
                alt={`Projet réalisé ${n}`}
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* APPEL À ACTION */}
      <section className="bg-primary text-white text-center py-12 px-6">
        <h3 className="text-2xl font-semibold mb-4">Un projet en tête ?</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Vous aimez notre travail ? Contactez-nous pour discuter de votre projet de rénovation ou de construction. Nous serons ravis de vous accompagner.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-primary px-5 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          Nous contacter
        </Link>
      </section>

      {/* Icône décorative */}
      <FontAwesomeIcon
        icon={faHammer}
        className="absolute opacity-10 text-primary w-[10rem] h-[10rem] top-[10%] right-[2%] hidden md:block rotate-[15deg]"
        aria-hidden="true"
      />
    </div>
  )
}
