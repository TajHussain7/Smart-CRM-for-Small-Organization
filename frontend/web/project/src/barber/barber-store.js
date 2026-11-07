import { useSyncExternalStore } from 'react';
export const services = [
    { id: 'haircut', name: 'Classic Haircut', minutes: 45, cents: 3500, bookings: 42 },
    { id: 'beard', name: 'Beard Sculpting', minutes: 30, cents: 3000, bookings: 31 },
    { id: 'shave', name: 'Hot Towel Shave', minutes: 30, cents: 2500, bookings: 18 },
    { id: 'fade', name: 'Fade & Beard Trim', minutes: 60, cents: 4500, bookings: 24 },
];
let state = {
    clients: [
        { id: 'james', name: 'James Dalton', phone: '+1 (555) 123-4567', email: 'james@example.com', service: 'haircut', loyalty: true, notes: 'Short sides, natural finish.', points: 450 },
        { id: 'alex', name: 'Alex Morgan', phone: '+1 (555) 234-5678', email: 'alex@example.com', service: 'fade', loyalty: true, notes: '', points: 650 },
        { id: 'sample-0', name: 'Marcus Thorne', since: '2022-10-14', preferences: ['Morning Appts', 'Coffee: Black', 'Silent Service', 'E-Receipts'], history: [{ id: 'm1', name: 'Advanced Color & Trim', date: '2024-03-12', stylist: 'Marcus K.', cents: 14500 }, { id: 'm2', name: 'Hydrating Scalp Treatment', date: '2024-02-05', stylist: 'Marcus K.', cents: 6500 }, { id: 'm3', name: 'Deep Condition & Style', date: '2024-01-18', stylist: 'Sarah J.', cents: 8500 }], phone: '+1 (555) 700-0000', email: 'client0@example.com', service: 'fade', loyalty: true, notes: 'Client prefers non-scented products due to allergies. Always uses Matrix color line 7N.', points: 2450, style: 'High Fade & Lineup', lastVisit: '2024-03-12' },
        { id: 'sample-1', name: 'Liam Vance', phone: '+1 (555) 700-0001', email: 'client1@example.com', service: 'beard', loyalty: true, notes: '', points: 100, style: 'Classic Taper & Beard Grooming', lastVisit: '2023-11-02' },
        { id: 'sample-2', name: 'Julian Reed', phone: '+1 (555) 700-0002', email: 'client2@example.com', service: 'haircut', loyalty: true, notes: '', points: 100, style: 'Skin Fade & Scissor Top', lastVisit: '2023-10-30' },
        { id: 'sample-3', name: 'Silas Knight', phone: '+1 (555) 700-0003', email: 'client3@example.com', service: 'shave', loyalty: true, notes: '', points: 100, style: 'Buzz Cut & Clean Shave', lastVisit: '2023-09-15' },
        { id: 'sample-4', name: 'Ethan Brooks', phone: '+1 (555) 700-0004', email: 'client4@example.com', service: 'haircut', loyalty: true, notes: '', points: 100, style: 'Pompadour & Taper', lastVisit: '2023-10-28' },
    ], receipts: [],
};
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getBarber = () => state;
export const useBarber = () => useSyncExternalStore(subscribe, getBarber, getBarber);
const publish = () => listeners.forEach(listener => listener());
export const money = (cents) => `$${(cents / 100).toFixed(2)}`;
export function addClient(input) {
    if (!input.name.trim() || input.phone.replace(/\D/g, '').length < 7 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || !services.some(s => s.id === input.service))
        return 'Enter a name, valid phone, email and primary service.';
    if (state.clients.some(c => c.email.toLowerCase() === input.email.trim().toLowerCase() || c.phone.replace(/\D/g, '') === input.phone.replace(/\D/g, '')))
        return 'A client with this email or phone already exists.';
    state = { ...state, clients: [...state.clients, { ...input, name: input.name.trim(), email: input.email.trim(), id: `client-${Date.now()}`, points: 0, since: localDate() }] };
    publish();
    return '';
}
export function totals(ids, client, redeem) {
    const subtotal = services.filter(s => ids.includes(s.id)).reduce((sum, s) => sum + s.cents, 0);
    const discount = redeem && client?.loyalty && client.points >= 500 ? Math.min(1000, subtotal) : 0;
    const tax = Math.round((subtotal - discount) * 0.08);
    return { subtotal, discount, tax, total: subtotal - discount + tax, earned: client?.loyalty ? Math.floor((subtotal - discount) / 100) : 0 };
}
export function recordService(clientId, ids, redeem, method) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client || !ids.length || ids.some(id => !services.some(s => s.id === id)))
        return 'Select a client and at least one service.';
    if (!['Cash', 'Card', 'Digital'].includes(method))
        return 'Choose a payment method.';
    if (redeem && (!client.loyalty || client.points < 500))
        return '500 loyalty points are required to redeem.';
    const amount = totals(ids, client, redeem);
    state = { clients: state.clients.map(c => c.id === clientId ? { ...c, lastVisit: localDate(), history: [...services.filter(s => ids.includes(s.id)).map(s => ({ id: `${Date.now()}-${s.id}`, name: s.name, date: localDate(), stylist: 'Demo staff', cents: s.cents })), ...(c.history || [])], points: c.points - (amount.discount ? 500 : 0) + amount.earned } : c), receipts: [...state.receipts, { id: `demo-${Date.now()}`, client: client.name, total: amount.total, method }] };
    publish();
    return '';
}
export function clientStyle(client) { return client.style || client.notes || services.find(s => s.id === client.service)?.name || 'No preference added'; }
export function visitLabel(date) { return date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No visits yet'; }
export function filterClients(clients, query, service) {
    const search = query.trim().toLowerCase();
    return clients.filter(c => (service === 'all' || c.service === service) && `${c.name} ${c.phone} ${clientStyle(c)}`.toLowerCase().includes(search)).sort((a, b) => Number(!!b.lastVisit) - Number(!!a.lastVisit));
}
function localDate() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function updateClient(id, input) {
    if (!state.clients.some(c => c.id === id))
        return 'Client not found.';
    if (!input.name.trim() || input.phone.replace(/\D/g, '').length < 7 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
        return 'Enter a name, valid phone and email.';
    if (state.clients.some(c => c.id !== id && (c.email.toLowerCase() === input.email.trim().toLowerCase() || c.phone.replace(/\D/g, '') === input.phone.replace(/\D/g, ''))))
        return 'Another client uses this email or phone.';
    state = { ...state, clients: state.clients.map(c => c.id === id ? { ...c, ...input, name: input.name.trim(), email: input.email.trim(), preferences: input.preferences.map(p => p.trim()).filter(Boolean) } : c) };
    publish();
    return '';
}
