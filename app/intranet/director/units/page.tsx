// 👇 server file
import { headers } from 'next/headers'
// client component
import Units from '@/components/Units' 

export default async function Page() {
 

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  return (
    <Units
      csrfToken={csrfToken}
    />
  )
}