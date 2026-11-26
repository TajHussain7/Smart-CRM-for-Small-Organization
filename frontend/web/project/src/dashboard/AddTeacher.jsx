import { useEffect, useRef, useState } from 'react'
import { createTeacher, updateTeacher, getTeacherById } from '../api/school.js'
import { addTeacher } from './teachers-store'

export default function AddTeacher({ onCreated, teacher }) {
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(null)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState('')
  return (
    <>
      <button type="button" className="g-button secondary" disabled={opening} onClick={async () => {
        setOpening(true); setOpenError('')
        try { if (teacher) setDetails(await getTeacherById(teacher._id)); setOpen(true) }
        catch (err) { setOpenError(err.message || 'Unable to load teacher.') }
        finally { setOpening(false) }
      }}>
        {teacher ? 'Edit Teacher' : '＋ Add Teacher'}
      </button>
      {openError && <p role="alert" className="student-error">{openError}</p>}
      {open && <TeacherDialog teacher={teacher ? details : null} close={() => setOpen(false)} onCreated={onCreated} />}
    </>
  )
}

function TeacherDialog({ close, onCreated, teacher }) {
  const ref = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  async function save(event) {
    event.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const name = form.get('name')?.trim()
    const email = form.get('email')?.trim().toLowerCase()
    const subject = form.get('subject')?.trim()
    const phone = form.get('phone')?.trim()

    if (name.length < 2 || !email || !subject) {
      setLoading(false)
      setError('Name, email and subject are required.')
      return
    }

    try {
      const input = { name, email, subject, phone }
      const created = teacher ? await updateTeacher(teacher._id, input) : await createTeacher(input)
      addTeacher(created)
      if (onCreated) onCreated(created)
      close()
      if (!teacher) location.hash = `#school-timetable/${created._id || created.id}`
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to add teacher.')
    }
  }

  return (
    <dialog ref={ref} className="school-dialog" aria-label={teacher ? "Edit Teacher" : "Add Teacher"} onCancel={close}>
      <div className="school-panel-heading">
        <h2>{teacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
        <button className="school-icon-button" aria-label="Close" onClick={close}>×</button>
      </div>
      <form className="student-form" onSubmit={save}>
        <label>
          Full Name
          <input name="name" defaultValue={teacher?.name} minLength={2} required maxLength={100} placeholder="e.g. Tariq Mehmood" />
        </label>
        <label>
          Email Address
          <input name="email" defaultValue={teacher?.email} required type="email" maxLength={100} placeholder="e.g. tariq@school.edu.pk" />
        </label>
        <label>
          Subject / Speciality
          <input name="subject" defaultValue={teacher?.subject} required maxLength={100} placeholder="e.g. Mathematics" />
        </label>
        <label>
          Phone Number
          <input name="phone" defaultValue={teacher?.phone} type="tel" maxLength={20} placeholder="e.g. 03001234567" />
        </label>
        {error && <p role="alert" className="student-error" style={{ color: '#d32f2f' }}>{error}</p>}
        <button className="student-submit" disabled={loading}>
          {loading ? 'Saving...' : teacher ? 'Save Teacher' : 'Add Teacher & Open Timetable'}
        </button>
      </form>
    </dialog>
  )
}
