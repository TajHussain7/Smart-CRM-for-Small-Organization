import Alerts from '../dashboard/Alerts'
import BarberReports from './BarberReports'
import BarberAppointments from './BarberAppointments'
import ClientProfile from './ClientProfile'
import ClientList from './ClientList'
import { useState, useEffect } from 'react'
import { useWorkspace } from '../workspace-store'
import {
  services,
  useBarber,
  setClientsFromAPI,
  setServicesFromAPI,
  totals,
  money,
} from './barber-store'
import {
  getBarberDashboard,
  getClients,
  getServices,
  createClient,
  recordPayment,
} from '../api/barber.js'
import './barber.css'

function Revenue() {
  const trend = [800, 1200, 950, 1500, 1400, 1800, 1100]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <section className="g-panel">
      <div className="g-panel-head">
        <h2>Revenue Trend</h2>
        <span>Last 7 Days (PKR)</span>
      </div>
      <div className="b-chart" aria-label="Revenue chart">
        {trend.map((value, i) => (
          <div key={i}>
            <span
              style={{
                height: `${Math.min(100, (value / 2000) * 100)}px`,
                background: i === 5 ? '#064bcb' : '#b8c7ff',
              }}
            />
            <small>{days[i]}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClientForm() {
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    setLoading(true)

    const data = new FormData(event.currentTarget)
    const name = data.get('name')?.trim()
    const phone = data.get('phone')?.trim()
    const email = data.get('email')?.trim()
    const notes = data.get('notes')?.trim()

    if (!name || !phone) {
      setLoading(false)
      setNotice('Name and phone number are required.')
      return
    }

    try {
      await createClient({
        name,
        phone,
        email: email || undefined,
        notes: notes || undefined,
      })
      location.hash = '#barber-clients'
    } catch (err) {
      setLoading(false)
      setNotice(err.message || 'Failed to save client.')
    }
  }

  return (
    <form className="b-form" onSubmit={submit}>
      <div>
        <section className="g-panel">
          <h2>Client Information</h2>
          {[
            ['name', 'Full Name', 'text'],
            ['phone', 'Phone Number', 'tel'],
            ['email', 'Email Address (optional)', 'email'],
          ].map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input name={name} type={type} required={name !== 'email'} placeholder={label} />
            </label>
          ))}
        </section>
        <section className="g-panel">
          <h2>Service Preferences</h2>
          <label>
            Primary Service
            <select name="service" defaultValue="">
              <option value="">Select a preferred service</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="b-check">
            <input name="loyalty" type="checkbox" defaultChecked />
            Enroll in Loyalty Program
          </label>
        </section>
      </div>
      <div>
        <section className="g-panel">
          <h2>Style Notes</h2>
          <label>
            Preferences &amp; Instructions
            <textarea name="notes" rows={7} placeholder="Cut preferences, skin sensitivity, parting style…" />
          </label>
        </section>
        <button className="g-button" type="submit" disabled={loading}>
          {loading ? 'Saving Client...' : 'Save Client Profile'}
        </button>
        {notice && <p role="alert" style={{ color: '#d32f2f', marginTop: 12 }}>{notice}</p>}
      </div>
    </form>
  )
}

function Payment() {
  const { clients } = useBarber()
  const [search, setSearch] = useState('')
  const [clientId, setClient] = useState('')
  const [selected, setSelected] = useState(['haircut'])
  const [redeem, setRedeem] = useState(false)
  const [method, setMethod] = useState('CASH')
  const [notice, setNotice] = useState('')
  const [done, setDone] = useState(false)
  const [receiptAmount, setReceiptAmount] = useState(null)
  const [loading, setLoading] = useState(false)

  const client = clients.find(c => c.id === clientId || c._id === clientId)
  const amount = done && receiptAmount ? receiptAmount : totals(selected, client, redeem)

  async function handleRecordPayment() {
    if (!clientId || !selected.length) return
    setNotice('')
    setLoading(true)

    try {
      await recordPayment({
        clientId: client?._id || client?.id || clientId,
        amount: amount.total ? Math.round(amount.total / 100) : 1000,
        method: method === 'Cash' || method === 'CASH' ? 'CASH' : method === 'Card' ? 'CARD' : 'JAZZCASH',
      })
      setReceiptAmount(amount)
      setDone(true)
      setNotice('Payment recorded in database successfully.')
    } catch (err) {
      setNotice(err.message || 'Payment recording failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="b-form">
      <div>
        <section className="g-panel">
          <h2>Client Selection</h2>
          <input
            aria-label="Search clients"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="b-client-list">
            {clients
              .filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
              .map(c => (
                <button
                  key={c.id || c._id}
                  className={(c.id === clientId || c._id === clientId) ? 'selected' : ''}
                  disabled={done}
                  onClick={() => { setClient(c.id || c._id); setRedeem(false) }}
                >
                  <span className="g-avatar">{c.name.split(' ').map(n => n[0]).join('')}</span>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.phone}</small>
                  </span>
                  <span>{(c.id === clientId || c._id === clientId) ? '✓' : ''}</span>
                </button>
              ))}
          </div>
        </section>

        <section className="g-panel">
          <h2>Services Rendered</h2>
          <p className="g-muted">Select services included in this ticket.</p>
          {services.map(s => (
            <label className="b-service" key={s.id}>
              <input
                type="checkbox"
                disabled={done}
                checked={selected.includes(s.id)}
                onChange={e =>
                  setSelected(old => e.target.checked ? [...old, s.id] : old.filter(id => id !== s.id))
                }
              />
              <span>
                <strong>{s.name}</strong>
                <small>{s.minutes} mins</small>
              </span>
              <strong>{money(s.cents)}</strong>
            </label>
          ))}
        </section>
      </div>

      <div>
        <section className="g-panel">
          <h2>Loyalty Program</h2>
          <div className="b-loyalty">
            <div>Current Balance<strong>{client?.points || 0} pts</strong></div>
            <div>Earning Today<strong>+{amount.earned} pts</strong></div>
          </div>
          <label className="b-check">
            <input
              type="checkbox"
              disabled={done || !client?.loyalty || client.points < 500}
              checked={redeem}
              onChange={e => setRedeem(e.target.checked)}
            />
            Redeem 500 points · Get Rs. 500 discount
          </label>
        </section>

        <section className="g-panel">
          <h2>Payment Method</h2>
          <div className="b-methods">
            {['CASH', 'CARD', 'JAZZCASH', 'EASYPAISA'].map(value => (
              <button
                key={value}
                disabled={done}
                className={method === value ? 'selected' : ''}
                aria-pressed={method === value}
                onClick={() => setMethod(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <dl>
            {[
              ['Subtotal', amount.subtotal],
              ['Tax (8%)', amount.tax],
              ['Loyalty Discount', -amount.discount],
              ['Total Amount', amount.total],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{money(value)}</dd>
              </div>
            ))}
          </dl>

          <button
            className="g-button"
            disabled={done || !selected.length || !clientId || loading}
            onClick={handleRecordPayment}
          >
            {done ? 'Payment Recorded' : loading ? 'Recording...' : 'Record Payment'}
          </button>

          {notice && <p role="status" style={{ marginTop: 8 }}>{notice}</p>}
          {done && (
            <button
              className="g-button secondary"
              style={{ marginTop: 8 }}
              onClick={() => {
                setDone(false)
                setSelected([])
                setRedeem(false)
                setNotice('')
              }}
            >
              New Service
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

export default function BarberApp({ page }) {
  const workspace = useWorkspace()
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([getBarberDashboard(), getClients(), getServices()])
      .then(([dashRes, clientsRes, servicesRes]) => {
        if (!mounted) return
        setDashboard(dashRes)
        const cList = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data || []
        const sList = Array.isArray(servicesRes) ? servicesRes : servicesRes?.data || []
        setClientsFromAPI(cList)
        setServicesFromAPI(sList)
      })
      .catch(err => console.error('Failed to load barber overview:', err))

    return () => { mounted = false }
  }, [page])

  const feature = page === 'add-client' || page.startsWith('client/') ? 'clients' : page

  if (!workspace.barber || (page !== 'dashboard' && page !== 'alerts' && !workspace.barberFeatures.includes(feature))) {
    return (
      <section className="g-panel">
        <h2>Feature not enabled</h2>
        <p>Select this Barber feature during workspace setup.</p>
        <a href="#school-dashboard">Back to School</a>
      </section>
    )
  }

  const todayAppts = dashboard?.todayAppointments ?? 0
  const todayRevenue = dashboard?.todayRevenue ?? 0
  const todayCompleted = dashboard?.todayCompletedPayments ?? 0

  return (
    <div className="barber">
      <div className="b-heading">
        <h2>
          {page === 'alerts'
            ? 'Barber Alerts'
            : page === 'reports'
              ? 'Reports'
              : page === 'appointments'
                ? 'Book Appointments'
                : page.startsWith('client/')
                  ? 'Client Profile'
                  : page === 'add-client'
                    ? 'Add Client'
                    : page === 'payments'
                      ? 'Record Service & Payment'
                      : page === 'clients'
                        ? 'Client List'
                        : 'Barber Dashboard'}
        </h2>
        <a href="#school-dashboard">Workspace overview →</a>
      </div>

      {page === 'alerts' ? (
        <Alerts module="barber" />
      ) : page === 'reports' ? (
        <BarberReports />
      ) : page === 'appointments' ? (
        <BarberAppointments />
      ) : page.startsWith('client/') ? (
        <ClientProfile key={page} clientId={page.slice(7)} />
      ) : page === 'add-client' ? (
        <ClientForm />
      ) : page === 'payments' ? (
        <Payment />
      ) : page === 'clients' ? (
        <ClientList />
      ) : (
        <>
          <div className="g-metrics">
            {[
              ['Appointments Today', todayAppts.toString()],
              ['Daily Total', `Rs. ${todayRevenue.toLocaleString()}`],
              ['Completed Payments', todayCompleted.toString()],
            ].map(([label, value]) => (
              <section key={label}>
                <div>
                  <span className="g-eyebrow">{label}</span>
                  <strong>{value}</strong>
                  <small>Live database metrics</small>
                </div>
              </section>
            ))}
            <section className="b-popular">
              <div>
                <span>POPULAR SERVICE</span>
                <strong>Fade &amp; Beard Trim</strong>
                <small>High demand</small>
              </div>
            </section>
          </div>

          <div className="b-form">
            <Revenue />
            <section className="g-panel">
              <h2>Quick Actions</h2>
              {workspace.barberFeatures.includes('clients') && (
                <>
                  <a className="b-action" href="#barber-clients">Clients →</a>
                  <a className="b-action" href="#barber-add-client">Add Client →</a>
                </>
              )}
              {workspace.barberFeatures.includes('payments') && (
                <a className="b-action" href="#barber-payments">Record Service →</a>
              )}
              {workspace.barberFeatures.includes('reports') && (
                <a className="b-action" href="#barber-reports">Reports →</a>
              )}
              {workspace.barberFeatures.includes('appointments') && (
                <a className="b-action" href="#barber-appointments">Book Appointments →</a>
              )}
            </section>
          </div>

          <section className="g-panel">
            <h2>Available Services</h2>
            {services.map(s => (
              <div className="b-service" key={s.id}>
                <span className="b-scissors">✂</span>
                <span>
                  <strong>{s.name}</strong>
                  <small>{s.minutes} min · {money(s.cents)}</small>
                </span>
                <span>
                  {s.bookings} Bookings
                  <small>{s.bookings >= 30 ? 'High Demand' : 'Standard'}</small>
                </span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
