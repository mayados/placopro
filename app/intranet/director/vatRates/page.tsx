// 👇 server file
import { headers } from 'next/headers'
// client component
import VatRates from '@/components/VatRates' 

export default async function Page() {
 

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  return (
    <VatRates
      csrfToken={csrfToken}
    />
  )
}