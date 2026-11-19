import { useState, useEffect } from 'react'
import Alerts from './Alerts'
import FeeInvoiceForm from './FeeInvoiceForm'
import BarberApp from '../barber/BarberApp'
import BarberReports from '../barber/BarberReports'
import TrainingSessions from '../gym/TrainingSessions'
import { useWorkspace } from '../workspace-store'
import { useAccount } from '../account-store'
import { useTraining } from '../training-store'
import { useBookings } from '../barber/barber-bookings-store'
import TeacherTimetable from './TeacherTimetable'
import SchoolDashboard from './SchoolDashboard'
import Students from './Students'
import StudentProfile from './StudentProfile'
import Admission from './Admission'
import AccountSettings from './AccountSettings'
import Icon from './SchoolIcon'
import { useStudents, setStudents } from './students-store'
import { getSchoolDashboard, getStudents } from '../api/school.js'
import '../gym/gym.css'
import './school-workspace.css'

const links = [
  ['#school-dashboard', 'Overview', 'dashboard'],
  ['#students', 'Students', 'students'],
  ['#school-admission', 'Student Admission', 'addPerson'],
  ['#school-fees', 'Fee Management', 'fees'],
  ['#school-timetable', 'Timetable', 'calendar'],
  ['#gym-training', 'Gym Training', 'gym'],
  ['#barber-clients', 'Barber Clients', 'people'],
  ['#barber-appointments', 'Barber Appointments', 'calendar'],
  ['#barber-payments', 'Record Barber Service', 'money'],
  ['#school-alerts', 'Alerts', 'alerts'],
  ['#school-reports', 'Reports', 'reports'],
  ['#school-settings', 'Profile & Settings', 'profile'],
]

function GymReport() {
  const sessions = useTraining()
  return (
    <section className="g-panel">
      <h2>Gym · Student Training</h2>
      <p>{sessions.length} sessions · {new Set(sessions.map(s => s.studentId)).size} students participating</p>
      <div className="g-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Trainer</th>
              <th>Session</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td>{s.student}</td>
                <td>{s.trainer}</td>
                <td>{s.type}</td>
                <td>{s.date}</td>
                <td>{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!sessions.length && <p className="g-empty">No training sessions booked yet.</p>}
    </section>
  )
}

function SharedReports() {
  const [section, setSection] = useState('School')
  return (
    <>
      <div className="g-actions">
        {['School', 'Gym', 'Barber'].map(label => (
          <button
            key={label}
            className="g-button secondary"
            aria-pressed={section === label}
            onClick={() => setSection(label)}
          >
            {label}
          </button>
        ))}
      </div>
      {section === 'School' ? <Reports /> : section === 'Gym' ? <GymReport /> : <BarberReports />}
    </>
  )
}

function Overview() {
  const students = useStudents()
  const training = useTraining()
  const bookings = useBookings()

  return (
    <>
      <div className="g-metrics">
        {[
          ['Student records', students.length, '#students'],
          ['Gym sessions', training.length, '#gym-training'],
          ['Barber appointments', bookings.filter(b => b.status !== 'Cancelled').length, '#barber-appointments'],
        ].map(([label, value, href]) => (
          <section key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <a href={href}>Open →</a>
            </div>
          </section>
        ))}
      </div>
      <SchoolDashboard />
    </>
  )
}

