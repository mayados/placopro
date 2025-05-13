// // 👇 server file
// import { headers } from 'next/headers'
// // client component
// import UpdateBill from '@/components/UpdateBill' 

// export default async function Page({ params }: { params: { billSlug: string } }) {
//   const { billSlug } = await params;

//   const h = await headers()
//   const csrfToken = h.get('X-CSRF-Token') || 'missing'

//   // Once we get the csrf token and billNumber, we can give it to the component
//   return (
//     <UpdateBill
//       billSlug={billSlug}
//       csrfToken={csrfToken}
//     />
//   )
// }

import { headers } from 'next/headers';
import UpdateBill from '@/components/UpdateBill';

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
    <UpdateBill
      billSlug={billSlug}
      csrfToken={csrfToken}
    />
  );
}