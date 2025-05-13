// 👇 server file
import { headers } from 'next/headers'
// client component
import CreateCreditNote from '@/components/CreateCreditNote' 
type Params = Promise<{ billNumber: string }>;

export default async function Page({ params }: { params: Params }) {
  
  const resolvedParams = await params;
  const { billNumber } = resolvedParams;
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <CreateCreditNote
      billNumber={billNumber}
      csrfToken={csrfToken}
    />
  )
}