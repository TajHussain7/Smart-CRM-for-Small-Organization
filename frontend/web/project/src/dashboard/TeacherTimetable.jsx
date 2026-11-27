import { classLevels, studentGrades, studentClassLevel } from './student-fields'
import { useEffect, useState } from 'react'
import {
  useTeachers,
  setTeachersFromAPI,
  setScheduleFromAPI,
  localDate,
  weekDates,
  minutes,
  lessonStatus,
  timeLabel,
} from './teachers-store'
import { getTeachers, getSchedule, getScheduleByClass, createScheduleEntry, deleteTeacher } from '../api/school.js'
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('A')

  useEffect(() => {
    let mounted = true
    setTeachersFromAPI([]); setScheduleFromAPI([])
    Promise.all([getTeachers(), classFilter ? getScheduleByClass(classFilter, sectionFilter) : getSchedule()])
      .then(([teachersRes, scheduleRes]) => {
        if (!mounted) return
        const tList = Array.isArray(teachersRes) ? teachersRes : teachersRes.data || []
        const sList = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || []
        setTeachersFromAPI(tList)
        setScheduleFromAPI(sList)

        if (tList.length > 0) {
          setSelected(curr => tList.some(t => t._id === curr) ? curr : tList.some(t => t._id === teacherId) ? teacherId : tList[0]._id)
        }
      })
      .catch(err => { if (mounted) setLoadError(err.message || 'Unable to load timetable.') })
      .finally(() => { if (mounted) setLoading(false) })

    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [teacherId, reload, classFilter, sectionFilter])


  const teacher = teachers.find(item => item.id === selected || item._id === selected)
  const currentDayOfWeek = DAY_NAMES[new Date(`${date}T12:00:00`).getDay()]

  const daily = lessons
    .filter(item => {
      const matchTeacher = !!teacher && item.teacherId === teacher._id
      const matchDay = item.dayOfWeek ? item.dayOfWeek === currentDayOfWeek : item.date === date
      return matchTeacher && matchDay
    })
    .sort((a, b) => a.start.localeCompare(b.start))

  const completed = daily.filter(item => lessonStatus(item, now, date) === 'Completed').length
  const next = daily.find(item => lessonStatus(item, now, date) === 'Upcoming')

  async function save(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setNotice('')
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const teacherDocId = teacher?._id || teacher?.id || selected

    try {
      await createScheduleEntry({
        teacherId: teacherDocId,
        subject: values.title.trim(),
        classLevel: studentClassLevel(values.grade),
        section: values.section,
        dayOfWeek: currentDayOfWeek,
        startTime: values.start,
        endTime: values.end,
      })

      setNotice('Weekly class schedule saved successfully.')
      form.reset()
      setClassFilter('')
      setLoading(true); setLoadError(''); setReload(value => value + 1)

    } catch (err) {
      // If backend validation throws or overlaps
      setError(err.message || 'Failed to save class to schedule.')
    } finally { setSaving(false) }
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
        <AddTeacher onCreated={(t) => { setSelected(t._id); setLoading(true); setLoadError(''); setReload(value => value + 1) }} />
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

      <div className="tt-toolbar">
        <label>Class filter<select value={classFilter} onChange={event => { setClassFilter(event.target.value); setLoading(true); setLoadError('') }}><option value="">All classes</option>{studentGrades.map(grade => <option key={grade} value={classLevels[grade]}>{grade}</option>)}</select></label>
        {classFilter && <label>Section<select value={sectionFilter} onChange={event => { setSectionFilter(event.target.value); setLoading(true); setLoadError('') }}><option>A</option><option>B</option></select></label>}
        {teacher && <><AddTeacher teacher={teacher} onCreated={() => { setLoading(true); setLoadError(''); setReload(value => value + 1) }}/><button className="g-button secondary" disabled={saving} onClick={async () => {
          if (!window.confirm(`Delete ${teacher.name}? Existing schedule entries will remain without this teacher.`)) return
          setSaving(true); setError(''); setNotice('')
          try { await deleteTeacher(teacher._id); setSelected(''); setLoading(true); setLoadError(''); setReload(value => value + 1); setNotice('Teacher deleted.') }
          catch (err) { setError(err.message || 'Unable to delete teacher.') }
          finally { setSaving(false) }
        }}>Delete Teacher</button></>}
      </div>
      {loading && <p role="status">Loading teachers and timetable...</p>}
      {loadError && <p role="alert" className="student-error">{loadError} <button onClick={() => { setLoading(true); setLoadError(''); setReload(value => value + 1) }}>Retry</button></p>}
      {!loading && !loadError && !teachers.length && <p className="g-empty">No teachers yet. Add your first teacher.</p>}
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
              const status = lessonStatus(item, now, date)
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
                    <span>Grade {studentGrades.find(grade => classLevels[grade] === item.classLevel) || item.grade}</span>
                    <span>Section {item.section}</span>
                  </div>
                </article>
              )
            })}
            {!loading && !loadError && !daily.length && <p className="g-empty">No classes scheduled for this teacher on this day.</p>}
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
                <small>NEXT CLASS</small>
                <strong>{next ? `${studentGrades.find(grade => classLevels[grade] === next.classLevel) || next.grade} / ${next.section}` : '—'}</strong>
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
                ['start', 'Start time', 'time'],
                ['end', 'End time', 'time']
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input name={key} type={type} required maxLength={100} />
                </label>
              ))}
              <label>Grade<select name="grade" required defaultValue=""><option value="" disabled>Select class</option>{studentGrades.map(grade => <option key={grade}>{grade}</option>)}</select></label>
              <label>Section<select name="section" defaultValue="A"><option>A</option><option>B</option></select></label>
              <p className="g-muted">Repeats every {currentDayOfWeek.toLowerCase()}. Times use the school’s local time.</p>
              {error && <p role="alert" className="student-error">{error}</p>}
              <button className="g-button" disabled={!teacher || saving || loading}>{saving ? 'Saving...' : 'Schedule Class'}</button>
            </form>
            {notice && <p role="status" className="student-notice">{notice}</p>}
          </section>
        </aside>
      </div>
    </>
  )
}
