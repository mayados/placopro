// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { headers } from 'next/headers'
// client component
import DashboardDirector from '@/components/DashboardDirector' 
import { fetchDirectorDatas } from '@/services/api/dashboardService';



export default async function Page() {

  const h = await headers()
  const cookie = h.get("cookie") || "";

  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  // const  datas  = await fetchDirectorDatas(cookie)
  const  datas  = await fetchDirectorDatas(cookie)
  
  console.log("CSRF Token:", csrfToken);  
  // Once we get the csrf token and billNumber, we can give it to the component
  return (
    <DashboardDirector
      datas={datas}
    />
  )
}