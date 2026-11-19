import { useSyncExternalStore } from 'react';
export const barberFeatures = [{ id: 'clients', label: 'Clients' }, { id: 'payments', label: 'Record Service & Payment' }, { id: 'appointments', label: 'Book Appointments' }, { id: 'reports', label: 'Reports' }] as const;
export type BarberFeature = typeof barberFeatures[number]['id'];
export const gymFeatures = [{ id: 'members', label: 'Members', route: '/gym-members' }, { id: 'renewal', label: 'Membership Renewal', route: '/gym-renewal' }, { id: 'training', label: 'Training Sessions', route: '/gym-training' }, { id: 'reports', label: 'Gym Reports', route: '/gym-reports' }] as const;
export type GymFeature = typeof gymFeatures[number]['id'];
let config: { name: string; gym: boolean; features: GymFeature[]; barber: boolean; barberFeatures: BarberFeature[] } = { name: 'School Management', gym: true, features: ['training'], barber: true, barberFeatures: ['clients','payments','appointments'] };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getWorkspace = () => config;
export function useWorkspace() { return useSyncExternalStore(subscribe, getWorkspace, getWorkspace); }
export function saveWorkspace(name: string, _gym?: boolean, _features?: GymFeature[], _barber?: boolean, _selectedBarber?: BarberFeature[]) {
  config = { name: name.trim() || 'School Management', gym: true, features: ['training'], barber: true, barberFeatures: ['clients','payments','appointments'] };
  listeners.forEach(listener => listener());
  return true;
}
