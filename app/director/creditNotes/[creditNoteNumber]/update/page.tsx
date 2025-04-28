// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateCreditNote from '@/components/UpdateCreditNote' 

export default async function Page({ params }: { params: { creditNoteNumber: string } }) {
  const { creditNoteNumber } = await params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateCreditNote
      creditNoteNumber={creditNoteNumber}
      csrfToken={csrfToken}
    />
  )
}