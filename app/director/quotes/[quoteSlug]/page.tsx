// 👇 server file
import { headers } from 'next/headers'
// client component
import Quote from '@/components/Quote' 
import { fetchQuote } from '@/services/api/quoteService';
import { fetchCompany } from '@/services/api/companyService';


export default async function Page({ params }: { params: { quoteSlug: string } }) {

  const { quoteSlug } = await params;

  const h = await headers()
  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  const  quote  = await fetchQuote(quoteSlug)
  const  company  = await fetchCompany('placopro')
  
  console.log("CSRF Token:", csrfToken);  
  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <Quote
      quote={quote}
      company={company}
      csrfToken={csrfToken}
    />
  )
}