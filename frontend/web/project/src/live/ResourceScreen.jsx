import { useCallback, useEffect, useRef, useState } from 'react'
import { request, download } from '../api/client'
import { actionRequest, availableActions, detailsOf, draftFor, fieldsForEdit, idOf, rowsOf, titleOf } from '../api-shared/records.ts'
import { useAuth } from '../auth-store'

function Details({ value }) {
  const details = detailsOf(value)
  return details.length ? <dl className="live-details">{details.map((item,i)=><div key={i}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : <p>No details available.</p>
}
function Fields({ fields, draft, setDraft, choices }) {
  return fields.map(field => <label key={field.key}>{field.label}
    {field.type==='multi'?<select multiple required={field.required} value={(draft[field.key]||'').split(',')} onChange={e=>setDraft({...draft,[field.key]:Array.from(e.target.selectedOptions,o=>o.value).join(',')})}>{(choices[field.source]||[]).map(row=><option key={idOf(row)} value={idOf(row)}>{titleOf(row)}</option>)}</select>:(field.type === 'select' || field.type === 'boolean') ? <select required={field.required} value={draft[field.key] || ''} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}>
      <option value="">Select…</option>
      {field.type === 'boolean' ? <><option value="true">Yes</option><option value="false">No</option></> : field.source ? (choices[field.source] || []).map(row=><option key={idOf(row)} value={idOf(row)}>{titleOf(row)}</option>) : field.options?.map(value=><option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}
    </select> : <input required={field.required} type={['array','text'].includes(field.type) ? 'text' : field.type} min={field.min} max={field.max} step={field.type==='number'?'any':undefined} minLength={field.type==='password'?6:undefined} value={draft[field.key] || ''} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}/>}
  </label>)
}
function Editor({ operation, onClose, onSaved }) {
  const ref = useRef(null)
  const [draft,setDraft] = useState(()=>draftFor(operation.fields || [], operation.row))
  const [choices,setChoices] = useState({})
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [saving,setSaving] = useState(false)
  useEffect(()=>{ref.current.showModal()},[])
  useEffect(()=>{
    let active=true
    Promise.all([...new Set((operation.fields || []).map(f=>f.source).filter(Boolean))].map(async path=>[path,rowsOf(await request(path))]))
      .then(entries=>{if(active)setChoices(Object.fromEntries(entries))}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[operation])
  async function submit(e) {
    e.preventDefault(); if(saving)return
    setSaving(true); setError('')
    try {
      const {path,init}=await actionRequest(operation,draft,operation.row||{},request)
      const result=await request(path,init)
      onSaved(result, operation.method)
    } catch(err){setError(err.message)} finally{setSaving(false)}
  }
  return <dialog ref={ref} className="live-dialog" onCancel={e=>{if(saving)e.preventDefault();else onClose()}} aria-label={operation.label}>
    <h2>{operation.label}</h2>
    {operation.method==='DELETE'&&<p>This removes {titleOf(operation.row)}. Confirm to continue.</p>}
    <form onSubmit={submit} className="g-form">
      {loading?<p>Loading choices…</p>:<div className="g-form-grid"><Fields fields={operation.fields || []} draft={draft} setDraft={setDraft} choices={choices}/></div>}
      {error&&<p role="alert" className="live-error">{error}</p>}
      <div className="g-actions"><button className="g-button" disabled={saving||loading}>{saving?'Saving…':'Confirm'}</button><button className="g-button secondary" type="button" disabled={saving} onClick={onClose}>Cancel</button></div>
    </form>
  </dialog>
}
export default function ResourceScreen({ resource, detailId }) {
  const {user}=useAuth()
  const [data,setData]=useState(null), [error,setError]=useState(''), [loading,setLoading]=useState(true)
  const [operation,setOperation]=useState(null),[result,setResult]=useState(null),[notice,setNotice]=useState('')
  const [filters,setFilters]=useState({}),[applied,setApplied]=useState({}),[page,setPage]=useState(1)
  const [filterChoices,setFilterChoices]=useState({})
  const version=useRef(0)
  const admin=user?.role==='ADMIN'
  const load=useCallback(async()=>{
    const current=++version.current
    setLoading(true);setError('')
    try {
      const query=new URLSearchParams({...applied,...(['school-alerts','interactions'].includes(resource.key)?{page:String(page),limit:'20'}:{})}).toString()
      const path=resource.path+(detailId?`/${encodeURIComponent(detailId)}`:'')+(query?`?${query}`:'')
      const next=resource.path?await request(path):null
      if(current===version.current)setData(next)
    }catch(e){if(current===version.current){setData(null);setError(e.message)}}
    finally{if(current===version.current)setLoading(false)}
  },[resource,detailId,applied,page])
  useEffect(()=>{
    const sequence=version
    const timer=setTimeout(load,0)
    return()=>{clearTimeout(timer);sequence.current++}
  },[load])
  useEffect(()=>{
    let active=true
    Promise.all([...new Set((resource.filters||[]).map(f=>f.source).filter(Boolean))].map(async path=>[path,rowsOf(await request(path))]))
      .then(entries=>{if(active)setFilterChoices(Object.fromEntries(entries))}).catch(e=>{if(active)setError(e.message)})
    return()=>{active=false}
  },[resource])
  const canWrite=!resource.admin||admin
  async function act(action,row) {
    if(action.download) {
      setError('');try{await download(action.path.replace(':id',encodeURIComponent(idOf(row||{}))),action.download)}catch(e){setError(e.message)}
    } else setOperation({...action,row})
  }
  const rows=detailId?[data].filter(Boolean):rowsOf(data)
  return <>
    <div className="g-actions">
      <button className="g-button secondary" onClick={load} disabled={loading}>Refresh</button>
      {resource.fields&&canWrite&&<button className="g-button" onClick={()=>setOperation({label:`Add ${resource.title.toLowerCase()}`,path:resource.path,method:'POST',fields:resource.fields})}>＋ Add record</button>}
      {resource.actions?.filter(a=>!a.admin||admin).map(a=><button key={a.label} className="g-button secondary" onClick={()=>act(a,data)}>{a.label}</button>)}
      {resource.download&&<button className="g-button secondary" onClick={()=>act({path:resource.download,download:`${resource.key}.csv`})}>Export CSV</button>}
    </div>
    {!!resource.filters?.length&&!detailId&&<form className="g-panel g-form" onSubmit={e=>{e.preventDefault();setApplied(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));setPage(1)}}><div className="g-form-grid"><Fields fields={resource.filters} draft={filters} setDraft={setFilters} choices={filterChoices}/></div><button className="g-button secondary">Apply filters</button></form>}
    {error&&<p role="alert" className="live-error">{error}</p>}
    {notice&&<p role="status">{notice}</p>}
    {result&&<section className="g-panel"><h2>Result</h2><Details value={result}/></section>}
    {loading?<p role="status">Loading {resource.title.toLowerCase()}…</p>:!error&&<>
      {resource.single ? data&&<section className="g-panel"><Details value={data}/></section> : <>
        {!rows.length&&<section className="g-panel"><h2>No records yet</h2><p>Saved records will appear here.</p></section>}
        <div className="live-records">{rows.map((row,i)=><article className="g-panel" key={idOf(row)||i}><h2>{titleOf(row)}</h2><Details value={row}/><div className="g-actions">
          {resource.edit&&canWrite&&<button className="g-button secondary" onClick={()=>setOperation({label:'Edit record',path:`${resource.path}/${idOf(row)}`,method:'PATCH',fields:fieldsForEdit(resource.fields||[],resource.path),row})}>Edit</button>}
          {resource.remove&&canWrite&&<button className="g-button secondary" onClick={()=>setOperation({label:resource.key==='barber-services'?'Deactivate service':'Delete record',path:`${resource.path}/${idOf(row)}`,method:'DELETE',row})}>{resource.key==='barber-services'?'Deactivate':'Delete'}</button>}
          {availableActions(resource.rowActions,row).map(a=><button key={a.label} className="g-button secondary" onClick={()=>act(a,row)}>{a.label}</button>)}
        </div></article>)}</div>
        {data?.pagination&&<nav className="g-actions" aria-label="Pagination"><button disabled={page<=1||loading} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.max(1,data.pagination.totalPages)}</span><button disabled={page>=data.pagination.totalPages||loading} onClick={()=>setPage(page+1)}>Next</button></nav>}
      </>}
    </>}
    {operation&&<Editor operation={operation} onClose={()=>setOperation(null)} onSaved={(next,method)=>{setOperation(null);setResult(next);setNotice(method==='GET'?'Result loaded.':'Saved successfully.');if(method!=='GET')load()}}/>}
  </>
}
