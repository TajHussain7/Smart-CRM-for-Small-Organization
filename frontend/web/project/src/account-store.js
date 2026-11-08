import { useSyncExternalStore } from 'react';
let account = { name: 'School Admin', email: '', phone: '', address: '', bio: '', photo: '' };
const listeners = new Set();
const subscribe = (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getAccount = () => account;
export const useAccount = () => useSyncExternalStore(subscribe, getAccount, getAccount);
export function saveAccount(input) {
    if (!input.name.trim())
        return 'Name is required.';
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
        return 'Enter a valid email.';
    account = { ...input, name: input.name.trim(), email: input.email.trim() };
    listeners.forEach(fn => fn());
    return '';
}
export function clearAccount() { account = { name: 'School Admin', email: '', phone: '', address: '', bio: '', photo: '' }; listeners.forEach(fn => fn()); }
