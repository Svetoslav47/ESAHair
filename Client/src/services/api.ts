import { Service } from '../types/service';
import { Barber } from '../types/barber';
import { BarberAvailability } from '../types/barberAvailability';
import { Appointment } from '../types/appointment';

export const fetchServices = async (): Promise<Service[]> => {
    const response = await fetch(`/api/services`);
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    return response.json();
}; 

export const fetchBarbers = async (): Promise<Barber[]> => {
    const response = await fetch(`/api/barbers`);
    if (!response.ok) {
        throw new Error('Failed to fetch barbers');
    }
    return response.json();
};

export const fetchBarberAvailability = async (barberName: string, serviceId: string): Promise<BarberAvailability> => {
    if (!barberName || !serviceId) {
        throw new Error('Barber name and service ID are required');
    }
    const response = await fetch(`/api/barbers/${barberName}/availability?serviceId=${serviceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch barber availability');
    }
    return response.json();
};

interface BookingSuccess {
    message: string;
    calendarEvent: string;
    bookingId: string;
}

interface BookingError {
    error: string;
}

export const bookAppointment = async (appointment: Appointment): Promise<BookingSuccess | BookingError> => {
    const response = await fetch(`/api/appointments/book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointment)
    });
    if (!response.ok) {
        return { error: 'Failed to book appointment' };
    }
    return response.json();
};

export const fetchSaloons = async () => {
    const response = await fetch(`/api/saloons`);
    if (!response.ok) {
        throw new Error('Failed to fetch saloons');
    }
    return response.json();
};