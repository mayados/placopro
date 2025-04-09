// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateDraftQuote from '@/components/UpdateDraftQuote' 

export default async function Page({ params }: { params: { quoteNumber: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateDraftQuote
      quoteNumber={params.quoteNumber}
      csrfToken={csrfToken}
    />
  )
}