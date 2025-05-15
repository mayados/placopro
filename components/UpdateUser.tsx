"use client";

import { useEffect, useState } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { fetchEmployee, updateUser } from "@/services/api/userService";
import { updateUserSchema } from "@/validation/userValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "@/components/BreadCrumb";

type UpdateUserProps = {
    csrfToken: string;
    employeeSlug: string;
  };

export default function UpdateUser({csrfToken, employeeSlug}: UpdateUserProps){

    const [employee, setEmployee] = useState<UserType | null>(null);
    // Define options for select
    const roleChoices = ["EMPLOYEE","DIRECTOR","SECRETARY"];
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    
    
    useEffect(() => {
        async function loadEmployee() {

                    
            try{
                const data = await fetchEmployee(employeeSlug)
                console.log("les datas : "+data)
                setEmployee(data);

            }catch (error) {
                console.error("Impossible to load the employee :", error);
            }
        }
                
        loadEmployee();
    }, [employeeSlug, csrfToken]);
      
    if (!employee) return <div>Chargement des détails de l&aposemployé...</div>;
      

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


    const handleUsertUpdate = async () => { 
                
        try{

            // Validation des données du formulaire en fonction du statut
            const validationResult = updateUserSchema.safeParse(employee);
                        
            if (!validationResult.success) {
                // Si la validation échoue, afficher les erreurs
                console.error("Erreurs de validation :", validationResult.error.errors);
                    // Transformer les erreurs Zod en un format utilisable dans le JSX
                const formattedErrors = validationResult.error.flatten().fieldErrors;
                        
                // Afficher les erreurs dans la console pour débogage
                console.log(formattedErrors);
                                      
                // Mettre à jour l'état avec les erreurs
                setErrors(formattedErrors);
                return;  // Ne pas soumettre si la validation échoue
            }
                        
            // Delete former validation errors
            setErrors({})
        
            const data = await updateUser(employee, csrfToken)
            const updatedEmployee = data;
            setEmployee(updatedEmployee);
            toast.success("Utilisateur mis à jour avec succès");

            console.log("essai de lecture des données : "+data)
            console.log("updated employee :"+updatedEmployee.slug)
            
            try {
                // We redirect because it's possible the slug has changed. So we have to point to the right URL.
                router.push(`/director/employees/${updatedEmployee.slug}/update`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }
    
                        
        }catch (error) {
            toast.error("Erreur avec la mise à jour de l'utilisateur");
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        }
            
    };

    return (
        <>
            
            <h1 className="text-3xl text-white ml-3 text-center">Modification : {employee?.firstName} {employee?.lastName}</h1>
            <Breadcrumb
                items={[
                    { label: "Tableau de bord", href: "/director" },
                    { label: "Employés", href: "/director/employees" },
                    { label: `Modification ${employee.firstName} ${employee.lastName}` }, 
                ]}
            />
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    handleUsertUpdate();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="lastName">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="lastName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.lastName || ""}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.lastName && <p style={{ color: "red" }}>{errors.lastName}</p>}

                </div>
                {/* firstName */}
                <div>
                    <label htmlFor="firstName">Prénom</label>
                    <Field className="w-full">
                        <Input type="text" name="firstName" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.firstName || ""}
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}

                </div>
                {/* role */}
                <div>
                    <label htmlFor="role">Rôle</label>
                    <Select
                        name="role"
                        value={employee.role || ""}
                        onChange={handleInputChange}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="" disabled>Sélectionnez un rôle</option>
                        {roleChoices.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                    {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}

                </div>
                {/* mail */}
                <div>
                    <label htmlFor="email">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="email" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={employee.email || ""}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />
                
                <button type="submit">Modifier</button>
            </form>
        </>
    );
};
