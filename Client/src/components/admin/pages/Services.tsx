import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faMoneyBill, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

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

const ServiceImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  background: #444;
  border: 3px solid #C19B76;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
`;

const ServiceName = styled.h3`
  color: #fff;
  margin: 0.5rem 0 0.7rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const ServiceDesc = styled.div`
  color: #bbb;
  font-size: 1.08rem;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const ServiceInfo = styled.div`
  color: #C19B76;
  font-size: 1.08rem;
  margin-bottom: 0.7rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SortOrderInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const SortOrderButton = styled.button`
  background: #444;
  color: #fff;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    background: #555;
  }
`;

const SortOrderValue = styled.span`
  color: #fff;
  font-size: 1.1rem;
  min-width: 40px;
  text-align: center;
`;

const InfoIcon = styled(FontAwesomeIcon)`
  font-size: 1rem;
  opacity: 0.8;
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

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.2rem;
`;

const InputIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem;
  padding-left: 2.8rem;
  border-radius: 5px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
  font-size: 1.08rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem;
  margin-bottom: 1.2rem;
  border-radius: 5px;
  border: 1px solid #444;
  background: #181818;
  color: #fff;
  font-size: 1.08rem;
  min-height: 80px;
`;

const ErrorMsg = styled.div`
  color: #ff4444;
  margin-bottom: 1rem;
`;

interface Service {
  _id: string;
  name: string;
  image?: string;
  description: string;
  duration: number;
  price: number;
  sortOrder?: number;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      const sortedServices = res.data.sort((a: Service, b: Service) => 
        (b.sortOrder || 0) - (a.sortOrder || 0)
      );
      setServices(sortedServices);
    } catch {
      setError('Failed to fetch services');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditService(null);
    setName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setSortOrder(0);
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (service: Service) => {
    setEditService(service);
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration);
    setPrice(service.price);
    setSortOrder(service.sortOrder || 0);
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditService(null);
    setName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setSortOrder(0);
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
    setError('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('description', description);
      formDataToSend.append('length', String(duration));
      formDataToSend.append('price', String(price));
      formDataToSend.append('sortOrder', String(sortOrder));
      if (image) formDataToSend.append('image', image);

      if (editService) {
        await axios.put(`/api/services/${editService._id}`, formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/services', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      closeModal();
      fetchServices();
    } catch (error) {
      setError('Failed to save service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`/api/services/${id}`);
      fetchServices();
    } catch {
      setError('Failed to delete service');
    }
  };

  return (
    <PageContainer>
      <Grid>
        {services.map(service => (
          <Card key={service._id}>
            <ServiceImage src={service.image || '/default-service.png'} alt={service.name} />
            <ServiceName>{service.name}</ServiceName>
            <ServiceDesc>{service.description}</ServiceDesc>
            <ServiceInfo>
              <InfoIcon icon={faClock} />
              Продължителност: {service.duration} минути
            </ServiceInfo>
            <ServiceInfo>
              <InfoIcon icon={faMoneyBill} />
              Цена: {service.price} лв.
            </ServiceInfo>
            <ServiceInfo>
              <InfoIcon icon={faEdit} />
              Приоритет за показване: {service.sortOrder || 0}
            </ServiceInfo>
            <Actions>
              <ActionButton onClick={() => openEditModal(service)}>Редактирай</ActionButton>
              <ActionButton onClick={() => handleDelete(service._id)} style={{ background: '#ff4444' }}>Изтрий</ActionButton>
            </Actions>
          </Card>
        ))}
      </Grid>
      <FabButton onClick={openAddModal} title="Add Service">
        <FontAwesomeIcon icon={faPlus} /> Добави Услуга
      </FabButton>
      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>{editService ? 'Редактиране на услуга' : 'Добавяне на услуга'}</ModalTitle>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Име"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <TextArea
                placeholder="Описание"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
              <InputWrapper>
                <InputIcon icon={faClock} />
                <Input
                  type="number"
                  min={1}
                  max={300}
                  placeholder="Продължителност (минути)"
                  value={duration}
                  onChange={e => setDuration(e.target.value === '' ? '' : Math.max(1, Math.min(300, Number(e.target.value))))}
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <InputIcon icon={faMoneyBill} />
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="Цена (лв.)"
                  value={price}
                  onChange={e => setPrice(e.target.value === '' ? '' : Math.max(0, Math.min(1000, Number(e.target.value))))}
                  required
                />
              </InputWrapper>
              <SortOrderInput>
                <span style={{ color: '#fff' }}>Приоритет за показване (по-висок = по-важен):</span>
                <SortOrderButton type="button" onClick={() => setSortOrder(prev => Math.max(0, prev - 1))}>-</SortOrderButton>
                <SortOrderValue>{sortOrder}</SortOrderValue>
                <SortOrderButton type="button" onClick={() => setSortOrder(prev => prev + 1)}>+</SortOrderButton>
              </SortOrderInput>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <ActionButton type="button" onClick={closeModal} style={{ background: '#444' }}>Cancel</ActionButton>
                <ActionButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Зареждане...' : 'Save'}
                </ActionButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Services; 