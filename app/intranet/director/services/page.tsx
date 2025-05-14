// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { headers } from 'next/headers'
// client component
import Services from '@/components/Services' 

export default async function Page() {
 

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  return (
    <Services
      csrfToken={csrfToken}
    />
  )
}