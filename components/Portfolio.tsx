'use client';
import Image from 'next/image';
import Link  from 'next/link';
import { motion } from 'framer-motion';

const pictures = [
  /* grand carré 2 × 2 */
  {
    src : '/images/realisations/realisation1.webp',
    alt : 'Mur entièrement enduit, finition beige nuagée avec moulures blanches – réalisation Placopro',
    span: 'md:col-span-2 md:row-span-2',
  },
  /* petit carré */
  {
    src : '/images/realisations/realisation2.webp',
    alt : ' Plafond BA13 quadrillé jointoyé, spots LED encastrés, murs lisses.',
    span: '',
  },
  /* bloc vertical 1 × 2 */
  {
    src : '/images/realisations/realisation3.webp',
    alt : 'Sol de salle de bain en pose chevron, ton gris clair, joints harmonisés.',
    span: 'md:row-span-2',
  },
  /* petit carré */
  {
    src : '/images/realisations/realisation4.webp',
    alt : 'Mur accent teal profond, lignes nettes avec plinthes et plafond blancs.',
    span: '',
  },

];

export function Portfolio() {
  return (
    <section
      aria-labelledby="portfolio-heading"
      className="bg-custom-white py-20 px-4"
    >
      <h2
        id="portfolio-heading"
        className="text-primary text-3xl md:text-4xl font-semibold text-center"
      >
        Nos réalisations
      </h2>

      {/* ====== BENTO GRID (4 colonnes) ====== */}
      <div
        className="mt-12 grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] grid-flow-dense gap-4 max-w-7xl mx-auto"
        role="list"
      >
        {pictures.map(({ src, alt, span }) => (
          <motion.figure
            key={src}
            role="listitem"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className={`relative overflow-hidden rounded-xl shadow-lg ${span}`}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover object-center"
              placeholder="blur"
              blurDataURL="/images/blur/placeholder.jpg"
            />
          </motion.figure>
        ))}
      </div>

      {/* ====== CTA UNIQUE ====== */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/public/realisations"
          className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-black font-medium shadow-lg hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition"
        >
          Explorer la galerie complète
        </Link>
      </div>
    </section>
  );
}
