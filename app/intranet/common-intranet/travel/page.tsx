'use client'

import dynamic from 'next/dynamic';

const MapWithForm = dynamic(() => import('@/components/MapWithForm'), {
  ssr: false,
});

export default function Travel() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Calculer un temps de trajet</h1>
      </header>
      <MapWithForm />
    </>

  );
}
