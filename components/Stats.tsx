'use client';
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faClock,
  faHandHoldingUsd,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';


interface StatItem {
  icon: IconDefinition;
  start: number;
  end: number;
  suffix?: string;
  label: string;
}


const stats: StatItem[] = [
  { icon: faMapMarkerAlt, start: 0, end: 20,  suffix: ' ans+', label: "d'expérience" },
  { icon: faClock,        start: 0, end: 120, suffix: '+',     label: 'interventions' },
  { icon: faHandHoldingUsd, start: 0, end: 100, suffix: ' %',  label: 'devis gratuits' },
];


export function Stats() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="bg-custom-gray-light py-24 px-4 text-center"
    >
      <h2
        id="stats-heading"
        className="text-3xl md:text-4xl font-semibold text-primary"
      >
        Nos chiffres clés&nbsp;–&nbsp;interventions locales
      </h2>

      <p className="mt-4 text-lg md:text-xl text-black/80">
        De&nbsp;<strong>Strasbourg</strong> à la&nbsp;
        <strong>vallée&nbsp;de&nbsp;la&nbsp;Bruche</strong>
      </p>

      <ul className="mt-16 flex flex-col md:flex-row justify-center gap-12">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </ul>
    </section>
  );
}

// Cards and animated counter

function StatCard({ icon, start, end, suffix = '', label }: StatItem) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const controls = animate(start, end, {
      duration: 1.6,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [start, end]);

  return (
    <li className="flex flex-col items-center">
      <FontAwesomeIcon
        icon={icon}
        className="w-8 h-8 text-primary"
        aria-hidden="true"
      />

      <span className="mt-4 text-4xl font-bold text-black tabular-nums">
        {value}
        {suffix}
      </span>

      <p className="text-lg text-black/80">{label}</p>
    </li>
  );
}
