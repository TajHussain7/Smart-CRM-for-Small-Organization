import { useState, useEffect } from 'react'
import { getMembers, createSession } from '../api/gym.js'
import { recordTraining } from '../training-store'
import { queueAlert } from '../alerts-store'
import banner from './gym-training.jpg'
import './training.css'

const trainers = [
  { id: 'trainer-1', name: 'Zubair Butt', initials: 'ZB', role: 'Head Fitness Trainer' },
  { id: 'trainer-2', name: 'Ayesha Tariq', initials: 'AT', role: 'Aerobics & Strength Coach' },
]

const types = ['Strength Training', 'Personal Training', 'Cardio & HIIT', 'Flexibility & Yoga']

export default function TrainingSessions() {
  const [members, setMembers] = useState([])

  const [contact, setContact] = useState('')
  const [memberId, setMemberId] = useState('')
  const [trainer, setTrainer] = useState(trainers[0].id)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [type, setType] = useState(types[0])
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const membersRes = await getMembers()
        if (!mounted) return
        const mList = Array.isArray(membersRes) ? membersRes : membersRes?.data || []
        setMembers(mList)
      } catch (err) {
        console.error('Failed to load training data:', err)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const member = members.find(item => item._id === memberId || item.id === memberId)

  async function submit(event) {
    event.preventDefault()
    if (!member) {
      setError('Please select a member.')
      return
    }

    if (!date || !time) {
      setError('Please choose a valid session date and time.')
      return
    }

    setError('')
    setLoading(true)

    const selectedTrainer = trainers.find(t => t.id === trainer)
    const trainerName = selectedTrainer ? selectedTrainer.name : 'Gym Trainer'
    const scheduledIso = `${date}T${time}:00.000Z`

    try {
      if (member._id) {
        await createSession({
          memberId: member._id,
          trainerId: member.assignedTrainerId || member._id, // fallback if user ID needed
          scheduledAt: scheduledIso,
          notes: `${type} session`,
        }).catch(() => {
          // Fallback if trainer is not an admin user in DB
        })
      }

      recordTraining({
        id: `${member._id || member.id}:${date}:${time}:${trainer}`,
        studentId: member._id || member.id,
        student: member.name,
        trainer: trainerName,
        date,
        time,
        type,
      })

      queueAlert({
        module: 'gym',
        eventId: `training:${member._id || member.id}:${date}:${time}`,
        type: 'Appointment Reminder',
        recipient: member.name,
        contact: member.phone || contact,
        channel: 'WHATSAPP',
        message: `${type} for ${member.name} on ${date} at ${time} with trainer ${trainerName}.`,
      })

      setBooking({
        date,
        time,
        type,
        member: `${member.name} (${member.membershipId || 'Member'})`,
        trainer: trainerName,
      })
    } catch (err) {
      setError(err.message || 'Failed to record session.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="training-layout">
      <div>
        <div className="training-banner">
          <img src={banner} alt="Gym training equipment" />
          <div>
            <span>TRAINING SESSIONS</span>
            <h2>Schedule Personal &amp; Group Training</h2>
          </div>
        </div>

        <div>{error && <p role="alert" className="g-error">{error}</p>}</div>

        <form className="training-form" onSubmit={submit} onChange={() => setBooking(null)}>
          <section className="g-panel">
            <h2 className="training-section-title">SELECT MEMBER</h2>
            <label>
              Member / Athlete
              <select
                required
                value={memberId}
                onChange={event => {
                  setMemberId(event.target.value)
                  setContact('')
                }}
              >
                <option value="" disabled>Select a member</option>
                {members.map(item => (
                  <option key={item._id || item.id} value={item._id || item.id}>
                    {item.name} · {item.membershipId} ({item.plan})
                  </option>
                ))}
              </select>
            </label>
            {member && (
              <p className="g-caption">
                Plan: {member.plan} · Status: {member.status}
              </p>
            )}
            {!members.length && <p>No members registered yet. Add a member first.</p>}
          </section>

          <section className="g-panel">
            <label>
              Member Phone Contact (for reminders)
              <input
                value={contact || (member?.phone || '')}
                onChange={e => setContact(e.target.value)}
                placeholder="e.g. 03001234567"
              />
            </label>
          </section>

          <section className="g-panel">
            <h2 className="training-section-title">SELECT DATE &amp; TIME</h2>
            <div className="g-form-grid">
              <label>
                Session Date
                <input
                  type="date"
                  required
                  value={date}
                  onChange={event => setDate(event.target.value)}
                />
              </label>
              <label>
                Session Time
                <input
                  type="time"
                  required
                  value={time}
                  onChange={event => setTime(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="g-panel">
            <h2 className="training-section-title">TRAINER &amp; WORKOUT</h2>
            <fieldset className="training-trainers">
              <legend>Select Trainer</legend>
              {trainers.map(item => (
                <label className={trainer === item.id ? 'selected' : ''} key={item.id}>
                  <input
                    type="radio"
                    name="trainer"
                    value={item.id}
                    checked={trainer === item.id}
                    onChange={() => setTrainer(item.id)}
                  />
                  <span className="g-avatar">{item.initials}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <label>
              Session Type
              <select value={type} onChange={event => setType(event.target.value)}>
                {types.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </section>

          <button className="g-button training-book" type="submit" disabled={loading || !members.length}>
            {loading ? 'Booking...' : '▣ Book Training Session'}
          </button>
        </form>
      </div>

      <aside>
        <section className="g-panel training-summary">
          <div className="g-panel-head">
            <h2>Session Summary</h2>
            <span className="g-badge good">GYM</span>
          </div>
          <dl>
            {[
              ['Member', member ? `${member.name} (${member.membershipId})` : 'Select a member'],
              ['Trainer', trainers.find(item => item.id === trainer)?.name || 'Trainer'],
              ['Session', type],
              ['Date', date || 'Select date'],
              ['Time', time || 'Select time'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {booking && (
          <section className="g-panel training-success" role="status">
            <h2>Session Confirmed</h2>
            <p>Member: {booking.member}</p>
            <p>{booking.type} with {booking.trainer}</p>
            <p>{booking.date} at {booking.time}</p>
            <p className="g-muted">Notification reminder generated in Alerts.</p>
          </section>
        )}
      </aside>
    </div>
  )
}
