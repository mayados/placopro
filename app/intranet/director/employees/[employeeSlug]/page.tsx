"use client";

import { fetchEmployee } from "@/services/api/userService";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/BreadCrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPenToSquare, faUserTie } from "@fortawesome/free-solid-svg-icons";

// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Employee = ({ params }: { params: Promise<{ employeeSlug: string }>}) => {

    const [employee, setEmployee] = useState<UserType | null>(null);

    
        useEffect(() => {

            async function loadEmployee() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const {employeeSlug} = resolvedParams;
                    
                try{
                  const data = await fetchEmployee(employeeSlug)
                  setEmployee(data);

                }catch (error) {
                    console.error("Impossible to load the employee :", error);
                }
            }
                
          loadEmployee();
        }, [params]);
      
        if (!employee) return <div>Loading...</div>;
      
      


    return (
        // <>
        //     <h1 className="text-3xl text-white ml-3 text-center">{employee?.firstName} {employee?.lastName}</h1>
        //     <Breadcrumb
        //         items={[
        //             { label: "Tableau de bord", href: "/director" },
        //             { label: "Employés", href: "/director/employees" },
        //             { label: `${employee.firstName} ${employee.lastName}` }, 
        //         ]}
        //     />
        //     <p>{employee?.email}</p>
        //     <p>{employee?.role}</p>
        // </>
        <article className="relative max-w-2xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-primary">
          {employee.firstName} {employee.lastName}
        </h1>
        <button
        //   onClick={onEdit}
          aria-label="Modifier les informations de l'employé"
          className="text-custom-gray hover:text-primary transition focus:outline-none"
        >
          <FontAwesomeIcon icon={faPenToSquare} size="lg" />
        </button>
      </header>

      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/director" },
          { label: "Employés", href: "/director/employees" },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      <section aria-labelledby="contact-info" className="mb-6">
        <h2 id="contact-info" className="text-2xl font-semibold text-custom-gray mb-2">
          <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-custom-gray" /> Coordonnées
        </h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-custom-gray">E-mail</dt>
            <dd className="text-gray-900">{employee.email}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="role-info">
        <h2 id="role-info" className="text-2xl font-semibold text-custom-gray mb-2">
          <FontAwesomeIcon icon={faUserTie} className="mr-2 text-custom-gray" /> Rôle
        </h2>
        <p className="text-gray-900">{employee.role}</p>
      </section>
    </article>
    );
};

export default Employee;
