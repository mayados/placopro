"use client";

import { useState } from "react";
import { Field,Input, Select } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { createEmployee } from "@/services/api/userService";
import { createUserSchema } from "@/validation/userValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "@/components/BreadCrumb";

type UserCreationProps = {
    csrfToken: string;
  };

export default function UserCreation({csrfToken}: UserCreationProps){

    const [employee, setEmployee] = useState({
        firstName: "",
        lastName: "",
        role:"",
        email: "",
    })
    // Define options for select
    const roleChoices = {
        EMPLOYEE: "Employé",
        DIRECTOR: "Directeur",
        SECRETARY: "Secrétaire"
    };
    const router = useRouter();
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    

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

            console.log("employé à créer : "+JSON.stringify(employee))
            // Validation des données du formulaire en fonction du statut
            const validationResult = createUserSchema.safeParse(employee);
            
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
            const newEmployee = await createEmployee(employee, csrfToken);
            toast.success("Utilisateur créé avec succès");

            try {
                router.push(`/intranet/director/employees/${newEmployee.slug}`);
            } catch (err) {
                console.error("Redirection failed :", err);
            }
        }catch (error) {
            console.error("Erreur lors de la création de l'utilisateur :", error);
            toast.error("Erreur lors de la création de l'utilisateur");
        }

    };

    return (
        <>

            <Breadcrumb
                items={[
                    { label: "Tableau de bord", href: "/intranet/director" },
                    { label: "Employés", href: "/intranet/director/employees" },
                    { label: "Création d'employé" }, 
                ]}
            />

                          <header className="text-center my-4">
    <h1 className="text-3xl text-primary font-semibold mb-8 text-center">Création utilisateur : {employee?.firstName} {employee?.lastName}</h1>
  </header>
            <form 
                        className="text-primary bg-custom-white mx-auto max-w-3xl  rounded p-5 border-2 border-primary"

                onSubmit={(e) => {
                    e.preventDefault();
                    handleUserCreation();
                }}
            >
                {/* lastName */}
                <div>
                    <label htmlFor="lastName">Nom</label>
                    <Field className="w-full">
                        <Input type="text" name="lastName" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            // value={employee.lastName}
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
                        <Input type="text" name="firstName" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            // value={employee.firstName}
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
                        // value={employee.role}
                        onChange={handleInputChange}
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                    >
                         <option value="" disabled>Sélectionnez un rôle</option>
                        {Object.entries(roleChoices).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Select>
                    {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}

                </div>
                {/* mail */}
                <div>
                    <label htmlFor="email">Mail</label>
                    <Field className="w-full">
                        <Input type="email" name="email" 
                                                className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

                            // value={employee.email}
                            onChange={handleInputChange}
                            >
                        </Input>
                    </Field>
                    {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />
                
                <button type="submit">Créer</button>
            </form>
        </>
    );
};
