import { useSyncExternalStore } from 'react';
let sequence = 0;
let invoices = [];
let entries = [];
const listeners = new Set();
const publish = () => listeners.forEach(l => l());
const subscribe = (l) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getInvoices = () => invoices;
export const useFeeInvoices = () => useSyncExternalStore(subscribe, getInvoices, getInvoices);
export const getAlerts = () => entries;
export const useAlerts = () => useSyncExternalStore(subscribe, getAlerts, getAlerts);

export function setAlertsFromAPI(list = []) {
    entries = list.map(item => ({
        id: item._id || item.id,
        _id: item._id,
        eventId: item.eventId,
        module: item.module,
        type: item.type,
        recipient: item.recipient,
        contact: item.contact,
        message: item.message,
        channel: item.channel,
        status: item.status,
        read: !!item.read,
        retryCount: item.retryCount || 0,
        createdAt: item.createdAt,
    }));
    publish();
}

export function setInvoicesFromAPI(list = []) {
    invoices = list.map(item => ({
        id: item.invoiceNumber || item._id || item.id,
        _id: item._id,
        studentId: item.studentId?.studentId || item.studentId || '',
        student: item.studentId?.name || '',
        parent: item.studentId?.guardianName || '',
        contact: item.studentId?.guardianPhone || '',
        amount: item.amountDue,
        amountPaid: item.amountPaid || 0,
        due: item.dueDate ? item.dueDate.split('T')[0] : '',
        status: item.status,
    }));
    publish();
}
export function queueAlert(input) {
    if (entries.some(e => e.eventId === input.eventId && e.module === input.module))
        return;
    entries = [{ ...input, id: `alert-${++sequence}`, createdAt: new Date().toISOString(), status: 'Pending' }, ...entries];
    publish();
}
export function markAlertRead(id) { entries = entries.map(e => e.id === id ? { ...e, read: true } : e); publish(); }
export function retryAlert(id) { entries = entries.map(e => e.id === id && e.status === 'Failed' ? { ...e, status: 'Pending', read: false } : e); publish(); }
export const alertTypes = ['Fee Reminder', 'Membership Reminder', 'Appointment Reminder'];
export function filterAlerts(status, type, search, module = 'school') { const q = search.trim().toLowerCase(); return entries.filter(e => e.module === module && e.status === status && (type === 'All Types' || e.type === type) && `${e.message} ${e.recipient} ${e.contact}`.toLowerCase().includes(q)); }
export function generateFeeInvoice(input) {
    if (!input.studentId || !input.parent.trim() || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact.trim()) || /^\+?[\d ()-]{7,20}$/.test(input.contact.trim())))
        return 'Enter a student, parent name and valid parent email or phone.';
    if (!/^\d+(\.\d{1,2})?$/.test(input.amount) || Number(input.amount) <= 0)
        return 'Enter a positive fee amount with up to two decimal places.';
    const due = new Date(`${input.due}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.due) || Number.isNaN(due.getTime()) || due.getFullYear() !== Number(input.due.slice(0, 4)) || due.getMonth() + 1 !== Number(input.due.slice(5, 7)) || due.getDate() !== Number(input.due.slice(8)))
        return 'Enter a valid due date (YYYY-MM-DD).';
    const eventId = `invoice:${input.studentId}:${input.due}:${Number(input.amount).toFixed(2)}:${input.contact.trim().toLowerCase()}`;
    if (!invoices.some(i => i.eventId === eventId))
        invoices = [{ id: `INV-${invoices.length + 1}`, eventId, studentId: input.studentId, student: input.studentName, parent: input.parent, contact: input.contact, amount: Number(input.amount).toFixed(2), due: input.due }, ...invoices];
    queueAlert({ eventId, module: 'school', type: 'Fee Reminder', recipient: input.parent.trim(), contact: input.contact.trim(), channel: input.contact.includes('@') ? 'Email' : 'SMS', message: `Fee invoice for ${input.studentName} (${input.studentId}): $${Number(input.amount).toFixed(2)}, due ${input.due}. Recipient: ${input.parent.trim()}.` });
    return '';
}
export function moduleAlertTypes(module, features) {
    if (module === 'school')
        return ['Fee Reminder'];
    if (module === 'gym')
        return [...(features.includes('renewal') ? ['Membership Reminder'] : []), ...(features.includes('training') ? ['Appointment Reminder'] : [])];
    return features.includes('appointments') ? ['Appointment Reminder'] : [];
}
