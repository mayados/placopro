// 👇 server file
import { headers } from 'next/headers'
// client component
import UpdateUser from '@/components/UpdateUser' 

type Params = Promise<{ employeeSlug: string }>;


export default async function Page({ params }: { params: Params }) {
  
  const resolvedParams = await params;
  const { employeeSlug } = resolvedParams;
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateUser
      employeeSlug={employeeSlug}
      csrfToken={csrfToken}
    />
  )
}