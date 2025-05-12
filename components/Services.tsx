"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description} from '@headlessui/react';
import { faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@headlessui/react';
import { deleteService, fetchServices, updateService } from "@/services/api/serviceService";


type ServicesProps = {
    csrfToken: string;
};

export default function Services({ csrfToken }: ServicesProps) {

    // const [serviceFormValues, setServiceFormValues] = useState<ServiceCreationType>({
    //     label: null,
    //     type: null,
    //     unitPriceHT: null,
    // })


    // Use of Record here because there are many to do
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceEntityType | null>(null);
    const [editedValues, setEditedValues] = useState<ServiceUpdateType>({});

    const serviceTypes = [
        { value: "platrerie", label: "Plâtrerie" },
        { value: "isolation", label: "Isolation" },
        { value: "peinture", label: "Peinture" },
      ];
      

    // a const for each to do status
    const [services, setServices] = useState<ServiceEntityType[]>([])
    // const to set a workSite if it's selected to be deleted
    const [serviceToDelete, setServiceToDelete] = useState<ServiceEntityType | null>(null);
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
    // For zod validation errors
    // const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await fetchServices();
                // console.log("données reçues après le fetch : "+data)
                // console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setServices(data)

            } catch (error) {
                console.error("Impossible to load toDos :", error);
            }
        }

        loadServices()
    }, [csrfToken]);

    // Delete a to do
    const handleServiceDeletion = async (service: ServiceEntityType) => {
        const serviceId = service.id
        try {
            await deleteService(serviceId, csrfToken);
            setIsOpen(false);
            toast.success('Unité supprimée avec succès');

            // Vérifier si l'on est dans les toDos, checkToDos, archived
            setServices(prevServices => prevServices.filter(service => service.id !== serviceId));

        } catch (error) {
            toast.error("Erreur lors de la suppression de l'unité");
            console.error("Erreur avec la suppression du To do", error);
        }
    };

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //     // console.log("évènement reçu : "+e)
    //     const { name, value } = e.target;
    //     // console.log("select :"+name+" valeur : "+value)
    //     setServiceFormValues({
    //         ...serviceFormValues,
    //         [name]: value,
    //     });

    // };


    const openDeleteDialog = (service: ServiceEntityType) => {
        setServiceToDelete(service);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };


    const openEditModal = (service: ServiceEntityType) => {
        setSelectedService(service);
        setEditedValues({ label: service.label, unitPriceHT: service.unitPriceHT, type: service.type });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setEditedValues(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        if (!selectedService) return;

        const updates: ServiceUpdateType = {};

        if (editedValues.label !== selectedService.label) updates.label = editedValues.label!;
        if (editedValues.type !== selectedService.type) updates.type = editedValues.type!;
        if (editedValues.unitPriceHT !== selectedService.unitPriceHT) updates.unitPriceHT = editedValues.unitPriceHT!;

        if (Object.keys(updates).length === 0) {
            toast("Aucune modification");
            return;
        }

        console.log("updates : "+JSON.stringify(updates))
        try {
            await updateService(selectedService.id, updates, csrfToken);

            setServices(prev =>
                prev.map(service =>
                    service.id === selectedService!.id
                        ? {
                            ...service,
                            label: updates.label ?? service.label,
                            type: updates.type ?? service.type,
                            unitPriceHT: updates.unitPriceHT ?? service.unitPriceHT,
                        }
                        : service
                )
            );
            toast.success("Service mis à jour");
            setIsEditModalOpen(false);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };


    return (

        <>

                <section className="border-2 border-green-800 flex-[8]">
                    <h1 className="text-3xl text-white text-center">Services</h1>

                    <section>
             
                        {
                            services.map((service) => {

                                return (
                                    <article key={service.id}>
                                        <p>{service.label}</p>
                                        <p>{service.type}</p>
                                        <p>{service.unitPriceHT} € HT</p>
                                        <Button
                                            label="Supprimer"
                                            icon={faXmark}
                                            type="button"
                                            specifyBackground="bg-red-500"
                                            action={() => openDeleteDialog(service)}
                                        />

                                        <Button
                                            label="Modifier"
                                            icon={faPenToSquare}
                                            type="button"
                                            specifyBackground="bg-orange-500"
                                            action={() => openEditModal(service)}
                                        />
                                        <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="absolute top-[50%] left-[25%]">
                                            <DialogPanel>
                                                <DialogTitle>Modifier le service</DialogTitle>

                                                <label>Service</label>
                                                <Input
                                                    name="label"
                                                    value={editedValues.label || ""}
                                                    onChange={handleEditChange}
                                                    className="w-full text-black"
                                                />
                                                <select
                                                name="type"
                                                className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3"
                                                value={editedValues.type ?? ""}
                                                onChange={handleEditChange}
                                                >
                                                <option value="">-- Sélectionner le type de service --</option>
                                                {serviceTypes.map(serviceType => (
                                                    <option key={serviceType.value} value={serviceType.value}>
                                                    {serviceType.label}
                                                    </option>
                                                ))}
                                                </select>


                                                <label>Prix unitaire HT</label>
                                                <Input
                                                    type="number"
                                                    name="unitPriceHT"
                                                    value={editedValues.unitPriceHT || ""}
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
                {isOpen && serviceToDelete && (
                    <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                        <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                            <DialogTitle>Supprimer l&apos;unité</DialogTitle>
                            <Description>Cette action est irréversible</Description>
                            <p>Etes-vous sûr de vouloir supprimer cette unité ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                            <div className="flex justify-between mt-4">
                                <button onClick={() => handleServiceDeletion(serviceToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                                <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                            </div>
                        </DialogPanel>
                    </Dialog>
                )}
        </>

    )
}

