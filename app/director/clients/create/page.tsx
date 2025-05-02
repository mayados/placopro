// 👇 server file
import { headers } from 'next/headers'
// client component
import ClientCreation from '@/components/ClientCreation' 

export default async function Page() {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <ClientCreation
      csrfToken={csrfToken}
    />
  )
}