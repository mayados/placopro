// 👇 server file
import { headers } from 'next/headers'
// client component
import DashboardEmployee from '@/components/DashboardEmployee' 
import { fetchEmployeeDatas } from '@/services/api/dashboardService';



export default async function Page() {

  const h = await headers()
  const cookie = h.get("cookie") || "";

  const csrfToken = h.get('X-CSRF-Token') || 'missing'

  const  datas  = await fetchEmployeeDatas(cookie)
  
  console.log("CSRF Token:", csrfToken);  
  return (
    <DashboardEmployee
      datas={datas}
    />
  )
}