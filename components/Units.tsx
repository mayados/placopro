"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description} from '@headlessui/react';
import Link from "next/link";
import { faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Field, Input } from '@headlessui/react';
import { createUnit, deleteUnit, fetchUnits, updateUnit } from "@/services/api/unitService";
import { createUnitSchema } from "@/validation/unitValidation";


type UnitsProps = {
    csrfToken: string;
};

export default function ToDos({ csrfToken }: UnitsProps) {

    const [unitFormValues, setUnitFormValues] = useState<UnitCreationType>({
        label: null,
    })


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);
    const [editedValues, setEditedValues] = useState<UnitUpdateType>({});


    // a const for each to do status
    const [units, setUnits] = useState<UnitType[]>([])
    // const to set a workSite if it's selected to be deleted
    const [unitToDelete, setUnitToDelete] = useState<UnitType | null>(null);
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
    // For zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadUnits = async () => {
            try {
                const data = await fetchUnits();
                // console.log("données reçues après le fetch : "+data)
                // console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setUnits(data)

            } catch (error) {
                console.error("Impossible to load toDos :", error);
            }
        }

        loadUnits()
    }, [csrfToken]);

    // Delete a to do
    const handleUnitDeletion = async (unit: UnitType) => {
        const unitId = unit.id
        try {
            await deleteUnit(unitId, csrfToken);
            setIsOpen(false);
            toast.success('Unité supprimée avec succès');

            // Vérifier si l'on est dans les toDos, checkToDos, archived
            setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));

        } catch (error) {
            toast.error("Erreur lors de la suppression de l'unité");
            console.error("Erreur avec la suppression du To do", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        // console.log("select :"+name+" valeur : "+value)
        setUnitFormValues({
            ...unitFormValues,
            [name]: value,
        });

    };

    const handleUnitCreation = async () => {


        try {

            // Choisir le schéma de validation en fonction du statut
            const schema = createUnitSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(unitFormValues);

            if (!validationResult.success) {
                toast.error("Veuillez remplir les champs requis correctement")
                // Si la validation échoue, afficher les erreurs
                console.error("Erreurs de validation :", validationResult.error.errors);
                // Transformer les erreurs Zod en un format utilisable dans le JSX
                const formattedErrors = validationResult.error.flatten().fieldErrors;

                // Mettre à jour l'état avec les erreurs
                setErrors(formattedErrors);
                return;  // Ne pas soumettre si la validation échoue
            }

            // Delete former validation errors
            setErrors({})

            const data = await createUnit(unitFormValues, csrfToken)

            const createdUnit = data;
            if (createdUnit) {

                // Réinitialiser le formulaire
                setUnitFormValues({
                    label: null,
                });
                setUnits(prev => [createdUnit, ...prev]);
                toast.success("Unité créée");
            }

        } catch (error) {
            toast.error("Un problème est survenu lors de la création de l'unité")
            console.error("Impossible to create the unit :", error);
        }
    }

    const openDeleteDialog = (unit: UnitType) => {
        setUnitToDelete(unit);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };


    const openEditModal = (unit: UnitType) => {
        setSelectedUnit(unit);
        setEditedValues({ label: unit.label });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setEditedValues(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        if (!selectedUnit) return;

        const updates: UnitUpdateType = {};

        if (editedValues.label !== selectedUnit.label) updates.label = editedValues.label!;

        if (Object.keys(updates).length === 0) {
            toast("Aucune modification");
            return;
        }

        try {
            await updateUnit(selectedUnit.id, updates, csrfToken);

            setUnits(prev =>
                prev.map(unit =>
                    unit.id === selectedUnit!.id
                        ? {
                            ...unit,
                            label: updates.label ?? unit.label,
                        }
                        : unit
                )
            );
            toast.success("Unité mise à jour");
            setIsEditModalOpen(false);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };


    return (

        <>
            <div className="flex w-screen">

                <section className="border-2 border-green-800 flex-[8]">
                    <h1 className="text-3xl text-white text-center">Unités</h1>

                    <section>
                        <Link href={`/director/toDos/create`}>Créer une unité</Link>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUnitCreation();
                            }}
                        >
                            <div>
                                <label htmlFor="label">Label</label>
                                <Field className="w-full">
                                    <Input type="text" name="label" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3"
                                        // Avoid uncontrolled input. Operateur nullish coalescing ?? allows to put an empty string if the value is null or undefined
                                        value={unitFormValues.label ?? ""}
                                        onChange={handleInputChange}
                                    >
                                    </Input>
                                </Field>
                                {errors.label && <p style={{ color: "red" }}>{errors.label}</p>}
                            </div>
                            <Input type="hidden" name="csrf_token" value={csrfToken} />

                            <button type="submit">Ajouter</button>
                        </form>
                        {
                            units.map((unit) => {

                                return (
                                    <article key={unit.id}>
                                        <p>{unit.label}</p>
                                        <Button
                                            label="Supprimer"
                                            icon={faXmark}
                                            type="button"
                                            specifyBackground="bg-red-500"
                                            action={() => openDeleteDialog(unit)}
                                        />

                                        <Button
                                            label="Modifier"
                                            icon={faPenToSquare}
                                            type="button"
                                            specifyBackground="bg-orange-500"
                                            action={() => openEditModal(unit)}
                                        />
                                        <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="absolute top-[50%] left-[25%]">
                                            <DialogPanel>
                                                <DialogTitle>Modifier l&apos;unité</DialogTitle>

                                                <label>Unité</label>
                                                <Input
                                                    name="label"
                                                    value={editedValues.label || ""}
                                                    onChange={handleEditChange}
                                                    className="w-full text-black"
                                                />

                                                <button onClick={handleUpdate}>Enregistrer</button>
                                                <button onClick={() => setIsEditModalOpen(false)}>Annuler</button>
                                            </DialogPanel>
                                        </Dialog>

                                    </article>
                                );
                            })
                        }
                    </section>

                </section>
                {/* Delete unit Dialog */}
                {isOpen && unitToDelete && (
                    <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                        <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                            <DialogTitle>Supprimer l&apos;unité</DialogTitle>
                            <Description>Cette action est irréversible</Description>
                            <p>Etes-vous sûr de vouloir supprimer cette unité ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => handleUnitDeletion(unitToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                                <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                            </div>
                        </DialogPanel>
                    </Dialog>
                )}
            </div>
        </>

    )
}

