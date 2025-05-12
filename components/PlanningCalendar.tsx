import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createPlanning, deletePlanning, fetchPlannings, updatePlanning } from "@/services/api/planningService";
import { fetchEmployees } from "@/services/api/userService";
import frLocale from '@fullcalendar/core/locales/fr';
import { fetchWorkSitesWithoutPagination } from "@/services/api/workSiteService";
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { updatePlanningSchema, createPlanningSchema } from "@/validation/planningValidation";
import { toast } from 'react-hot-toast';



interface PlanningCalendarProps {
  // Manage calendar in function of the role
  role: "director" | "employee" | "secretary";
  // Filter planning of an employee
  clerkUserId?: string;
  selectedEmployee?: string;
  csrfToken: string;
}

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ role, clerkUserId, csrfToken }) => {
  // Display form or not
  const [showForm, setShowForm] = useState<boolean>(false);
  // Event selectionated for modification
  const [selectedEvent, setSelectedEvent] = useState<CreateOrUpdateCalendarEventType | null>(null);
  // Title of the event
  const [eventTitle, setEventTitle] = useState<string>("");
  // FullCalendar events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [workSites, setWorkSites] = useState<WorkSiteForListType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(clerkUserId);
  const [selectedWorkSite, setSelectedWorkSite] = useState<string | undefined>();
  // Modal to display to make sure the users wants to delete 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Retrieve employee name for the title of the created event
  const [, setEmployeeName] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});


  useEffect(() => {

    if (role === "director") {
      const loadEmployees = async () => {
        try {
          const data = await fetchEmployees();
          setEmployees(data.userList);
        } catch (error) {
          console.error("Impossible de charger les employés :", error);
        }
      };

      loadEmployees();

      const loadWorkSites = async () => {
        try {
          const data = await fetchWorkSitesWithoutPagination();
          setWorkSites(data['inProgressWorkSites']);
        } catch (error) {
          console.error("Impossible de charger les employés :", error);
        }
      };

      loadWorkSites();
    }
    const loadPlannings = async () => {
      try {
        const data = await fetchPlannings();

        // Filtrer en fonction du rôle et de l'employé sélectionné
        const employeeIdToFilter = role === "director" ? selectedEmployee : clerkUserId;

        // Transformer les plannings en format FullCalendar
        const formattedEvents = data.plannings
          .filter((planning: PlanningType) =>
            !employeeIdToFilter || planning.clerkUserId === employeeIdToFilter
          )
          .map((planning: PlanningType) => ({
            id: planning.id,
            title: `${planning.employee} - ${planning.task}`,
            start: new Date(planning.startTime),
            end: new Date(planning.endTime),
            workSiteId: planning.workSiteId,
            clerkUserId: planning.clerkUserId
          }));
        // console.log("Événements formatés pour FullCalendar :", formattedEvents);

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Impossible to load plannings :", error);
      }
    };

    loadPlannings();
  }, [role, clerkUserId, csrfToken]);

  const handleDeleteEvent = async () => {
    if (selectedEvent?.id) {
      try {
        await deletePlanning(selectedEvent.id, csrfToken)
        setEvents((prevEvents) => prevEvents.filter(event => event.id !== selectedEvent.id));
        setShowDeleteModal(false);
        setShowForm(false);
        toast.success("Evènement supprimé avec succès");

      } catch (error) {
        toast.error("Erreur lors de la suppression du planning");

        console.error("Erreur lors de la suppression de l'événement :", error);
      }
    }
  };

  // Modify a planning (only available for director)
  const handleEventDrop = async (eventInfo: EventDropArg) => {
    if (role !== "director") return;
    if (!eventInfo.event.start) return;

    const updatedEvent = {
      id: eventInfo.event.id,
      startTime: eventInfo.event.start.toISOString(),
      endTime: eventInfo.event.end?.toISOString(),
    };

    await fetch(`/api/plannings/${updatedEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    });

    setEvents((prev) =>
      prev.map((event) =>
        event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const handleEventClick = (info: EventClickArg) => {
    // info.event contains instance of event FullCalendar (EventImpl)
    const event = info.event;

    console.log("event à modifier : " + JSON.stringify(event));

    // Extract title without employee name (formatted as "Title - Employee")
    let title = event.title;
    if (title.includes(" - ")) {
      title = title.split(" - ")[1];
    }

    setEventTitle(title);
    setSelectedEmployee(event.extendedProps.clerkUserId);
    setSelectedWorkSite(event.extendedProps.workSiteId);

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      clerkUserId: event.extendedProps.clerkUserId,
      workSiteId: event.extendedProps.workSiteId
    });
    setShowForm(true);
  };


  // DisplayForm
  const displayCreationForm = (selectInfo: DateSelectArg) => {
    const { start, end } = selectInfo;

    const localStart = new Date(start);
    const localEnd = new Date(end);
    // We minus 2 hours because if we make selection by click there will be 2 hours decalage because of the input fields
    localStart.setHours(localStart.getHours() - 2);
    localEnd.setHours(localEnd.getHours() - 2);
    setSelectedEvent({ start: localStart, end: localEnd });

    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eventTitle && selectedEmployee && selectedWorkSite && selectedEvent?.start && selectedEvent?.end) {
      const localStart = new Date(selectedEvent.start);
      const localEnd = new Date(selectedEvent.end);

      // Adjust hours (évite les décalages de fuseau horaire)
      localStart.setMinutes(localStart.getMinutes() - localStart.getTimezoneOffset());
      localEnd.setMinutes(localEnd.getMinutes() - localEnd.getTimezoneOffset());

      // Create new event
      if (!selectedEvent.id) {
        const newEvent = {
          title: eventTitle,
          start: localStart,
          end: localEnd,
          clerkUserId: selectedEmployee,
          workSiteId: selectedWorkSite
        };
        console.log("New event : " + JSON.stringify(newEvent))
        try {
          // Validation des données du formulaire en fonction du statut
          const validationResult = createPlanningSchema.safeParse(newEvent);

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
          const data = await createPlanning(newEvent, csrfToken)
          setEvents(prev => [...prev, { ...newEvent, id: data.id }]);
        } catch (error) {
          toast.error("Erreur lors de la création du planning");

          console.error("Erreur lors de la création de l'événement :", error);
        }
      }
      // existing event's update
      else {
        const updatedEvent = {
          id: selectedEvent.id,
          title: eventTitle !== selectedEvent.title ? eventTitle : null,
          start: selectedEvent.start !== localStart ? localStart : null,
          end: selectedEvent.end !== localEnd ? localEnd : null,
          clerkUserId: selectedEmployee !== selectedEvent.clerkUserId ? selectedEmployee : null,
          workSiteId: selectedWorkSite !== selectedEvent.workSiteId ? selectedWorkSite : null
        };
        console.log("updated Event : " + JSON.stringify(updatedEvent))
        try {
          // Validation des données du formulaire en fonction du statut
          const validationResult = updatePlanningSchema.safeParse(updatedEvent);

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
          await updatePlanning(selectedEvent.id, updatedEvent, csrfToken);
          setEvents((prev) =>
            prev.map((event) =>
              event.id === selectedEvent.id
                ? {
                  ...event,
                  // We only udpate fields that changed (for performance in database)
                  ...(updatedEvent.start && updatedEvent.start !== event.start ? { start: updatedEvent.start } : {}),
                  ...(updatedEvent.end && updatedEvent.end !== event.end ? { end: updatedEvent.end } : {}),
                  ...(updatedEvent.title && updatedEvent.title !== event.title ? { title: updatedEvent.title } : {}),
                  ...(updatedEvent.clerkUserId && updatedEvent.clerkUserId !== event.clerkUserId ? { clerkUserId: updatedEvent.clerkUserId } : {}),
                  ...(updatedEvent.workSiteId && updatedEvent.workSiteId !== event.workSiteId ? { workSiteId: updatedEvent.workSiteId } : {}),
                }
                : event
            )
          );
        } catch (error) {
          toast.error("Impossible de modifier le planning !");

          console.error("Erreur lors de la modification de l'événement :", error);
        }
      }

      // Re initialize form after submission
      setShowForm(false);
      setEventTitle("");
      setSelectedEmployee(undefined);
      setSelectedWorkSite(undefined);
      setSelectedEvent(null);
    } else {
      toast.error("Tous les champs sont obligatoires pour la création");

      console.error("Tous les champs sont obligatoires pour la création !");
    }
  };

  const formTitle = selectedEvent?.id ? "Modifier l'événement" : "Ajouter un événement";

  return (
    <>
                <header className="mb-6">
              <h1 className="text-3xl font-bold text-[#1873BF] text-center mb-2">Planning</h1>
            </header>
      <button
        onClick={() => setShowForm(true)}
        className="bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2 rounded-lg shadow transition"
      >
        Ajouter un événement
      </button>

      {/* Formulaire modal visible uniquement pour le directeur */}
      {showForm && role === "director" && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-form-title"
        >
          <form
            onSubmit={handleFormSubmit}
            className="relative bg-custom-white rounded-xl p-6  max-w-md shadow-lg"
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-xl font-bold"
              aria-label="Fermer le formulaire"
            >
              ✖
            </button>

            <h2 id="event-form-title" className="text-xl font-semibold text-primary mb-4">
              {formTitle}
            </h2>

            {/* Champ titre */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-custom-gray">
                Titre de l&apos;événement
              </label>
              <input
                id="title"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="mt-1 p-2 border border-custom-gray/30 rounded-md text-black focus:ring-primary focus:border-primary"
                required
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Sélecteur employé */}
            <div className="mb-4">
              <label htmlFor="employee" className="block text-sm font-medium text-custom-gray">
                Sélectionner un employé
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  const selectedEmp = employees.find((emp) => emp.id === e.target.value);
                  if (selectedEmp) {
                    setEmployeeName(`${selectedEmp.firstName} ${selectedEmp.lastName}`);
                  }
                }}
                className="mt-1 p-2 border border-custom-gray/30 rounded-md  text-black focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Sélectionner un employé</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
              {errors.userId && <p className="text-sm text-red-600 mt-1">{errors.userId}</p>}
            </div>

            {/* Sélecteur chantier */}
            <div className="mb-4">
              <label htmlFor="worksite" className="block text-sm font-medium text-custom-gray">
                Sélectionner un chantier
              </label>
              <select
                id="worksite"
                value={selectedWorkSite}
                onChange={(e) => setSelectedWorkSite(e.target.value)}
                className="mt-1 p-2 border border-custom-gray/30 rounded-md  text-black focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Sélectionner un chantier</option>
                {workSites.map((workSite) => (
                  <option key={workSite.id} value={workSite.id}>
                    {workSite.title}
                  </option>
                ))}
              </select>
              {errors.workSiteId && <p className="text-sm text-red-600 mt-1">{errors.workSiteId}</p>}
            </div>

            {/* Date de début */}
            <div className="mb-4">
              <label htmlFor="start" className="block text-sm font-medium text-custom-gray">
                Date et heure de début
              </label>
              <input
                id="start"
                type="datetime-local"
                value={
                  selectedEvent?.start
                    ? new Date(selectedEvent.start.getTime() - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setSelectedEvent((prev) => ({ ...prev, start: new Date(e.target.value) }))
                }
                className="mt-1 p-2 border border-custom-gray/30 rounded-md  text-black focus:ring-primary focus:border-primary"
                required
              />
              {errors.start && <p className="text-sm text-red-600 mt-1">{errors.start}</p>}
            </div>

            {/* Date de fin */}
            <div className="mb-4">
              <label htmlFor="end" className="block text-sm font-medium text-custom-gray">
                Date et heure de fin
              </label>
              <input
                id="end"
                type="datetime-local"
                value={
                  selectedEvent?.end
                    ? new Date(selectedEvent.end.getTime() - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setSelectedEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))
                }
                className="mt-1 p-2 border border-custom-gray/30 rounded-md  text-black focus:ring-primary focus:border-primary"
                required
              />
              {errors.end && <p className="text-sm text-red-600 mt-1">{errors.end}</p>}
            </div>

            <input type="hidden" name="csrf_token" value={csrfToken} />

            {/* Supprimer l’événement */}
            {selectedEvent?.id && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTimeout(() => setShowDeleteModal(true), 100);
                }}
                className="text-white bg-red-600 hover:bg-red-700 font-medium px-4 py-2 rounded-md  mt-2"
              >
                Supprimer
              </button>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirmation-title"
        >
          <div className="bg-custom-white p-6 rounded-lg shadow-xl  max-w-md">
            <h3 id="delete-confirmation-title" className="text-lg font-semibold text-primary mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-custom-gray mb-4">
              Êtes-vous sûr de vouloir supprimer cet événement ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-md bg-custom-gray text-white hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteEvent}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <FullCalendar
        timeZone="Europe/Paris"
        locale={frLocale}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={role === "director"}
        events={events}
        eventDrop={handleEventDrop}
        slotEventOverlap={false}
        selectOverlap={() => true}
        select={displayCreationForm}
        selectable={true}
        eventClick={handleEventClick}
      />
    </>
  );

};

export default PlanningCalendar;