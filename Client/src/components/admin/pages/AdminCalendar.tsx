import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { fetchAppointments, fetchBarbers, fetchSaloons, bookAppointment, fetchServices } from '../../../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { addHours, subHours, parseISO, format, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import styled from 'styled-components';
import { io as socketIOClient } from 'socket.io-client';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay: (date: Date) => date.getDay(),
  locales,
});

const messages = {
  today: 'Днес',
  previous: 'Назад',
  next: 'Напред',
  day: 'Ден',
  week: 'Седмица',
  month: 'Месец',
  agenda: 'Списък',
  allDay: 'Цял ден',
  date: 'Дата',
  time: 'Час',
  event: 'Събитие',
  noEventsInRange: 'Няма събития за този период',
};

const CalendarWrapper = styled.div`
  padding: 2rem 2rem 0 2rem;
  .rbc-calendar, .rbc-time-view, .rbc-timeslot-group, .rbc-time-header, .rbc-time-content, .rbc-time-slot, .rbc-label, .rbc-header, .rbc-event, .rbc-time-gutter, .rbc-timeslot-group {
    background: #181818 !important;
    color: #fff !important;
    border-color: #333 !important;
  }
  .rbc-event {
    background-color: #C19B76 !important;
    color: #000 !important;
    border: none !important;
    font-weight: bold;
  }
  .rbc-toolbar button {
    background: #222 !important;
    color: #fff !important;
    border: 1px solid #444 !important;
  }
  .rbc-toolbar button.rbc-active {
    background: #C19B76 !important;
    color: #000 !important;
  }
  .rbc-today {
    background: #222 !important;
  }
  .rbc-time-header-content, .rbc-header {
    background: #181818 !important;
    color: #C19B76 !important;
    font-weight: bold;
  }
`;

const DayNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  justify-content: center;
  align-items: center;
`;
const DayButton = styled.button<{ selected: boolean }>`
  background: ${({ selected }) => (selected ? '#C19B76' : '#222')};
  color: ${({ selected }) => (selected ? '#000' : '#fff')};
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px 28px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
`;

const FilterRow = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;

  select {
    font-size: 1.1rem;
    padding: 8px 18px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #222;
    color: #fff;
    min-width: 220px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #222;
  color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 10px;
  min-width: 320px;
  box-shadow: 0 4px 32px #000a;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  select {
    font-size: 1.15rem;
    padding: 10px 22px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #222;
    color: #fff;
    min-width: 250px;
    margin-top: 4px;
    margin-bottom: 4px;
  }
`;
const ModalTitle = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #C19B76;
`;
const ModalButtonRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;
const DeleteButton = styled.button`
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
`;
const CloseButton = styled.button`
  background: #444;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
`;

const AddButton = styled.button`
  background: #C19B76;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 18px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

interface Salon { 
  _id: string; 
  id: string; 
  name: string; 
}

interface Barber { 
  _id: string; 
  id: string; 
  name: string; 
  saloonId?: string; 
  saloon?: { 
    id: string;
    name: string;
  };
  saloonAssignments?: Array<{
    date: string;
    saloon: {
      _id: string;
      name: string;
    };
  }>;
}

interface Appointment {
  _id: string;
  staff: { id: string; name: string };
  customer: { firstname: string; lastname: string; phone: string };
  dateTime: { date: string; time: string };
  service: { 
    _id: string;
    name: string;
    duration: number;
  };
  salonId?: string;
  salon?: { 
    id: string;
    name: string;
  };
}

interface Resource {
  resourceId: string;
  resourceTitle: string;
}
interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
}

