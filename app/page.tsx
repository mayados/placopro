import type { Metadata } from 'next';

import PrestationCard from "@/components/PrestationCard";
import SwiperEmployees from "@/components/SwiperEmployees";
import { faClock, faHandHoldingUsd, faMapMarkerAlt, faPaintRoller, faToolbox, faTrowel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Placopro • Accueil',
  description: 'Bienvenue sur Placopro, votre entreprise de plâtrerie, peinture et carrelage sur strasbourg et vallée de la Bruche.',
};

export default function Home() {
    return (

        <div className="min-h-screen bg-gray-100">
            {/* Section header avec une image de fond */}
            <header className="relative w-full h-screen">
                <Image
                    src="/images/plasterer_home.webp"
                    alt="Image d'accueil mettant en avant le contenu du site"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="top"
                    className="rounded-lg shadow-lg
               filter brightness-75    /* assombrit à 75% sur mobile */
               md:brightness-100"     /* remet à 100% (normal) sur md+ */
                />

                {/* Overlay : mobile = centré, desktop = ton ancien positionnement */}
                <div
                    className={`
      absolute inset-0 flex items-center justify-center p-4

      md:inset-auto        
      md:top-1/2 md:left-[85%] /* ton left 85% sur desktop */
      md:transform md:-translate-x-1/2 md:-translate-y-1/2
      md:flex-col md:justify-evenly
      md:w-[20%] md:h-[80%]
    `}
                >
                    <div
                        className={`
        bg-white bg-opacity-75 p-6 rounded-lg max-w-xs text-center space-y-4

        md:bg-transparent md:bg-none   
        md:p-0 md:rounded-none          
        md:max-w-full                   
        md:text-left md:space-y-0       
      `}
                    >
                        <h1
                            id="main-title"
                            className={`
          text-black font-bold

          /* mobile petits titres */
          text-3xl sm:text-4xl

          /* desktop comme avant (plus grand) */
          md:text-4xl lg:text-5xl
        `}
                        >
                            Placopro
                        </h1>
                        <p
                            id="slogan-description"
                            className={`
          text-black

          /* mobile plus petit */
          text-base sm:text-lg

          /* desktop comme avant */
          md:text-lg lg:text-xl
        `}
                        >
                            Professionnel et humain, les qualités d&apos;un bon artisan.
                        </p>
                        <Link
                            href="/"
                            className={`
          inline-block

          bg-secondary text-black px-4 py-2 rounded hover:bg-secondary/90 transition

          md:px-6 md:py-3
          md:bg-primary md:text-white
        `}
                        >
                            Estimer mon devis
                        </Link>
                    </div>
                </div>
            </header>


            <section className="bg-custom-light-blue min-h-[50vh] flex flex-col justify-center items-center text-center px-4 text-black">
                <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                    Bienvenue chez Placopro
                </h2>
                <p className="text-lg md:text-xl leading-relaxed">
                    Une équipe de professionnels spécialisés en <strong>plâtrerie</strong>, <strong>carrelage</strong> et <strong>peinture</strong> avec plus de 20 ans d&apos;expérience, intervenant tant pour des projets de construction neuve que pour des travaux de rénovation pour les particuliers. Nous mettons notre expertise au service de vos projets, qu’il s’agisse de transformer un espace existant ou de réaliser des travaux dans une construction neuve.
                </p>
                <p className="text-lg md:text-xl mt-4">
                    Vous avez des questions sur nos services ou un projet en tête ? Contactez-nous dès maintenant !
                </p>
                <p className="text-lg md:text-xl mt-4">
                    Estimez gratuitement le coût de vos travaux grâce à notre outil de devis en ligne. Obtenez une estimation rapide pour vos travaux de plâtrerie, carrelage ou peinture.
                </p>
            </section>
            <section className="bg-custom-white pb-5 text-center flex flex-col min-h-[100vh]">
                <h2 className="text-primary text-3xl md:text-4xl font-semibold mt-8 ">
                    Nos prestations
                </h2>
                <div className="flex flex-col md:flex-row md:justify-evenly mx-auto w-full lg:w-[90vw] flex-1 items-center gap-[20vh] mt-[18vh]">
                    <PrestationCard
                        imageSrc="/images/trowel.webp"
                        title="Plâtrerie"
                        link="/plastering"
                        icon={faTrowel}
                    />
                    <PrestationCard
                        imageSrc="/images/trowel.webp"
                        title="Carrelage"
                        link="/plastering"
                        icon={faToolbox}
                    />
                    <PrestationCard
                        imageSrc="/images/trowel.webp"
                        title="Peinture"
                        link="/plastering"
                        icon={faPaintRoller}
                    />
                </div>
            </section>

            <section className="bg-custom-white text-center min-h-[100vh] flex flex-col justify-evenly">
                <h2 className="text-primary text-3xl md:text-4xl font-semibold mb-4">
                    Nos Réalisations
                </h2>
                <div className="flex flex-wrap w-full gap-0">
                    <figure className="w-1/2 md:w-1/4 p-0">
                        <Image
                            src="/images/trowel.webp"
                            alt="Plâtrerie"
                            layout="responsive"
                            width={400}
                            height={250}
                            objectFit="cover"
                            className="rounded-lg shadow-lg"
                        />
                    </figure>

                    <figure className="w-1/2 md:w-1/4 p-0">
                        <Image
                            src="/images/trowel.webp"
                            alt="Carrelage"
                            layout="responsive"
                            width={400}
                            height={250}
                            objectFit="cover"
                            className="rounded-lg shadow-lg"
                        />
                    </figure>

                    <figure className="w-1/2 md:w-1/4 p-0">
                        <Image
                            src="/images/trowel.webp"
                            alt="Peinture"
                            layout="responsive"
                            width={400}
                            height={250}
                            objectFit="cover"
                            className="rounded-lg shadow-lg"
                        />
                    </figure>

                    <figure className="w-1/2 md:w-1/4 p-0">
                        <Image
                            src="/images/trowel.webp"
                            alt="Revêtement"
                            layout="responsive"
                            width={400}
                            height={250}
                            objectFit="cover"
                            className="rounded-lg shadow-lg"
                        />
                    </figure>
                </div>

                <div className="text-center flex text-black items-center justify-center gap-3">
                    <p>Explorez nos réalisations</p>
                    <Link
                        href=""
                        className="py-2 px-3 bg-secondary rounded text-custom-gray hover:bg-secondary/90 transition"
                    >
                        Consulter
                    </Link>
                </div>

            </section>
            <section className="bg-custom-light-blue flex flex-col md:flex-row items-center justify-between bg-custom-light ">
                {/* Section Textuelle (Gauche) */}
                <article className="md:w-1/2 space-y-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-semibold text-primary">
                        Interventions de Strasbourg à la vallée de la Bruche
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-lg text-black">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary w-5 h-5" />
                            <span>+ de 20 ans d&apos;expérience</span>
                        </li>
                        <li className="flex items-center gap-3 text-lg text-black">
                            <FontAwesomeIcon icon={faClock} className="text-primary w-5 h-5" />
                            <span>+ de 120 interventions</span>
                        </li>
                        <li className="flex items-center gap-3 text-lg text-black">
                            <FontAwesomeIcon icon={faHandHoldingUsd} className="text-primary w-5 h-5" />
                            <span>Estimation gratuite de devis</span>
                        </li>
                    </ul>
                </article>

                {/* Section Image (Droite) */}
                <figure className="md:w-1/2 mt-8 md:mt-0">
                    <Image
                        src="/images/plasterer_home.webp" // Chemin de l'image
                        alt="Intervention professionnelle en région de Strasbourg et vallée de la Bruche"
                        width={800}  // Largeur de l'image en px
                        height={500} // Hauteur de l'image en px
                        className="rounded-lg shadow-xl w-full h-auto object-cover"
                    />
                </figure>
            </section>
            <section className="min-h-[100vh] text-center bg-custom-white flex flex-col justify-evenly">
                <h2 className="bg-custom-white text-3xl md:text-4xl font-semibold text-primary">
                    Notre équipe
                </h2>
                <SwiperEmployees
                    slides={[
                        { imageSrc: "/images/trowel.webp", title: 'Manuel', yearsExperience: "26 ans d'expérience", alt: "employé Manuel" },
                        { imageSrc: "/images/trowel.webp", title: 'Bruno', yearsExperience: "20 ans d'expérience", alt: "employé Bruno" },
                        { imageSrc: "/images/trowel.webp", title: 'Julien', yearsExperience: "7 ans d'expérience", alt: "employé Julien" },
                        { imageSrc: "/images/trowel.webp", title: 'Valentin', yearsExperience: "12 ans d'expérience", alt: "employé Valentin" },
                        { imageSrc: "/images/trowel.webp", title: 'Charles', yearsExperience: "8 ans d'expérience", alt: "employé Charles" },
                        { imageSrc: "/images/trowel.webp", title: 'Pascale', yearsExperience: "30 ans d'expérience", alt: "employé Pascale" },

                    ]}
                />

            </section>
        </div>

    );
}
