// components/ui/PrestationCard.tsx
'use client';
import Image from 'next/image';
import Link  from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { motion } from 'framer-motion';

export interface ServiceCardProps {
  title : string;
  href  : string;
  icon  : IconDefinition;
  img   : string;
}

export function PrestationCard({ title, href, icon, img }: ServiceCardProps) {
  return (
    <motion.article
      whileHover={{ translateY: -6 }}
      transition={{ type: 'spring', stiffness: 210, damping: 18 }}
      className="
        relative flex-shrink-0
        w-[82%] xs:w-[70%] sm:w-[280px]   
        lg:w-full lg:max-w-none
        aspect-[4/5]                      
        rounded-xl overflow-hidden shadow-lg
        scroll-ml-6
      "
      role="listitem"
    >
      <Image
        src={img}
        alt={title}
        fill
        sizes="(max-width: 1024px) 82vw, 33vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL="/images/blur/placeholder.jpg"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="absolute bottom-0 p-4 sm:p-5 text-white z-10">
        <FontAwesomeIcon icon={icon} aria-hidden="true" className="w-6 h-6 text-secondary" />
        <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl font-semibold">{title}</h3>

        <Link
          href={href}
          aria-label={`Découvrir ${title}`}
          className="mt-2 inline-block rounded-full bg-secondary px-4 py-1.5 text-xs sm:text-sm font-medium text-black hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition"
        >
          En savoir&nbsp;plus&nbsp;→
        </Link>
      </div>
    </motion.article>
  );
}
