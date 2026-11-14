import { useEffect, useRef, useState } from 'react'
import Icon from './SchoolIcon'
import { getStudentById, updateStudent } from '../api/school.js'
import { updateStudent as updateStoreStudent } from './students-store'
import './dashboard.css'
import './students.css'
import './profile.css'

const fields = [
  ['name', 'Student name'],
  ['grade', 'Grade / Section'],
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
      const updated = await updateStudent(student.studentId || student.id, values)
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
            <input
              name={key}
              defaultValue={student[key] || student[key === 'guardianName' ? 'guardian' : key === 'guardianPhone' ? 'phone' : key === 'guardianEmail' ? 'email' : ''] || ''}
              required={key === 'name' || key === 'grade'}
              maxLength={120}
              type={key.includes('Email') ? 'email' : key.includes('Phone') ? 'tel' : 'text'}
            />
          </label>
        ))}
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

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getStudentById(studentId)
      .then(res => {
        if (!mounted) return
        setStudent(res)
        setLoading(false)
      })
      .catch(err => {
        if (!mounted) return
        console.error('Failed to fetch student:', err)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [studentId])

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
          <h1>Student not found</h1>
          <p>No student with ID &ldquo;{studentId}&rdquo; was found.</p>
          <a href="#students">← Back to Students</a>
        </section>
      </main>
    )
  }

  const id = student.studentId || student.id || student._id
  const guardian = student.guardianName || student.guardian || 'Not provided'
  const phone = student.guardianPhone || student.phone || 'Not provided'
  const email = student.guardianEmail || student.email || 'Not provided'
  const address = student.notes || student.address || 'Not provided'
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
                ['MONTHLY FEE', student.monthlyFee ? `Rs. ${student.monthlyFee.toLocaleString()}` : 'Rs. 5,000'],
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
            Monthly fee: Rs. {(student.monthlyFee || 5000).toLocaleString()}. Current invoice status: {feeStatus}.
          </p>
        </section>

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
