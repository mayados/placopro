// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateWorkSite from '@/components/UpdateWorkSite' 

export default async function Page({ params }: { params: { workSiteSlug: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateWorkSite
      workSiteSlug={params.workSiteSlug}
      csrfToken={csrfToken}
    />
  )
}