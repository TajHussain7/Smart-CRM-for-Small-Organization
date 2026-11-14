import { useState, useEffect } from 'react'
import { money, visitLabel } from './barber-store'
import { getClientById, updateClient as apiUpdateClient } from '../api/barber.js'

export default function ClientProfile({ clientId }) {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [all, setAll] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getClientById(clientId)
      .then(res => {
        if (!mounted) return
        setClient(res)
        setLoading(false)
      })
      .catch(err => {
        if (!mounted) return
        console.error('Failed to load client:', err)
        setLoading(false)
      })
    return () => { mounted = false }
  }, [clientId])

  if (loading) {
    return <section className="g-panel"><h2>Loading client details...</h2></section>
  }

  if (!client) {
    return (
      <section className="g-panel">
        <h2>Client not found</h2>
        <a href="#barber-clients">Back to Client List</a>
      </section>
    )
  }

  const history = client.visitHistory || client.history || []
  const points = client.loyaltyPoints || client.points || 0
  const remaining = Math.max(0, 3000 - points)

  async function save(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const prefs = (data.get('preferences') || '').split(',').map(p => p.trim()).filter(Boolean)

    try {
      const updated = await apiUpdateClient(client._id || client.id, {
        name: data.get('name'),
        phone: data.get('phone'),
        email: data.get('email'),
        notes: data.get('notes'),
        preferences: prefs,
      })
      setClient(updated)
      setNotice('Client profile updated successfully.')
      setEditing(false)
    } catch (err) {
      setNotice(err.message || 'Failed to update client profile.')
    }
  }

  return (
    <>
      <div className="b-heading">
        <a href="#barber-clients">← Back to Client List</a>
        <button className="g-button secondary" onClick={() => { setEditing(!editing); setNotice('') }}>
          {editing ? 'Cancel' : '✎ Edit Profile'}
        </button>
      </div>
      {notice && <p role="status" className="g-notice">{notice}</p>}
      {editing ? (
        <form className="g-panel bp-edit" onSubmit={save}>
          <h2>Edit {client.name}</h2>
          {[
            ['name', 'Full Name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel'],
          ].map(([key, label, type]) => (
            <label key={key}>
              {label}
              <input required name={key} type={type} defaultValue={client[key] || ''} />
            </label>
          ))}
          <label>
            Staff Notes
            <textarea name="notes" rows={4} defaultValue={client.notes || ''} />
          </label>
          <label>
            Preferences (comma separated)
            <input name="preferences" defaultValue={client.preferences?.join(', ') || ''} />
          </label>
          <button className="g-button" type="submit">Save Changes</button>
        </form>
      ) : (
        <div className="bp-layout">
          <div>
            <section className="g-panel bp-identity">
              <span className="bp-avatar">
                {client.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </span>
              <h2>{client.name}</h2>
              <span className="g-badge">
                {points >= 2000 ? 'Premium Member' : 'Loyalty Member'}
              </span>
              <dl>
                {[
                  ['Email', client.email || 'Not provided'],
                  ['Phone', client.phone],
                  ['Client Since', client.createdAt ? visitLabel(client.createdAt.split('T')[0]) : 'Recently'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="bp-loyalty">
              <small>LOYALTY PROGRAM</small>
              <h2>{points.toLocaleString()} <span>Points</span></h2>
              <progress aria-label="Progress toward Gold Status" value={Math.min(points, 3000)} max={3000} />
              <p>
                {remaining ? `${remaining.toLocaleString()} points until Gold Status reward` : 'Gold Status reward reached'}
              </p>
            </section>
          </div>
          <div>
            <section className="g-panel">
              <div className="g-panel-head">
                <h2>Service History</h2>
                {history.length > 3 && (
                  <button className="g-link" onClick={() => setAll(!all)}>
                    {all ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>
              {(all ? history : history.slice(0, 3)).map((visit, idx) => (
                <div className="b-service" key={visit._id || idx}>
                  <span className="b-scissors">✂</span>
                  <span>
                    <strong>{visit.serviceName || visit.name || 'Barber Service'}</strong>
                    <small>{visitLabel(visit.date?.split('T')[0])} · Stylist: {visit.stylist || 'Barber Staff'}</small>
                  </span>
                  <span className="bp-price">
                    <strong>{money(visit.amountInPaisas || visit.cents || 100000)}</strong>
                    <small className="g-badge good">Completed</small>
                  </span>
                </div>
              ))}
              {!history.length && <p className="g-muted">No services recorded for this client yet.</p>}
            </section>
            <section className="g-panel">
              <div className="g-panel-head">
                <h2>Staff Notes</h2>
                <button className="g-link" aria-label="Edit staff notes" onClick={() => setEditing(true)}>
                  ⊕ Add / Edit
                </button>
              </div>
              <blockquote className="bp-note">{client.notes || 'No staff notes added yet.'}</blockquote>
            </section>
            <section className="g-panel">
              <h2>Preferences</h2>
              <div className="bp-preferences">
                {client.preferences?.length ? (
                  client.preferences.map((p, i) => <span key={i}>{p}</span>)
                ) : (
                  <p className="g-muted">No preferences added yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
