import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import apiClient from '../../../utils/apiClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faClock, faUser, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import { format, addDays } from 'date-fns';

const PageContainer = styled.div`
  padding: 0 40px 0 40px;
  @media (max-width: 700px) {
    padding: 0 10px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2.5rem;
  padding: 3rem 0 2rem 0;
`;

const Card = styled.div`
  background: #232323;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
  min-height: 340px;
  &:hover {
    box-shadow: 0 8px 32px rgba(193,155,118,0.13);
    transform: translateY(-4px) scale(1.02);
  }
`;

const BarberImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  background: #444;
  border: 4px solid #C19B76;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
`;

const BarberName = styled.h3`
  color: #fff;
  margin: 0.5rem 0 1.2rem 0;
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.7rem;
`;

const ActionButton = styled.button`
  background: #C19B76;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 500;
  transition: background 0.2s;
  box-shadow: none;
  &:hover { background: #b08a65; }
`;

const FabButton = styled.button`
  position: fixed;
  right: 2.5rem;
  bottom: 2.5rem;
  min-width: 170px;
  height: 54px;
  border-radius: 10px;
  background: #C19B76;
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  cursor: pointer;
  z-index: 4000;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: #b08a65;
    box-shadow: 0 8px 32px rgba(193,155,118,0.18);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: #232323;
  border-radius: 14px;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 350px;
  max-width: 98vw;
  box-shadow: 0 2px 24px rgba(0,0,0,0.18);
`;

const ModalTitle = styled.h2`
  color: #fff;
  margin-top: 0;
  font-size: 1.35rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  margin-bottom: 1.2rem;
  border-radius: 5px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
  font-size: 1.08rem;
`;

const ErrorMsg = styled.div`
  color: #ff4444;
  margin-bottom: 1rem;
`;

const HourRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
`;
const HourInput = styled.input`
  width: 100%;
  padding: 0.9rem;
  border-radius: 5px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
  font-size: 1.08rem;
`;

const AssignmentsContainer = styled.div`
  margin-top: 1rem;
  width: 100%;
`;

const DateGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const DateLabel = styled.div`
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const DateValue = styled.div`
  color: ${props => props.color || '#bbb'};
  font-size: 1.1rem;
  font-weight: 500;
`;

const SaloonSelect = styled.select`
  width: 100%;
  padding: 0.9rem;
  margin-bottom: 1.2rem;
  border-radius: 5px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
  font-size: 1.08rem;
`;

const Spinner = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  color: #C19B76;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TimeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const TimeSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TimeLabel = styled.div`
  color: #bbb;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimeInputs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TimeDash = styled.div`
  color: #bbb;
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0.5rem;
  align-self: flex-end;
  padding-bottom: 0.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const InputLabel = styled.div`
  color: #bbb;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface Barber {
  _id: string;
  name: string;
  image?: string;
  email?: string;
  phone?: string;
  startHour?: number;
  startMinutes?: number;
  endHour?: number;
  endMinutes?: number;
  saloonAssignments: Array<{
    date: string;
    saloon: {
      _id: string;
      name: string;
    };
  }>;
}

interface Saloon {
  _id: string;
  name: string;
}

interface Appointment {
  _id: string;
  staff: { id: string; name: string };
  dateTime: { date: string; time: string };
}

const Barbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [saloons, setSaloons] = useState<Saloon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editBarber, setEditBarber] = useState<Barber | null>(null);
  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState<number | ''>('');
  const [startMinutes, setStartMinutes] = useState<number | ''>('');
  const [endHour, setEndHour] = useState<number | ''>('');
  const [endMinutes, setEndMinutes] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loadingAssignments, setLoadingAssignments] = useState<{[key: string]: boolean}>({});

  const fetchBarbers = async () => {
    try {
      const res = await apiClient.get('/api/barbers');
      setBarbers(res.data);
    } catch {
      setError('Failed to fetch barbers');
    }
  };

  const fetchSaloons = async () => {
    try {
      const res = await apiClient.get('/api/saloons');
      setSaloons(res.data);
    } catch {
      setError('Failed to fetch saloons');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/api/appointments');
      setAppointments(res.data);
    } catch {
      setError('Failed to fetch appointments');
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchSaloons();
    fetchAppointments();
  }, []);

  const openAddModal = () => {
    setEditBarber(null);
    setName('');
    setStartHour('');
    setStartMinutes('');
    setEndHour('');
    setEndMinutes('');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (barber: Barber) => {
    setEditBarber(barber);
    setName(barber.name);
    setStartHour(barber.startHour ?? '');
    setStartMinutes(barber.startMinutes ?? '');
    setEndHour(barber.endHour ?? '');
    setEndMinutes(barber.endMinutes ?? '');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditBarber(null);
    setName('');
    setStartHour('');
    setStartMinutes('');
    setEndHour('');
    setEndMinutes('');
    setImage(null);
    setError('');
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required');
      return;
    }
    if (startHour === '' || endHour === '') {
      setError('Working hours are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('startHour', String(startHour));
      formData.append('startMinutes', String(startMinutes || 0));
      formData.append('endHour', String(endHour));
      formData.append('endMinutes', String(endMinutes || 0));
      if (image) formData.append('image', image);
      if (editBarber) {
        await apiClient.put(`/api/barbers/${editBarber._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await apiClient.post('/api/barbers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      closeModal();
      fetchBarbers();
    } catch {
      setError('Failed to save barber');
    }
  };

  const handleAssignmentChange = async (barber: Barber, date: Date, saloonId: string) => {
    const assignmentKey = `${barber._id}-${date.toISOString()}`;
    setLoadingAssignments(prev => ({ ...prev, [assignmentKey]: true }));
    try {
      if (saloonId === '') {
        await apiClient.post(`/api/barbers/${barber._id}/assign-saloon`, {
          date: date.toISOString(),
          saloonId: "-1"
        });
      } else {
        await apiClient.post(`/api/barbers/${barber._id}/assign-saloon`, {
          date: date.toISOString(),
          saloonId
        });
      }
      await fetchBarbers();
    } catch {
      setError('Failed to update assignment');
    } finally {
      setLoadingAssignments(prev => ({ ...prev, [assignmentKey]: false }));
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  const getAssignmentForDate = (barber: Barber, date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return barber.saloonAssignments.find(a => format(new Date(a.date), 'yyyy-MM-dd') === dStr);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Сигурен ли си, че искаш да изтриеш този фризьор?')) return;
    try {
      await apiClient.delete(`/api/barbers/${id}`);
      fetchBarbers();
    } catch {
      setError('Неуспешно изтриване на фризьора');
    }
  };

  const hasAppointmentsForDay = (barber: Barber, date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return appointments.some(a => a.staff.id === barber._id && a.dateTime.date === dStr);
  };

  return (
    <PageContainer>
      <Grid>
        {barbers.map(barber => (
          <Card key={barber._id}>
            <BarberImage src={barber.image || '/default-barber.png'} alt={barber.name} />
            <BarberName>{barber.name}</BarberName>
            {(barber.startHour !== undefined && barber.endHour !== undefined) && (
              <div style={{ color: '#bbb', fontSize: '1.02rem', marginBottom: '1.1rem' }}>
                Работно време: {barber.startHour.toString().padStart(2, '0')}:{barber.startMinutes?.toString().padStart(2, '0') || '00'} - {barber.endHour.toString().padStart(2, '0')}:{barber.endMinutes?.toString().padStart(2, '0') || '00'}
              </div>
            )}
            <AssignmentsContainer>
              <DateGrid>
                {getNextSevenDays().map((date, idx) => {
                  const assignment = getAssignmentForDate(barber, date);
                  const disableAssignment = hasAppointmentsForDay(barber, date);
                  const assignmentKey = `${barber._id}-${date.toISOString()}`;
                  const isLoading = loadingAssignments[assignmentKey];
                  
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                      <DateLabel style={{ marginBottom: 2 }}>{format(date, 'EEEE')}</DateLabel>
                      <DateValue style={{ marginBottom: 4 }}>{format(date, 'MMM d')}</DateValue>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <SaloonSelect
                            style={{ 
                              fontSize: '0.98rem', 
                              padding: '0.5rem', 
                              minWidth: 0,
                              flex: 1
                            }}
                            value={assignment ? assignment.saloon._id : ''}
                            onChange={e => handleAssignmentChange(barber, date, e.target.value)}
                            disabled={disableAssignment || isLoading}
                          >
                            <option value="">Почивка</option>
                            {saloons.map(saloon => (
                              <option key={saloon._id} value={saloon._id}>{saloon.name}</option>
                            ))}
                          </SaloonSelect>
                          {isLoading && (
                            <Spinner>
                              <FontAwesomeIcon icon={faSpinner} />
                            </Spinner>
                          )}
                        </div>
                      </div>
                      {disableAssignment && <span style={{ color: '#ff4444', fontSize: '0.95rem', marginTop: 2 }}>Има записани часове</span>}
                    </div>
                  );
                })}
              </DateGrid>
            </AssignmentsContainer>
            <Actions>
              <ActionButton onClick={() => openEditModal(barber)}>Редактирай</ActionButton>
              <ActionButton onClick={() => handleDelete(barber._id)} style={{ background: '#ff4444' }}>Изтрий</ActionButton>
            </Actions>
          </Card>
        ))}
      </Grid>
      <FabButton onClick={openAddModal} title="Add Barber">
        <FontAwesomeIcon icon={faPlus} /> Добави фризьор
      </FabButton>
      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>{editBarber ? 'Редактиране на фризьор' : 'Добавяне на фризьор'}</ModalTitle>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <InputLabel>
                  <FontAwesomeIcon icon={faUser} />
                  Име на фризьора
                </InputLabel>
                <Input
                  type="text"
                  placeholder="Въведете име"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </InputGroup>

              <TimeInputGroup>
                <TimeSection>
                  <TimeLabel>
                    <FontAwesomeIcon icon={faClock} />
                    Начало на работа
                  </TimeLabel>
                  <TimeInputs>
                    <HourInput
                      type="number"
                      min={0}
                      max={23}
                      placeholder="Час"
                      value={startHour}
                      onChange={e => setStartHour(e.target.value === '' ? '' : Math.max(0, Math.min(23, Number(e.target.value))))}
                      required
                    />
                    <HourInput
                      type="number"
                      min={0}
                      max={59}
                      placeholder="Мин"
                      value={startMinutes}
                      onChange={e => setStartMinutes(e.target.value === '' ? '' : Math.max(0, Math.min(59, Number(e.target.value))))}
                      required
                    />
                  </TimeInputs>
                </TimeSection>

                <TimeDash>—</TimeDash>

                <TimeSection>
                  <TimeLabel>
                    <FontAwesomeIcon icon={faClock} />
                    Край на работа
                  </TimeLabel>
                  <TimeInputs>
                    <HourInput
                      type="number"
                      min={0}
                      max={23}
                      placeholder="Час"
                      value={endHour}
                      onChange={e => setEndHour(e.target.value === '' ? '' : Math.max(0, Math.min(23, Number(e.target.value))))}
                      required
                    />
                    <HourInput
                      type="number"
                      min={0}
                      max={59}
                      placeholder="Мин"
                      value={endMinutes}
                      onChange={e => setEndMinutes(e.target.value === '' ? '' : Math.max(0, Math.min(59, Number(e.target.value))))}
                      required
                    />
                  </TimeInputs>
                </TimeSection>
              </TimeInputGroup>

              <InputGroup>
                <InputLabel>
                  <FontAwesomeIcon icon={faImage} />
                  Снимка
                </InputLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </InputGroup>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <ActionButton type="button" onClick={closeModal} style={{ background: '#444' }}>
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: '0.5rem' }} />
                  Отказ
                </ActionButton>
                <ActionButton type="submit">
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }} />
                  {editBarber ? 'Запази промените' : 'Добави фризьор'}
                </ActionButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Barbers; 