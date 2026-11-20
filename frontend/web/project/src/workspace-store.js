import { useSyncExternalStore } from 'react'
export const barberFeatures = [['clients', 'Clients'], ['payments', 'Record Service & Payment'], ['appointments', 'Book Appointments'], ['reports', 'Reports']]
export const gymFeatures = [['members', 'Members'], ['renewal', 'Membership Renewal'], ['training', 'Training Sessions'], ['reports', 'Gym Reports']]
let config = { name: 'School Management', gym: true, features: ['training'], barber: true, barberFeatures: ['clients','payments','appointments'] }
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
export const getWorkspace = () => config
export function useWorkspace() { return useSyncExternalStore(subscribe, getWorkspace, getWorkspace) }
export function saveWorkspace(name) {
  config = { name: name.trim() || 'School Management', gym: true, features: ['training'], barber: true, barberFeatures: ['clients','payments','appointments'] }
  listeners.forEach(listener => listener())
  return true
}
export function gymFeatureForRoute(route) {
  const page = route.replace('#gym-', '').split('/')[0]
  return page === 'member' || page === 'add-member' ? 'members' : page
}
