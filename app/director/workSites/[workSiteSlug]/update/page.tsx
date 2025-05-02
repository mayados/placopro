// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateWorkSite from '@/components/UpdateWorkSite' 

type Params = Promise<{ workSiteSlug: string }>;


export default async function Page({ params }: { params: Params }) {
  const resolvedParams = await params;
  const { workSiteSlug } = resolvedParams;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateWorkSite
      workSiteSlug={workSiteSlug}
      csrfToken={csrfToken}
    />
  )
}