// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateBill from '@/components/UpdateBill' 

export default async function Page({ params }: { params: { billSlug: string } }) {
  const { billSlug } = await params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateBill
      billSlug={billSlug}
      csrfToken={csrfToken}
    />
  )
}