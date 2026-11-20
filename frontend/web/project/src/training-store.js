import { useSyncExternalStore } from 'react';
let sessions = [];
const listeners = new Set();
const subscribe = (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getTraining = () => sessions;
export const useTraining = () => useSyncExternalStore(subscribe, getTraining, getTraining);
export function recordTraining(item) { if (!sessions.some(s => s.id === item.id)) {
    sessions = [...sessions, item];
    listeners.forEach(fn => fn());
} }
