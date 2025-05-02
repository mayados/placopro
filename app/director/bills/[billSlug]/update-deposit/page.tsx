// 👇 server file
// import { headers } from 'next/headers'
// // client component
// import UpdateDepositBill from '@/components/UpdateDepositBill' 

// export default async function Page({ params }: { params: { billSlug: string } }) {
//   const h = await headers()
//   const csrfToken = h.get('X-CSRF-Token') || 'missing'

//   // Once we get the csrf token and billNumber, we can give it to the component
//   return (
//     <UpdateDepositBill
//       billSlug={params.billSlug}
//       csrfToken={csrfToken}
//     />
//   )
// }

import { headers } from 'next/headers';
import UpdateDepositBill from '@/components/UpdateDepositBill';

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
    <UpdateDepositBill
      billSlug={billSlug}
      csrfToken={csrfToken}
    />
  );
}