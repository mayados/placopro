import Image from 'next/image'
import Link from 'next/link'


export default function PeinturePage() {
  return (
    <div className="bg-custom-white text-primary">

      {/* HERO */}
      <section
        className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center text-white px-6"
        style={{ backgroundImage: 'url(/images/trowel.webp)' }} // utilise une image adaptée à la peinture
      >
        <div className="absolute inset-0 bg-black/50 z-0" aria-hidden="true"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Peinture</h1>
          <p className="text-lg md:text-xl">
            Rafraîchissez vos espaces avec des finitions impeccables grâce à notre service professionnel de peinture intérieure et extérieure.
          </p>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Texte */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Des murs qui ont du caractère</h2>
            <p>
              Que vous souhaitiez moderniser une pièce, appliquer une peinture technique ou créer une ambiance particulière,
              notre équipe vous accompagne dans vos projets avec professionnalisme.
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Peinture intérieure et extérieure</li>
              <li>Préparation des surfaces (enduit, ponçage, sous-couche)</li>
              <li>Finitions lisses, mates, satinées ou brillantes</li>
              <li>Travail propre, rapide et soigné</li>
            </ul>
            <Link
              href="/devis"
              className="inline-block bg-primary text-white px-5 py-2 rounded hover:bg-primary/90 transition"
            >
              Demander un devis
            </Link>
          </div>

          {/* Image */}
          <div className="relative md:w-1/2 w-full h-[300px] md:h-[400px]">
            <Image
              src="/images/trowel.webp" // image liée à la peinture (mur, pinceau, rouleau, etc.)
              alt="Travaux de peinture"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Icône décorative */}
        {/* <FontAwesomeIcon
          icon={faPaintRoller}
          className="absolute opacity-10 text-primary w-[12rem] h-[12rem] top-[-3rem] left-[-2rem] hidden md:block rotate-[15deg]"
          aria-hidden="true"
        /> */}
      </section>
    </div>
  )
}
