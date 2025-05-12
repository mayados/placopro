// On transforme notre page en composant client et non plus serveur. Il faut faire ainsi car nous importons un composant qui a besoin de useEffect, il faut donc que l'un de ses parents soit marqué avec "use client"
"use client"

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
// use Dialog when click on delete an employee, because it's a permanent action
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Button from '@/components/Button';
import { deleteEmployee, fetchEmployees } from '@/services/api/userService';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


const Employees = () => {

    const [employees, setEmployees] = useState<UserType[]>([])
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    // This const allows to manage the state of the dialog element when the user wants to delete an employee
    const [isOpen, setIsOpen] = useState(false);


    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await fetchEmployees();
                console.log("données reçues après le fetch : " + data)
                setEmployees(data.userList)
            } catch (error) {
                console.error("Impossible to load employees :", error);
            }
        }

        loadEmployees()
    }, []);

    console.log("les employes : " + employees)


    // Delete an employee
    const handleDeleteEmployee = async (employeeSlug: string) => {
        try {
            await deleteEmployee(employeeSlug);
            setIsOpen(false);
            // toast.success('Category deleted with success');                 
            setEmployees(prevEmployees => prevEmployees.filter(employee => employee.slug !== employeeSlug));
        } catch (error) {
            console.error("Erreur avec la suppression de l'employé", error);
        }
    };

    const openDeleteDialog = (employeeSlug: string) => {
        setEmployeeToDelete(employeeSlug);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };

    return (
        <>
            <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Employés</h1>
                </header>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1873BF] text-white">
                            <th className="px-3 py-2">Nom</th>
                            <th className="px-3 py-2">Prénom</th>
                            <th className="px-3 py-2">Rôle</th>
                            <th className="px-3 py-2">Details</th>
                            <th className="px-3 py-2">Modifier</th>
                            <th className="px-3 py-2">Supprimer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            employees.map((employee: UserType) => {
                                return (
                                    <tr key={employee.id} className="even:bg-[#F5F5F5]">
                                        <td className="px-3 py-2">{employee?.lastName}</td>
                                        <td className="px-3 py-2">{employee?.firstName}</td>
                                        <td className="px-3 py-2">{employee?.role}</td>
                                        <td className="px-3 py-2">

                                            <Link
                                                href={`/intranet/director/employees/${employee?.slug}`}
                                                className="text-[#1873BF] underline hover:text-[#FDA821]"
                                            >
                                                Consulter les détails
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Link
                                                href={`/intranet/director/employees/${employee?.slug}/update`}
                                                className="text-[#FDA821] underline hover:text-[#1873BF]"
                                            >
                                                Modifier
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Button
                                                label="Remove"
                                                icon={faXmark}
                                                type="button"
                                                action={() => openDeleteDialog(employee.slug)}
                                                specifyBackground="text-red-500"
                                            />
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
                <Dialog
                    open={isOpen}
                    onClose={closeDeleteDialog}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    aria-labelledby="quote-delete-title"
                    aria-describedby="quote-delete-desc"
                >
                    <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
                        <DialogTitle id="quote-delete-title" className="text-xl font-semibold text-[#1873BF] mb-2">
                            Supprimer l&apos;utilisateur
                        </DialogTitle>
                        <Description id="quote-delete-desc" className="mb-2">
                            Cette action est irréversible
                        </Description>
                        <p className="text-sm mb-4">
                            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses données seront supprimées de façon permanente.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => handleDeleteEmployee(employeeToDelete)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                            >
                                Supprimer
                            </button>
                            <button
                                onClick={closeDeleteDialog}
                                className="bg-gray-200 hover:bg-gray-300 text-[#637074] px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                            >
                                Annuler
                            </button>
                        </div>
                    </DialogPanel>
                </Dialog>
            )}
        </>
    )
}

export default Employees