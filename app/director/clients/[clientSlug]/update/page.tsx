// 👇 server file
import { headers } from 'next/headers'
// client component
import ModifyClient from '@/components/ModifyClient' 

export default async function Page({ params }: { params: { clientSlug: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <ModifyClient
      clientSlug={params.clientSlug}
      csrfToken={csrfToken}
    />
  )
}