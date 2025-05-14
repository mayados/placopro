// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { headers } from 'next/headers'
// client component
import ModifyCompany from '@/components/ModifyCompany' 

type Params = Promise<{ companySlug: string }>;


export default async function Page({ params }: { params: Params }) {
  
  const resolvedParams = await params;
  const { companySlug } = resolvedParams;
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <ModifyCompany
      companySlug={companySlug}
      csrfToken={csrfToken}
    />
  )
}