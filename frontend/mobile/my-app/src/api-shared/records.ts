// Generated from frontend/shared; run node frontend/shared/sync.mjs after edits.
import type { Field, Action } from './catalog';
export type RecordData = Record<string, any>;
export const label = (key: string) => key.replace(/Id$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
export const idOf = (row: RecordData) => String(row._id || row.id || '');
export function titleOf(row: RecordData): string {
  if (row.clientId && row.date) return `${row.clientId.name || 'Appointment'} · ${row.date} ${row.time || ''}`;
  return row.name || row.title || row.invoiceNumber || row.receiptNumber || row.membershipId || row.subject || row.recipient || row.description || row.studentId?.name || row.memberId?.name || 'Record';
}
export function rowsOf(data: any): RecordData[] { return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []; }
export function draftFor(fields: Field[], row: RecordData = {}): Record<string, string> {
  return Object.fromEntries(fields.map(field => {
    let value = row[field.key];
    if (field.type === 'boolean') value = value ? 'true' : 'false';
    else if (field.type === 'array' || field.type === 'multi') value = value?.join(', ');
    else if (value && typeof value === 'object') value = value._id || value.id || '';
    return [field.key, value === undefined || value === null ? '' : String(value)];
  }));
}
export function payloadFor(fields: Field[], draft: Record<string,string>): RecordData {
  const result: RecordData = {};
  for (const field of fields) {
    const value = (draft[field.key] || '').trim();
    if (!value && field.required) throw new Error(`${field.label} is required.`);
    if (!value) continue;
    if (field.type === 'number') {
      const number = Number(value);
      if (!Number.isFinite(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
      result[field.key] = number;
    } else if (field.type === 'datetime-local') {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
      result[field.key] = date.toISOString();
    } else if (field.type === 'array' || field.type === 'multi') result[field.key] = value.split(',').map(s=>s.trim()).filter(Boolean);
    else if (field.type === 'boolean') result[field.key] = value === 'true';
    else result[field.key] = value;
  }
  if (result.startTime && result.endTime && result.startTime >= result.endTime) throw new Error('End time must be after start time.');
  return result;
}
export async function actionRequest(action:Action, draft:Record<string,string>, row:RecordData, request:(path:string)=>Promise<any>) {
  const body=payloadFor(action.fields||[],draft);
  if(action.path==='/school/invoices/pay') body.invoiceId=idOf(row);
  if(action.status)body.status=action.status;
  if(action.path==='/school/attendance/bulk') {
    body.records=body.studentIds.map((studentId:string)=>({studentId,status:body.status,...(body.note?{note:body.note}:{})}));
    delete body.studentIds;delete body.status;delete body.note;
  }
  if(action.path==='/ai/summary')body.stats=await request(`/${body.moduleName}/dashboard`);
  let path=action.path.replace(/:([A-Za-z]+)/g,(_match,key)=>{
    const value=key==='id'?idOf(row):body[key];
    if(key!=='id')delete body[key];
    return encodeURIComponent(value||'');
  });
  if(action.method==='GET'&&Object.keys(body).length)path+=`?${new URLSearchParams(body)}`;
  return {path,init:{method:action.method,...(!['GET','DELETE'].includes(action.method)?{body:JSON.stringify(body)}:{})}};
}
export function availableActions(actions: Action[] = [], row: RecordData): Action[] {
  return actions.filter(action => {
    if (action.label === 'Mark read') return !row.read;
    if (action.label === 'Retry delivery') return row.status !== 'SENT';
    if (action.label === 'Record payment') return Number(row.amountDue) > Number(row.amountPaid);
    if (!action.status) return true;
    if (action.path.startsWith('/tasks')) return row.status !== 'COMPLETED' && row.status !== action.status;
    const allowed: Record<string,string[]> = { CONFIRMED:['IN_PROGRESS','NO_SHOW','CANCELLED'], IN_PROGRESS:['COMPLETED','CANCELLED'] };
    return (allowed[row.status] || []).includes(action.status);
  });
}
export function fieldsForEdit(fields: Field[], path: string) {
  return fields.filter(f => !f.createOnly && (path !== '/school/attendance' || ['status','note'].includes(f.key)));
}
/** Human-readable details, excluding database metadata and credentials. */
export function detailsOf(value: any, prefix = ''): {label: string; value: string}[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== 'object') return [{label:prefix || 'Value',value:typeof value === 'boolean' ? (value?'Yes':'No') : String(value)}];
  if (Array.isArray(value)) return value.flatMap((v,i) => detailsOf(v, `${prefix} ${i+1}`));
  return Object.entries(value).filter(([key])=>!['_id','id','__v','workspaceId','password','accessToken','refreshToken'].includes(key)).flatMap(([key,v])=> {
    if (key.endsWith('Id') && typeof v === 'string') return [];
    if (key.endsWith('Id') && v && typeof v === 'object' && !Array.isArray(v)) return [{label:label(key),value:titleOf(v)}];
    return detailsOf(v,prefix ? `${prefix} · ${label(key)}` : label(key));
  });
}
