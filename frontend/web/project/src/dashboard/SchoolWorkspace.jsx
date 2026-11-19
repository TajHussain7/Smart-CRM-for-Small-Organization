import { useEffect, useState } from 'react'
import { catalog, resourceFor } from '../api-shared/catalog.ts'
import { useAuth, setAuthSession } from '../auth-store'
import { request } from '../api/client'
import ResourceScreen from '../live/ResourceScreen'
import '../gym/gym.css'
import '../live/live.css'

export default function SchoolWorkspace({route,onLogout}) {
  const {user,workspace}=useAuth()
  const [menu,setMenu]=useState(false)
  useEffect(()=>{
    let active=true
    request('/workspaces/me').then(value=>{
      if(active){localStorage.setItem('crm_workspace',JSON.stringify(value));setAuthSession(user,value)}
    }).catch(()=>{})
    return()=>{active=false}
  },[user])
  const resource=resourceFor(route)
  const detailId=/^#(student|barber-client|gym-member)\//.test(route)?decodeURIComponent(route.split('/')[1]||''):undefined
  const enabled=group=>group==='Workspace'||workspace?.[`${group.toLowerCase()}Enabled`]!==false
  return <div className="gym-app"><aside className={`g-sidebar ${menu?'open':''}`}>
    <a className="g-brand" href="#school-dashboard">Smart CRM</a><div className="g-workspace"><strong>{workspace?.name || 'Workspace'}</strong></div>
    <nav aria-label="Workspace navigation">{['School','Gym','Barber','Workspace'].filter(enabled).map(group=><section key={group}><h2>{group}</h2>{catalog.filter(r=>r.group===group).map(item=><a key={item.key} href={`#${item.key}`} aria-current={resource.key===item.key?'page':undefined} onClick={()=>setMenu(false)}>{item.title}</a>)}</section>)}</nav>
  </aside><div className="g-main"><header className="g-topbar"><button className="g-menu" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}>☰</button><span>{workspace?.name}</span><strong>{user?.name}</strong><button className="g-button secondary" onClick={onLogout}>Log out</button></header>
    <main className="g-content"><h1 className="live-page-title">{resource.title}</h1>{enabled(resource.group)?<ResourceScreen key={`${resource.key}:${detailId||''}`} resource={resource} detailId={detailId}/>:<p>This module is disabled for this workspace.</p>}</main>
  </div></div>
}
