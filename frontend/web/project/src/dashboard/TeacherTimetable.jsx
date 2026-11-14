import { useEffect, useState } from 'react'
import {
  useTeachers,
  setTeachersFromAPI,
  setScheduleFromAPI,
  addLesson,
  localDate,
  weekDates,
  minutes,
  lessonStatus,
  timeLabel,
} from './teachers-store'
import { getTeachers, getSchedule, createScheduleEntry } from '../api/school.js'
import AddTeacher from './AddTeacher'
import './timetable.css'

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function TeacherTimetable({ teacherId }) {
  const { teachers, lessons } = useTeachers()
  const [selected, setSelected] = useState(teacherId || '')
  const [date, setDate] = useState(localDate())
  const [now, setNow] = useState(() => new Date())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([getTeachers(), getSchedule()])
      .then(([teachersRes, scheduleRes]) => {
        if (!mounted) return
        const tList = Array.isArray(teachersRes) ? teachersRes : teachersRes.data || []
        const sList = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || []
        setTeachersFromAPI(tList)
        setScheduleFromAPI(sList)

        if (!selected && tList.length > 0) {
          setSelected(teacherId || tList[0]._id || tList[0].id)
        }
      })
      .catch(err => console.error('Failed to load timetable data:', err))

    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [teacherId])

  useEffect(() => {
    if (!selected && teachers.length > 0) {
      setSelected(teacherId || teachers[0].id || teachers[0]._id)
    }
  }, [teachers, teacherId, selected])

  const teacher = teachers.find(item => item.id === selected || item._id === selected)
  const currentDayOfWeek = DAY_NAMES[new Date(`${date}T12:00:00`).getDay()]

  const daily = lessons
    .filter(item => {
      const matchTeacher = item.teacherId === selected || item.teacherId === teacher?._id
      const matchDay = item.dayOfWeek ? item.dayOfWeek === currentDayOfWeek : item.date === date
      return matchTeacher && matchDay
    })
    .sort((a, b) => a.start.localeCompare(b.start))

  const completed = daily.filter(item => lessonStatus(item, now) === 'Completed').length
  const next = daily.find(item => lessonStatus(item, now) === 'Upcoming')

  async function save(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const values = Object.fromEntries(new FormData(event.currentTarget))
    const teacherDocId = teacher?._id || teacher?.id || selected

    try {
      await createScheduleEntry({
        teacherId: teacherDocId,
        subject: values.title.trim(),
        classLevel: 'TEN',
        section: 'A',
        dayOfWeek: currentDayOfWeek,
        startTime: values.start,
        endTime: values.end,
      })

      addLesson({
        ...values,
        teacherId: selected,
        date,
      })

      setNotice('Class schedule saved to database successfully.')
      event.currentTarget.reset()
    } catch (err) {
      // If backend validation throws or overlaps
      setError(err.message || 'Failed to save class to schedule.')
    }
  }

  return (
    <>
      <div className="tt-toolbar">
        <label>
          Teacher
          <select
            aria-label="Select teacher"
            value={selected}
            onChange={event => {
              setSelected(event.target.value)
              setNotice('')
              setError('')
            }}
          >
            <option value="" disabled>Select teacher</option>
            {teachers.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.subject}
              </option>
            ))}
          </select>
        </label>
        <AddTeacher onCreated={(t) => setSelected(t._id || t.id)} />
        <label>
          Date
          <input
            aria-label="Timetable date"
            type="date"
            required
            value={date}
            onChange={event => {
              if (event.target.value) setDate(event.target.value)
              setError('')
              setNotice('')
            }}
          />
        </label>
      </div>

      <div className="tt-layout">
        <section className="g-panel">
          <div className="g-panel-head">
            <div>
              <h2>Teacher Timetable</h2>
              <p className="g-caption">
                {teacher ? `${teacher.name} (${teacher.subject}) · ${teacher.email}` : 'Select a teacher to view their timetable'}
              </p>
            </div>
            <span className="g-muted">
              {new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="tt-week">
            {weekDates(date).map(day => (
              <button
                key={day}
                className={day === date ? 'selected' : ''}
                aria-pressed={day === date}
                onClick={() => {
                  setDate(day)
                  setNotice('')
                  setError('')
                }}
              >
                <span>{new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <strong>{Number(day.slice(-2))}</strong>
              </button>
            ))}
          </div>

          <div className="tt-timeline">
            {daily.map(item => {
              const status = lessonStatus(item, now)
              return (
                <article className={`tt-lesson ${status.toLowerCase()}`} key={item.id}>
                  <div className="tt-line">
                    <span>{timeLabel(item.start)} – {timeLabel(item.end)}</span>
                    <span className={`g-badge ${status === 'Ongoing' ? 'good' : status === 'Completed' ? 'done' : 'warn'}`}>
                      {status}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <div className="tt-meta">
                    <span>Grade {item.grade}</span>
                    <span>▣ {item.room}</span>
                  </div>
                </article>
              )
            })}
            {!daily.length && <p className="g-empty">No classes scheduled for this teacher on this day.</p>}
          </div>

          <div className="tt-load">
            <h2>{date === localDate() ? 'Today’s' : 'Daily'} Load</h2>
            <p>
              {daily.length} classes scheduled ·{' '}
              {Number((daily.reduce((sum, item) => sum + minutes(item.end) - minutes(item.start), 0) / 60).toFixed(2))} hours total
            </p>
            <div>
              <section>
                <small>COMPLETED</small>
                <strong>{completed} / {daily.length}</strong>
              </section>
              <section>
                <small>NEXT ROOM</small>
                <strong>{next?.room || '—'}</strong>
              </section>
            </div>
          </div>
        </section>

        <aside>
          <section className="g-panel">
            <h2>Schedule a Class</h2>
            <form className="student-form tt-form" onSubmit={save}>
              <p className="g-muted">{teacher?.name || 'Select a teacher'} · {currentDayOfWeek}</p>
              {[
                ['title', 'Class title / Subject', 'text'],
                ['grade', 'Grade / Section', 'text'],
                ['room', 'Room', 'text'],
                ['start', 'Start time', 'time'],
                ['end', 'End time', 'time']
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input name={key} type={type} required maxLength={100} />
                </label>
              ))}
              {error && <p role="alert" className="student-error">{error}</p>}
              <button className="g-button" disabled={!teacher}>Schedule Class</button>
            </form>
            {notice && <p role="status" className="student-notice">{notice}</p>}
          </section>
        </aside>
      </div>
    </>
  )
}
