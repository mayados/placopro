// 👇 server file
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { headers } from 'next/headers'
// client component
import DashboardSecretary from '@/components/DashboardSecretary' 
import { fetchSecretaryDatas } from '@/services/api/dashboardService';



export default async function Page() {

  const h = await headers()
  const cookie = h.get("cookie") || "";

  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  const  datas  = await fetchSecretaryDatas(cookie)
  
  console.log("CSRF Token:", csrfToken);  
  return (
    <DashboardSecretary
      datas={datas}
    />
  )
}