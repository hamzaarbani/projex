import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchTasks } from '../store/taskSlice';

// ✅ Import FullCalendar CSS directly
// import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';

// ... rest of your component (unchanged)

const CalendarView = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const { projects } = useSelector((state) => state.projects);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach((project) => {
        dispatch(fetchTasks(project._id));
      });
    }
  }, [dispatch, projects]);

  useEffect(() => {
    const taskEvents = tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task._id,
        title: task.title,
        start: task.dueDate,
        extendedProps: { status: task.status, priority: task.priority },
        backgroundColor:
          task.status === 'done'
            ? '#10b981'
            : task.status === 'in-progress'
            ? '#f59e0b'
            : '#6b7280',
      }));
    setEvents(taskEvents);
  }, [tasks]);

  const handleEventClick = (info) => {
    alert(`Task: ${info.event.title}\nStatus: ${info.event.extendedProps.status}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Calendar</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          themeSystem="standard"
          eventColor="#6366f1"
          dayMaxEvents={true}
        />
      </div>
    </div>
  );
};

export default CalendarView;