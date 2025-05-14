import { Metadata } from 'next';
import Image from 'next/image'
import Link from 'next/link'


export const metadata: Metadata = {
  title: 'Placopro • Carrelage',
  description: 'Bienvenue sur Placopro, services de carrelage sur strasbourg et vallée de la Bruche.',
};

export default function CarrelagePage() {
  return (
    <div className="bg-custom-white text-primary">

      {/* HERO */}
      <section
        className="relative min-h-[60vh] bg-cover bg-center flex items-center justify-center text-white px-6"
        style={{ backgroundImage: 'url(/images/trowel.webp)' }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" aria-hidden="true"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Carrelage</h1>
          <p className="text-lg md:text-xl">
            Donnez du style et de la solidité à vos sols et murs grâce à nos services de carrelage professionnels.
          </p>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Texte */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Notre expertise en carrelage</h2>
            <p>
              Nous réalisons la pose de carrelage avec précision et esthétique, en intérieur comme en extérieur.
              Que ce soit pour des cuisines, salles de bains, terrasses ou piscines, nous adaptons nos techniques
              à vos besoins spécifiques.
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Pose de carrelage au sol et mural</li>
              <li>Carrelage en céramique, grès, faïence, pierre naturelle...</li>
              <li>Préparation des supports et finitions soignées</li>
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
              src="/images/trowel.webp"
              alt="Pose de carrelage"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Icône décorative */}
        {/* <FontAwesomeIcon
          icon={faToolbox}
          className="absolute opacity-10 text-primary w-[12rem] h-[12rem] top-[-3rem] left-[-2rem] hidden md:block rotate-[15deg]"
          aria-hidden="true"
        /> */}
      </section>
    </div>
  )
}