const AdminCalendar = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [minTime, setMinTime] = useState<Date>(new Date(new Date().setHours(8,0,0,0)));
  const [maxTime, setMaxTime] = useState<Date>(new Date(new Date().setHours(18,0,0,0)));
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [addForm, setAddForm] = useState({
    barberName: '',
    salonId: '',
    serviceId: '',
    date: '',
    time: '',
    customerName: '',
    customerPhone: '',
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSaloons().then(setSalons);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetchBarbers().then(setBarbers);
    fetchServices().then(setServices);
  }, []);

  useEffect(() => {
    fetchAppointments().then(setAppointments);
  }, [selectedSalon, selectedBarber]);

  useEffect(() => {
    const socket = socketIOClient('http://localhost:3000');
    socket.on('appointment:new', (appointment) => {
      setAppointments(prev => [...prev, appointment]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Helper: get barbers assigned to a salon on a given date
  const getBarbersAssignedToSalonOnDate = (salonId: string, date: string) => {
    return barbers.filter(b => {
      if (!b.saloonAssignments) return false;
      return b.saloonAssignments.some(assignment => {
        const assignmentDate = new Date(assignment.date).toISOString().split('T')[0];
        return assignmentDate === date && assignment.saloon._id === salonId;
      });
    });
  };

  // Helper: get assignment for a barber on a given date and salon
  const getAssignmentForBarberOnDateAndSalon = (b: Barber, date: string, salonId?: string) =>
    b.saloonAssignments?.find(assignment =>
      new Date(assignment.date).toISOString().split('T')[0] === date &&
      (!salonId || assignment.saloon._id === salonId)
    );

  // Day navigation logic
  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const todayStr = todayDate.toISOString().split('T')[0];
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
  const dayOptions = [
    { label: 'Днес', value: todayStr },
    { label: 'Утре', value: tomorrowStr },
  ];

  const formatLocalTime = (utcTimeString: string) => {
    const date = parseISO(utcTimeString);
    return format(date, 'HH:mm');
  };

  useEffect(() => {
    // Filter appointments and compute resources
    let filteredAppointments = appointments;
    let resourceList: Barber[] = [];
    
    if (selectedSalon) {
      // Only barbers assigned to this salon for the current date
      resourceList = getBarbersAssignedToSalonOnDate(selectedSalon, currentDate);
      // Show appointments for barbers assigned to this salon for the current date
      const assignedBarberIds = resourceList.map(b => b._id || b.id);
      filteredAppointments = appointments.filter(a => assignedBarberIds.includes(a.staff.id));
    } else if (selectedBarber) {
      // If barber is selected, show only that barber
      resourceList = barbers.filter(b => b._id === selectedBarber || b.id === selectedBarber);
      filteredAppointments = appointments.filter(a => a.staff.id === selectedBarber);
    } else {
      // Show all barbers who are assigned to any salon on the current date
      resourceList = barbers.filter(b => {
        const hasAssignment = b.saloonAssignments?.some(assignment => 
          new Date(assignment.date).toISOString().split('T')[0] === currentDate
        );
        return hasAssignment;
      });
    }

    // Convert appointments to events with local time
    const eventsList = filteredAppointments.map(app => {
      const startTime = parseISO(`${app.dateTime.date}T${app.dateTime.time}`);
      const endTime = addHours(startTime, app.service.duration / 60);
      
      return {
        id: app._id,
        title: `${app.customer.firstname} ${app.customer.lastname} - ${app.service.name}`,
        start: startTime,
        end: endTime,
        resourceId: app.staff.id,
        resourceTitle: app.staff.name
      };
    });

    setEvents(eventsList);
    setResources(resourceList.map(b => ({
      resourceId: b._id || b.id,
      resourceTitle: b.name
    })));

    // Compute min/max time
    let min = 8, max = 18;
    filteredAppointments.forEach(a => {
      const startHour = parseISO(a.dateTime.date + 'T' + a.dateTime.time).getHours();
      const endHour = startHour + (a.service.duration / 60);
      if (startHour < min) min = startHour;
      if (endHour > max) max = endHour;
    });
    setMinTime(subHours(new Date().setHours(min, 0, 0, 0), 1));
    setMaxTime(addHours(new Date().setHours(max, 0, 0, 0), 1));
  }, [appointments, selectedSalon, selectedBarber, currentDate]);

  // Filter barber dropdown options
  let barberDropdownOptions: Barber[] = barbers;
  if (selectedSalon) {
    barberDropdownOptions = getBarbersAssignedToSalonOnDate(selectedSalon, currentDate);
  } else {
    // Only show barbers assigned to any salon on the current date
    barberDropdownOptions = barbers.filter(b => b.saloonAssignments?.some(assignment => new Date(assignment.date).toISOString().split('T')[0] === currentDate));
  }

  // Find appointment by event id
  const getAppointmentByEvent = (event: Event | null) => {
    if (!event) return null;
    return appointments.find(a => a._id === event.id);
  };

  // Delete appointment
  const handleDelete = async () => {
    if (!selectedEvent) return;
    setDeleting(true);
    try {
      await fetch(`/api/appointments/${selectedEvent.id}`, { method: 'DELETE' });
      setModalOpen(false);
      setSelectedEvent(null);
      // Refresh appointments
      fetchAppointments().then(setAppointments);
    } catch (error) {
      console.error(error);
      alert('Грешка при изтриване на резервацията!');
    } finally {
      setDeleting(false);
    }
  };

  // Barbers for add form (filtered by salon if selected)
  const addBarberOptions = selectedSalon
    ? barbers.filter(b => b.saloonAssignments?.some(a => new Date(a.date).toISOString().split('T')[0] === currentDate && a.saloon._id === selectedSalon))
    : barbers;

  // Salons for add form
  const addSalonOptions = salons;

  // Handle add form change
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(f => ({ ...f, [name]: value }));
  };

  // Handle add appointment
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setAdding(true);
    const { barberName, serviceId, date, time, customerName, customerPhone } = addForm;
    const appointmentDate = date + 'T' + time;
    const payload = {
      barberName,
      customerName,
      customerPhone,
      customerEmail: '', // Not used, but required by type
      date: appointmentDate,
      serviceId,
    };
    const result = await bookAppointment(payload);
    setAdding(false);
    if ('error' in result) {
      alert('Грешка при добавяне на резервация!');
      return;
    }
    setAddModalOpen(false);
    setAddForm({ barberName: '', salonId: '', serviceId: '', date: '', time: '', customerName: '', customerPhone: '' });
    fetchAppointments().then(setAppointments);
  };

  return (
    <CalendarWrapper>
      <AddButton onClick={() => setAddModalOpen(true)}>Добави резервация</AddButton>
      {/* Modal for appointment details */}
      {modalOpen && selectedEvent && (
        <ModalOverlay onClick={() => setModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Детайли за резервация</ModalTitle>
            {(() => {
              const appt = getAppointmentByEvent(selectedEvent);
              if (!appt) return <div>Резервацията не е намерена.</div>;
              return <>
                <div><b>Клиент:</b> {appt.customer.firstname} {appt.customer.lastname} <span style={{color:'#C19B76'}}>{appt.customer.phone && appt.customer.phone.startsWith('0') ? appt.customer.phone.slice(1) : appt.customer.phone}</span></div>
                <div><b>Дата:</b> {appt.dateTime.date} <b>Час:</b> {appt.dateTime.time}</div>
                <div><b>Фризьор:</b> {appt.staff.name}</div>
                {appt.salon && <div><b>Салон:</b> {appt.salon.name}</div>}
              </>;
            })()}
            <ModalButtonRow>
              <CloseButton onClick={() => setModalOpen(false)}>Затвори</CloseButton>
              <DeleteButton onClick={handleDelete} disabled={deleting}>{deleting ? 'Изтриване...' : 'Изтрий'}</DeleteButton>
            </ModalButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}
      {/* Add Appointment Modal */}
      {addModalOpen && (
        <ModalOverlay onClick={() => setAddModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Добави резервация</ModalTitle>
            <form onSubmit={handleAddAppointment}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label>Салон:
                  <select name="salonId" value={addForm.salonId || selectedSalon} onChange={handleAddFormChange} required>
                    <option value="">Избери салон</option>
                    {addSalonOptions.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label>Фризьор:
                  <select name="barberName" value={addForm.barberName} onChange={handleAddFormChange} required>
                    <option value="">Избери фризьор</option>
                    {addBarberOptions.map(b => <option key={b._id || b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </label>
                <label>Услуга:
                  <select name="serviceId" value={addForm.serviceId} onChange={handleAddFormChange} required>
                    <option value="">Избери услуга</option>
                    {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </label>
                <label>Дата:
                  <input type="date" name="date" value={addForm.date} onChange={handleAddFormChange} required />
                </label>
                <label>Час:
                  <input type="time" name="time" value={addForm.time} onChange={handleAddFormChange} required />
                </label>
                <label>Име на клиент:
                  <input type="text" name="customerName" value={addForm.customerName} onChange={handleAddFormChange} required />
                </label>
                <label>Телефон на клиент:
                  <input type="text" name="customerPhone" value={addForm.customerPhone} onChange={handleAddFormChange} required />
                </label>
                <ModalButtonRow>
                  <CloseButton type="button" onClick={() => setAddModalOpen(false)}>Затвори</CloseButton>
                  <DeleteButton as="button" type="submit" disabled={adding} style={{ background: '#C19B76', color: '#000' }}>{adding ? 'Добавяне...' : 'Добави'}</DeleteButton>
                </ModalButtonRow>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
      <DayNav>
        {dayOptions.map(opt => (
          <DayButton
            key={opt.value}
            selected={currentDate === opt.value}
            onClick={() => setCurrentDate(opt.value)}
          >
            {opt.label}
          </DayButton>
        ))}
      </DayNav>
      <FilterRow>
        <select value={selectedSalon} onChange={e => { setSelectedSalon(e.target.value); setSelectedBarber(''); }}>
          <option value="">Всички салони</option>
          {salons.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
        </select>
        <select value={selectedBarber} onChange={e => { setSelectedBarber(e.target.value); setSelectedSalon(''); }}>
          <option value="">Всички фризьори</option>
          {barberDropdownOptions.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
        </select>
      </FilterRow>
      <Calendar
        localizer={localizer}
        events={events}
        resources={resources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        defaultView={Views.DAY}
        views={['day']}
        min={minTime}
        max={maxTime}
        step={30}
        timeslots={2}
        style={{ height: 800, margin: '2rem 0', background: '#181818', borderRadius: 8 }}
        messages={messages}
        date={parseISO(currentDate)}
        onNavigate={() => {}} // Disable default navigation
        toolbar={false} // Hide default toolbar
        onSelectEvent={event => { setSelectedEvent(event); setModalOpen(true); }}
      />
    </CalendarWrapper>
  );
};

export default AdminCalendar; 