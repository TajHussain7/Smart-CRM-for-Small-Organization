import { getAccount, saveAccount } from './account-store'
import { useState, useEffect } from 'react'
import './App.css'
import SchoolWorkspace from './dashboard/SchoolWorkspace'
import { saveWorkspace } from './workspace-store'
const paths = {
mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
user: 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3c0-5 16-5 16 0v3z',
store: 'M3 3h18 M4 6h16l2 5H2z M4 11v10h16V11 M8 21v-7h8',
type: 'M12 2l4 7H8z M3 14h7v7H3z M21 17.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
arrow: 'M4 12h16 M13 5l7 7-7 7', back: 'M20 12H4 M11 5l-7 7 7 7',
rocket: 'M9 15l-4-4C9 4 14 2 22 2c0 8-2 13-9 17l-4-4z M9 15l-3 3 M5 15c-3 1-3 6-3 7 1 0 6 0 7-3 M14 7l3 3 M5 11H2l3-6 5-1 M13 19v3l6-3 1-5'
}
function Icon({ name, size = 24 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg> }
function Field({ label, icon, children, ...props }) { return <div className="field"><label htmlFor={props.id}>{label}</label><div className="input-wrap"><Icon name={icon} />{children || <input {...props} required />}</div></div> }
export default function App() {
const [workspace, setWorkspace] = useState(location.hash === '#create-workspace')
const [notice, setNotice] = useState('')
const [route, setRoute] = useState(location.hash)
useEffect(() => { const update = () => { setRoute(location.hash); window.scrollTo(0, 0) }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
useEffect(() => { const update = () => { setWorkspace(location.hash === '#create-workspace'); setNotice('') }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
function submit(event) { event.preventDefault(); if (workspace) { if (!saveWorkspace(event.currentTarget.querySelector('#business').value)) { setNotice('Select at least one feature for each enabled module.'); return }; saveAccount({...getAccount(),name:event.currentTarget.querySelector('#owner').value,email:event.currentTarget.querySelector('#email').value}); location.hash = '#school-dashboard'; return }; setNotice(workspace ? 'Your workspace details are ready. Workspace creation will be available when the service is connected.' : 'Your details are ready. Sign-in will be available when the service is connected.') }
if (route.startsWith('#school-') || route === '#students' || route.startsWith('#student/')) return <SchoolWorkspace route={route} />
if (route.startsWith('#barber-')) return <SchoolWorkspace route={route} />
if (route.startsWith('#gym-')) return <SchoolWorkspace route={route} />
return <main className={`auth-shell ${workspace ? 'auth-setup' : 'auth-login'}`}>
<aside className="auth-story"><a href="#login" className="auth-logo"><span><Icon name="store" /></span>Smart CRM</a><div className="auth-story-content"><span className="auth-eyebrow">YOUR SCHOOL. ONE WORKSPACE.</span><h2>More connected.<br/>Better managed.</h2><p>Bring your school, people and everyday operations together in one place.</p><div className="auth-preview" aria-hidden="true"><div className="auth-preview-top"><span>Workspace overview</span><span className="auth-preview-dot"/></div><div className="auth-preview-grid"><div><Icon name="user"/><strong>School</strong><small>Students & teachers</small></div><div><Icon name="type"/><strong>Modules</strong><small>Built around you</small></div></div><div className="auth-preview-bars">{[38,58,45,74,60,90,78].map((height,i)=><span key={i} style={{height}}/>)}</div><div className="auth-preview-bottom"><span>One workspace</span><span>More possibilities ↗</span></div></div><ul><li><span>✓</span> Manage students, teachers and timetables</li><li><span>✓</span> School, Gym and Barber services included</li><li><span>✓</span> Keep your team’s work in one place</li></ul></div><p className="auth-story-footer">Smart CRM · Made for small organizations</p></aside>
<div className="auth-form-pane"><header className="auth-topline"><a href="#login" className="auth-mobile-brand">Smart CRM</a><span>{workspace ? 'Already have a workspace?' : 'New to Smart CRM?'}</span><a href={workspace ? '#login' : '#create-workspace'}>{workspace ? 'Sign in' : 'Create a workspace'} →</a></header><section className={`page card ${workspace ? 'workspace-card' : 'login-card'}`} aria-labelledby="title">
<p className="auth-kicker">{workspace ? 'LET’S GET YOU STARTED' : 'YOUR WORKSPACE AWAITS'}</p>
<h1 id="title">{workspace ? 'Workspace Setup' : 'Welcome Back'}</h1>
<p className="subtitle">{workspace ? 'Set up your school with Gym and Barber services included.' : 'Enter your details to access your dashboard.'}</p>
<form onSubmit={submit} key={workspace ? 'workspace' : 'login'}>
{workspace && <><Field label="School Name" id="business" icon="store" placeholder="e.g. Sunrise School" autoComplete="organization" pattern=".*\S.*" /><Field label="Owner Name" id="owner" icon="user" placeholder="Full Name" autoComplete="name" pattern=".*\S.*" /></>}
<Field label="Email" id="email" icon="mail" type="email" placeholder={workspace ? 'name@business.com' : 'name@school.edu'} autoComplete="email" />
<div className="password-field">{!workspace && <button type="button" className="forgot text-link" onClick={() => setNotice('Password recovery will be available when the service is connected.')}>Forgot password?</button>}<Field label="Password" id="password" icon="lock" type="password" minLength={workspace ? 8 : undefined} placeholder={workspace ? 'Min. 8 characters' : '••••••••'} autoComplete={workspace ? 'new-password' : 'current-password'} /></div>
{workspace && <fieldset className="workspace-modules"><legend>Included services</legend><p>One workspace for your school and student facilities.</p>{['School — students, admission, fees and timetable','Gym — student training sessions','Barber — clients, appointments and services'].map(label=><div key={label} className="auth-included"><span>{label}</span><strong>Included ✓</strong></div>)}<p>Shared overview, alerts and reports.</p></fieldset>}
{!workspace && <label className="remember"><input type="checkbox" />Remember me for 30 days</label>}
<button className="primary" type="submit">{workspace ? 'Create Workspace' : 'Login'}<Icon name={workspace ? 'rocket' : 'arrow'} size={26} /></button>
</form>
{notice && <p className="notice" role="status">{notice}</p>}
{!workspace && <><div className="divider"><span />OR CONTINUE WITH<span /></div><button className="google" onClick={() => setNotice('Google sign-in will be available when the service is connected.')}><span className="google-g">G</span>Sign in with Google</button><p className="footer">Don’t have a workspace? <a href="#create-workspace">Create one</a></p></>}
<p className="footer"><a href="#school-dashboard">Preview School Dashboard</a></p>

</section><footer className="auth-page-footer">Smart CRM · School Management Workspace</footer></div></main>
}
