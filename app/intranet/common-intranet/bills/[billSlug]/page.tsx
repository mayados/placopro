// //👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import { headers } from 'next/headers';
import Bill from '@/components/Bill';

type Params = Promise<{ billSlug: string }>;

export default async function Page({ params }: { params: Params }) {
  // Attendre que les paramètres soient résolus (car 'params' peut être une promesse)
  const resolvedParams = await params;
  const { billSlug } = resolvedParams;

  // Récupérer le CSRF token depuis les en-têtes
  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  // Passer les paramètres à ton composant Bill
  return (
    <Bill
      billSlug={billSlug}
      csrfToken={csrfToken}
    />
  );
}
