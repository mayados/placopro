'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative isolate h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/images/plasterer_home.webp"
        alt="Artisan plâtrier au travail"
        fill
        sizes="100vw"
        className="object-cover object-top"
        priority
        placeholder="blur"
        blurDataURL="/images/blur/plasterer_home.jpg"
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white drop-shadow">
          Placopro
        </h1>
        <p className="mt-4 text-lg sm:text-2xl text-white/90 max-w-prose mx-auto">
          Professionnel&nbsp;et&nbsp;humain&nbsp;:&nbsp;les qualités d&apos;un bon artisan.
        </p>
        <Link
          href="/public/contact"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-medium text-white shadow-lg hover:bg-primary/90 transition"
        >
          Demander un devis
        </Link>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />
    </section>
  );
}
