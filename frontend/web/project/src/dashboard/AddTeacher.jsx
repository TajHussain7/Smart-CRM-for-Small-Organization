import { useEffect, useRef, useState } from 'react'
import { createTeacher } from '../api/school.js'
import { addTeacher } from './teachers-store'

export default function AddTeacher({ onCreated }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="g-button secondary" onClick={() => setOpen(true)}>
        ＋ Add Teacher
      </button>
      {open && <TeacherDialog close={() => setOpen(false)} onCreated={onCreated} />}
    </>
  )
}

function TeacherDialog({ close, onCreated }) {
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
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const name = form.get('name')?.trim()
    const email = form.get('email')?.trim().toLowerCase()
    const subject = form.get('subject')?.trim()
    const phone = form.get('phone')?.trim()

    if (!name || !email || !subject) {
      setLoading(false)
      setError('Name, email and subject are required.')
      return
    }

    try {
      const created = await createTeacher({ name, email, subject, phone: phone || undefined })
      addTeacher({ name, email, subject, phone, id: created._id || created.id })
      if (onCreated) onCreated(created)
      close()
      location.hash = `#school-timetable/${created._id || created.id}`
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to add teacher.')
    }
  }

  return (
    <dialog ref={ref} className="school-dialog" aria-label="Add Teacher" onCancel={close}>
      <div className="school-panel-heading">
        <h2>Add Teacher</h2>
        <button className="school-icon-button" aria-label="Close" onClick={close}>×</button>
      </div>
      <form className="student-form" onSubmit={save}>
        <label>
          Full Name
          <input name="name" required maxLength={100} placeholder="e.g. Tariq Mehmood" />
        </label>
        <label>
          Email Address
          <input name="email" required type="email" maxLength={100} placeholder="e.g. tariq@school.edu.pk" />
        </label>
        <label>
          Subject / Speciality
          <input name="subject" required maxLength={100} placeholder="e.g. Mathematics" />
        </label>
        <label>
          Phone Number
          <input name="phone" type="tel" maxLength={20} placeholder="e.g. 03001234567" />
        </label>
        {error && <p role="alert" className="student-error" style={{ color: '#d32f2f' }}>{error}</p>}
        <button className="student-submit" disabled={loading}>
          {loading ? 'Adding Teacher...' : 'Add Teacher & Open Timetable'}
        </button>
      </form>
    </dialog>
  )
}
