import { useState, useEffect } from 'react'
import { useBarber, setClientsFromAPI, services, clientStyle, filterClients } from './barber-store'
import { getClients } from '../api/barber.js'

export default function ClientList() {
  const { clients } = useBarber()
  const [query, setQuery] = useState('')
  const [service, setService] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getClients()
      .then(res => {
        if (!mounted) return
        const list = Array.isArray(res) ? res : res.data || []
        setClientsFromAPI(list)
      })
      .catch(err => console.error('Failed to load clients:', err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [])

  const visible = filterClients(clients, query, service)

  return (
    <div className="bc-list">
      <section className="bc-hero">
        <div>
          <h2>Manage your clientele</h2>
          <p>
            You have {clients.length} client profile{clients.length === 1 ? '' : 's'}. Track preferences, loyalty points and visit history.
          </p>
        </div>
        <a href="#barber-add-client" className="g-button secondary">+ Add Client</a>
      </section>

      <section className="g-panel">
        <div className="bc-tools">
          <input
            aria-label="Search clients by name or phone"
            placeholder="Search by name, phone or style..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            aria-label="Filter clients by primary service"
            value={service}
            onChange={e => setService(e.target.value)}
          >
            <option value="all">All services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <p className="g-muted">
          {visible.length} client{visible.length === 1 ? '' : 's'} registered in database
        </p>

        <div className="bc-grid">
          {visible.map(c => (
            <a
              className="bc-card"
              key={c.id || c._id}
              href={`#barber-client/${c.id || c._id}`}
              aria-label={`View ${c.name} profile`}
            >
              <span className="bc-avatar">
                {c.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </span>
              <div className="bc-identity">
                <h3>{c.name}</h3>
                <p>{c.phone} · {clientStyle(c)}</p>
              </div>
              <div className="bc-visit">
                <small>LOYALTY</small>
                <span>{c.points} pts</span>
              </div>
            </a>
          ))}
        </div>

        {!visible.length && (
          <p className="g-empty">
            {loading ? 'Loading clients...' : 'No clients match your search or filter.'}
          </p>
        )}
      </section>
    </div>
  )
}
