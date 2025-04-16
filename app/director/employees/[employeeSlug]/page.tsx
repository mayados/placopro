"use client";

import { fetchEmployee } from "@/services/api/userService";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/BreadCrumb";

// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Employee = ({ params }: { params: Promise<{ employeeSlug: string }>}) => {

    const [employee, setEmployee] = useState<UserType | null>(null);

    
        useEffect(() => {

            async function loadEmployee() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const employeeSlug = resolvedParams.employeeSlug;
                    
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
        <>
            <h1 className="text-3xl text-white ml-3 text-center">{employee?.firstName} {employee?.lastName}</h1>
            <Breadcrumb
                items={[
                    { label: "Tableau de bord", href: "/director" },
                    { label: "Employés", href: "/director/employees" },
                    { label: `${employee.firstName} ${employee.lastName}` }, 
                ]}
            />
            <p>{employee?.email}</p>
            <p>{employee?.role}</p>
        </>
    );
};

export default Employee;
