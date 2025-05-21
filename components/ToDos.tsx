"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, Textarea } from '@headlessui/react';
import { archiveOrUnarchiveToDo, checkOrUncheckToDo, createAssignedToDo, createClassicToDo, deleteToDo, fetchToDos, updateAssignedToDo, updateClassicToDo } from "@/services/api/toDoService";
import { faArchive, faXmark, faPenToSquare, faUndo } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@headlessui/react';
import { createAssignedToDoSchema, createClassicToDoSchema } from "@/validation/toDoValidation";
import Breadcrumb from "./BreadCrumb";


type ToDosProps = {
    csrfToken: string;
};

export default function ToDos({ csrfToken }: ToDosProps) {

    const [toDoFormValues, setToDoFormValues] = useState<ClassicToDoCreationType>({
        task: null,
        description: null
    })
    const [assignedToDoFormValues, setAssignedToDoFormValues] = useState<AssignedToDoCreationType>({
        task: null,
        description: null,
        assignedToClerkId: null,
        assignedToName: null
    })

    // To do update
    // const [editingToDoId, setEditingToDoId] = useState<string | null>(null);
    // Use of Record here because there are many to do
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignedEditModalOpen, setIsAssignedEditModalOpen] = useState(false);
    const [selectedToDo, setSelectedToDo] = useState<ToDoForListType | null>(null);
    const [editedValues, setEditedValues] = useState<ClassicToDoUpdateType>({});
    const [editedAssignedValues, setEditedAssignedValues] = useState<AssignedToDoUpdateType>({});


    // a const for each to do status
    const [toDos, setToDos] = useState<ToDoForListType[]>([])
    const [archivedToDos, setArchivedToDos] = useState<ToDoForListType[]>([])
    const [assignedToDos, setAssignedToDos] = useState<ToDoForListType[]>([])
    const [checkedToDos, setCheckedToDos] = useState<ToDoForListType[]>([])
    const [secretaries, setSecretaries] = useState<SecretariesForListType[]>([])
    // const to get total of workSites by status
    const [totalToDos, setTotalToDos] = useState<number>(0)
    const [totalCheckedToDos, setTotalCheckedToDos] = useState<number>(0)
    const [totalArchivedToDos, setTotalArchivedToDos] = useState<number>(0)
    const [totalAssignedToDos, setTotalAssignedToDos] = useState<number>(0)
    // const to set a workSite if it's selected to be deleted
    const [toDoToDelete, setToDoToDelete] = useState<ToDoForListType | null>(null);
    // const for the modal
    const [isOpen, setIsOpen] = useState(false);
    // For zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const loadToDos = async () => {
            try {
                const data = await fetchToDos();
                // console.log("données reçues après le fetch : "+data)
                // console.log("exemple d'un todo reçu : "+data['toDos'][0])
                // We hydrate each const with the datas
                setToDos(data['toDos'])
                setCheckedToDos(data['checkedToDos'])
                setArchivedToDos(data['archivedToDos'])
                setAssignedToDos(data['assignedToDos'])
                setSecretaries(data['secretaries'])

                setTotalToDos(data['totalToDos'] || 0)
                setTotalCheckedToDos(data['totalCheckedToDos'] || 0)
                setTotalArchivedToDos(data['totalArchivedToDos'] || 0)
                setTotalAssignedToDos(data['totalAssignedToDos'] || 0)
            } catch (error) {
                console.error("Impossible to load toDos :", error);
            }
        }

        loadToDos()
    }, [csrfToken]);

    // Delete a to do
    const handleToDoDeletion = async (toDo: ToDoForListType) => {
        const toDoId = toDo.id
        try {
            await deleteToDo(toDoId, csrfToken);
            setIsOpen(false);
            toast.success('To do supprimé avec succès');
            if (toDo.assignedToClerkId != null) {
                setAssignedToDos(prevToDos => prevToDos.filter(toDo => toDo.id !== toDoId));
                setTotalAssignedToDos(prev => prev - 1);
            } else {
                // Vérifier si l'on est dans les toDos, checkToDos, archived
                setToDos(prevToDos => prevToDos.filter(toDo => toDo.id !== toDoId));
                setTotalToDos(prev => prev - 1);
            }


        } catch (error) {
            toast.error('Erreur lors de la suppression du To do');
            console.error("Erreur avec la suppression du To do", error);
        }
    };

    const check = async (toDo: ToDoForListType) => {
        try {
            await checkOrUncheckToDo(toDo.id, csrfToken);
            toast.success("Tâche cochée");
            setToDos(prev => prev.filter(item => item.id !== toDo.id));
            setCheckedToDos(prev => [...prev, toDo]);
            setTotalToDos(prev => prev - 1);
            setTotalCheckedToDos(prev => prev + 1);
        } catch (err) {
            toast.error("Erreur lors de la mise à jour" + err);
        }
    }

    const uncheck = async (toDo: ToDoForListType) => {
        try {
            await checkOrUncheckToDo(toDo.id, csrfToken);
            toast("Tâche décochée");
            setCheckedToDos(prev => prev.filter(item => item.id !== toDo.id));
            setToDos(prev => [...prev, toDo]);
            setTotalCheckedToDos(prev => prev - 1);
            setTotalToDos(prev => prev + 1);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    }

    const archive = async (toDo: ToDoForListType) => {
        try {

            // We archive a to do which is checked
            // We have to delete it visually from the checked and add it to the archived
            if (toDo.isChecked) {
                await archiveOrUnarchiveToDo(toDo.id, csrfToken);
                toast.success("Tâche archivée");
                setCheckedToDos(prev => prev.filter(item => item.id !== toDo.id));
                setArchivedToDos(prev => [...prev, toDo]);
                setTotalCheckedToDos(prev => prev - 1);
                setTotalArchivedToDos(prev => prev + 1);
            } else {
                // If the to do is not checked, it's part of the toDos
                // We have to visually delete it from the toDos and add it to the archived
                await archiveOrUnarchiveToDo(toDo.id, csrfToken);
                toast.success("Tâche archivée");
                setToDos(prev => prev.filter(item => item.id !== toDo.id));
                setArchivedToDos(prev => [...prev, toDo]);
                setTotalToDos(prev => prev - 1);
                setTotalArchivedToDos(prev => prev + 1);
            }


        } catch {
            toast.error("Erreur lors de l'archivage");
        }
    }

    const unarchive = async (toDo: ToDoForListType) => {
        try {

            // We unarchive a to do which is checked
            // We have to delete it from the archived and add it to the checked
            if (toDo.isChecked) {
                await archiveOrUnarchiveToDo(toDo.id, csrfToken);
                toast("Tâche désarchivée");
                setArchivedToDos(prev => prev.filter(item => item.id !== toDo.id));
                setCheckedToDos(prev => [...prev, toDo]);
                setTotalArchivedToDos(prev => prev - 1);
                setTotalCheckedToDos(prev => prev + 1);
            } else {
                await archiveOrUnarchiveToDo(toDo.id, csrfToken);
                toast("Tâche désarchivée");
                setArchivedToDos(prev => prev.filter(item => item.id !== toDo.id));
                setToDos(prev => [...prev, toDo]);
                setTotalArchivedToDos(prev => prev - 1);
                setTotalToDos(prev => prev + 1);
            }


        } catch {
            toast.error("Erreur lors de l'archivage");
        }
    }


    const handleAssignedInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {

        const { name, value } = e.target;
        console.log("onChange déclenché :", name, value);

        if (name === "assignedToClerkId") {
            const selectedSecretary = secretaries.find(sec => sec.id === value);
            setAssignedToDoFormValues(prev => ({
                ...prev,
                assignedToClerkId: value,
                assignedToName: selectedSecretary ? `${selectedSecretary.firstName} ${selectedSecretary.lastName}` : null,
            }));
        } else {
            setAssignedToDoFormValues(prev => ({
                ...prev,
                [name]: value,
            }));
        }

    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        // console.log("select :"+name+" valeur : "+value)
        setToDoFormValues({
            ...toDoFormValues,
            [name]: value,
        });

    };

    const handleToDoCreation = async () => {


        try {

            // Choisir le schéma de validation en fonction du statut
            const schema = createClassicToDoSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(toDoFormValues);

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

            const data = await createClassicToDo(toDoFormValues, csrfToken)

            const createdToDo = data;
            if (createdToDo) {

                // Réinitialiser le formulaire
                setToDoFormValues({
                    task: null,
                    description: null
                });
                setToDos(prev => [createdToDo, ...prev]);
                setTotalToDos(prev => prev + 1);
                toast.success("Tâche créée");
            }

        } catch (error) {
            toast.error("Un problème est survenu lors de la création de la tâche")
            console.error("Impossible to create the to do :", error);
        }
    }

    const handleAssignedToDoCreation = async () => {
        console.log("données assign from " + JSON.stringify(assignedToDoFormValues))

        try {

            // Choisir le schéma de validation en fonction du statut
            const schema = createAssignedToDoSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(assignedToDoFormValues);

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

            const data = await createAssignedToDo(assignedToDoFormValues, csrfToken)

            const createdToDo = data;
            if (createdToDo) {

                // Réinitialiser le formulaire
                setAssignedToDoFormValues({
                    task: null,
                    description: null,
                    assignedToClerkId: null,
                    assignedToName: null
                });
                setAssignedToDos(prev => [createdToDo, ...prev]);
                setTotalAssignedToDos(prev => prev + 1);
                toast.success("Tâche créée");
            }

        } catch {
            toast.error("Un problème est survenu lors de la création de la tâche")
        }
    }

    const openDeleteDialog = (toDo: ToDoForListType) => {
        setToDoToDelete(toDo);
        setIsOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsOpen(false);
    };


    const openEditModal = (toDo: ToDoForListType) => {
        setSelectedToDo(toDo);
        setEditedValues({ task: toDo.task, description: toDo.description });
        setIsEditModalOpen(true);
    };

    const openEditAssignedModal = (toDo: ToDoForListType) => {
        setSelectedToDo(toDo);
        setEditedAssignedValues({ task: toDo.task, description: toDo.description, assignedToClerkId: toDo.assignedToClerkId });
        setIsAssignedEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setEditedValues(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditAssignedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setEditedAssignedValues(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        if (!selectedToDo) return;

        const updates: ClassicToDoUpdateType = {};

        if (editedValues.task !== selectedToDo.task) updates.task = editedValues.task!;
        if (editedValues.description !== selectedToDo.description) updates.description = editedValues.description!;

        if (Object.keys(updates).length === 0) {
            toast("Aucune modification");
            return;
        }

        try {
            await updateClassicToDo(selectedToDo.id, updates, csrfToken);

            setToDos(prev =>
                prev.map(todo =>
                    todo.id === selectedToDo!.id
                        ? {
                            ...todo,
                            task: updates.task ?? todo.task,
                            description: updates.description ?? todo.description,
                        }
                        : todo
                )
            );
            toast.success("Tâche mise à jour");
            setIsEditModalOpen(false);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleAssignedUpdate = async () => {
        if (!selectedToDo) return;

        const updates: AssignedToDoUpdateType = {};

        if (editedAssignedValues.task !== selectedToDo.task) updates.task = editedAssignedValues.task!;
        if (editedAssignedValues.description !== selectedToDo.description) updates.description = editedAssignedValues.description!;
        if (editedAssignedValues.assignedToClerkId !== selectedToDo.assignedToClerkId) updates.assignedToClerkId = editedAssignedValues.assignedToClerkId!;

        if (Object.keys(updates).length === 0) {
            toast("Aucune modification");
            return;
        }

        try {
            await updateAssignedToDo(selectedToDo.id, updates, csrfToken);

            setAssignedToDos(prev =>
                prev.map(todo =>
                    todo.id === selectedToDo!.id
                        ? {
                            ...todo,
                            task: updates.task ?? todo.task,
                            description: updates.description ?? todo.description,
                        }
                        : todo
                )
            );
            toast.success("Tâche mise à jour");
            setIsAssignedEditModalOpen(false);
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };


    return (

        <>
    <Breadcrumb
      items={[
        { label: "Tableau de bord", href: "/director" },
        { label: `To Do` },
      ]}
    />
            <section >
                <header>
                    <h1 className="text-3xl font-semibold text-center text-[#1873BF]">To do list</h1>
                </header>

                <TabGroup className="flex flex-col items-center lg:block my-3">
                    <TabList className="my-3 flex gap-3">
                        <Tab className="text-lg lg:text-base bg-[#1873BF] text-white p-2 rounded-md hover:bg-[#FDA821] focus:outline-none focus:ring-2 focus:ring-[#FDA821]">To do ({totalToDos})</Tab>
                        <Tab className="text-lg lg:text-base bg-[#1873BF] text-white p-2 rounded-md hover:bg-[#FDA821] focus:outline-none focus:ring-2 focus:ring-[#FDA821]">Checked ({totalCheckedToDos})</Tab>
                        <Tab className="text-lg lg:text-base bg-[#1873BF] text-white p-2 rounded-md hover:bg-[#FDA821] focus:outline-none focus:ring-2 focus:ring-[#FDA821]">Archivés ({totalArchivedToDos})</Tab>
                        <Tab className="text-lg lg:text-base bg-[#1873BF] text-white p-2 rounded-md hover:bg-[#FDA821] focus:outline-none focus:ring-2 focus:ring-[#FDA821]">Assignés ({totalAssignedToDos})</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel >
                            <section>
                                <h2 className="text-2xl text-center text-[#1873BF] mb-4">Créer un to do</h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleToDoCreation();
                                    }}
                                >
                                    <fieldset className="mb-4">
                                        <legend className="text-lg text-[#1873BF]">Tâche</legend>
                                        <label htmlFor="task" className="block text-[#637074]">Nom de la tâche</label>
                                        <Input
                                            type="text"
                                            name="task"
                                            id="task"
                                            className="w-full p-2 mt-2 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                            value={toDoFormValues.task ?? ""}
                                            onChange={handleInputChange}
                                            required
                                            aria-describedby="taskHelp"
                                        />
                                        {errors.task && <p className="text-red-500 text-sm">{errors.task}</p>}
                                    </fieldset>

                                    <fieldset className="mb-4">
                                        <legend className="text-lg text-[#1873BF]">Description</legend>
                                        <label htmlFor="description" className="block text-[#637074]">Détails de la tâche</label>
                                        <Textarea
                                            name="description"
                                            id="description"
                                            className="w-full p-2 mt-2 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                            value={toDoFormValues.description !== null ? toDoFormValues.description : ""}
                                            onChange={handleInputChange}
                                            aria-describedby="descriptionHelp"
                                        />
                                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                                    </fieldset>
                                    <Input type="hidden" name="csrf_token" value={csrfToken} />

                                    <button type="submit" className="w-full bg-[#FDA821] text-white py-2 px-4 rounded-md hover:bg-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#1873BF]">
                                        Ajouter
                                    </button>
                                </form>
                                <section className="my-5">
                                    {
                                        toDos.map((toDo) => {

                                            return (
                                                <article key={toDo.id} className="bg-[#F5F5F5] shadow-md p-4 rounded-lg mb-4">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 accent-[#1873BF] mr-3"
                                                        onChange={() => check(toDo)}
                                                        aria-label={`Marquer la tâche ${toDo.task} comme terminée`}

                                                    />
                                                    <h3 className="text-[#1873BF]">{toDo.task}</h3>
                                                    <p className="text-[#637074]">{toDo.description}</p>
                                                    <p className="text-sm text-[#637074]">{formatDate(toDo.createdAt)}</p>
                                                    <div className="flex gap-3 mt-3">
                                                        <Button
                                                            label="Archiver"
                                                            icon={faArchive}
                                                            specifyBackground="bg-[#FDA821] hover:bg-[#1873BF]"
                                                            action={() => archive(toDo)}
                                                            aria-label={`Archiver la tâche ${toDo.task}`}
                                                        />
                                                        <Button
                                                            label="Supprimer"
                                                            icon={faXmark}
                                                            type="button"
                                                            specifyBackground="bg-red-500 hover:bg-red-600"
                                                            action={() => openDeleteDialog(toDo)}
                                                            aria-label={`Supprimer la tâche ${toDo.task}`}
                                                        />
                                                        <Button
                                                            label="Modifier"
                                                            icon={faPenToSquare}
                                                            type="button"
                                                            specifyBackground="bg-orange-500 hover:bg-orange-600"
                                                            action={() => openEditModal(toDo)}
                                                            aria-label={`Modifier la tâche ${toDo.task}`}
                                                        />
                                                    </div>
                                                    <Dialog
                                                        open={isEditModalOpen}
                                                        onClose={() => setIsEditModalOpen(false)}
                                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                                        aria-labelledby="edit-task-title"
                                                        aria-describedby="edit-task-desc"
                                                    >
                                                        <DialogPanel className="w-full max-w-md p-6 rounded-lg bg-white shadow-xl">
                                                            <DialogTitle id="edit-task-title" className="text-xl font-semibold text-[#1873BF] mb-4">
                                                                Modifier la tâche
                                                            </DialogTitle>

                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    handleUpdate();
                                                                }}
                                                                className="space-y-4"
                                                            >
                                                                <div>
                                                                    <label htmlFor="edit-task" className="block text-[#637074] mb-1">
                                                                        Tâche
                                                                    </label>
                                                                    <Input
                                                                        id="edit-task"
                                                                        name="task"
                                                                        value={editedValues.task || ""}
                                                                        onChange={handleEditChange}
                                                                        className="w-full h-10 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                                        required
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label htmlFor="edit-description" className="block text-[#637074] mb-1">
                                                                        Description
                                                                    </label>
                                                                    <Textarea
                                                                        id="edit-description"
                                                                        name="description"
                                                                        value={editedValues.description || ""}
                                                                        onChange={handleEditChange}
                                                                        className="w-full rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                                        rows={4}
                                                                    />
                                                                </div>

                                                                <div className="flex justify-end gap-3 pt-4">
                                                                    <button
                                                                        type="submit"
                                                                        className="bg-[#1873BF] text-white px-4 py-2 rounded-md hover:bg-[#145da0] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                                    >
                                                                        Enregistrer
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsEditModalOpen(false)}
                                                                        className="bg-gray-300 text-[#637074] px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </DialogPanel>
                                                    </Dialog>

                                                </article>
                                            );
                                        })
                                    }
                                </section>
                            </section>

                        </TabPanel>
                        <TabPanel>
                            <section>
                                <h2 className="text-2xl text-center text-[#1873BF] mb-4">Tâches terminées</h2>

                                {
                                    checkedToDos.map((toDo) => {

                                        return (
                                            <article key={toDo.id} className="bg-[#F5F5F5] shadow-md p-4 rounded-lg mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked
                                                    className="w-5 h-5 accent-[#1873BF] mr-3"
                                                    onChange={() => uncheck(toDo)}
                                                    aria-label={`Décocher la tâche ${toDo.task}`}
                                                />
                                                <h3 className="text-[#1873BF]">{toDo.task}</h3>
                                                <p className="text-[#637074]">{toDo.description}</p>
                                                <p className="text-sm text-[#637074]">{formatDate(toDo.createdAt)}</p>
                                                <div className="flex gap-3 mt-3">
                                                    <Button
                                                        label="Archiver"
                                                        icon={faArchive}
                                                        specifyBackground="bg-[#FDA821] hover:bg-[#1873BF]"
                                                        action={() => archive(toDo)}
                                                        aria-label={`Archiver la tâche ${toDo.task}`}
                                                    />
                                                    <Button
                                                        label="Supprimer"
                                                        icon={faXmark}
                                                        type="button"
                                                        specifyBackground="bg-red-500 hover:bg-red-600"
                                                        action={() => openDeleteDialog(toDo)}
                                                        aria-label={`Supprimer la tâche ${toDo.task}`}
                                                    />
                                                    <Button
                                                        label="Modifier"
                                                        icon={faPenToSquare}
                                                        type="button"
                                                        specifyBackground="bg-orange-500 hover:bg-orange-600"
                                                        action={() => openEditModal(toDo)}
                                                        aria-label={`Modifier la tâche ${toDo.task}`}
                                                    />
                                                </div>
                                                {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                            Modifier
                                        </Link>
                                    </td>
                                        <td>
                                            <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                        </td> */}
                                            </article>
                                        );
                                    })
                                }
                            </section>

                        </TabPanel>
                        <TabPanel>
                            <section>
                                <h2 className="text-2xl text-center text-[#1873BF] mb-4">Tâches archivées</h2>

                                {
                                    archivedToDos.map((toDo) => {

                                        return (
                                            <article key={toDo.id} className="bg-[#F5F5F5] shadow-md p-4 rounded-lg mb-4">
                                                <h3 className="text-[#1873BF]">{toDo.task}</h3>
                                                <p className="text-[#637074]">{toDo.description}</p>
                                                <p className="text-sm text-[#637074]">{formatDate(toDo.createdAt)}</p>

                                                <div className="flex gap-3 mt-3">
                                                    <Button
                                                        label="Désarchiver"
                                                        icon={faUndo}
                                                        specifyBackground="bg-[#FDA821] hover:bg-[#1873BF]"
                                                        action={() => unarchive(toDo)}
                                                        aria-label={`Désarchiver la tâche ${toDo.task}`}
                                                    />
                                                    <Button
                                                        label="Supprimer"
                                                        icon={faXmark}
                                                        type="button"
                                                        specifyBackground="bg-red-500 hover:bg-red-600"
                                                        action={() => openDeleteDialog(toDo)}
                                                        aria-label={`Supprimer la tâche ${toDo.task}`}
                                                    />
                                                    <Button
                                                        label="Modifier"
                                                        icon={faPenToSquare}
                                                        type="button"
                                                        specifyBackground="bg-orange-500 hover:bg-orange-600"
                                                        action={() => openEditModal(toDo)}
                                                        aria-label={`Modifier la tâche ${toDo.task}`}
                                                    />
                                                </div>
                                                {/* <Link href={`/director/workSites/${workSite?.slug}/update`}>
                                        Modifier
                                    </Link>
                                </td>
                                    <td>
                                        <Button label="Remove" icon={Trash2} type="button" action={() => openDeleteDialog(toDo.id)} specifyBackground="text-red-500" />
                                    </td> */}
                                            </article>
                                        );
                                    })
                                }
                            </section>

                        </TabPanel>
                        <TabPanel>
                            <section>
                                <h2 className="text-2xl text-center text-[#1873BF] mb-4">Tâches assignées</h2>

                                <Dialog
                                    open={isAssignedEditModalOpen}
                                    onClose={() => setIsAssignedEditModalOpen(false)}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                    aria-labelledby="edit-assigned-task-title"
                                    aria-describedby="edit-assigned-task-desc"
                                >
                                    <DialogPanel className="w-full max-w-md p-6 rounded-lg bg-white shadow-xl">
                                        <DialogTitle id="edit-assigned-task-title" className="text-xl font-semibold text-[#1873BF] mb-4">
                                            Modifier la tâche assignée
                                        </DialogTitle>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleAssignedUpdate();
                                            }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label htmlFor="assigned-edit-task" className="block text-[#637074] mb-1">
                                                    Tâche
                                                </label>
                                                <Input
                                                    id="assigned-edit-task"
                                                    name="task"
                                                    value={editedAssignedValues.task || ""}
                                                    onChange={handleEditAssignedChange}
                                                    className="w-full h-10 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="assigned-edit-description" className="block text-[#637074] mb-1">
                                                    Description
                                                </label>
                                                <Textarea
                                                    id="assigned-edit-description"
                                                    name="description"
                                                    value={editedAssignedValues.description || ""}
                                                    onChange={handleEditAssignedChange}
                                                    className="w-full rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                    rows={4}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="assigned-clerk-select" className="block text-[#637074] mb-1">
                                                    Assigné à
                                                </label>
                                                <select
                                                    id="assigned-clerk-select"
                                                    name="assignedToClerkId"
                                                    value={editedAssignedValues.assignedToClerkId ?? ""}
                                                    onChange={handleEditAssignedChange}
                                                    className="w-full h-10 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                    required
                                                >
                                                    <option value="">-- Sélectionner un(e) secrétaire --</option>
                                                    {secretaries.map(secretary => (
                                                        <option key={secretary.id} value={secretary.id}>
                                                            {secretary.firstName} {secretary.lastName} ({secretary.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="bg-[#1873BF] text-white px-4 py-2 rounded-md hover:bg-[#145da0] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAssignedEditModalOpen(false)}
                                                    className="bg-gray-300 text-[#637074] px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </form>
                                    </DialogPanel>
                                </Dialog>

                                <p>Créer un to do à assigner</p>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAssignedToDoCreation();
                                    }}
                                >
                                    <fieldset className="mb-4">
                                        <legend className="text-lg text-[#1873BF]">Tâche</legend>
                                        <label htmlFor="task" className="block text-[#637074]">Nom de la tâche</label>
                                        <Input
                                            type="text"
                                            name="task"
                                            id="task"
                                            className="w-full p-2 mt-2 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                            value={assignedToDoFormValues.task ?? ""}
                                            onChange={handleAssignedInputChange}
                                            required
                                            aria-describedby="taskHelp"
                                        />
                                        {errors.task && <p className="text-red-500 text-sm">{errors.task}</p>}
                                    </fieldset>
                                    <fieldset className="mb-4">
                                        <legend className="text-lg text-[#1873BF]">Description</legend>
                                        <label htmlFor="description" className="block text-[#637074]">Détails de la tâche</label>
                                        <Textarea
                                            name="description"
                                            id="description"
                                            className="w-full p-2 mt-2 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                            value={assignedToDoFormValues.description !== null ? assignedToDoFormValues.description : ""}

                                            onChange={handleAssignedInputChange}
                                            aria-describedby="descriptionHelp"
                                        />
                                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                                    </fieldset>

                                    <fieldset className="mb-4">
                                        <legend className="text-lg text-[#1873BF] mb-2">Assignation</legend>

                                        <label htmlFor="assignedToClerkId" className="block text-[#637074] mb-1">
                                            Sélectionner un(e) secrétaire :
                                        </label>

                                        <select
                                            id="assignedToClerkId"
                                            name="assignedToClerkId"
                                            className="w-full h-10 rounded-md bg-[#F5F5F5] text-[#637074] border border-[#1873BF] px-3 focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                                            value={assignedToDoFormValues.assignedToClerkId ?? ""}
                                            onChange={handleAssignedInputChange}
                                            required
                                            aria-describedby="assignedHelp"
                                        >
                                            <option value="">-- Sélectionner un(e) secrétaire --</option>
                                            {secretaries.map(secretary => (
                                                <option key={secretary.id} value={secretary.id}>
                                                    {secretary.firstName} {secretary.lastName}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.assignedToClerkId && (
                                            <p id="assignedHelp" className="text-red-500 text-sm mt-1">
                                                {errors.assignedToClerkId}
                                            </p>
                                        )}
                                    </fieldset>

                                    <Input type="hidden" name="csrf_token" value={csrfToken} />
                                    <button type="submit" className="w-full bg-[#FDA821] text-white py-2 px-4 rounded-md hover:bg-[#1873BF] focus:outline-none focus:ring-2 focus:ring-[#1873BF]">
                                        Ajouter
                                    </button>
                                </form>
                                {
                                    assignedToDos.map((toDo) => {

                                        return (

                                            <article key={toDo.id} className="bg-[#F5F5F5] shadow-md p-4 rounded-lg mb-4">
                                                <h3 className="text-[#1873BF]">{toDo.task}</h3>
                                                <p className="text-[#637074]">{toDo.description}</p>
                                                <p className="text-sm text-[#637074]">{formatDate(toDo.createdAt)}</p>
                                                <p className="text-[#637074]">Assigné à {toDo.assignedToName}</p>

                                                <div className="flex gap-3 mt-3">
                                                    <Button
                                                        label="Supprimer"
                                                        icon={faXmark}
                                                        type="button"
                                                        specifyBackground="bg-red-500 hover:bg-red-600"
                                                        action={() => openDeleteDialog(toDo)}
                                                        aria-label={`Supprimer la tâche ${toDo.task}`}
                                                    />
                                                    <Button
                                                        label="Modifier"
                                                        icon={faPenToSquare}
                                                        type="button"
                                                        specifyBackground="bg-orange-500 hover:bg-orange-600"
                                                        action={() => openEditAssignedModal(toDo)}
                                                        aria-label={`Modifier la tâche ${toDo.task}`}
                                                    />
                                                </div>
                                            </article>
                                        );
                                    })
                                }
                            </section>

                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </section>
            {/* Delete workSite Dialog */}
            {isOpen && toDoToDelete && (
                // <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
                //     <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                //         <DialogTitle>Supprimer le to do</DialogTitle>
                //         <Description>Cette action est irréversible</Description>
                //         <p>Etes-vous sûr de vouloir supprimer ce to do ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                //         <div className="flex justify-between mt-4">
                //             <button onClick={() => handleToDoDeletion(toDoToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                //             <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                //         </div>
                //     </DialogPanel>
                // </Dialog>
                <Dialog
                    open={isOpen}
                    onClose={closeDeleteDialog}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-desc"
                >
                    <DialogPanel className="w-full max-w-md p-6 rounded-lg bg-white shadow-xl">
                        <DialogTitle id="delete-dialog-title" className="text-xl font-semibold text-[#1873BF] mb-2">
                            Supprimer le to-do
                        </DialogTitle>

                        <p id="delete-dialog-desc" className="text-[#637074] mb-4">
                            Cette action est irréversible.
                        </p>

                        <p className="text-sm text-[#637074]">
                            Êtes-vous sûr de vouloir supprimer ce to-do ? Toutes ses données seront supprimées de façon permanente.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => handleToDoDeletion(toDoToDelete)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                            >
                                Supprimer
                            </button>

                            <button
                                onClick={closeDeleteDialog}
                                className="bg-gray-200 hover:bg-gray-300 text-[#637074] px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
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

