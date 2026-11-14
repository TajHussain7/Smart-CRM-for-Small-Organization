import { useState, useEffect } from 'react'
import { useAlerts, setAlertsFromAPI } from '../alerts-store'
import { getAlerts, markAlertRead as apiMarkRead, retryAlert as apiRetry } from '../api/alerts.js'
import './alerts.css'

export default function Alerts({ module }) {
  const types = ['Fee Reminder', 'Appointment Reminder', 'Membership Reminder', 'Attendance Alert']
  const entries = useAlerts()
  const [status, setStatus] = useState('Pending')
  const [type, setType] = useState('All Types')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadAlerts() {
    setLoading(true)
    try {
      const res = await getAlerts(module ? { module } : {})
      const list = Array.isArray(res) ? res : res.data || []
      setAlertsFromAPI(list)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [module])

  async function handleMarkRead(id) {
    try {
      await apiMarkRead(id)
      loadAlerts()
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  async function handleRetry(id) {
    try {
      await apiRetry(id)
      loadAlerts()
    } catch (err) {
      console.error('Failed to retry alert:', err)
    }
  }

  const filteredByModule = module ? entries.filter(e => e.module === module) : entries
  const sentCount = filteredByModule.filter(e => e.status === 'SENT' || e.status === 'Sent').length
  const pendingCount = filteredByModule.filter(e => e.status === 'PENDING' || e.status === 'Pending').length
  const failedCount = filteredByModule.filter(e => e.status === 'FAILED' || e.status === 'Failed').length

  const visible = filteredByModule.filter(e => {
    const normStatus = (e.status || '').toUpperCase()
    const targetStatus = status.toUpperCase()
    const matchesStatus = normStatus === targetStatus
    const matchesType = type === 'All Types' || e.type === type
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || `${e.recipient} ${e.message} ${e.contact} ${e.module}`.toLowerCase().includes(query)
    return matchesStatus && matchesType && matchesSearch
  })

  return (
    <div className="alerts-page">
      <h2 style={{ marginBottom: 20 }}>Workspace Alerts & Notifications</h2>
      <div className="al-toolbar">
        <div className="al-tabs">
          {['Pending', 'Sent', 'Failed'].map(tab => (
            <button
              key={tab}
              aria-pressed={status === tab}
              className={status === tab ? 'active' : ''}
              onClick={() => setStatus(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <input
          aria-label="Search alerts"
          placeholder="Search recipients or messages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="g-metrics">
        <section>
          <div>
            <span className="g-eyebrow">Pending Queue</span>
            <strong>{pendingCount}</strong>
            <small>Awaiting delivery</small>
          </div>
        </section>
        <section>
          <div>
            <span className="g-eyebrow">Total Delivered</span>
            <strong>{sentCount}</strong>
            <small>Sent via WhatsApp / SMS / Email</small>
          </div>
        </section>
        <section className="al-delivery">
          <div>
            <span className="g-eyebrow">Failed Alerts</span>
            <strong>{failedCount}</strong>
            <small>Requires review or retry</small>
          </div>
        </section>
      </div>

      <div className="al-filters">
        {['All Types', ...types].map(value => (
          <button
            key={value}
            aria-pressed={type === value}
            className={type === value ? 'active' : ''}
            onClick={() => setType(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="al-list">
        {visible.map(entry => (
          <article className={`al-card ${entry.read ? 'read' : ''}`} key={entry.id || entry._id}>
            <span
              className={`al-icon ${
                entry.type === 'Fee Reminder'
                  ? 'fee'
                  : entry.type === 'Membership Reminder'
                  ? 'membership'
                  : ''
              }`}
            >
              {entry.type === 'Fee Reminder' ? '▣' : entry.type === 'Membership Reminder' ? '▤' : '▦'}
            </span>
            <div className="al-body">
              <div className="al-heading">
                <h2>{entry.type}</h2>
                <small>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</small>
              </div>
              <p>{entry.message}</p>
              <small>To: {entry.recipient} · {entry.contact}</small>
              <div className="al-meta">
                <span
                  className={`g-badge ${
                    entry.status === 'FAILED' || entry.status === 'Failed'
                      ? 'bad'
                      : entry.status === 'SENT' || entry.status === 'Sent'
                      ? 'good'
                      : 'warn'
                  }`}
                >
                  {(entry.status || 'PENDING').toUpperCase()}
                </span>
                <span>{(entry.module || 'school').toUpperCase()}</span>
                <span>{entry.channel}</span>
                {(entry.status === 'FAILED' || entry.status === 'Failed') && (
                  <button onClick={() => handleRetry(entry._id || entry.id)}>Retry</button>
                )}
                <button
                  onClick={() => handleMarkRead(entry._id || entry.id)}
                  disabled={entry.read}
                >
                  {entry.read ? 'Read' : 'Mark read'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!visible.length && (
        <section className="g-panel g-empty">
          {loading ? 'Loading alerts...' : 'No alerts match these filters.'}
        </section>
      )}
    </div>
  )
}
