import { useEffect, useRef, useState } from 'react'
import icons from './icons.json'
import data from './demo-data.json'
import './dashboard.css'

function Icon({ name, size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>
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
  return <dialog ref={ref} aria-label={title} className="school-dialog" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close() }}>
    <div className="school-panel-heading"><h2>{title}</h2><button className="school-icon-button" aria-label="Close dialog" onClick={close}><Icon name="close" /></button></div>
    <p className="school-demo">School workspace · Sample data</p>
    {menu ? <div className="school-menu">{options.map(item => <button key={item} onClick={() => open(item)}>{item}<span>→</span></button>)}{title === 'Menu' && <a href="#login" onClick={close}>Back to login</a>}</div>
      : <><ul className="school-detail-list">{(data.sections[title] || []).map(text => <li key={text}>{text}</li>)}</ul><p className="school-detail-note">This is a dashboard preview. Detailed records and changes will be available when this module is connected.</p></>}
  </dialog>
}

export default function SchoolDashboard() {
  const [period, setPeriod] = useState('monthly')
  const [selectedBar, setSelectedBar] = useState(5)
  const [expanded, setExpanded] = useState(false)
  const [panel, setPanel] = useState(null)
  const series = data[period]
  function open(name) {
    if(name==='Profile'){location.hash='#school-settings';return}
    if(name==='Alerts'){location.hash='#school-alerts';return}
    if (name === 'Students' || name === 'Tasks') { location.hash = '#students'; return }
    if (name === 'Fee Mgt') { location.hash = '#school-fees'; return }
    if (name === 'Reports') { location.hash = '#school-reports'; return }
    if (name === 'Timetable') {
      setPanel(null)
      location.hash = '#school-timetable'
    } else setPanel(name)
  }
  return <div className="school-shell">
    <header className="school-header">
      <div className="school-header-inner"><button className="school-icon-button" aria-label="Open menu" onClick={() => open('Menu')}><Icon name="menu" /></button><h1>School Management</h1><button className="school-avatar" aria-label="Open administrator profile" onClick={() => open('Profile')}>SA</button></div>
    </header>
    <main className="school-main">
      <section className="school-stats" aria-label="School overview">
        {data.stats.map((stat, index) => <article className={'school-stat' + (index === 2 ? ' overdue' : '')} key={stat.label}><h2>{stat.label}</h2><div><strong>{stat.value}</strong><Icon name={stat.icon} /></div></article>)}
      </section>
      <section className="school-actions" aria-label="Quick actions"><h2>QUICK ACTIONS</h2><div>{data.actions.map((action, index) => <button key={action.label} onClick={() => open(action.label)}><span className={index === 0 ? 'selected' : ''}><Icon name={action.icon} /></span>{action.label}</button>)}</div></section>
      <div className="school-charts">
        <section className="school-panel school-revenue">
          <div className="school-panel-heading"><div><h2>Revenue Trend</h2><p>{period === 'monthly' ? 'Last 6 Months' : 'This Week'}</p></div><select aria-label="Revenue period" value={period} onChange={e => { setPeriod(e.target.value); setSelectedBar(5) }}><option value="monthly">Monthly</option><option value="weekly">Weekly</option></select></div>
          <div className="school-bars" aria-label="Revenue chart">
            {series.values.map((value, index) => <button key={series.labels[index]} aria-label={series.labels[index] + ': $' + value + 'K'} aria-pressed={selectedBar === index} onClick={() => setSelectedBar(index)} className={'school-bar-column' + (selectedBar === index ? ' current' : '')}>
              <span className="school-bar" style={{ height: (value / Math.max(...series.values) * 86) + '%' }}>{selectedBar === index && <span className="school-tooltip">{index === 5 ? 'Current' : series.labels[index]}:<br />${value.toFixed(1)}K</span>}</span><span className="school-bar-label">{series.labels[index]}</span>
            </button>)}
          </div>
        </section>
        <section className="school-panel school-growth"><div className="school-panel-heading"><div><h2>Student Growth</h2><p>Active Enrolments</p></div></div><div className="school-ring" role="img" aria-label="Student growth 12 percent, target met. 24 new and 96 returning students."><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="72" fill="none" stroke="#ebedef" strokeWidth="14" /><circle cx="90" cy="90" r="72" fill="none" stroke="#064bcb" strokeWidth="14" strokeDasharray="47 66" transform="rotate(-108 90 90)" /></svg><div><strong>+12%</strong><span>Target met</span></div></div><div className="school-legend"><div><span><i />New</span><strong>24</strong></div><div><span><i />Returning</span><strong>96</strong></div></div></section>
      </div>
      <section className="school-panel school-schedule" id="school-schedule">
        <div className="school-panel-heading"><h2>Today’s Schedule</h2><button className="school-link" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show Less' : 'View All'}</button></div>
        <div className="school-lessons">{data.schedule.slice(0, expanded ? 8 : 3).map(lesson => <article className="school-lesson" key={lesson.title}><span className="school-lesson-icon"><Icon name={lesson.icon} /></span><div><h3>{lesson.title}</h3><p>{lesson.time} • {lesson.room}</p></div><span className={'school-status ' + lesson.status.toLowerCase()}>{lesson.status}</span></article>)}</div>
      </section>
      <p className="school-sample-note">Preview workspace · Sample data</p>
    </main>
    <button className="school-add" aria-label="Open quick add" onClick={() => open('Quick add')}><Icon name="plus" size={28} /></button>
    <nav className="school-nav" aria-label="School navigation">{['Dashboard', 'Tasks', 'Alerts', 'Profile'].map(item => <button key={item} className={item === 'Dashboard' ? 'active' : ''} aria-current={item === 'Dashboard' ? 'page' : undefined} onClick={() => item === 'Dashboard' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : open(item)}><Icon name={item.toLowerCase()} size={20} /><span>{item}</span></button>)}</nav>
    {panel && <DetailDialog title={panel} close={() => setPanel(null)} open={open} />}
  </div>
}
