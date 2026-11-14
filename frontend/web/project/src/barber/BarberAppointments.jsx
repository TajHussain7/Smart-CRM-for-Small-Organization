import { useState, useEffect } from 'react'
import { useBarber, setClientsFromAPI, setServicesFromAPI, services, visitLabel } from './barber-store'
import {
  barbers,
  useBookings,
  setBookingsFromAPI,
  dateKey,
  monthDays,
  timeSlots,
  timeLabel,
  slotAvailable,
  cancelBooking,
} from './barber-bookings-store'
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getClients,
  getServices,
} from '../api/barber.js'

export default function BarberAppointments() {
  const { clients } = useBarber()
  const bookings = useBookings()
  const [clientId, setClient] = useState('')
  const [serviceId, setService] = useState('')
  const [date, setDate] = useState(dateKey())
  const [month, setMonth] = useState(new Date())
  const [time, setTime] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [barber, setBarber] = useState(barbers[0])

  async function loadData() {
    try {
      const [clientRes, serviceRes, apptRes] = await Promise.all([
        getClients(),
        getServices(),
        getAppointments(),
      ])
      const cList = Array.isArray(clientRes) ? clientRes : clientRes?.data || []
      const sList = Array.isArray(serviceRes) ? serviceRes : serviceRes?.data || []
      const aList = Array.isArray(apptRes) ? apptRes : apptRes?.data || []

      setClientsFromAPI(cList)
      setServicesFromAPI(sList)
      setBookingsFromAPI(aList)
    } catch (err) {
      console.error('Failed to load appointment screen data:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const daily = bookings.filter(b => b.date === date)

  function move(delta) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  }

  async function handleBook() {
    if (!clientId || !serviceId || !time) return
    setNotice('')
    setLoading(true)

    try {
      const selectedClient = clients.find(c => c.id === clientId || c._id === clientId)
      const selectedService = services.find(s => s.id === serviceId || s._id === serviceId)

      await createAppointment({
        clientId: selectedClient?._id || selectedClient?.id || clientId,
        serviceId: selectedService?._id || selectedService?.id || serviceId,
        barberName: barber,
        date,
        time,
      })

      setNotice('Appointment booked and confirmed in database.')
      setTime('')
      await loadData()
    } catch (err) {
      setNotice(err.message || 'Failed to book appointment.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id) {
    try {
      await updateAppointmentStatus(id, 'CANCELLED')
      cancelBooking(id)
      setNotice('Appointment cancelled successfully.')
      await loadData()
    } catch (err) {
      setNotice(err.message || 'Failed to cancel appointment.')
    }
  }

  return (
    <div className="ba-layout">
      <div>
        <section className="g-panel">
          <h2>Client & Booking Details</h2>
          <label>
            Client Name
            <select value={clientId} onChange={e => setClient(e.target.value)}>
              <option value="">Select Client</option>
              {clients.map(c => (
                <option value={c.id || c._id} key={c.id || c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </label>
          <label>
            Assigned Barber
            <select value={barber} onChange={e => setBarber(e.target.value)}>
              {barbers.map(name => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Service Type
            <select
              value={serviceId}
              onChange={e => {
                setService(e.target.value)
                setTime('')
              }}
            >
              <option value="">Choose Service</option>
              {services.map(s => (
                <option value={s.id || s._id} key={s.id || s._id}>
                  {s.name} · {s.minutes} min
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="g-panel">
          <h2>Daily Schedule Overview</h2>
          <div className="ba-statuses">
            {['Confirmed', 'Completed', 'Cancelled'].map(status => (
              <span className={`ba-status ${status.toLowerCase()}`} key={status}>
                {daily.filter(b => b.status === status).length} {status}
              </span>
            ))}
          </div>
        </section>

        <button
          className="g-button"
          disabled={!clientId || !serviceId || !time || loading}
          onClick={handleBook}
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
        {notice && <p role="status" className="g-notice" style={{ marginTop: 12 }}>{notice}</p>}
      </div>

      <section className="g-panel">
        <div className="g-panel-head">
          <div>
            <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <p className="g-muted">Select a date to view or book slots</p>
          </div>
          <div className="ba-controls">
            <button aria-label="Previous month" onClick={() => move(-1)}>‹</button>
            <button onClick={() => { setMonth(new Date()); setDate(dateKey()); setTime('') }}>Today</button>
            <button aria-label="Next month" onClick={() => move(1)}>›</button>
          </div>
        </div>

        <div className="ba-calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <strong key={d}>{d}</strong>
          ))}
          {monthDays(month).map(day => {
            const key = dateKey(day)
            const items = bookings.filter(b => b.date === key && b.status !== 'Cancelled')
            return (
              <button
                key={key}
                className={`${key === date ? 'selected' : ''} ${day.getMonth() !== month.getMonth() ? 'outside' : ''}`}
                aria-label={`${visitLabel(key)}, ${items.length} appointments`}
                aria-pressed={key === date}
                onClick={() => { setDate(key); setTime('') }}
              >
                <span>{day.getDate()}</span>
                {items.slice(0, 2).map(b => (
                  <small className={`ba-status ${b.status.replaceAll(' ', '').toLowerCase()}`} key={b.id}>
                    {timeLabel(b.time)} {b.clientName || 'Client'}
                  </small>
                ))}
                {items.length > 2 && <small>+{items.length - 2} more</small>}
              </button>
            )
          })}
        </div>

        <h3>Available Time Slots · {visitLabel(date)}</h3>
        <div className="ba-slots">
          {timeSlots.map(slot => (
            <button
              key={slot}
              className={time === slot ? 'selected' : ''}
              disabled={!slotAvailable(date, slot, serviceId)}
              aria-pressed={time === slot}
              onClick={() => setTime(slot)}
            >
              {timeLabel(slot)}
            </button>
          ))}
        </div>
        <p className="g-muted">
          {!serviceId ? 'Choose a service to see available times.' : 'Times are in Pakistan Standard Time (PKT).'}
        </p>

        <h3>Appointments for this day</h3>
        {!daily.length && <p className="g-muted">No appointments scheduled for this day.</p>}
        {daily.map(b => (
          <div className="b-service" key={b.id || b._id}>
            <span>
              <strong>{b.clientName || clients.find(c => c.id === b.clientId || c._id === b.clientId)?.name || 'Client'}</strong>
              <small>{timeLabel(b.time)} · {b.serviceName || services.find(s => s.id === b.serviceId || s._id === b.serviceId)?.name || 'Haircut'}</small>
            </span>
            <span className={`ba-status ${b.status.replaceAll(' ', '').toLowerCase()}`}>{b.status}</span>
            {b.status !== 'Cancelled' && (
              <button
                className="g-link"
                onClick={() => handleCancel(b._id || b.id)}
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
