import { useSyncExternalStore } from 'react';
export let services = [
    { id: 'haircut', name: 'Classic Haircut', minutes: 45, cents: 100000, bookings: 42 },
    { id: 'beard', name: 'Beard Sculpting', minutes: 30, cents: 60000, bookings: 31 },
    { id: 'shave', name: 'Hot Towel Shave', minutes: 30, cents: 50000, bookings: 18 },
    { id: 'fade', name: 'Fade & Beard Trim', minutes: 60, cents: 150000, bookings: 24 },
];
let state = {
    clients: [],
    receipts: [],
};
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getBarber = () => state;
export const useBarber = () => useSyncExternalStore(subscribe, getBarber, getBarber);
const publish = () => listeners.forEach(listener => listener());
export const money = (cents) => `Rs. ${(cents / 100).toLocaleString()}`;

export function setClientsFromAPI(clients = []) {
    state = {
        ...state,
        clients: clients.map(c => ({
            id: c._id || c.id,
            _id: c._id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            loyalty: true,
            points: c.loyaltyPoints || 0,
            notes: c.notes || '',
            preferences: c.preferences || [],
            history: (c.visitHistory || []).map(v => ({
                id: v._id || `${Date.now()}`,
                name: 'Service',
                date: v.date ? v.date.split('T')[0] : '',
                stylist: 'Barber Staff',
                cents: v.amountInPaisas || 100000,
            })),
            since: c.createdAt ? c.createdAt.split('T')[0] : '',
            lastVisit: c.lastVisit ? c.lastVisit.split('T')[0] : '',
        })),
    };
    publish();
}

export function setServicesFromAPI(apiServices = []) {
    if (apiServices && apiServices.length > 0) {
        services = apiServices.map(s => ({
            id: s._id || s.id,
            _id: s._id,
            name: s.name,
            minutes: s.durationMinutes || 30,
            cents: s.priceInPaisas || (s.price ? s.price * 100 : 50000),
            bookings: s.bookings || 0,
        }));
        publish();
    }
}
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
