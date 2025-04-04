"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { createEmployee } from "@/services/api/userService";
// import toast, { Toaster } from 'react-hot-toast';

const employeeCreation = () => {

    const [employee, setEmployee] = useState({
        firstName: "",
        lastName: "",
        role:"",
        email: "",
    })
    // Define options for select
    const roleChoices = ["employé","directeur","secrétaire"];
    const router = useRouter();
      

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setEmployee({
            ...employee,
            [name]: value,
        });
          
    };


    const handleUserCreation = async () => {
        try{

            const newEmployee = await createEmployee(employee);

            try {
                router.push(`/director/employees/${newEmployee.slug}`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }
        }catch (error) {
            console.error("Erreur lors de la création de l'utilisateur :", error);
            // toast.error("There was a problem with updating the client. Please try again!");
        }

    };

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création utilisateur : {employee?.firstName} {employee?.lastName}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUserCreation();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="lastName">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="lastName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            // value={employee.lastName}
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
                            // value={employee.firstName}
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
                        // value={employee.role}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Sélectionnez un rôle</option>
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
                            // value={employee.email}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                </div>
                <button type="submit">Créer</button>
            </form>
        </>
    );
};

export default employeeCreation;
