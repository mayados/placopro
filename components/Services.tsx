"use client";

import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description} from '@headlessui/react';
import { Input } from '@headlessui/react';
import { deleteService, fetchServices, updateService } from "@/services/api/serviceService";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Breadcrumb from "./BreadCrumb";

type ServicesProps = {
    csrfToken: string;
};

const LIMIT = 3;


export default function Services({ csrfToken }: ServicesProps) {

    // const [serviceFormValues, setServiceFormValues] = useState<ServiceCreationType>({
    //     label: null,
    //     type: null,
    //     unitPriceHT: null,
    // })
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const searchQuery = searchParams.get("search") || "";

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
        const [totalServices, setTotalServices] = useState<number>(0)

    // const to set a workSite if it's selected to be deleted
    const [serviceToDelete, setServiceToDelete] = useState<ServiceEntityType | null>(null);
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
        const [search, setSearch] = useState(searchQuery);

    // For zod validation errors
    // const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await fetchServices({
                    page,
                    limit: LIMIT,
                    search
                });
                // console.log("données reçues après le fetch : "+data)
                // console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setServices(data.services)
                setTotalServices(data.totalServices)

            } catch (error) {
                console.error("Impossible to load toDos :", error);
            }
        }

        loadServices()
    }, [csrfToken, page, search]);

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

        const renderPagination = (total: number, pageParam: string) => {
            if (total > 0) {
                return <Pagination pageParam={pageParam} total={total} limit={LIMIT} />;
            }
            // Don't display anything it there are no datas
            return null;
        };

    return (

<>
    <Breadcrumb
      items={[
        { label: "Tableau de bord", href: "/director" },
        { label: `Services` },
      ]}
    />
  <section className="flex-[8] px-4 py-6 bg-[#F5F5F5] rounded-md shadow-sm">
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-primary text-center mb-4">Services</h1>
    </header>

    <SearchBar
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onClear={() => setSearch("")}
      placeholder="Rechercher un service par son label"
    />

    <table className="w-full text-left border-collapse mt-6">
      <thead>
        <tr className="bg-primary text-white">
          <th className="px-3 py-2">Label</th>
          <th className="px-3 py-2">Type</th>
          <th className="px-3 py-2">Prix unitaire HT</th>
          <th className="px-3 py-2">Modifier</th>
          <th className="px-3 py-2">Supprimer</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.id} className="even:bg-[#F5F5F5]">
            <td className="px-3 py-2">{service.label}</td>
            <td className="px-3 py-2">{service.type}</td>
            <td className="px-3 py-2">{service.unitPriceHT} € HT</td>
            <td className="px-3 py-2">
              <button
                onClick={() => openEditModal(service)}
                aria-label={`Modifier le service ${service.label}`}
                className="text-[#FDA821] underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-[#FDA821] rounded"
              >
                Modifier
              </button>
            </td>
            <td className="px-3 py-2">
              <button
                onClick={() => openDeleteDialog(service)}
                aria-label={`Supprimer le service ${service.label}`}
                className="text-red-500 underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {renderPagination(totalServices, "page")}

    {/* Edit service modal */}
    <Dialog
      open={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-labelledby="edit-service-title"
      aria-describedby="edit-service-desc"
    >
      <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <DialogTitle id="edit-service-title" className="text-xl font-semibold text-primary mb-4">
          Modifier le service
        </DialogTitle>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
          aria-describedby="edit-service-desc"
        >
          <label htmlFor="service-label" className="block mb-1 font-medium text-gray-700">
            Label du service
          </label>
          <Input
            id="service-label"
            name="label"
            value={editedValues.label || ""}
            onChange={handleEditChange}
            className="w-full mb-4 text-black"
          />

          <label htmlFor="service-type" className="block mb-1 font-medium text-gray-700">
            Type de service
          </label>
          <select
            id="service-type"
            name="type"
            value={editedValues.type ?? ""}
            onChange={handleEditChange}
            className="w-full mb-4 h-9 rounded-md bg-gray-700 text-white pl-3"
          >
            <option value="">-- Sélectionner le type de service --</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType.value} value={serviceType.value}>
                {serviceType.label}
              </option>
            ))}
          </select>

          <label htmlFor="service-price" className="block mb-1 font-medium text-gray-700">
            Prix unitaire HT
          </label>
          <Input
            id="service-price"
            type="number"
            name="unitPriceHT"
            value={editedValues.unitPriceHT || ""}
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

    {/* Delete service dialog */}
    {isOpen && serviceToDelete && (
      <Dialog
        open={isOpen}
        onClose={closeDeleteDialog}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        aria-labelledby="service-delete-title"
        aria-describedby="service-delete-desc"
      >
        <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black">
          <DialogTitle id="service-delete-title" className="text-xl font-semibold text-primary mb-2">
            Supprimer le service
          </DialogTitle>
          <Description id="service-delete-desc" className="mb-4">
            Cette action est irréversible.
          </Description>
          <p className="mb-6">
            Êtes-vous sûr de vouloir supprimer le service <strong>{serviceToDelete.label}</strong> ? Toutes ses données seront supprimées de façon permanente.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => handleServiceDeletion(serviceToDelete)}
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
  </section>
</>


    )
}