function Fees() {
  const students = useStudents()
  const [grade, setGrade] = useState('All')
  const [status, setStatus] = useState('All')

  const visible = students.filter(student =>
    (grade === 'All' || student.grade === grade) &&
    (status === 'All' || student.status === status)
  )

  return (
    <section className="g-panel">
      <div className="g-panel-head">
        <h2>Student Fee Status</h2>
        <select aria-label="Class filter" value={grade} onChange={e => setGrade(e.target.value)}>
          {['All', ...[...new Set(students.map(s => s.grade))].sort()].map(g => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select aria-label="Filter fee status" value={status} onChange={event => setStatus(event.target.value)}>
          {['All', 'Paid', 'Pending'].map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="g-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>ID</th>
              <th>Grade</th>
              <th>Fee status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(student => (
              <tr key={student.id}>
                <td><strong>{student.name}</strong></td>
                <td>{student.id}</td>
                <td>{student.grade}</td>
                <td>
                  <span className={`g-badge ${student.status === 'Paid' ? 'good' : 'warn'}`}>
                    {student.status}
                  </span>
                </td>
                <td><a href={`#student/${student.id}`}>View profile →</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p className="g-empty">No students matching this filter.</p>}
      </div>
    </section>
  )
}

function Reports() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getSchoolDashboard()
      .then(res => setSummary(res))
      .catch(err => console.error('Failed to load reports summary:', err))
  }, [])

  const monthlyCollection = summary?.fees?.monthlyCollection || 0
  const totalStudents = summary?.totalStudents || 0
  const pendingAmount = summary?.fees?.pendingAmount || 0
  const overdueCount = summary?.fees?.overdueInvoices || 0

  const metrics = [
    ['Monthly Collection', `Rs. ${monthlyCollection.toLocaleString()}`],
    ['Total Enrolment', totalStudents.toString()],
    ['Pending Balance', `Rs. ${pendingAmount.toLocaleString()}`],
    ['Overdue Invoices', overdueCount.toString()],
  ]

  const months = ['June', 'July', 'August', 'September', 'October', 'November']
  const trend = [35000, 42000, 50000, 48000, 55000, monthlyCollection || 60000]
  const maxTrend = Math.max(...trend, 1)

  return (
    <>
      <div className="g-metrics">
        {metrics.map(([label, value]) => (
          <section key={label}>
            <div>
              <span className="g-eyebrow">{label}</span>
              <strong>{value}</strong>
              <small>Live school database metrics</small>
            </div>
          </section>
        ))}
      </div>
      <section className="g-panel">
        <div className="g-panel-head">
          <h2>Revenue Collection Trend</h2>
          <span className="g-muted">Last 6 months</span>
        </div>
        <div className="g-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, index) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>Rs. {trend[index].toLocaleString()}</td>
                  <td>
                    <div className="g-track">
                      <span style={{ width: `${(trend[index] / maxTrend) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default function SchoolWorkspace({ route: requested, onLogout }) {
  const config = useWorkspace()
  const account = useAccount()
  const [menu, setMenu] = useState(false)

  // Preload students if empty
  useEffect(() => {
    getStudents()
      .then(res => {
        const list = Array.isArray(res) ? res : res.data || []
        setStudents(list)
      })
      .catch(err => console.error('Failed to preload students:', err))
  }, [])

  let route = requested
  if (['#gym-dashboard', '#barber-dashboard'].includes(route)) route = '#school-dashboard'
  if (['#gym-alerts', '#barber-alerts'].includes(route)) route = '#school-alerts'
  if (['#gym-reports', '#barber-reports'].includes(route)) route = '#school-reports'
  if (route.startsWith('#gym-') && route !== '#gym-training') route = '#students'

  const profile = route.startsWith('#student/')
  const title = profile ? 'Student Profile' : links.find(([href]) => href === route)?.[1] || 'Workspace'

  return (
    <div className="gym-app school-web">
      <aside className={`g-sidebar ${menu ? 'open' : ''}`}>
        <a className="g-brand" href="#school-dashboard">Smart CRM</a>
        <div className="g-workspace">
          <strong>{config.name}</strong>
        </div>
        <p className="g-nav-label">SCHOOL · GYM · BARBER</p>
        <nav aria-label="Workspace navigation">
          {links.map(([href, label, icon]) => (
            <a
              key={href}
              href={href}
              aria-current={route === href ? 'page' : undefined}
              onClick={() => setMenu(false)}
            >
              <Icon name={icon} />
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="g-main">
        <header className="g-topbar">
          <button className="g-menu" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>
            ☰
          </button>
          <span>{config.name}</span>
          <a className="g-admin" href="#school-settings" aria-label="Open profile settings">
            {account.photo ? (
              <img
                src={account.photo}
                alt=""
                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span className="g-avatar">
                {account.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            )}
            <strong>{account.name}</strong>
          </a>
        </header>

        <main className="g-content">
          <div className="g-heading">
            <h1>{title}</h1>
          </div>

          {route === '#school-dashboard' ? (
            <Overview />
          ) : route === '#students' ? (
            <Students />
          ) : route === '#school-admission' ? (
            <Admission />
          ) : route === '#school-settings' ? (
            <AccountSettings onLogout={onLogout} />
          ) : profile ? (
            <StudentProfile key={route} studentId={decodeURIComponent(route.slice(9))} />
          ) : route === '#school-alerts' ? (
            <Alerts />
          ) : route === '#school-fees' ? (
            <>
              <FeeInvoiceForm />
              <Fees />
            </>
          ) : route === '#school-reports' ? (
            <SharedReports />
          ) : route.startsWith('#school-timetable') ? (
            <TeacherTimetable key={route} teacherId={route.split('/')[1]} />
          ) : route === '#gym-training' ? (
            <TrainingSessions />
          ) : route.startsWith('#barber-') ? (
            <BarberApp key={route} page={route.slice(8)} />
          ) : (
            <p>Page not found.</p>
          )}
        </main>
      </div>
    </div>
  )
}
