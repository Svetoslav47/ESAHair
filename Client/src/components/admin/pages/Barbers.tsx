import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
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

interface Barber {
  _id: string;
  name: string;
  image?: string;
  email?: string;
  phone?: string;
  startHour?: number;
  endHour?: number;
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

const Barbers: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [saloons, setSaloons] = useState<Saloon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editBarber, setEditBarber] = useState<Barber | null>(null);
  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState<number | ''>('');
  const [endHour, setEndHour] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const fetchBarbers = async () => {
    try {
      const res = await axios.get('/api/barbers');
      setBarbers(res.data);
    } catch {
      setError('Failed to fetch barbers');
    }
  };

  const fetchSaloons = async () => {
    try {
      const res = await axios.get('/api/saloons');
      setSaloons(res.data);
    } catch {
      setError('Failed to fetch saloons');
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchSaloons();
  }, []);

  const openAddModal = () => {
    setEditBarber(null);
    setName('');
    setStartHour('');
    setEndHour('');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (barber: Barber) => {
    setEditBarber(barber);
    setName(barber.name);
    setStartHour(barber.startHour ?? '');
    setEndHour(barber.endHour ?? '');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditBarber(null);
    setName('');
    setStartHour('');
    setEndHour('');
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
      formData.append('endHour', String(endHour));
      if (image) formData.append('image', image);
      if (editBarber) {
        await axios.put(`/api/barbers/${editBarber._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/barbers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      closeModal();
      fetchBarbers();
    } catch {
      setError('Failed to save barber');
    }
  };

  const handleAssignmentChange = async (barber: Barber, date: Date, saloonId: string) => {
    try {
      if (saloonId === '') {
        await axios.post(`/api/barbers/${barber._id}/assign-saloon`, {
          date: date.toISOString(),
          saloonId: null
        });
      } else {
        await axios.post(`/api/barbers/${barber._id}/assign-saloon`, {
          date: date.toISOString(),
          saloonId
        });
      }
      fetchBarbers();
    } catch {
      setError('Failed to update assignment');
    }
  };

  const getNextThreeDays = () => {
    const days = [];
    for (let i = 0; i < 3; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  const getAssignmentForDate = (barber: Barber, date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return barber.saloonAssignments.find(a => format(new Date(a.date), 'yyyy-MM-dd') === dStr);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this barber?')) return;
    try {
      await axios.delete(`/api/barbers/${id}`);
      fetchBarbers();
    } catch {
      setError('Failed to delete barber');
    }
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
                Working hours: {barber.startHour}:00 - {barber.endHour}:00
              </div>
            )}
            <AssignmentsContainer>
              <DateGrid>
                {getNextThreeDays().map((date, idx) => {
                  const assignment = getAssignmentForDate(barber, date);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                      <DateLabel style={{ marginBottom: 2 }}>{format(date, 'EEEE')}</DateLabel>
                      <DateValue style={{ marginBottom: 4 }}>{format(date, 'MMM d')}</DateValue>
                      <SaloonSelect
                        style={{ fontSize: '0.98rem', padding: '0.5rem', minWidth: 0 }}
                        value={assignment ? assignment.saloon._id : ''}
                        onChange={e => handleAssignmentChange(barber, date, e.target.value)}
                      >
                        <option value="">Почивка</option>
                        {saloons.map(saloon => (
                          <option key={saloon._id} value={saloon._id}>{saloon.name}</option>
                        ))}
                      </SaloonSelect>
                    </div>
                  );
                })}
              </DateGrid>
            </AssignmentsContainer>
            <Actions>
              <ActionButton onClick={() => openEditModal(barber)}>Edit</ActionButton>
              <ActionButton onClick={() => handleDelete(barber._id)} style={{ background: '#ff4444' }}>Delete</ActionButton>
            </Actions>
          </Card>
        ))}
      </Grid>
      <FabButton onClick={openAddModal} title="Add Barber">
        <FontAwesomeIcon icon={faPlus} /> Add Barber
      </FabButton>
      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>{editBarber ? 'Edit Barber' : 'Add Barber'}</ModalTitle>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <HourRow>
                <HourInput
                  type="number"
                  min={0}
                  max={23}
                  placeholder="Start hour (e.g. 9)"
                  value={startHour}
                  onChange={e => setStartHour(e.target.value === '' ? '' : Math.max(0, Math.min(23, Number(e.target.value))))}
                  required
                />
                <HourInput
                  type="number"
                  min={1}
                  max={24}
                  placeholder="End hour (e.g. 18)"
                  value={endHour}
                  onChange={e => setEndHour(e.target.value === '' ? '' : Math.max(1, Math.min(24, Number(e.target.value))))}
                  required
                />
              </HourRow>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <ActionButton type="button" onClick={closeModal} style={{ background: '#444' }}>Cancel</ActionButton>
                <ActionButton type="submit">Save</ActionButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Barbers; 