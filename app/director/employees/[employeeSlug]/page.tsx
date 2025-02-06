"use client";

import { useEffect, useState, use } from "react";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Employee = ({ params }: { params: Promise<{ employeeSlug: string }>}) => {

    const [employee, setEmployee] = useState<UserType | null>(null);

    
        useEffect(() => {
          async function fetchEmployee() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const employeeSlug = resolvedParams.employeeSlug;
      
            const response = await fetch(`/api/users/${employeeSlug}`);
            const data = await response.json();
            setEmployee(data.employee);
          }
      
          fetchEmployee();
        }, [params]);
      
        // if (!employee) return <div>Loading...</div>;
      
      


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">{employee?.firstName} {employee?.lastName}</h1>
            {/* <div><Toaster /></div> */}
            <p>{employee?.email}</p>
            <p>{employee?.role}</p>
        </>
    );
};

export default Employee;
