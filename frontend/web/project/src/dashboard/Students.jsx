import { useEffect, useRef, useState } from 'react'
import AddTeacher from './AddTeacher'
import './timetable.css'
import Icon from './SchoolIcon'
import { addStudent, useStudents } from './students-store'
import data from './demo-data.json'
import './dashboard.css'
import './students.css'

function Dialog({ title, close, children }) {
  const ref = useRef(null)
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} aria-label={title} className="school-dialog student-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="school-panel-heading"><h2>{title}</h2><button className="school-icon-button" aria-label="Close dialog" onClick={close}><Icon name="close" /></button></div>{children}
  </dialog>
}

const grades = ['9th', '10th', '11th', '12th']

export default function Students() {
  const students = useStudents()
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('All')
  const [status, setStatus] = useState('All')
  const [draftGrade, setDraftGrade] = useState('All')
  const [draftStatus, setDraftStatus] = useState('All')
  const [panel, setPanel] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const filterCount = Number(grade !== 'All') + Number(status !== 'All')
  const filtered = students.filter(student => (student.name.toLowerCase().includes(query.trim().toLowerCase()) || student.id.toLowerCase().includes(query.trim().toLowerCase())) && (grade === 'All' || student.grade === grade) && (status === 'All' || student.status === status))
  function openAdd() { location.hash = '#school-admission' }
  function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const name = fields.get('name').trim()
    const id = fields.get('id').trim().toUpperCase()
    if (!name || !id) { setError('Enter a student name and ID.'); return }
    if (!addStudent({ name, id, grade: fields.get('grade'), status: fields.get('status') })) { setError('A student with this ID already exists.'); return }
    setQuery(''); setGrade('All'); setStatus('All'); setPanel(null)
    setNotice(name + ' added to this demo session.')
  }
  return <div className="school-shell students-shell">
    <header className="school-header"><div className="school-header-inner"><a className="school-icon-button student-back" href="#school-dashboard" aria-label="Back to dashboard"><Icon name="back" /></a><h1>School Management</h1><button className="school-avatar" aria-label="Open administrator profile" onClick={() => {location.hash='#school-settings'}}>SA</button></div></header>
    <main className="students-main">
      <div className="student-tools"><div className="student-search"><Icon name="search" size={21} /><input type="search" aria-label="Search students by name or ID" placeholder="Search students by name or ID..." value={query} onChange={event => setQuery(event.target.value)} /></div><button className="student-filter" onClick={() => { setDraftGrade(grade); setDraftStatus(status); setPanel('Filter Students') }}><Icon name="filter" size={20} />Filter{filterCount ? ' (' + filterCount + ')' : ''}</button></div>
      <section className="student-overview" aria-label="Student summary">
        <article className="student-enrollment"><h2>TOTAL ENROLLMENT</h2><strong>{(1284 + students.length - 5).toLocaleString('en-US')}</strong><p><Icon name="trend" size={16} />4% from last month</p></article>
        <article className="student-metric"><h2>FEES PAID</h2><strong>82%</strong></article><article className="student-metric attendance"><h2>ATTENDANCE</h2><strong>94%</strong></article>
      </section>
      {notice && <p className="student-notice" role="status">{notice}</p>}
      {(query || filterCount > 0) && <div className="student-results" role="status"><span>{filtered.length} student{filtered.length === 1 ? '' : 's'} found</span><button onClick={() => { setQuery(''); setGrade('All'); setStatus('All') }}>Clear filters</button></div>}
      <section className="student-list" aria-label="Students">
        <div className="g-panel student-table-panel"><div className="g-table-wrap"><table><thead><tr><th>Student</th><th>Student ID</th><th>Grade</th><th>Fee status</th><th>Action</th></tr></thead><tbody>{filtered.map(student => <tr key={student.id}><td><a className="g-person" href={`#student/${student.id}`} aria-label={`View profile for ${student.name}, ${student.id}`}><span className={'student-avatar ' + student.tone}><Icon name="profile" size={21}/></span><strong>{student.name}</strong></a></td><td>{student.id}</td><td>{student.grade}</td><td><span className={`g-badge ${student.status === 'Paid' ? 'good' : 'warn'}`}>{student.status}</span></td><td><a href={`#student/${student.id}`}>View profile →</a></td></tr>)}</tbody></table></div></div>
        {filtered.length === 0 && <div className="student-empty"><Icon name="search" size={30} /><h2>No students found</h2><p>Try another name, ID, or filter.</p></div>}
        <div className="school-add-actions"><button className="student-add-card" onClick={openAdd}><Icon name="addPerson" size={32} /><strong>Add New Student</strong><span>Quickly register a new attendee</span></button><AddTeacher/><a className="g-button secondary" href="#school-timetable">Teacher Timetable</a></div>
      </section>
      <p className="school-sample-note">Sample records · New students stay in this session only</p>
    </main>
    <button className="school-add student-floating-add" aria-label="Add new student" onClick={openAdd}><Icon name="plus" size={26} /></button>
    <nav className="school-nav" aria-label="School navigation">{['Dashboard', 'Tasks', 'Alerts', 'Profile'].map(item => <button key={item} className={item === 'Tasks' ? 'active' : ''} aria-current={item === 'Tasks' ? 'page' : undefined} onClick={() => item === 'Dashboard' ? (location.hash = '#school-dashboard') : item === 'Tasks' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : setPanel(item)}><Icon name={item.toLowerCase()} size={21} /><span>{item}</span></button>)}</nav>
    {panel && <Dialog key={panel} title={panel} close={() => setPanel(null)}>
      {panel === 'Filter Students' ? <form className="student-form" onSubmit={event => { event.preventDefault(); setGrade(draftGrade); setStatus(draftStatus); setPanel(null) }}><label>Grade<select value={draftGrade} onChange={event => setDraftGrade(event.target.value)}><option>All</option>{grades.map(value => <option key={value}>{value}</option>)}</select></label><label>Fee status<select value={draftStatus} onChange={event => setDraftStatus(event.target.value)}>{['All', 'Paid', 'Pending'].map(value => <option key={value}>{value}</option>)}</select></label><div className="student-form-actions"><button type="button" className="student-secondary" onClick={() => { setDraftGrade('All'); setDraftStatus('All') }}>Reset</button><button className="student-submit">Apply filters</button></div></form>
        : panel === 'Add New Student' ? <form className="student-form" onSubmit={submit}><p className="school-detail-note">Add a sample student for this session. Changes are not saved to a server.</p><label>Full name<input name="name" required maxLength={80} autoComplete="off" placeholder="e.g. Alex Johnson" /></label><label>Student ID<input name="id" required maxLength={20} pattern="[A-Za-z0-9-]+" title="Use letters, numbers, or hyphens" placeholder="e.g. S116" autoComplete="off" /></label><label>Grade<select name="grade" defaultValue="10th">{grades.map(value => <option key={value}>{value}</option>)}</select></label><label>Fee status<select name="status" defaultValue="Pending"><option>Pending</option><option>Paid</option></select></label>{error && <p className="student-error" role="alert">{error}</p>}<button className="student-submit">Add Student</button></form>
          : <><p className="school-demo">School workspace · Sample data</p><ul className="school-detail-list">{(data.sections[panel] || []).map(line => <li key={line}>{line}</li>)}</ul></>}
    </Dialog>}
  </div>
}
