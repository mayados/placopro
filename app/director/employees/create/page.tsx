// 👇 server file
import { headers } from 'next/headers'
// client component
import UserCreation from '@/components/UserCreation' 

export default async function Page() {
  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <UserCreation
      csrfToken={csrfToken}
    />
  )
}