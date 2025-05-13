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

// Define a Salon type for API mapping

interface Salon {
    _id: string;
    id: string;
    name: string;
    image: string;
    address: string;
    [key: string]: unknown;
}

export const fetchSaloons = async (): Promise<Salon[]> => {
    const response = await fetch(`/api/saloons`);
    if (!response.ok) {
        throw new Error('Failed to fetch saloons');
    }
    const salons = await response.json();
    return salons.map((salon: Omit<Salon, 'id'>) => ({
        ...salon,
        id: salon._id,
    }));
};

export const fetchBarbersAssignedToSaloon = async (saloonId: string, date: string) => {
    const response = await fetch(`/api/barbers/assigned?saloonId=${saloonId}&date=${date}`);
    if (!response.ok) {
        throw new Error('Failed to fetch barbers for saloon');
    }
    const barbers: Array<Omit<Barber, 'id'> & { _id: string }> = await response.json();
    return barbers.map((barber) => ({
        ...barber,
        id: barber._id,
    }));
};

export const fetchTimeSlots = async (barberId: string, saloonId: string, serviceId: string, date: string, numberOfPeople: number = 1) => {
    const response = await fetch(`/api/barbers/${barberId}/availability/day?saloonId=${saloonId}&serviceId=${serviceId}&date=${date}&numberOfPeople=${numberOfPeople}`);
    if (!response.ok) throw new Error('Failed to fetch time slots');
    return response.json(); // Should be array of { start, end }
};

export const fetchAppointments = async () => {
    const response = await fetch(`/api/appointments`);
    if (!response.ok) {
        throw new Error('Failed to fetch appointments');
    }
    return response.json();
};