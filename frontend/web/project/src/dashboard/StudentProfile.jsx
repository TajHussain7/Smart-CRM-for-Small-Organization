import { readStudentNotes, updateStudentAddress } from './student-notes'
import { useEffect, useRef, useState } from 'react'
import Icon from './SchoolIcon'
import { getStudentById, updateStudent, deleteStudent } from '../api/school.js'
import { updateStudent as updateStoreStudent, removeStudent } from './students-store'
import { studentGrades, studentClassLevel } from './student-fields'
import './dashboard.css'
import './students.css'
import './profile.css'

const fields = [
  ['name', 'Student name'],
  ['grade', 'Grade'],
  ['notes', 'Address / Notes'],
  ['guardianName', 'Guardian name'],
  ['guardianPhone', 'Guardian Phone'],
  ['guardianEmail', 'Guardian Email'],
]

function EditDialog({ student, close, onSaved }) {
  const ref = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const values = Object.fromEntries(
      [...new FormData(event.currentTarget)].map(([key, value]) => [key, value.trim()])
    )

    if (!values.name || !values.grade) {
      setLoading(false)
      setError('Student name and grade are required.')
      return
    }

    try {
      values.notes = updateStudentAddress(student.notes, values.notes)
      values.monthlyFee = Number(values.monthlyFee)
      values.classLevel = studentClassLevel(values.grade)
      if (!values.guardianEmail) delete values.guardianEmail
      const updated = await updateStudent(student._id || student.studentId || student.id, values)
      updateStoreStudent(student.studentId || student.id, updated)
      onSaved(updated)
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to update student.')
    }
  }

  return (
    <dialog ref={ref} className="school-dialog" aria-label="Edit student" onCancel={close}>
      <div className="school-panel-heading">
        <h2>Edit Student</h2>
        <button className="school-icon-button" aria-label="Close edit" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <form className="student-form" onSubmit={submit}>
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === 'grade' ? <select name="grade" defaultValue={student.grade}>{!studentGrades.includes(student.grade) && <option value={student.grade} disabled>{student.grade} (unsupported)</option>}{studentGrades.map(grade => <option key={grade}>{grade}</option>)}</select> : <input
              name={key}
              defaultValue={key === 'notes' ? readStudentNotes(student.notes).address : student[key] || student[key === 'guardianName' ? 'guardian' : key === 'guardianPhone' ? 'phone' : key === 'guardianEmail' ? 'email' : ''] || ''}
              required={['name', 'guardianName', 'guardianPhone'].includes(key) || (key === 'guardianEmail' && !!student.guardianEmail)}
              minLength={key === 'guardianPhone' ? 10 : ['name', 'guardianName'].includes(key) ? 2 : undefined}
              maxLength={120}
              type={key.includes('Email') ? 'email' : key.includes('Phone') ? 'tel' : 'text'}
            />}
          </label>
        ))}
        <label>Section<select name="section" defaultValue={student.section}><option>A</option><option>B</option></select></label>
        <label>Monthly fee<input name="monthlyFee" type="number" min="0" required defaultValue={student.monthlyFee} /></label>
        {error && <p role="alert" className="g-error" style={{ color: '#d32f2f' }}>{error}</p>}
        <button className="student-submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </dialog>
  )
}

export default function SelectedStudentProfile({ studentId }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let mounted = true
    getStudentById(studentId)
      .then(res => {
        if (!mounted) return
        setStudent(res)
        setLoading(false)
      })
      .catch(err => {
        if (!mounted) return
        setStudent(null)
        setError(err.message || 'Unable to load student.')
        setLoading(false)
      })
    return () => { mounted = false }
  }, [studentId, reload])

  if (loading) {
    return (
      <main className="profile-main">
        <section className="profile-card">
          <h2>Loading student profile...</h2>
        </section>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="profile-main">
        <section className="profile-card">
          <h1>Unable to load student</h1>
          <p role="alert">{error || 'Student not found.'}</p>
          <button onClick={() => { setLoading(true); setError(''); setReload(value => value + 1) }}>Retry</button>
          <a href="#students">← Back to Students</a>
        </section>
      </main>
    )
  }

  const id = student.studentId || student.id || student._id
  const guardian = student.guardianName || student.guardian || 'Not provided'
  const phone = student.guardianPhone || student.phone || 'Not provided'
  const email = student.guardianEmail || student.email || 'Not provided'
  const address = readStudentNotes(student.notes).address || 'Not provided'
  const feeStatus = student.feeStatus || student.status || 'Pending'

  return (
    <div className="school-shell profile-shell">
      <header className="school-header">
        <div className="school-header-inner">
          <a className="school-icon-button" href="#students" aria-label="Back to Students">
            <Icon name="back" />
          </a>
          <h1>Student Information</h1>
        </div>
      </header>
      <main className="profile-main">
        <section className="profile-card profile-hero">
          <div className="selected-student-avatar" aria-hidden="true">
            {student.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('')}
          </div>
          <h2>{student.name}</h2>
          <span className="profile-id">ID: {id}</span>
          <button className="profile-button" onClick={() => setEditing(true)}>
            <Icon name="edit" size={16} />
            Edit Student
          </button>
        </section>

        <div className="profile-details">
          <section className="profile-card">
            <h2 className="profile-section-label">ACADEMIC & PERSONAL DETAILS</h2>
            <dl className="profile-description">
              {[
                ['CLASS / GRADE', student.grade],
                ['SECTION', student.section || 'A'],
                ['MONTHLY FEE', `Rs. ${(student.monthlyFee ?? 0).toLocaleString()}`],
                ['ADDRESS', address],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="profile-card">
            <h2 className="profile-section-label">GUARDIAN DETAILS</h2>
            <dl className="profile-description">
              {[
                ['GUARDIAN', guardian],
                ['PHONE', phone],
                ['EMAIL', email],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <section className="profile-card">
          <div className="school-panel-heading">
            <h2>Fee Status</h2>
            <span className={`fee-status ${feeStatus.toLowerCase()}`}>{feeStatus}</span>
          </div>
          <p className="school-detail-note">
            Monthly fee: Rs. {(student.monthlyFee ?? 0).toLocaleString()}. Current invoice status: {feeStatus}.
          </p>
        </section>

        {error && <p role="alert" className="student-error">{error}</p>}
        <button className="profile-button" disabled={deleting} onClick={async () => {
          if (!window.confirm(`Delete ${student.name} (${id})? This cannot be undone.`)) return
          setDeleting(true); setError('')
          try { await deleteStudent(student._id || id); removeStudent(id); location.hash = '#students' }
          catch (err) { setError(err.message || 'Unable to delete student.'); setDeleting(false) }
        }}>{deleting ? 'Deleting...' : 'Delete Student'}</button>
        {notice && <p className="student-notice" role="status">{notice}</p>}
      </main>

      <nav className="school-nav" aria-label="School navigation">
        <a href="#school-dashboard"><Icon name="dashboard" />Dashboard</a>
        <a href="#students" aria-current="page"><Icon name="tasks" />Students</a>
      </nav>

      {editing && (
        <EditDialog
          student={student}
          close={() => setEditing(false)}
          onSaved={(updated) => {
            setStudent(updated)
            setEditing(false)
            setNotice('Student details updated successfully.')
          }}
        />
      )}
    </div>
  )
}
