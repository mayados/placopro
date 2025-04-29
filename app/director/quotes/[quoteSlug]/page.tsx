// 👇 server file
import { headers } from 'next/headers'
// client component
import Quote from '@/components/Quote' 
// import { cookies } from 'next/headers';  // Utilisation de la fonction cookies pour récupérer les cookies


export default async function Page({ params }: { params: { quoteSlug: string } }) {

  const { quoteSlug } = await params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'
  // Récupérer les cookies (attendre que la promesse soit résolue)
  // const cookieStore = await cookies();
  // console.log(JSON.stringify(cookieStore))
  // const csrfToken = cookieStore.get('_csrfSecret')?.value || 'missing';  // Récupérer le token CSRF du cookie
  
  console.log("CSRF Token:", csrfToken);  // Vérifier si tu récupères bien le token
  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <Quote
      quoteSlug={quoteSlug}
      csrfToken={csrfToken}
    />
  )
}