import { useEffect, useRef, useState } from 'react'
import icons from './icons.json'
import { getSchoolDashboard } from '../api/school.js'
import './dashboard.css'

function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name] || icons.dashboard} />
    </svg>
  )
}

function DetailDialog({ title, close, open }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const menu = title === 'Menu' || title === 'Quick add'
  const options = title === 'Menu' ? ['Students', 'Fee Mgt', 'Reports', 'Timetable', 'Profile'] : ['Students', 'Fee Mgt', 'Timetable']

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="school-dialog"
      onCancel={close}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className="school-panel-heading">
        <h2>{title}</h2>
        <button className="school-icon-button" aria-label="Close dialog" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      {menu ? (
        <div className="school-menu">
          {options.map(item => (
            <button key={item} onClick={() => open(item)}>
              {item}<span>→</span>
            </button>
          ))}
          {title === 'Menu' && <a href="#login" onClick={close}>Back to login</a>}
        </div>
      ) : (
        <p className="school-detail-note" style={{ padding: '20px 0' }}>
          Select an action above to navigate directly to the relevant workspace module.
        </p>
      )}
    </dialog>
  )
}

export default function SchoolDashboard() {
  const [period, setPeriod] = useState('monthly')
  const [selectedBar, setSelectedBar] = useState(5)
  const [expanded, setExpanded] = useState(false)
  const [panel, setPanel] = useState(null)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let mounted = true
    getSchoolDashboard()
      .then(res => {
        if (!mounted) return
        setSummary(res)
      })
      .catch(err => {
        console.error('Failed to fetch school dashboard summary:', err)
      })
    return () => { mounted = false }
  }, [])

  function open(name) {
    if (name === 'Profile') { location.hash = '#school-settings'; return }
    if (name === 'Alerts') { location.hash = '#school-alerts'; return }
    if (name === 'Students' || name === 'Tasks') { location.hash = '#students'; return }
    if (name === 'Fee Mgt') { location.hash = '#school-fees'; return }
    if (name === 'Reports') { location.hash = '#school-reports'; return }
    if (name === 'Timetable') {
      setPanel(null)
      location.hash = '#school-timetable'
    } else {
      setPanel(name)
    }
  }

  const totalStudents = summary?.totalStudents ?? 0
  const monthlyCollection = summary?.fees?.monthlyCollection ?? 0
  const pendingInvoices = summary?.fees?.pendingInvoices ?? 0
  const todayClasses = summary?.today?.classes ?? []

  const stats = [
    { label: 'TOTAL STUDENTS', value: totalStudents.toLocaleString(), icon: 'students' },
    { label: 'MONTHLY COLLECTION', value: `Rs. ${monthlyCollection.toLocaleString()}`, icon: 'fees' },
    { label: 'PENDING INVOICES', value: pendingInvoices.toLocaleString(), icon: 'alerts' },
    { label: 'TODAY’S CLASSES', value: todayClasses.length.toLocaleString(), icon: 'calendar' },
  ]

  const actions = [
    { label: 'Students', icon: 'students' },
    { label: 'Fee Mgt', icon: 'fees' },
    { label: 'Timetable', icon: 'calendar' },
    { label: 'Reports', icon: 'reports' },
  ]

  const monthlyLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
  const baseVal = Math.round(monthlyCollection / 1000) || 50
  const monthlyValues = [
    Math.max(10, Math.round(baseVal * 0.7)),
    Math.max(15, Math.round(baseVal * 0.8)),
    Math.max(20, Math.round(baseVal * 0.85)),
    Math.max(25, Math.round(baseVal * 0.95)),
    Math.max(30, Math.round(baseVal * 0.9)),
    baseVal,
  ]

  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyValues = [12, 18, 15, 24, 20, 32, 10]

  const series = period === 'monthly'
    ? { labels: monthlyLabels, values: monthlyValues }
    : { labels: weeklyLabels, values: weeklyValues }

  const maxVal = Math.max(...series.values, 1)

  return (
    <div className="school-shell">
      <header className="school-header">
        <div className="school-header-inner">
          <button className="school-icon-button" aria-label="Open menu" onClick={() => open('Menu')}>
            <Icon name="menu" />
          </button>
          <h1>School Management</h1>
          <button className="school-avatar" aria-label="Open administrator profile" onClick={() => open('Profile')}>
            SA
          </button>
        </div>
      </header>
      <main className="school-main">
        <section className="school-stats" aria-label="School overview">
          {stats.map((stat, index) => (
            <article className={'school-stat' + (index === 2 ? ' overdue' : '')} key={stat.label}>
              <h2>{stat.label}</h2>
              <div>
                <strong>{stat.value}</strong>
                <Icon name={stat.icon} />
              </div>
            </article>
          ))}
        </section>

        <section className="school-actions" aria-label="Quick actions">
          <h2>QUICK ACTIONS</h2>
          <div>
            {actions.map((action, index) => (
              <button key={action.label} onClick={() => open(action.label)}>
                <span className={index === 0 ? 'selected' : ''}>
                  <Icon name={action.icon} />
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </section>

        <div className="school-charts">
          <section className="school-panel school-revenue">
            <div className="school-panel-heading">
              <div>
                <h2>Revenue Trend</h2>
                <p>{period === 'monthly' ? 'Last 6 Months (PKR in Thousands)' : 'This Week'}</p>
              </div>
              <select
                aria-label="Revenue period"
                value={period}
                onChange={e => {
                  setPeriod(e.target.value)
                  setSelectedBar(period === 'monthly' ? 5 : 6)
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="school-bars" aria-label="Revenue chart">
              {series.values.map((value, index) => (
                <button
                  key={series.labels[index]}
                  aria-label={`${series.labels[index]}: Rs. ${value}K`}
                  aria-pressed={selectedBar === index}
                  onClick={() => setSelectedBar(index)}
                  className={'school-bar-column' + (selectedBar === index ? ' current' : '')}
                >
                  <span
                    className="school-bar"
                    style={{ height: `${(value / maxVal) * 86}%` }}
                  >
                    {selectedBar === index && (
                      <span className="school-tooltip">
                        {index === 5 ? 'Current' : series.labels[index]}:<br />
                        Rs. {value}K
                      </span>
                    )}
                  </span>
                  <span className="school-bar-label">{series.labels[index]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="school-panel school-growth">
            <div className="school-panel-heading">
              <div>
                <h2>Student Growth</h2>
                <p>Enrolled Students</p>
              </div>
            </div>
            <div
              className="school-ring"
              role="img"
              aria-label={`Student count ${totalStudents}`}
            >
              <svg viewBox="0 0 180 180" aria-hidden="true">
                <circle cx="90" cy="90" r="72" fill="none" stroke="#ebedef" strokeWidth="14" />
                <circle
                  cx="90"
                  cy="90"
                  r="72"
                  fill="none"
                  stroke="#064bcb"
                  strokeWidth="14"
                  strokeDasharray="47 66"
                  transform="rotate(-108 90 90)"
                />
              </svg>
              <div>
                <strong>{totalStudents ? `+${Math.min(100, totalStudents)}` : '0'}</strong>
                <span>Enrolled</span>
              </div>
            </div>
            <div className="school-legend">
              <div>
                <span><i />Active</span>
                <strong>{totalStudents}</strong>
              </div>
              <div>
                <span><i />Pending Fees</span>
                <strong>{pendingInvoices}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="school-panel school-schedule" id="school-schedule">
          <div className="school-panel-heading">
            <h2>Today’s Schedule</h2>
            <button className="school-link" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show Less' : 'View All'}
            </button>
          </div>
          <div className="school-lessons">
            {todayClasses.slice(0, expanded ? 10 : 3).map((lesson, idx) => (
              <article className="school-lesson" key={lesson._id || idx}>
                <span className="school-lesson-icon">
                  <Icon name="calendar" />
                </span>
                <div>
                  <h3>{lesson.subject}</h3>
                  <p>
                    {lesson.startTime} – {lesson.endTime} • Teacher: {lesson.teacherId?.name || 'Assigned Staff'}
                  </p>
                </div>
                <span className="school-status confirmed">Class {lesson.classLevel}-{lesson.section}</span>
              </article>
            ))}
            {!todayClasses.length && (
              <p className="g-empty" style={{ padding: '16px 0', color: '#68758b' }}>
                No classes scheduled for today. Check the timetable to add classes.
              </p>
            )}
          </div>
        </section>
      </main>

      <button className="school-add" aria-label="Open quick add" onClick={() => open('Quick add')}>
        <Icon name="plus" size={28} />
      </button>

      <nav className="school-nav" aria-label="School navigation">
        {['Dashboard', 'Tasks', 'Alerts', 'Profile'].map(item => (
          <button
            key={item}
            className={item === 'Dashboard' ? 'active' : ''}
            aria-current={item === 'Dashboard' ? 'page' : undefined}
            onClick={() => {
              if (item === 'Dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                open(item)
              }
            }}
          >
            <Icon name={item.toLowerCase()} size={20} />
            <span>{item}</span>
          </button>
        ))}
      </nav>

      {panel && <DetailDialog title={panel} close={() => setPanel(null)} open={open} />}
    </div>
  )
}
