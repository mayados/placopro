// On transforme notre page en composant client et non plus serveur. Il faut faire ainsi car nous importons un composant qui a besoin de useEffect, il faut donc que l'un de ses parents soit marqué avec "use client"
"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
// use Dialog when click on delete an employee, because it's a permanent action
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Button from '@/components/Button';
import { Trash2 } from 'lucide-react';


const Employees = () =>  {

  const [employees, setEmployees] = useState<UserType[]>([])
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null); 
      // This const allows to manage the state of the dialog element when the user wants to delete an employee
      const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch(`/api/users`)
      const data: ClerkUserListType =  await response.json()

      setEmployees(data.userList)
    }

    fetchEmployees()
  },[]);

  console.log("les employes : "+employees)

  const deleteEmployee = async (employeeId: string) => {
    try {
        const response = await fetch(`/api/users/${employeeId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            setIsOpen(false);  
            // toast.success('Category deleted with success');                 
            setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== employeeId));
        }
    } catch (error) {
        console.error("Error with employee deletion :", error);
        // toast.error('Something went wrong with deleting the category. Please try again !');                 
    }
  }

  const openDeleteDialog = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsOpen(true);  
  };

  const closeDeleteDialog = () => {
      setIsOpen(false);  
  };

  return (
    <>
        <div className="flex w-screen">
          {/* Navigation menu for director */}
          {/* <DirectorNav /> */}
          <section className="border-2 border-green-800 flex-[8]">
              <h1 className="text-3xl text-white text-center">Employés</h1>
              <Link href={`/director/employees/create`}>Créer un employé</Link>
              <table className="table-auto">
              <thead>
                  <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Rôle</th>
                      <th>Details</th>
                      <th>Modifier</th>
                      <th>Supprimer</th>
                  </tr>  
              </thead>
              <tbody>
              {
                  employees.map((employee: UserType) => {
                  console.log("Le slug employé est : "+employee.slug)
                  return (
                      <tr key={employee.id}>
                          <td>{employee?.lastName}</td>
                          <td>{employee?.firstName}</td>
                          <td>{employee?.role}</td>
                          <td>
                            <Link href={`/director/employees/${employee?.slug}`}>
                                Consulter les détails
                            </Link>
                          </td>
                          <td>
                            <Link href={`/director/employees/${employee?.slug}/update`}>
                                Modifier
                            </Link>
                          </td>
                          <td>
                            <Button label="Supprimer" icon={Trash2} type="button" action={() => openDeleteDialog(employee.id)} specifyBackground="text-red-500" />
                          </td>
                      </tr>
                  );
                  })
              }
              </tbody>
              </table>   
          </section>    
          {/* Delete category Dialog */}
          {isOpen && employeeToDelete && (
            <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                <DialogTitle>Supprimer l'utilisateur</DialogTitle>
                <Description>Cette action est irréversible</Description>
                <p>Etes-vous sûr de vouloir supprimer l'utilisateur ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => deleteEmployee(employeeToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Supprimer</button>
                        <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                    </div>
                </DialogPanel>
            </Dialog>
          )}    
        </div>
    </>
  )
}

export default Employees