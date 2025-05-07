import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMapMarkerAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

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

const SaloonImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  background: #444;
  border: 4px solid #C19B76;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
`;

const SaloonName = styled.h3`
  color: #fff;
  margin: 0.5rem 0 0.7rem 0;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const SaloonAddress = styled.div`
  color: #bbb;
  font-size: 1.08rem;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const GmapsLink = styled.a`
  color: #C19B76;
  font-size: 1.1rem;
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  &:hover {
    color: #fff;
    text-decoration: underline;
  }
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

interface Saloon {
  _id: string;
  name: string;
  address: string;
  image?: string;
  gmapsLink?: string;
}

const Saloons: React.FC = () => {
  const [saloons, setSaloons] = useState<Saloon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSaloon, setEditSaloon] = useState<Saloon | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gmapsLink, setGmapsLink] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const fetchSaloons = async () => {
    try {
      const res = await axios.get('/api/saloons');
      setSaloons(res.data);
    } catch {
      setError('Failed to fetch saloons');
    }
  };

  useEffect(() => { fetchSaloons(); }, []);

  const openAddModal = () => {
    setEditSaloon(null);
    setName('');
    setAddress('');
    setGmapsLink('');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (saloon: Saloon) => {
    setEditSaloon(saloon);
    setName(saloon.name);
    setAddress(saloon.address);
    setGmapsLink(saloon.gmapsLink || '');
    setImage(null);
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSaloon(null);
    setName('');
    setAddress('');
    setGmapsLink('');
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
    if (!name || !address) {
      setError('Name and address are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      if (gmapsLink) formData.append('gmapsLink', gmapsLink);
      if (image) formData.append('image', image);
      if (editSaloon) {
        await axios.put(`/api/saloons/${editSaloon._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/saloons', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      closeModal();
      fetchSaloons();
    } catch {
      setError('Failed to save saloon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saloon?')) return;
    try {
      await axios.delete(`/api/saloons/${id}`);
      fetchSaloons();
    } catch {
      setError('Failed to delete saloon');
    }
  };

  return (
    <PageContainer>
      <Grid>
        {saloons.map(saloon => (
          <Card key={saloon._id}>
            <SaloonImage src={saloon.image || '/default-barber.png'} alt={saloon.name} />
            <SaloonName>{saloon.name}</SaloonName>
            <SaloonAddress>{saloon.address}</SaloonAddress>
            {saloon.gmapsLink && (
              <GmapsLink href={saloon.gmapsLink} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faMapMarkerAlt} /> Google Maps <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '0.9em' }} />
              </GmapsLink>
            )}
            <Actions>
              <ActionButton onClick={() => openEditModal(saloon)}>Edit</ActionButton>
              <ActionButton onClick={() => handleDelete(saloon._id)} style={{ background: '#ff4444' }}>Delete</ActionButton>
            </Actions>
          </Card>
        ))}
      </Grid>
      <FabButton onClick={openAddModal} title="Add Saloon">
        <FontAwesomeIcon icon={faPlus} /> Добави Салон
      </FabButton>
      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>{editSaloon ? 'Edit Saloon' : 'Add Saloon'}</ModalTitle>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
              <Input
                type="url"
                placeholder="Google Maps link (optional)"
                value={gmapsLink}
                onChange={e => setGmapsLink(e.target.value)}
              />
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

export default Saloons; 