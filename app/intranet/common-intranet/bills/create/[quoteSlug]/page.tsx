// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import { headers } from 'next/headers';
import CreationBillFromQuote from '@/components/CreationBillFromQuote';

type Params = Promise<{ quoteSlug: string }>;

export default async function Page({ params }: { params: Params }) {
  // Attendre que les paramètres soient résolus (car 'params' peut être une promesse)
  const resolvedParams = await params;
  const { quoteSlug } = resolvedParams;

  // Récupérer le CSRF token depuis les en-têtes
  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  // Passer les paramètres à ton composant Bill
  return (
    <CreationBillFromQuote
      quoteSlug={quoteSlug}
      csrfToken={csrfToken}
    />
  );
}