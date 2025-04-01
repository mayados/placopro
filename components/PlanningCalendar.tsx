import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createPlanning, fetchPlannings } from "@/services/api/planningService";
import { fetchEmployees } from "@/services/api/userService";
import frLocale from '@fullcalendar/core/locales/fr';
import { fetchWorkSites } from "@/services/api/workSiteService";


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
  const [selectedEvent, setSelectedEvent] = useState<any>(null);  
  // Title of the event
  const [eventTitle, setEventTitle] = useState<string>("");  
  // FullCalendar events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [workSites, setWorkSites] = useState<WorkSiteForListType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(clerkUserId);
  const [selectedWorkSite, setSelectedWorkSite] = useState<string | undefined>();
  // Retrieve employee name for the title of the created event
  const [employeeName, setEmployeeName] = useState<string | null>(null); 


  
    // useEffect pour charger les plannings en fonction de l'employé sélectionné
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
          console.log("données reçues après le fetch : " + JSON.stringify(data));
          
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
            console.log("Événements formatés pour FullCalendar :", formattedEvents);

          setEvents(formattedEvents);
        } catch (error) {
          console.error("Impossible to load plannings :", error);
        }
      };
  
      loadPlannings();
    }, [role, clerkUserId]);
  
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

    const handleEventClick = (clickInfo: any) => {
      setSelectedEvent({
        id: clickInfo.event.id,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
      });
    
      setEventTitle(clickInfo.event.title.split(" - ")[0]); // Récupère uniquement le titre
      setSelectedEmployee(clickInfo.event.extendedProps.clerkUserId);
      setSelectedWorkSite(clickInfo.event.extendedProps.workSiteId);
    
      const selectedEmp = employees.find(emp => emp.id === clickInfo.event.extendedProps.clerkUserId);
      setEmployeeName(selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : null);
    
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

  // handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedEmployee)

    if (employeeName && selectedEmployee && selectedWorkSite && eventTitle && selectedEvent.start && selectedEvent.end) {
      const localStart = new Date(selectedEvent.start);
      const localEnd = new Date(selectedEvent.end);
      
      // Ajust hour with local hour (if not the case, there will be a decalage of 2 hours)
      localStart.setMinutes(localStart.getMinutes() - localStart.getTimezoneOffset());
      localEnd.setMinutes(localEnd.getMinutes() - localEnd.getTimezoneOffset());

      const newEvent = {
        title: eventTitle,
        start: localStart, 
        end: localEnd, 
        clerkUserId: selectedEmployee,  
        workSiteId: selectedWorkSite
      };

      // Ajouter l'événement à l'état local
      setEvents((prevEvents) => [
        ...prevEvents, 
        { 
          ...newEvent, 
          // Add employee name to title for the display
          title: `${eventTitle} - ${employeeName}` 
        }
      ]);
      console.log("Evènements enregistrés : "+events)
      console.log("worksite : "+selectedWorkSite)
      console.log("employee : "+selectedEmployee)
      console.log("start : "+newEvent.start)
      console.log("end : "+newEvent.end)
      // Call to API route
      const data = await createPlanning(newEvent)
      

      // Close the form
      setShowForm(false);   
      
      // Reset form fields
      setEventTitle("");
      setSelectedEmployee(clerkUserId);
      setSelectedWorkSite(undefined);
      setSelectedEvent(null);
      setEmployeeName(null);
    }else{
      console.error("All fields are mandatory")
    }


  };
  
  
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
              <h2 className="text-xl mb-4">Ajouter un événement</h2>
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
                {/* <input
                  id="start"
                  type="datetime-local"
                  value={selectedEvent?.start ? new Date(selectedEvent.start.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSelectedEvent((prev) => ({ ...prev, start: new Date(e.target.value) }))}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                /> */}
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
                {/* <input
                  id="end"
                  type="datetime-local"
                  value={selectedEvent?.end ? new Date(selectedEvent.end.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSelectedEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                /> */}
                <input
                  id="end"
                  type="datetime-local"
                  value={selectedEvent?.end ? new Date(selectedEvent.end.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSelectedEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full text-black"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                  Sauvegarder
                </button>
              </div>
            </form>
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
        />
      </div>
    );
  };
  
  export default PlanningCalendar;