import { useState } from 'react'
import { admitStudent } from './admission-store'

const classes = ['Play Group', 'Nursery', 'KG I', 'KG II', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['Male', 'Female', 'Other']

export default function Admission() {
  const [error, setError] = useState('')

  return (
    <section className="g-panel">
      <h2>Student Admission</h2>
      <p className="g-muted">New students become available in fees and Gym training. Student ID is auto-generated upon admission.</p>
      <form
        className="g-form"
        onSubmit={e => {
          e.preventDefault()
          const value = Object.fromEntries(new FormData(e.currentTarget))
          const issue = admitStudent(value)
          if (issue) setError(issue)
          else location.hash = '#student/' + encodeURIComponent(value.id)
        }}
      >
        <div className="g-form-grid">
          <label>
            Full Name
            <input name="name" required type="text" placeholder="Full Name" />
          </label>
          <label>
            Class
            <select name="grade" required defaultValue="">
              <option value="" disabled>Select class</option>
              {classes.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Section
            <select name="section" required defaultValue="">
              <option value="" disabled>Select section</option>
              <option value="Section A (Boys)">Section A (Boys)</option>
              <option value="Section B (Girls)">Section B (Girls)</option>
            </select>
          </label>
          <label>
            Date of Birth
            <input name="birthDate" required type="date" />
          </label>
          <label>
            Gender
            <select name="gender" required defaultValue="">
              <option value="" disabled>Select gender</option>
              {genders.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Blood Group
            <select name="bloodGroup" required defaultValue="">
              <option value="" disabled>Select blood group</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </label>
          <label>
            Parent / Guardian
            <input name="guardian" required type="text" placeholder="Parent or Guardian Name" />
          </label>
          <label>
            Guardian Phone
            <input name="phone" required type="tel" placeholder="e.g. 555-0123" />
          </label>
          <label>
            Emergency Number
            <input name="emergencyPhone" required type="tel" placeholder="e.g. 555-0199" />
          </label>
          <label>
            Guardian Email
            <input name="email" required type="email" placeholder="guardian@example.com" />
          </label>
          <label>
            Address
            <input name="address" type="text" placeholder="Residential Address" />
          </label>
        </div>
        {error && <p role="alert" className="g-error">{error}</p>}
        <button className="g-button" style={{ marginTop: '20px' }}>Admit Student</button>
      </form>
    </section>
  )
}
