// 👇 server file
export const metadata: Metadata = {
    title: 'Placopro • Contactez-nous',
    description: "Besoin de renseignements ou d'établire un devis ? Contactez-nous",
};
import { headers } from 'next/headers'
// client component
import Contact from '@/components/Contact' 
import { Metadata } from 'next';

export default async function Page() {
 

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  return (
    <Contact
      csrfToken={csrfToken}
    />
  )
}