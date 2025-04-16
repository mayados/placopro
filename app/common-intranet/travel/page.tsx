'use client'

import dynamic from 'next/dynamic';

const MapWithForm = dynamic(() => import('@/components/MapWithForm'), {
  ssr: false,
});

export default function Travel() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Calcul de temps de trajet</h1>
      <MapWithForm />
    </main>
  );
}
