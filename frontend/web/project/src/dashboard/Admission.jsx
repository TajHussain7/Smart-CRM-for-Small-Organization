import { useState } from 'react'
import { createStudent } from '../api/school.js'
import { addStudent } from './students-store'

import { studentGrades, studentClassLevel } from './student-fields'

export default function Admission() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const value = Object.fromEntries(formData.entries())
    const id = value.id?.trim().toUpperCase()
    const name = value.name?.trim()
    const grade = value.grade?.trim()
    const guardian = value.guardian?.trim()
    const phone = value.phone?.trim()
    const email = value.email?.trim()
    const fee = Number(value.fee)
    const address = value.address?.trim()

    if (!id || !name || !grade || !guardian || !phone) {
      setLoading(false)
      setError('Please fill in all required fields.')
      return
    }

    try {
      const created = await createStudent({
        studentId: id,
        name,
        grade,
        classLevel: studentClassLevel(grade),
        section: value.section,
        guardianName: guardian,
        guardianPhone: phone,
        guardianEmail: email || undefined,
        monthlyFee: fee,
        notes: address,
      })

      addStudent(created)
      location.hash = `#student/${encodeURIComponent(id)}`
    } catch (err) {
      setLoading(false)
      setError(err.message || 'Failed to admit student. Please try again.')
    }
  }

  return (
    <section className="g-panel">
      <h2>Student Admission</h2>
      <p className="g-muted">Register a new student with complete academic and guardian details.</p>
      <form className="g-form" onSubmit={handleSubmit}>
        <div className="g-form-grid">
          <label>
            Student ID
            <input name="id" required placeholder="e.g. S101" />
          </label>
          <label>
            Full Name
            <input name="name" minLength={2} required placeholder="e.g. Ali Raza" />
          </label>
          <label>
            Parent / Guardian
            <input name="guardian" minLength={2} required placeholder="e.g. Muhammad Raza" />
          </label>
          <label>
            Guardian Phone
            <input name="phone" type="tel" minLength={10} required placeholder="e.g. 03001234567" />
          </label>
          <label>
            Guardian Email
            <input name="email" type="email" placeholder="e.g. parent@example.com" />
          </label>
          <label>
            Monthly Tuition Fee (PKR)
            <input name="fee" type="number" defaultValue="5000" min="0" required />
          </label>
          <label>
            Residential Address
            <input name="address" placeholder="e.g. House 14, Street 3, Lahore" />
          </label>
          <label>
            Class / Grade
            <select name="grade" required defaultValue="">
              <option value="" disabled>Select class</option>
              {studentGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>Section<select name="section" defaultValue="A"><option>A</option><option>B</option></select></label>
        </div>
        {error && <p className="g-error" role="alert" style={{ color: '#d32f2f', marginTop: 12 }}>{error}</p>}
        <button className="g-button" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Admitting Student...' : 'Admit Student'}
        </button>
      </form>
    </section>
  )
}
