"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogPanel, Description, Tab, TabGroup ,TabList, TabPanel, TabPanels, Textarea } from '@headlessui/react';
import {archiveOrUnarchiveToDo, checkOrUncheckToDo, createAssignedToDo, createClassicToDo, deleteToDo, fetchToDos, updateAssignedToDo, updateClassicToDo } from "@/services/api/toDoService";
import { faArchive, faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Field,Input } from '@headlessui/react';
import { createAssignedToDoSchema, createClassicToDoSchema } from "@/validation/toDoValidation";


type ToDosProps = {
    csrfToken: string;
  };

  export default function ToDos({csrfToken}: ToDosProps){

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
            try{
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
            }catch(error){
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
            if(toDo.assignedToClerkId != null){
                setAssignedToDos(prevToDos => prevToDos.filter(toDo => toDo.id !== toDoId));
                setTotalAssignedToDos(prev => prev - 1);
            }else{
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
            await checkOrUncheckToDo(toDo.id,csrfToken);
            toast.success("Tâche cochée");
            setToDos(prev => prev.filter(item => item.id !== toDo.id));
            setCheckedToDos(prev => [...prev, toDo]); 
            setTotalToDos(prev => prev - 1);
            setTotalCheckedToDos(prev => prev + 1);
        } catch (err) {
            toast.error("Erreur lors de la mise à jour"+err);
        } 
    }

    const uncheck = async (toDo: ToDoForListType) => {
        try {
            await checkOrUncheckToDo(toDo.id,csrfToken);
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
            if(toDo.isChecked){
                await archiveOrUnarchiveToDo(toDo.id,csrfToken);
                toast.success("Tâche archivée");
                setCheckedToDos(prev => prev.filter(item => item.id !== toDo.id));
                setArchivedToDos(prev => [...prev, toDo]); 
                setTotalCheckedToDos(prev => prev - 1);
                setTotalArchivedToDos(prev => prev + 1);                
            }else{
                // If the to do is not checked, it's part of the toDos
                // We have to visually delete it from the toDos and add it to the archived
                await archiveOrUnarchiveToDo(toDo.id,csrfToken);
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
            if(toDo.isChecked){
                await archiveOrUnarchiveToDo(toDo.id,csrfToken);
                toast("Tâche désarchivée");
                setArchivedToDos(prev => prev.filter(item => item.id !== toDo.id));
                setCheckedToDos(prev => [...prev, toDo]); 
                setTotalArchivedToDos(prev => prev - 1);
                setTotalCheckedToDos(prev => prev + 1);                
            }else{
                await archiveOrUnarchiveToDo(toDo.id,csrfToken);
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


        try{

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

            const data = await createClassicToDo(toDoFormValues,csrfToken)
            
            const createdToDo = data;
            if (createdToDo) {
 
                // Réinitialiser le formulaire
                setToDoFormValues({
                  task: null,
                  description: null
                });
                setToDos(prev => [createdToDo,...prev]);
                setTotalToDos(prev => prev + 1);
                toast.success("Tâche créée");
              }

        }catch(error){
            toast.error("Un problème est survenu lors de la création de la tâche")
            console.error("Impossible to create the to do :", error);
        }
    }

    const handleAssignedToDoCreation = async () => {
        console.log("données assign from "+JSON.stringify(assignedToDoFormValues))

        try{

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

            const data = await createAssignedToDo(assignedToDoFormValues,csrfToken)
            
            const createdToDo = data;
            if (createdToDo) {
 
                // Réinitialiser le formulaire
                setAssignedToDoFormValues({
                  task: null,
                  description: null,
                  assignedToClerkId: null,
                  assignedToName: null
                });
                setAssignedToDos(prev => [createdToDo,...prev]);
                setTotalAssignedToDos(prev => prev + 1);
                toast.success("Tâche créée");
              }

        }catch{
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
        } catch{
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
        } catch{
          toast.error("Erreur lors de la mise à jour");
        }
      };
      

  return (

    <>
    <div className="flex w-screen">

        <section className="border-2 border-green-800 flex-[8]">
            <h1 className="text-3xl text-white text-center">To do list</h1>

            <TabGroup className="flex flex-col items-center lg:block my-3">
                <TabList className="my-3 flex gap-3">
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">To do ({totalToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Checked ({totalCheckedToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Archivés ({totalArchivedToDos})</Tab>
                    <Tab className="text-lg lg:text-base flex data-[selected]:bg-pink-600  data-[hover]:bg-pink-500 p-2 rounded-md">Assignés ({totalAssignedToDos})</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            <p>Créer un to do</p>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleToDoCreation();
                                }}
                            >
                                <div>
                                    <label htmlFor="task">Tâche</label>
                                    <Field className="w-full">
                                        <Input type="text" name="task" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                            // Avoid uncontrolled input. Operateur nullish coalescing ?? allows to put an empty string if the value is null or undefined
                                            value={toDoFormValues.task ?? ""}
                                            onChange={handleInputChange}
                                        >
                                        </Input>
                                    </Field>
                                    {errors.task && <p style={{ color: "red" }}>{errors.task}</p>}
                                </div>
                                <div>
                                    <label htmlFor="description">Description</label>
                                    <Field className="w-full">
                                        <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                            value={toDoFormValues.description !== null ? toDoFormValues.description : ""}
                                            onChange={handleInputChange}
                                        >
                                        </Textarea>
                                    </Field>
                                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}
                                </div>
                                <Input type="hidden" name="csrf_token" value={csrfToken} />
                                                
                                <button type="submit">Ajouter</button>
                            </form>
                            {
                                toDos.map((toDo) => {
                                
                                return (
                                    <article key={toDo.id}>   
                                                <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-green-500"
                                                onChange={() => check(toDo)}
                                                />
                                                <p>{toDo.task}</p>
                                                <p>{toDo.description}</p>
                                                {formatDate(toDo.createdAt)}
                                                <Button
                                                    label="Archiver"
                                                    icon={faArchive}
                                                    specifyBackground="bg-yellow-500 hover:bg-yellow-600"
                                                    action={() => archive(toDo)}
                                                />
                                                <Button 
                                                    label="Supprimer"
                                                    icon={faXmark} 
                                                    type="button" 
                                                    specifyBackground="bg-red-500"
                                                    action={() => openDeleteDialog(toDo)}
                                                />
                        
                                                <Button 
                                                    label="Modifier"
                                                    icon={faPenToSquare} 
                                                    type="button" 
                                                    specifyBackground="bg-orange-500"
                                                    action={() => openEditModal(toDo)}
                                                />
                                        <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="absolute top-[50%] left-[25%]">
                                            <DialogPanel>
                                                <DialogTitle>Modifier la tâche</DialogTitle>

                                                <label>Tâche</label>
                                                <Input
                                                name="task"
                                                value={editedValues.task || ""}
                                                onChange={handleEditChange}
                                                className="w-full text-black"
                                                />

                                                <label>Description</label>
                                                <Textarea
                                                name="description"
                                                value={editedValues.description || ""}
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

                    </TabPanel>
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            {
                                checkedToDos.map((toDo) => {
                                
                                return (
                                    <article key={toDo.id}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-green-500"
                                            onChange={() => uncheck(toDo)}
                                        />
                                        <p>{toDo.task}</p>
                                        <p>{toDo.description}</p>
                                        {formatDate(toDo.createdAt)}
                                        <Button
                                            label="Archiver"
                                            icon={faArchive}
                                            specifyBackground="bg-yellow-500 hover:bg-yellow-600"
                                            action={() => archive(toDo)}
                                        />
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
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                    <section>
                        {
                            archivedToDos.map((toDo) => {
                                
                            return (
                                <article key={toDo.id}>
                                    <p>{toDo.task}</p>
                                    <p>{toDo.description}</p>
                                    {formatDate(toDo.createdAt)}
                                    <Button
                                        label="Désarchiver"
                                        icon={faArchive}
                                        specifyBackground="bg-yellow-500 hover:bg-yellow-600"
                                        action={() => unarchive(toDo)}
                                    />
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
                    <TabPanel className="flex flex-row gap-5 flex-wrap justify-center lg:justify-between">
                        <section>
                            <Dialog open={isAssignedEditModalOpen} onClose={() => setIsAssignedEditModalOpen(false)} className="absolute top-[50%] left-[25%]">
                                            <DialogPanel>
                                                <DialogTitle>Modifier la tâche</DialogTitle>

                                                <label>Tâche</label>
                                                <Input
                                                name="task"
                                                value={editedAssignedValues.task || ""}
                                                onChange={handleEditAssignedChange}
                                                className="w-full text-black"
                                                />

                                                <label>Description</label>
                                                <Textarea
                                                name="description"
                                                value={editedAssignedValues.description || ""}
                                                onChange={handleEditAssignedChange}
                                                className="w-full text-black"
                                                />
                                                <select
                                                    name="assignedToClerkId"
                                                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3"
                                                    value={editedAssignedValues.assignedToClerkId ?? ""}
                                                    onChange={handleEditAssignedChange}
                                                    >
                                                    <option value="">-- Sélectionner un(e) secrétaire --</option>
                                                    {secretaries.map(secretary => (
                                                        <option key={secretary.id} value={secretary.id}>
                                                        {secretary.firstName} {secretary.lastName} {secretary.id}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={handleAssignedUpdate}>Enregistrer</button>
                                                <button onClick={() => setIsAssignedEditModalOpen(false)}>Annuler</button>
                                            </DialogPanel>
                                        </Dialog>
                            <p>Créer un to do à assigner</p>
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAssignedToDoCreation();
                                    }}
                                >
                                    <div>
                                        <label htmlFor="task">Tâche</label>
                                        <Field className="w-full">
                                            <Input type="text" name="task" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                                // Avoid uncontrolled input. Operateur nullish coalescing ?? allows to put an empty string if the value is null or undefined
                                                value={assignedToDoFormValues.task ?? ""}
                                                onChange={handleAssignedInputChange}
                                            >
                                            </Input>
                                        </Field>
                                        {/* {errors.task && <p style={{ color: "red" }}>{errors.task}</p>} */}
                                    </div>
                                    <div>
                                        <label htmlFor="description">Description</label>
                                        <Field className="w-full">
                                            <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                                value={assignedToDoFormValues.description !== null ? assignedToDoFormValues.description : ""}
                                                onChange={handleAssignedInputChange}
                                            >
                                            </Textarea>
                                        </Field>
                                        {/* {errors.description && <p style={{ color: "red" }}>{errors.description}</p>} */}
                                    </div>
                                    <select
                                        name="assignedToClerkId"
                                        className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3"
                                        value={assignedToDoFormValues.assignedToClerkId ?? ""}
                                        onChange={handleAssignedInputChange}
                                        >
                                        <option value="">-- Sélectionner un(e) secrétaire --</option>
                                        {secretaries.map(secretary => (
                                            <option key={secretary.id} value={secretary.id}>
                                            {secretary.firstName} {secretary.lastName} {secretary.id}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assignedToClerkId && <p style={{ color: "red" }}>{errors.assignedToClerkId}</p>}

                                    <Input type="hidden" name="csrf_token" value={csrfToken} />
                                                    
                                    <button type="submit">Ajouter</button>
                                </form>
                            {
                                assignedToDos.map((toDo) => {
                                    
                                return (
                                    
                                    <article key={toDo.id}>
                                        <p>{toDo.task}</p>
                                        <p>{toDo.description}</p>
                                        {formatDate(toDo.createdAt)}
                                        <p>Assigné à {toDo.assignedToName}</p>
                                        <Button 
                                            label="Supprimer"
                                            icon={faXmark} 
                                            type="button" 
                                            specifyBackground="bg-red-500"
                                            action={() => openDeleteDialog(toDo)}
                                        />
                        
                                        <Button 
                                            label="Modifier"
                                            icon={faPenToSquare} 
                                            type="button" 
                                            specifyBackground="bg-orange-500"
                                            action={() => openEditAssignedModal(toDo)}
                                        />
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
        <Dialog open={isOpen} onClose={closeDeleteDialog} className="absolute top-[50%] left-[25%]" >
            <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
            <DialogTitle>Supprimer le to do</DialogTitle>
            <Description>Cette action est irréversible</Description>
            <p>Etes-vous sûr de vouloir supprimer ce to do ? Toutes ses données seront supprimées de façon permanente. Cette action est irréversible.</p>
                <div className="flex justify-between mt-4">
                    <button onClick={() => handleToDoDeletion(toDoToDelete)} className="bg-red-600 text-white px-4 py-2 rounded-md">Delete</button>
                    <button onClick={closeDeleteDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Cancel</button>
                </div>
            </DialogPanel>
        </Dialog>
            )}   
    </div>
    </>

  )
}

