// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { headers } from 'next/headers'
// client component
import UpdateDraftQuote from '@/components/UpdateDraftQuote' 

type Params = Promise<{ quoteSlug: string }>;


export default async function Page({ params }: { params: Params }) {
  
  const resolvedParams = await params;
  const { quoteSlug } = resolvedParams;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UpdateDraftQuote
      quoteSlug={quoteSlug}
      csrfToken={csrfToken}
    />
  )
}