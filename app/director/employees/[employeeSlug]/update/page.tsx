"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const ModifyEmployee = ({ params }: { params: Promise<{ employeeSlug: string }>}) => {

    const [employee, setEmployee] = useState<UserType | null>(null);
    // Define options for select
    const roleChoices = ["employé","directeur","secrétaire"];
    const router = useRouter();

    
    useEffect(() => {
          async function fetchEmployee() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const employeeSlug = resolvedParams.employeeSlug;
      
            const response = await fetch(`/api/director/users/${employeeSlug}`);
            const data = await response.json();
            setEmployee(data.employee);
          }
      
          fetchEmployee();
    }, [params]);
      
    if (!employee) return <div>Chargement des détails de l'employé...</div>;
      

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
          
        setEmployee((prev) => {
            if (!prev) {
                // Prevent state updates if employee is null
                return null;
            }
          
            // Return a new object with the updated field
            return {
                ...prev,
                // Update only the field matching the name, because we don't want to update all the object right away
                [name]: value, 
            };
        });
    };


    const handleSubmit = async () => {
        try{

            const response = await fetch(`/api/director/users/update/${employee.slug}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(employee),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data)
                const updatedEmployee = data.updatedEmployee;
                setEmployee(updatedEmployee);
                console.log("updated employé :"+updatedEmployee.slug)
                // toast.success("Recipe updated successfully !");
                try {
                    // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                    router.push(`/director/employees/${updatedEmployee.slug}/update`);
                } catch (err) {
                    console.error("Redirection failed :", err);
                }
            }
        }catch (error) {
            console.error("Erreur lors de la modification de l'employé :", error);
            // toast.error("There was a problem with updating your recipe. Please try again!");
        }

    };


    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification : {employee?.firstName} {employee?.lastName}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="lastName">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="lastName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.lastName}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                {/* firstName */}
                <div>
                    <label htmlFor="firstName">Prénom</label>
                    <Field className="w-full">
                        <Input type="text" name="firstName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.firstName}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* role */}
                <div>
                    <label htmlFor="role">Rôle</label>
                    <Select
                        name="role"
                        value={employee.role}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="" disabled>Sélectionnez un rôle</option>
                        {roleChoices.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                </div>
                {/* mail */}
                <div>
                    <label htmlFor="email">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="email" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.email}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                <button type="submit">Modifier</button>
            </form>
        </>
    );
};

export default ModifyEmployee;
