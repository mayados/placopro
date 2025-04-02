import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createPlanning, deletePlanning, fetchPlannings, updatePlanning } from "@/services/api/planningService";
import { fetchEmployees } from "@/services/api/userService";
import frLocale from '@fullcalendar/core/locales/fr';
import { fetchWorkSites } from "@/services/api/workSiteService";
import { EventClickArg } from '@fullcalendar/core';



interface PlanningCalendarProps {
    // Manage calendar in function of the role
  role: "director" | "employee" | "secretary"; 
  // Filter planning of an employee
  clerkUserId?: string; 
  selectedEmployee?: string;
}

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ role, clerkUserId }) => {
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
  const [employeeName, setEmployeeName] = useState<string | null>(null); 


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
            const data = await fetchWorkSites();
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
    }, [role, clerkUserId]);
  
    const handleDeleteEvent = async() => {
      if (selectedEvent?.id) {
        try {
          const data = await deletePlanning(selectedEvent.id)
          setEvents((prevEvents) => prevEvents.filter(event => event.id !== selectedEvent.id));
          setShowDeleteModal(false);
          setShowForm(false);
        } catch (error) {
          console.error("Erreur lors de la création de l'événement :", error);
        }
      }
    };

    // Modify a planning (only available for director)
    const handleEventDrop = async (eventInfo: any) => {
      if (role !== "director") return; // Empêcher modification si pas directeur
  
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
  const displayCreationForm = (selectInfo: any) => {
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
        console.log("New event : "+JSON.stringify(newEvent))
        try {
          const data = await createPlanning(newEvent)
          setEvents(prev => [...prev, { ...newEvent, id: data.id }]);
        } catch (error) {
          console.error("Erreur lors de la création de l'événement :", error);
        }
      } 
      // existing event's update
      else {
        const updatedEvent = {
          id: selectedEvent.id, 
          title: eventTitle !== selectedEvent.title ? eventTitle : null,
          start: selectedEvent.start !== localStart? localStart : null,
          end: selectedEvent.end !== localEnd ? localEnd : null,
          clerkUserId: selectedEmployee !== selectedEvent.clerkUserId ? selectedEmployee : null,
          workSiteId: selectedWorkSite !== selectedEvent.workSiteId ? selectedWorkSite : null
        };
        console.log("updated Event : "+JSON.stringify(updatedEvent))
        try {
          const response = await updatePlanning(selectedEvent.id, updatedEvent); 
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
      console.error("Tous les champs sont obligatoires pour la création !");
    }
  };

  const formTitle = selectedEvent?.id ? "Modifier l'événement" : "Ajouter un événement";


    return (
      <div className="space-y-4 w-full z-20">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
        >
          Ajouter un événement
        </button>
        {/* Sélecteur d'employé visible uniquement pour le directeur */}
        {showForm && role==="director" &&(
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <form
              onSubmit={handleFormSubmit}
              className="bg-white p-4 rounded-lg shadow-lg w-96 z-50"
            >
              {/* close button */}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-2 right-2 text-red-700 hover:text-red-900"
              >
                ✖
              </button>
              <h2 className="text-xl mb-4 text-black">{formTitle}</h2>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-black">
                  Titre de l'événement
                </label>
                <input
                  id="title"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="employee" className="block text-sm font-medium text-black">
                  Sélectionner un employé
                </label>
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    // Search for employee name with the id
                    const selectedEmp = employees.find((employee) => employee.id === e.target.value);
                    if (selectedEmp) {
                      setEmployeeName(`${selectedEmp.firstName} ${selectedEmp.lastName}`); 
                    }}}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id} className="text-black">
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="employee" className="block text-sm font-medium text-black">
                  Sélectionner un chantier
                </label>
                <select
                  id="employee"
                  value={selectedWorkSite}
                  onChange={(e) => setSelectedWorkSite(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                >
                  <option value="">Sélectionner un chantier</option>
                  {workSites.map((workSite) => (
                    <option key={workSite.id} value={workSite.id}>
                      {workSite.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="start" className="block text-sm font-medium text-black">
                  Date et heure de début
                </label>
                <input
                  id="start"
                  type="datetime-local"
                  value={selectedEvent?.start ? new Date(selectedEvent.start.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSelectedEvent((prev) => ({ ...prev, start: new Date(e.target.value) }))}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="end" className="block text-sm font-medium text-black">
                  Date et heure de fin
                </label>
                <input
                  id="end"
                  type="datetime-local"
                  value={selectedEvent?.end ? new Date(selectedEvent.end.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSelectedEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                />
              </div>
              {/* delete button, only display on modification mode */}
              {selectedEvent?.id && (
                <button 
                  type="button"   
                  onClick={() => {
                    setShowForm(false); // Masquer le formulaire
                    setTimeout(() => setShowDeleteModal(true), 100); // Afficher la modale après un court délai
                  }} 
                  style={{ backgroundColor: "red", color: "white", marginTop: "10px" }}>
                  Supprimer l'événement
                </button>
              )}
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}
        {/*  Confirmation modale for suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal">
            <div className="modal-content">
              <h3>Confirmer la suppression</h3>
              <p>Êtes-vous sûr de vouloir supprimer cet événement ?</p>
              <button onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button onClick={handleDeleteEvent} style={{ backgroundColor: "red", color: "white" }}>
                Supprimer
              </button>
            </div>
          </div>
        )}
        {/* Calendrier */}
        <FullCalendar
          timeZone="Europe/Paris"
          locale={frLocale}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          // Only the director can modify
          editable={role === "director"} 
          events={events}
          eventDrop={handleEventDrop}
          // Disable events to be on top of each other
          slotEventOverlap={false}
          // Allows to select the selection even if an event already exists
          selectOverlap={() => true} 
          // Activate the callback function
          select={displayCreationForm}  
          // Allow time selection
          selectable={true}  
          eventClick={handleEventClick}
        />
      </div>
    );
  };
  
  export default PlanningCalendar;