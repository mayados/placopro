"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import Link from "next/link";
import { faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Field, Input } from '@headlessui/react';
import { createVatRate, deleteVatRate, fetchVatRates, updateVatRate } from "@/services/api/vatRateService";
import { createVatRateSchema } from "@/validation/vatRateValidation";


type VatRateProps = {
    csrfToken: string;
};

export default function ToDos({ csrfToken }: VatRateProps) {

    const [vatRateFormValues, setVatRateFormValues] = useState<VatRateCreationType>({
        rate: null,
    })


    // Use of Record here because there are many to do
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVatRate, setselectedVatRate] = useState<VatRateType | null>(null);
    const [editedValues, setEditedValues] = useState<VatRateUpdateType>({});


    // a const for each to do status
    const [vatRates, setVatRates] = useState<VatRateType[]>([])
    // const to set a workSite if it's selected to be deleted
    const [vatRateToDelete, setVatRateToDelete] = useState<VatRateType | null>(null);
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
    // For zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadVatRates = async () => {
            try {
                const data = await fetchVatRates();
                // console.log("données reçues après le fetch : "+data)
                // console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setVatRates(data)

            } catch (error) {
                console.error("Impossible to load toDos :", error);
            }
        }

        loadVatRates()
    }, [csrfToken]);

    // Delete a to do
    const handleUnitDeletion = async (vatRate: VatRateType) => {
        const vatRateId = vatRate.id
        try {
            await deleteVatRate(vatRateId, csrfToken);
            setIsOpen(false);
            toast.success('Taux de TVA supprimée avec succès');

            // Vérifier si l'on est dans les toDos, checkToDos, archived
            setVatRates(prevVatRates => prevVatRates.filter(vatRate => vatRate.id !== vatRateId));

        } catch (error) {
            toast.error("Erreur lors de la suppression de l'Taux de TVA");
            console.error("Erreur avec la suppression du To do", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        // console.log("select :"+name+" valeur : "+value)
        setVatRateFormValues({
            ...vatRateFormValues,
            [name]: value,
        });

    };

    const handleUnitCreation = async () => {


        try {

            // Choisir le schéma de validation en fonction du statut
            const schema = createVatRateSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(vatRateFormValues);

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

            const data = await createVatRate(vatRateFormValues, csrfToken)

            const createdVatRate = data;
            if (createdVatRate) {

                // Réinitialiser le formulaire
                setVatRateFormValues({
                    rate: null,
                });
                setVatRates(prev => [createdVatRate, ...prev]);
                toast.success("Taux de TVA créée");
            }

        } catch (error) {
            toast.error("Un problème est survenu lors de la création de l'Taux de TVA")
            console.error("Impossible to create the unit :", error);
        }
    }

    const openDeleteDialog = (vatRate: VatRateType) => {
        setVatRateToDelete(vatRate);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };


    const openEditModal = (vatRate: VatRateType) => {
        setselectedVatRate(vatRate);
        setEditedValues({ rate: vatRate.rate });
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
        if (!selectedVatRate) return;

        const updates: VatRateUpdateType = {};

        if (editedValues.rate !== selectedVatRate.rate) updates.rate = editedValues.rate!;

        if (Object.keys(updates).length === 0) {
            toast("Aucune modification");
            return;
        }

        try {
            await updateVatRate(selectedVatRate.id, updates, csrfToken);

            setVatRates(prev =>
                prev.map(vatRate =>
                    vatRate.id === selectedVatRate!.id
                        ? {
                            ...vatRate,
                            rate: updates.rate ?? vatRate.rate,
                        }
                        : vatRate
                )
            );
            toast.success("Taux de TVA mise à jour");
            setIsEditModalOpen(false);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };


    return (

        <>
            <div className="flex w-screen">

                <section className="border-2 border-green-800 flex-[8]">
                    <h1 className="text-3xl text-white text-center">Taux de TVAs</h1>

                    <section>
                        <Link href={`/director/toDos/create`}>Créer un Taux de TVA</Link>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUnitCreation();
                            }}
                        >
                            <div>
                                <label htmlFor="rate">rate</label>
                                <Field className="w-full">
                                    <Input type="text" name="rate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3"
                                        // Avoid uncontrolled input. Operateur nullish coalescing ?? allows to put an empty string if the value is null or undefined
                                        value={vatRateFormValues.rate ?? ""}
                                        onChange={handleInputChange}
                                    >
                                    </Input>
                                </Field>
                                {errors.rate && <p style={{ color: "red" }}>{errors.rate}</p>}
                            </div>
                            <Input type="hidden" name="csrf_token" value={csrfToken} />

                            <button type="submit">Ajouter</button>
                        </form>
                        {
                            vatRates.map((unit) => {

                                return (
                                    <article key={unit.id}>
                                        <p>{unit.rate}</p>
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
                                                <DialogTitle>Modifier le Taux de TVA</DialogTitle>

                                                <label>Taux de TVA</label>
                                                <Input
                                                    name="rate"
                                                    value={editedValues.rate || ""}
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
                {isOpen && vatRateToDelete && (
                    <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                        <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                            <DialogTitle>Supprimer le Taux de TVA</DialogTitle>
                            <Description>Cette action est irréversible</Description>
                            <p>Etes-vous sûr de vouloir supprimer cette Taux de TVA ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => handleUnitDeletion(vatRateToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                                <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                            </div>
                        </DialogPanel>
                    </Dialog>
                )}
            </div>
        </>

    )
}

