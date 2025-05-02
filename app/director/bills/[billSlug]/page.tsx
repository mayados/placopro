// 👇 server file
import { headers } from 'next/headers'
// client component
import Bill from '@/components/Bill' 

export default async function Page({ params }: { params: { billSlug: string } }) {
  
  const { billSlug } = params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <Bill
      billSlug={billSlug}
      csrfToken={csrfToken}
    />
  )
}