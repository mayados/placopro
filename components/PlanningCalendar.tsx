import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatISO } from "date-fns";
import { fetchPlannings } from "@/services/api/planningService";


interface PlanningCalendarProps {
    // Manage calendar in function of the role
  role: "director" | "employee" | "secretary"; 
  // Filter planning of an employee
  clerkUserId?: string; 
}

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ role, clerkUserId }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(clerkUserId);
  
    // useEffect pour charger les employés si l'utilisateur est un directeur
    useEffect(() => {
      if (role === "director") {
        const loadEmployees = async () => {
          try {
            // Remplacez ceci par votre appel API réel pour récupérer les employés
            const response = await fetch('/api/employees');
            const data = await response.json();
            setEmployees(data.employees);
          } catch (error) {
            console.error("Impossible de charger les employés :", error);
          }
        };
        
        loadEmployees();
      }
    }, [role]);
  
    // useEffect pour charger les plannings en fonction de l'employé sélectionné
    useEffect(() => {
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
              title: planning.task,
              start: formatISO(new Date(planning.startTime)),
              end: formatISO(new Date(planning.endTime)),
            }));
  
          setEvents(formattedEvents);
        } catch (error) {
          console.error("Impossible to load plannings :", error);
        }
      };
  
      loadPlannings();
    }, [role, clerkUserId, selectedEmployee]);
  
    // Fonction pour modifier un planning (uniquement pour le directeur)
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
  
    // Gestionnaire pour le changement d'employé sélectionné
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedEmployee(e.target.value === "all" ? undefined : e.target.value);
    };
  
    return (
      <div className="space-y-4">
        {/* Sélecteur d'employé visible uniquement pour le directeur */}
        {role === "director" && (
          <div className="mb-4">
            <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner un employé
            </label>
            <select
              id="employee-select"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              value={selectedEmployee || "all"}
              onChange={handleEmployeeChange}
            >
              <option value="all">Tous les employés</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
  
        {/* Calendrier */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable={role === "director"} // Seulement modifiable par le directeur
          events={events}
          eventDrop={handleEventDrop}
        />
      </div>
    );
  };
  
  export default PlanningCalendar;