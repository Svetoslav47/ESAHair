import { Service } from '../../types/service';

const API_URL = 'http://localhost:3000';

export const fetchServices = async (): Promise<Service[]> => {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    return response.json();
}; 