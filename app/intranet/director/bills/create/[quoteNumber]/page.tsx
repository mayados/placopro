// 👇 server file
// import { headers } from 'next/headers'
// // client component
// import CreationBillFromQuote from '@/components/CreationBillFromQuote' 

// export default async function Page({ params }: { params: { quoteNumber: string } }) {
 
//   const quoteNumberParam = await Promise.resolve(params.quoteNumber);

//   const h = await headers()
//   const csrfToken = h.get('X-CSRF-Token') || 'missing'

//   // Once we get the csrf token and billNumber, we can give it to the component
//   return (
//     <CreationBillFromQuote
//       quoteNumber={quoteNumberParam}
//       csrfToken={csrfToken}
//     />
//   )
// }

import { headers } from 'next/headers';
import CreationBillFromQuote from '@/components/CreationBillFromQuote';

type Params = Promise<{ quoteNumber: string }>;

export default async function Page({ params }: { params: Params }) {
  // Attendre que les paramètres soient résolus (car 'params' peut être une promesse)
  const resolvedParams = await params;
  const { quoteNumber } = resolvedParams;

  // Récupérer le CSRF token depuis les en-têtes
  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  // Passer les paramètres à ton composant Bill
  return (
    <CreationBillFromQuote
      quoteNumber={quoteNumber}
      csrfToken={csrfToken}
    />
  );
}