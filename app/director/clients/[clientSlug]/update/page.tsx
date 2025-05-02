// 👇 server file
import { headers } from 'next/headers'
// client component
import ModifyClient from '@/components/ModifyClient' 

type Params = Promise<{ clientSlug: string }>;


export default async function Page({ params }: { params: Params }) {
  const resolvedParams = await params;
  const { clientSlug } = resolvedParams;
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <ModifyClient
      clientSlug={clientSlug}
      csrfToken={csrfToken}
    />
  )
}