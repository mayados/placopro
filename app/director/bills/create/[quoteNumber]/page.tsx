// 👇 server file
import { headers } from 'next/headers'
// client component
import CreationBillFromQuote from '@/components/CreationBillFromQuote' 

export default async function Page({ params }: { params: { quoteNumber: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <CreationBillFromQuote
      quoteNumber={params.quoteNumber}
      csrfToken={csrfToken}
    />
  )
}