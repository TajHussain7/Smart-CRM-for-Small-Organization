import { useEffect, useRef, useState } from 'react'
import Icon from './SchoolIcon'
import { useProfile, updateProfile } from './profile-store'
import './dashboard.css'
import './students.css'
import './profile.css'

const fields = [['name', 'Student name'], ['grade', 'Grade / Section'], ['address', 'Address'], ['guardian', 'Guardian name'], ['phone', 'Phone number'], ['email', 'Email']]
function EditDialog({ student, close, saved }) {
  const ref = useRef(null)
  const [error, setError] = useState('')
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  function submit(event) {
    event.preventDefault()
    const values = Object.fromEntries([...new FormData(event.currentTarget)].map(([key, value]) => [key, value.trim()]))
    if (!updateProfile(student.id, values)) { setError('Student name and grade are required.'); return }
    saved()
  }
  return <dialog ref={ref} className="school-dialog" aria-label="Edit student" onCancel={close}>
    <div className="school-panel-heading"><h2>Edit Student</h2><button className="school-icon-button" aria-label="Close edit" onClick={close}><Icon name="close"/></button></div>
    <form className="student-form" onSubmit={submit}><p className="school-detail-note">Changes apply to {student.id} for this demo session.</p>{fields.map(([key,label]) => <label key={key}>{label}<input name={key} defaultValue={student[key]} required={key === 'name' || key === 'grade'} maxLength={key === 'address' ? 180 : 80} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}/></label>)}{error && <p role="alert">{error}</p>}<button className="student-submit">Save Changes</button></form>
  </dialog>
}
export default function SelectedStudentProfile({ studentId }) {
  const profile = useProfile(studentId)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  if (!profile) return <main className="profile-main"><section className="profile-card"><h1>Student not found</h1><p>This student is unavailable. Session-only records are cleared on refresh.</p><a href="#students">← Back to Tasks</a></section></main>
  const { student } = profile
  return <div className="school-shell profile-shell">
    <header className="school-header"><div className="school-header-inner"><a className="school-icon-button" href="#students" aria-label="Back to Tasks"><Icon name="back"/></a><h1>Student Information</h1></div></header>
    <main className="profile-main">
      <section className="profile-card profile-hero"><div className="selected-student-avatar" aria-hidden="true">{student.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('')}</div><h2>{student.name}</h2><span className="profile-id">ID: {student.id}</span><button className="profile-button" onClick={()=>setEditing(true)}><Icon name="edit" size={16}/>Edit Student</button></section>
      <div className="profile-details"><section className="profile-card"><h2 className="profile-section-label">PERSONAL DETAILS</h2><dl className="profile-description">{[['DATE OF BIRTH',student.birthDate],['GRADE / SECTION',student.grade],['ADDRESS',student.address]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></section><section className="profile-card"><h2 className="profile-section-label">GUARDIAN DETAILS</h2><dl className="profile-description">{[['GUARDIAN',student.guardian],['PHONE',student.phone],['EMAIL',student.email]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></section></div>
      <section className="profile-card"><h2>Attendance Overview</h2><p className="school-detail-note">Attendance records have not been provided for {student.name}.</p></section>
      <section className="profile-card"><div className="school-panel-heading"><h2>Fee History</h2><span className={'fee-status '+student.status.toLowerCase()}>{student.status}</span></div><p className="school-detail-note">Fee status: {student.status}. Detailed payment history has not been provided.</p></section>
      {notice && <p className="student-notice" role="status">{notice}</p>}<p className="school-sample-note">Sample records · Changes last for this session only</p>
    </main>
    <nav className="school-nav" aria-label="School navigation"><a href="#school-dashboard"><Icon name="dashboard"/>Dashboard</a><a href="#students" aria-current="page"><Icon name="tasks"/>Tasks</a></nav>
    {editing && <EditDialog student={student} close={()=>setEditing(false)} saved={()=>{setEditing(false);setNotice('Student details updated for this session.')}}/>}
  </div>
}
