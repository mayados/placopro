import type { Metadata } from 'next';

import { PrestationCard } from "@/components/PrestationCard";
import SwiperEmployees from "@/components/SwiperEmployees";
import {  faPaintRoller, faToolbox, faTrowel } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { Hero } from '@/components/Hero';
import { Portfolio } from '@/components/Portfolio';
import { Stats } from '@/components/Stats';

export const metadata: Metadata = {
    title: 'Plâtrerie, Peinture & Carrelage à Strasbourg - Devis Gratuit • Placopro',
    description: "Plâtrerie, Peinture & Carrelage à Strasbourg & Vallée de la Bruche - Devis gratuit. Découvrez l'expertise Placopro !",
};


const services = [
    { title: 'Plâtrerie', href: '/public/prestations/platrerie', icon: faTrowel, img: '/images/prestation-platrerie.webp' },
    { title: 'Carrelage', href: '/public/prestations/platrerie', icon: faToolbox, img: '/images/prestation-carrelage.webp' },
    { title: 'Peinture', href: '/public/prestations/platrerie', icon: faPaintRoller, img: '/images/prestation-peinture.webp' },
];

export default function Home() {
    return (

        <div className="min-h-screen bg-gray-100">
            <Hero />
            <section
                aria-labelledby="about-heading"
                className="bg-custom-gray-light text-black px-4 py-24"
            >
                <div className="mx-auto max-w-7xl grid gap-16 items-center md:grid-cols-2">
                    <div>
                        <h2
                            id="about-heading"
                            className="text-3xl md:text-4xl font-semibold"
                        >
                            Bienvenue chez Placopro
                        </h2>

                        <p className="mt-6 text-lg md:text-xl leading-relaxed">
                            Une équipe de professionnels spécialisés en&nbsp;
                            <strong>plâtrerie</strong>, <strong>carrelage</strong> et&nbsp;
                            <strong>peinture</strong> avec plus de&nbsp;20 ans d’expérience,
                            intervenant pour la construction neuve comme la rénovation. Nous
                            mettons notre expertise au service de vos projets, qu’il s’agisse de
                            transformer un espace existant ou d’intervenir sur un chantier neuf.
                        </p>

                        <p className="mt-6 text-lg md:text-xl">
                            Des questions ? Un projet en tête ? Parlons-en&nbsp;!
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/public/contact"
                                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white font-medium shadow-lg hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition"
                            >
                                Nous contacter
                            </Link>

                            <Link
                                href="/public/devis"
                                className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-black font-medium shadow-lg hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition"
                            >
                                Estimer mes travaux
                            </Link>
                        </div>
                    </div>

                    <figure className="relative aspect-[4/3] mx-auto w-full max-w-sm overflow-hidden rotate-2">
                        <Image
                            src="/images/trowel.webp"
                            alt="Artisan Placopro en action"
                            fill
                            sizes="(min-width: 768px) 400px, 100vw"
                            className="object-cover object-center"
                            priority
                            placeholder="blur"
                            blurDataURL="/images/blur/plasterer_home.jpg"
                            style={{
                                clipPath:
                                    'polygon(0 8%, 100% 0, 92% 100%, 0 92%)', // forme “parallélogramme” originale
                            }}
                        />
                    </figure>
                </div>
            </section>
            <section
                aria-labelledby="services-heading"
                className="bg-custom-white pt-16 pb-20 px-4"
            >
                <h2
                    id="services-heading"
                    className="text-primary text-3xl md:text-4xl font-semibold text-center"
                >
                    Nos prestations
                </h2>

                <div
                    className="
      mt-10 grid gap-8
      grid-cols-1              /* mobile : 1 carte par ligne */
      sm:grid-cols-2           /* ≥640 px : 2 cartes */
      lg:grid-cols-3           /* ≥1024 px : 3 cartes */
      place-items-center       /* centre chaque carte */
      max-w-6xl mx-auto
    "
                    role="list"
                >
                    {services.map((s) => (
                        <PrestationCard key={s.title} {...s} />
                    ))}
                </div>
            </section>


            <Portfolio />
            <Stats />
            <section className="min-h-[100vh] text-center bg-custom-white flex flex-col justify-evenly">
                <h2 className="bg-custom-white text-3xl md:text-4xl font-semibold text-primary">
                    Notre équipe
                </h2>
                <SwiperEmployees
                    slides={[
                        { imageSrc: "/images/equipe/manuel.webp", title: 'Manuel', yearsExperience: "26 ans d'expérience", alt: "employé Manuel" },
                        { imageSrc: "/images/equipe/bruno.webp", title: 'Bruno', yearsExperience: "20 ans d'expérience", alt: "employé Bruno" },
                        { imageSrc: "/images/equipe/julien.webp", title: 'Massoud', yearsExperience: "7 ans d'expérience", alt: "employé Massoud" },
                        { imageSrc: "/images/equipe/valentin.webp", title: 'Valentin', yearsExperience: "12 ans d'expérience", alt: "employé Valentin" },
                        { imageSrc: "/images/equipe/charles.webp", title: 'Charles', yearsExperience: "8 ans d'expérience", alt: "employé Charles" },
                        { imageSrc: "/images/equipe/pascale.webp", title: 'Pascale', yearsExperience: "30 ans d'expérience", alt: "employé Pascale" },

                    ]}
                />

            </section>
        </div>

    );
}
