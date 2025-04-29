// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateDepositBill from '@/components/UpdateDepositBill' 

export default async function Page({ params }: { params: { billSlug: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateDepositBill
      billSlug={params.billSlug}
      csrfToken={csrfToken}
    />
  )
}