import { useWorkspace } from '../workspace-store'
import { useState, useEffect } from 'react'
import { getMemberProfile } from './member-profile-data'
import {
  getGymDashboard,
  getMembers,
  createMember,
  renewMember as apiRenewMember,
  getGymReports,
} from '../api/gym.js'
import './gym.css'
import TrainingSessions from './TrainingSessions'

const money = value => `Rs. ${Math.round(value).toLocaleString()}`

const plans = [
  { name: 'STANDARD', label: 'Standard', price: 5000, description: 'Basic gym floor and cardio equipment access.' },
  { name: 'PREMIUM', label: 'Premium', price: 8000, description: 'All access: strength machines, group classes, locker.' },
  { name: 'ANNUAL', label: 'Annual Pass', price: 60000, description: 'Best value 1-year unlimited fitness pass.' },
]

const navigation = [
  ['dashboard', 'Overview', 'grid'],
  ['members', 'Members', 'users'],
  ['renewal', 'Membership Renewal', 'renew'],
  ['training', 'Training Sessions', 'gym'],
  ['reports', 'Reports & Analytics', 'chart'],
]

function Icon({ name }) {
  const paths = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M17 11h6',
    renew: 'M20 4v6h-6M4 20v-6h6M5 9a7 7 0 0 1 12-4l3 5M4 14l3 5a7 7 0 0 0 12-4',
    chart: 'M4 3v18h17M8 17v-5M13 17V7M18 17V4',
    gym: 'M2 9v6M5 6v12M19 6v12M22 9v6M5 12h14',
    plus: 'M12 5v14M5 12h14',
  }
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.chart} />
    </svg>
  )
}

function Badge({ status }) {
  const s = (status || 'Active').toLowerCase()
  return (
    <span
      className={`g-badge ${
        s === 'active' || s === 'paid' ? 'good' : s === 'expired' ? 'bad' : 'warn'
      }`}
    >
      {status || 'Active'}
    </span>
  )
}

function Avatar({ member }) {
  const initials = (member.name || 'Member')
    .split(/\s+/)
    .slice(0, 2)
    .map(s => s[0])
    .join('')
    .toUpperCase()
  return (
    <span className="g-avatar" style={{ background: member.avatarColor || '#dce8fa' }}>
      {initials}
    </span>
  )
}

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`g-panel ${className}`}>
      <div className="g-panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Metrics({ summary }) {
  const rows = [
    { label: 'TOTAL MEMBERS', value: (summary?.totalMembers ?? 0).toString(), note: 'Enrolled members' },
    { label: 'ACTIVE MEMBERS', value: (summary?.activeMembers ?? 0).toString(), note: 'Current active plans' },
    { label: 'EXPIRING SOON', value: (summary?.expiringSoon ?? 0).toString(), note: 'Within next 7 days' },
    { label: 'SESSIONS TODAY', value: (summary?.sessionsToday ?? 0).toString(), note: 'Scheduled sessions' },
  ]

  return (
    <div className="g-metrics">
      {rows.map((item, i) => (
        <section key={item.label}>
          <div>
            <span className="g-eyebrow">{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </div>
          <span className={`g-stat-icon tone-${i}`}>
            <Icon name={['users', 'chart', 'renew', 'gym'][i]} />
          </span>
        </section>
      ))}
    </div>
  )
}

