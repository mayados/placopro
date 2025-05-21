"use client";

import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { Field, Input } from '@headlessui/react';
import { createVatRate, deleteVatRate, fetchVatRates, updateVatRate } from "@/services/api/vatRateService";
import { createVatRateSchema } from "@/validation/vatRateValidation";
import Breadcrumb from "./BreadCrumb";


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
    <Breadcrumb
      items={[
        { label: "Tableau de bord", href: "/director" },
        { label: `Taux de TVA` },
      ]}
    />
  <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-primary text-center mb-4">Taux de TVAs</h1>
    </header>

    <section>
      <h2 className="text-xl font-semibold mb-3">Créer un Taux de TVA</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUnitCreation();
        }}
        aria-label="Formulaire de création d'un taux de TVA"
        className="mb-8"
      >
        <div className="mb-4">
          <label htmlFor="vat-rate" className="block mb-1 font-medium text-gray-700">
            Taux de TVA
          </label>
          <Field>
            <Input
              id="vat-rate"
              type="text"
              name="rate"
                                      className="border-2 border-custom-gray outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"

              value={vatRateFormValues.rate ?? ""}
              onChange={handleInputChange}
              aria-invalid={errors.rate ? "true" : "false"}
              aria-describedby={errors.rate ? "rate-error" : undefined}
            />
          </Field>
          {errors.rate && (
            <p id="rate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.rate}
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
            <th className="px-3 py-2">Taux</th>
            <th className="px-3 py-2">Modifier</th>
            <th className="px-3 py-2">Supprimer</th>
          </tr>
        </thead>
        <tbody>
          {vatRates.map((vatRate) => (
            <tr key={vatRate.id} className="even:bg-[#F5F5F5]">
              <td className="px-3 py-2">{vatRate.rate}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => openEditModal(vatRate)}
                  aria-label={`Modifier le taux de TVA ${vatRate.rate}`}
                  className="text-[#FDA821] underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#FDA821] rounded"
                >
                  Modifier
                </button>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => openDeleteDialog(vatRate)}
                  aria-label={`Supprimer le taux de TVA ${vatRate.rate}`}
                  className="text-red-500 underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal modification taux de TVA */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        aria-labelledby="edit-vat-title"
        aria-describedby="edit-vat-desc"
      >
        <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black">
          <DialogTitle id="edit-vat-title" className="text-xl font-semibold text-primary mb-4">
            Modifier le Taux de TVA
          </DialogTitle>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            aria-describedby="edit-vat-desc"
          >
            <label htmlFor="edit-vat-rate" className="block mb-1 font-medium text-gray-700">
              Taux de TVA
            </label>
            <Input
              id="edit-vat-rate"
              name="rate"
              value={editedValues.rate || ""}
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

  {/* Delete taux de TVA Dialog */}
  {isOpen && vatRateToDelete && (
    <Dialog
      open={isOpen}
      onClose={closeDeleteDialog}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="vat-delete-title"
      aria-describedby="vat-delete-desc"
    >
      <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black">
        <DialogTitle id="vat-delete-title" className="text-xl font-semibold text-primary mb-2">
          Supprimer le Taux de TVA
        </DialogTitle>
        <Description id="vat-delete-desc" className="mb-4">
          Cette action est irréversible.
        </Description>
        <p className="mb-6">
          Êtes-vous sûr de vouloir supprimer le taux de TVA <strong>{vatRateToDelete.rate}</strong> ? Toutes ses données seront supprimées de façon permanente.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleUnitDeletion(vatRateToDelete)}
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

