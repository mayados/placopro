"use client";

import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description} from '@headlessui/react';
import { Field, Input } from '@headlessui/react';
import { createUnit, deleteUnit, fetchUnits, updateUnit } from "@/services/api/unitService";
import { createUnitSchema } from "@/validation/unitValidation";
import Breadcrumb from "./BreadCrumb";


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
       <Breadcrumb
         items={[
           { label: "Tableau de bord", href: "/director" },
           { label: `Unités` },
         ]}
       />
  <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-primary text-center mb-4">Unités</h1>
    </header>

    <section>
      <h2 className="text-xl font-semibold mb-3">Créer une unité</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUnitCreation();
        }}
        aria-label="Formulaire de création d'une unité"
        className="mb-8"
      >
        <div className="mb-4">
          <label htmlFor="unit-label" className="block mb-1 font-medium text-gray-700">
            Label
          </label>
          <Field>
            <Input
              id="unit-label"
              type="text"
              name="label"
                                                    className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

              value={unitFormValues.label ?? ""}
              onChange={handleInputChange}
              aria-invalid={errors.label ? "true" : "false"}
              aria-describedby={errors.label ? "label-error" : undefined}
            />
          </Field>
          {errors.label && (
            <p id="label-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.label}
            </p>
          )}
        </div>

        <Input type="hidden" name="csrf_token" value={csrfToken} />

        <button
          type="submit"
          className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
        >
          Ajouter
        </button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-3 py-2">Label</th>
            <th className="px-3 py-2">Modifier</th>
            <th className="px-3 py-2">Supprimer</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.id} className="even:bg-[#F5F5F5]">
              <td className="px-3 py-2">{unit.label}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => openEditModal(unit)}
                  aria-label={`Modifier l'unité ${unit.label}`}
                  className="text-[#FDA821] underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#FDA821] rounded"
                >
                  Modifier
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => openDeleteDialog(unit)}
                  aria-label={`Supprimer l'unité ${unit.label}`}
                  className="text-red-500 underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal modification unité */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        aria-labelledby="edit-unit-title"
        aria-describedby="edit-unit-desc"
      >
        <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black">
          <DialogTitle id="edit-unit-title" className="text-xl font-semibold text-primary mb-4">
            Modifier l&apos;unité
          </DialogTitle>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            aria-describedby="edit-unit-desc"
          >
            <label htmlFor="edit-unit-label" className="block mb-1 font-medium text-gray-700">
              Unité
            </label>
            <Input
              id="edit-unit-label"
              name="label"
              value={editedValues.label || ""}
              onChange={handleEditChange}
              className="w-full mb-6 text-black"
            />

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
              >
                Annuler
              </button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>
    </section>
  </section>

  {/* Delete unit Dialog */}
  {isOpen && unitToDelete && (
    <Dialog
      open={isOpen}
      onClose={closeDeleteDialog}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="unit-delete-title"
      aria-describedby="unit-delete-desc"
    >
      <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black">
        <DialogTitle id="unit-delete-title" className="text-xl font-semibold text-primary mb-2">
          Supprimer l&apos;unité
        </DialogTitle>
        <Description id="unit-delete-desc" className="mb-4">
          Cette action est irréversible.
        </Description>
        <p className="mb-6">
          Êtes-vous sûr de vouloir supprimer l&apos;unité <strong>{unitToDelete.label}</strong> ? Toutes ses données seront supprimées de façon permanente.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleUnitDeletion(unitToDelete)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Supprimer
          </button>
          <button
            onClick={closeDeleteDialog}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
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