function Revenue() {
  const [period, setPeriod] = useState('Last 30 Days')
  const periods = {
    'Last 30 Days': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [58, 76, 86, 72] },
    'Last 3 Months': { labels: ['Aug', 'Sep', 'Oct'], values: [54, 72, 91] },
    'Last 6 Months': { labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], values: [35, 49, 62, 57, 78, 95] },
  }
  const data = periods[period]

  return (
    <Panel
      title="Revenue Trend"
      action={
        <select aria-label="Revenue period" value={period} onChange={e => setPeriod(e.target.value)}>
          {Object.keys(periods).map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      }
    >
      <div className="g-chart-summary">
        <strong>Rs. 75,000</strong>
        <span>Estimated monthly fitness revenue · {period.toLowerCase()}</span>
      </div>
      <div className="g-bars">
        {data.values.map((v, i) => (
          <div key={data.labels[i]}>
            <div className="g-bar" style={{ height: `${v}%` }} title={`Relative revenue: ${v}`} />
            <small>{data.labels[i]}</small>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Overview({ summary }) {
  const recentMembers = summary?.recentMembers || []
  const planBreakdown = summary?.planBreakdown || []

  return (
    <>
      <Metrics summary={summary} />
      <div className="g-columns">
        <Revenue />
        <Panel title="Membership Plan Breakdown">
          <p className="g-muted">Current member distribution</p>
          {planBreakdown.map(item => (
            <div className="g-growth" key={item.plan}>
              <div>
                <span>{item.plan}</span>
                <strong>{item.count} members</strong>
              </div>
              <div className="g-track">
                <span
                  style={{
                    width: `${Math.min(100, item.count * 20)}%`,
                    background: item.plan === 'PREMIUM' ? '#0755D7' : '#007A89',
                  }}
                />
              </div>
            </div>
          ))}
          {!planBreakdown.length && <p className="g-empty">No active plans recorded yet.</p>}
        </Panel>
      </div>

      <Panel title="Recent Members">
        <div className="g-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Phone</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map(row => (
                <tr key={row._id || row.id}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.plan}</td>
                  <td>{row.phone}</td>
                  <td>{row.expiryDate ? row.expiryDate.split('T')[0] : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recentMembers.length && <p className="g-empty">No members enrolled yet.</p>}
        </div>
      </Panel>
    </>
  )
}

function Members({ members }) {
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('All plans')

  const filtered = members.filter(
    m =>
      `${m.name} ${m.membershipId} ${m.phone}`.toLowerCase().includes(search.toLowerCase()) &&
      (plan === 'All plans' || m.plan === plan)
  )

  return (
    <Panel title="Member Directory" action={<span className="g-muted">{filtered.length} members</span>}>
      <div className="g-filters">
        <input
          aria-label="Search members"
          placeholder="Search by name, ID or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select aria-label="Membership plan" value={plan} onChange={e => setPlan(e.target.value)}>
          {['All plans', 'STANDARD', 'PREMIUM', 'ANNUAL'].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="g-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Plan</th>
              <th>Phone</th>
              <th>Expiry date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m._id || m.id}>
                <td>
                  <div className="g-person">
                    <Avatar member={m} />
                    <div>
                      <strong>{m.name}</strong>
                      <small>{m.membershipId}</small>
                    </div>
                  </div>
                </td>
                <td>{m.plan}</td>
                <td>{m.phone}</td>
                <td>{m.expiryDate ? m.expiryDate.split('T')[0] : 'N/A'}</td>
                <td><Badge status={m.status} /></td>
                <td>
                  <a href={`#gym-member/${m._id || m.id}`}>View profile →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="g-empty">No members found.</p>}
      </div>
    </Panel>
  )
}

function AddMember({ onAdd }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const name = form.get('name')?.trim()
    const phone = form.get('phone')?.trim()
    const email = form.get('email')?.trim()
    const plan = form.get('plan')

    if (!name || !phone || phone.replace(/\D/g, '').length < 10) {
      setLoading(false)
      return setError('Enter a valid name and phone number (min 10 digits).')
    }

    try {
      await onAdd({ name, phone, email: email || undefined, plan })
    } catch (err) {
      setError(err.message || 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="g-form-layout">
      <Panel title="Member Registration">
        <form className="g-form" onSubmit={submit}>
          <div className="g-form-grid">
            <label>
              Full Name
              <input name="name" type="text" required maxLength={100} placeholder="e.g. Usman Ali" />
            </label>
            <label>
              Phone Number
              <input name="phone" type="tel" required placeholder="e.g. 03001234567" />
            </label>
            <label>
              Email Address (Optional)
              <input name="email" type="email" placeholder="e.g. usman@gmail.com" />
            </label>
            <label>
              Membership Plan
              <select name="plan" required defaultValue="STANDARD">
                {plans.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.label} (Rs. {p.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p role="alert" className="g-error" style={{ color: '#d32f2f' }}>{error}</p>}
          <div className="g-form-footer">
            <a className="g-button secondary" href="#gym-members">Cancel</a>
            <button className="g-button" type="submit" disabled={loading}>
              {loading ? 'Adding Member...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Panel>
      <Panel title="Membership Benefits">
        <span className="g-large-icon"><Icon name="users" /></span>
        <h3>Fitness CRM Member</h3>
        <p className="g-muted">
          Members enjoy scheduled personal training, workout tracking, and automated reminder alerts.
        </p>
      </Panel>
    </div>
  )
}

function Profile({ member, notify }) {
  const details = member.details || getMemberProfile(member._id || member.id, member.name, member.plan)
  const price = member.plan === 'PREMIUM' ? 8000 : member.plan === 'ANNUAL' ? 60000 : 5000

  return (
    <>
      <a className="g-back" href="#gym-members">← Back to members</a>
      <div className="g-profile-hero">
        <Avatar member={member} />
        <div>
          <h2>{member.name}</h2>
          <p>{member.membershipId} · Joined {member.startDate ? member.startDate.split('T')[0] : 'Recently'}</p>
        </div>
        <Badge status={member.status} />
        <a className="g-button" href={`#gym-renewal/${member._id || member.id}`}>Renew Membership</a>
      </div>
      <div className="g-columns">
        <Panel title="Personal Information">
          <dl className="g-details">
            {[
              ['Email', member.email || 'Not provided'],
              ['Phone', member.phone],
              ['Membership ID', member.membershipId],
              ['Expires', member.expiryDate ? member.expiryDate.split('T')[0] : 'N/A'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Membership Details">
          <span className="g-eyebrow">{member.plan}</span>
          <p className="g-price">{money(price)}<small> / billing cycle</small></p>
          <p className="g-muted">Status: {member.status || 'Active'}</p>
        </Panel>
      </div>
    </>
  )
}

function Renewal({ members, initialId, onRenewed }) {
  const [id, setId] = useState(initialId || members[0]?._id || members[0]?.id || '')
  const [selectedPlan, setSelectedPlan] = useState('STANDARD')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const selected = members.find(m => m._id === id || m.id === id)
  const planInfo = plans.find(p => p.name === selectedPlan) || plans[0]

  async function handleRenew() {
    if (!id) return
    setNotice('')
    setLoading(true)

    try {
      await apiRenewMember(selected?._id || selected?.id || id, { plan: selectedPlan })
      setNotice(`Membership for ${selected?.name} renewed successfully with ${planInfo.label} plan!`)
      if (onRenewed) onRenewed()
    } catch (err) {
      setNotice(err.message || 'Renewal failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!members.length) {
    return <section className="g-panel"><h2>No members found to renew.</h2></section>
  }

  return (
    <div className="g-form-layout">
      <div>
        <Panel title="Select Member">
          <label className="g-label">
            Member
            <select value={id} onChange={e => setId(e.target.value)}>
              {members.map(m => (
                <option key={m._id || m.id} value={m._id || m.id}>
                  {m.name} · {m.membershipId} ({m.plan})
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <div className="g-person g-selected">
              <Avatar member={selected} />
              <div>
                <strong>{selected.name}</strong>
                <small>
                  Current plan: {selected.plan} · Expires {selected.expiryDate ? selected.expiryDate.split('T')[0] : 'N/A'}
                </small>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Choose Renewal Plan">
          <div className="g-plans">
            {plans.map(p => (
              <label className={selectedPlan === p.name ? 'selected' : ''} key={p.name}>
                <input
                  type="radio"
                  name="renewal-plan"
                  checked={selectedPlan === p.name}
                  onChange={() => setSelectedPlan(p.name)}
                />
                <div>
                  <strong>{p.label}</strong>
                  <p>{p.description}</p>
                </div>
                <b>{money(p.price)}</b>
              </label>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Payment Summary" className="g-summary">
        <p className="g-muted">{planInfo.label} Renewal</p>
        <dl>
          <div>
            <dt>Renewal Fee</dt>
            <dd>{money(planInfo.price)}</dd>
          </div>
          <div className="g-total">
            <dt>Total</dt>
            <dd>{money(planInfo.price)}</dd>
          </div>
        </dl>
        <button className="g-button" disabled={loading} onClick={handleRenew}>
          {loading ? 'Processing...' : 'Confirm & Renew Membership'}
        </button>
        {notice && <p role="status" style={{ marginTop: 12 }}>{notice}</p>}
      </Panel>
    </div>
  )
}

function Reports() {
  const [reports, setReports] = useState(null)

  useEffect(() => {
    getGymReports()
      .then(res => setReports(res))
      .catch(err => console.error('Failed to load gym reports:', err))
  }, [])

  const totalMembers = reports?.totalMembers ?? 0
  const newSignups = reports?.newSignups30Days ?? 0
  const activeMembers = reports?.activeMembers ?? 0

  return (
    <>
      <div className="g-metrics">
        {[
          { label: 'TOTAL REGISTERED', value: totalMembers.toString(), note: 'All-time members' },
          { label: 'ACTIVE MEMBERS', value: activeMembers.toString(), note: 'Currently valid' },
          { label: 'NEW SIGNUPS (30D)', value: newSignups.toString(), note: 'Last 30 days' },
        ].map((item, i) => (
          <section key={item.label}>
            <div>
              <span className="g-eyebrow">{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </div>
            <span className={`g-stat-icon tone-${i}`}>
              <Icon name="chart" />
            </span>
          </section>
        ))}
      </div>

      <div className="g-columns">
        <Revenue />
        <Panel title="Plan Distribution">
          {(reports?.planBreakdown || []).map(p => (
            <div className="g-growth" key={p.plan}>
              <div>
                <span>{p.plan}</span>
                <strong>{p.count}</strong>
              </div>
              <div className="g-track">
                <span style={{ width: `${Math.min(100, p.count * 20)}%` }} />
              </div>
            </div>
          ))}
          {!reports?.planBreakdown?.length && <p className="g-empty">No plan records yet.</p>}
        </Panel>
      </div>
    </>
  )
}

export default function GymApp({ route }) {
  const [members, setMembers] = useState([])
  const [summary, setSummary] = useState(null)
  const [notice, setNotice] = useState('')
  const [menu, setMenu] = useState(false)

  async function loadGymData() {
    try {
      const [membersRes, dashRes] = await Promise.all([
        getMembers(),
        getGymDashboard(),
      ])
      const mList = Array.isArray(membersRes) ? membersRes : membersRes?.data || []
      setMembers(mList)
      setSummary(dashRes)
    } catch (err) {
      console.error('Failed to load gym data:', err)
    }
  }

  useEffect(() => {
    loadGymData()
  }, [])

  const path = route.slice(5).split('/')
  const page = path[0]
  const titles = {
    dashboard: 'Overview',
    members: 'Members',
    'add-member': 'Add Member',
    member: 'Member Profile',
    renewal: 'Membership Renewal',
    reports: 'Reports & Analytics',
    training: 'Training Sessions',
  }

  const member = members.find(m => m._id === path[1] || m.id === path[1])

  async function handleAddMember(data) {
    const created = await createMember(data)
    setNotice(`Member ${created.name} added successfully!`)
    await loadGymData()
    location.hash = '#gym-members'
  }

  return (
    <div className="gym-app">
      <aside className={`g-sidebar ${menu ? 'open' : ''}`}>
        <a className="g-brand" href="#gym-dashboard">
          <span><Icon name="gym" /></span>Smart CRM
        </a>
        <div className="g-workspace">
          <span className="g-workspace-icon"><Icon name="gym" /></span>
          <div>
            <strong>Gym Management</strong>
            <small>Fitness workspace</small>
          </div>
        </div>
        <p className="g-nav-label">WORKSPACE</p>
        <nav aria-label="Gym navigation">
          {navigation.map(([key, label, icon]) => (
            <a
              key={key}
              href={`#gym-${key}`}
              aria-current={page === key || (key === 'members' && ['member', 'add-member'].includes(page)) ? 'page' : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={icon} />
              {label}
            </a>
          ))}
        </nav>
        <div className="g-sidebar-bottom">
          <a href="#school-dashboard">← Back to School Workspace</a>
        </div>
      </aside>

      <div className="g-main">
        <header className="g-topbar">
          <button
            className="g-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <span>Workspace <span className="g-slash">/</span> <strong>Gym Management</strong></span>
          <div className="g-admin">
            <span className="g-avatar">GA</span>
            <div>
              <strong>Gym Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        <main className="g-content">
          <div className="g-heading">
            <div>
              <p className="g-eyebrow">GYM MANAGEMENT</p>
              <h1>{titles[page] || 'Gym Management'}</h1>
            </div>
            {['dashboard', 'members'].includes(page) && (
              <a href="#gym-add-member" className="g-button">
                <Icon name="plus" />Add Member
              </a>
            )}
          </div>

          {notice && (
            <div className="g-notice" role="status">
              <span>{notice}</span>
              <button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button>
            </div>
          )}

          {page === 'dashboard' ? (
            <Overview summary={summary} />
          ) : page === 'members' ? (
            <Members members={members} />
          ) : page === 'add-member' ? (
            <AddMember onAdd={handleAddMember} />
          ) : page === 'member' && member ? (
            <Profile key={member._id || member.id} member={member} notify={setNotice} />
          ) : page === 'renewal' ? (
            <Renewal
              key={route}
              members={members}
              initialId={path[1]}
              onRenewed={loadGymData}
            />
          ) : page === 'training' ? (
            <TrainingSessions />
          ) : page === 'reports' ? (
            <Reports />
          ) : (
            <Panel title="Page not found">
              <a href="#gym-members">Return to members</a>
            </Panel>
          )}
        </main>
        <footer className="g-footer">
          Smart CRM <span>Gym Management Workspace</span>
        </footer>
      </div>
    </div>
  )
}
