// On transforme notre page en composant client et non plus serveur. Il faut faire ainsi car nous importons un composant qui a besoin de useEffect, il faut donc que l'un de ses parents soit marqué avec "use client"
"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Employees = () =>  {

  const [employees, setEmployees] = useState<UserType[]>([])


  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch(`/api/director/users`)
      const data: ClerkUserListType =  await response.json()
      setEmployees(data.userList)
    }

    fetchEmployees()
  },[]);

  console.log("les employes : "+employees)

  return (
    <>
        <div className="flex w-screen">
        {/* Navigation menu for director */}
        {/* <DirectorNav /> */}
        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">Employés</h1>
            <table className="table-auto">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Rôle</th>
                    <th>Details</th>
                </tr>  
            </thead>
            <tbody>
            {
                employees.map((employee: UserType) => {
                
                return (
                    <tr key={employee.id}>
                        <td>{employee?.lastName}</td>
                        <td>{employee?.firstName}</td>
                        <td>{employee?.role}</td>
                        <td>
                        <Link href={`/admin/articles/${employee?.slug}`}>
                            Consulter les détails
                        </Link>
                        </td>
                    </tr>
                );
                })
            }
            </tbody>
            </table>   
        </section>     
        </div>
    </>
  )
}

export default Employees