// 👇 server file
import { headers } from 'next/headers'
// client component
import ModifyCompany from '@/components/ModifyCompany' 

export default async function Page({ params }: { params: { companySlug: string } }) {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <ModifyCompany
      companySlug={params.companySlug}
      csrfToken={csrfToken}
    />
  )
}