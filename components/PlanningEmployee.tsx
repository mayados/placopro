import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";

interface PlanningEmployeeProps {
  events: PlanningType[];
}

const PlanningEmployee: React.FC<PlanningEmployeeProps> = ({ events }) => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = (task: string) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Close modal with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;
    const title = event.title;
    const task = title.split(" ").slice(1).join(" "); // assumes format "Worksite Tâche"
    openModal(task);
  };

  const formattedEvents = events.map((planning: PlanningType) => ({
    id: planning.id,
    title: `${planning.workSite.title} ${planning.task}`,
    start: new Date(planning.startTime),
    end: new Date(planning.endTime),
  }));

  return (
    <>
      <FullCalendar
        timeZone="Europe/Paris"
        locale={frLocale}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={formattedEvents}
        slotEventOverlap={false}
        selectOverlap={() => true}
        selectable={true}
        eventClick={handleEventClick}
      />

      {/* Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === modalRef.current) closeModal();
          }}
          ref={modalRef}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Tâche à effectuer</h2>
            <p className="text-sm text-gray-700">{selectedTask}</p>

            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanningEmployee;
