// 👇 server file
import { headers } from 'next/headers'
// client component
import SetPassword from '@/components/SetPassword';


export default async function Page() {

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'
  
  console.log("CSRF Token:", csrfToken);  
  return (
    <SetPassword
      csrfToken={csrfToken}
    />
  )
}