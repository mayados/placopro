// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateBill from '@/components/UpdateBill' 

export default async function Page({ params }: { params: { billNumber: string } }) {
  const { billNumber } = await params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateBill
      billNumber={billNumber}
      csrfToken={csrfToken}
    />
  )
}