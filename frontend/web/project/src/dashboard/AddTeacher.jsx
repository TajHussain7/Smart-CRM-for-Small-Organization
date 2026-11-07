import { useEffect, useRef, useState } from 'react'
import { addTeacher } from './teachers-store'
export default function AddTeacher() {
  const [open,setOpen]=useState(false)
  return <><button className="g-button secondary" onClick={()=>setOpen(true)}>＋ Add Teacher</button>{open && <TeacherDialog close={()=>setOpen(false)}/>}</>
}
function TeacherDialog({close}) {
  const ref=useRef(null)
  const [error,setError]=useState('')
  useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close()},[])
  function save(event){event.preventDefault();const result=addTeacher(Object.fromEntries(new FormData(event.currentTarget)));if(result.error){setError(result.error);return}close();location.hash=`#school-timetable/${result.teacher.id}`}
  return <dialog ref={ref} className="school-dialog" aria-label="Add Teacher" onCancel={close}><div className="school-panel-heading"><h2>Add Teacher</h2><button className="school-icon-button" aria-label="Close" onClick={close}>×</button></div><form className="student-form" onSubmit={save}><p className="school-detail-note">Add teacher information, then schedule their timetable. Demo session only.</p>{[['name','Full name','text'],['email','Email','email'],['subject','Subject / Speciality','text']].map(([key,label,type])=><label key={key}>{label}<input name={key} required type={type} maxLength={100}/></label>)}{error&&<p role="alert" className="student-error">{error}</p>}<button className="student-submit">Add Teacher & Open Timetable</button></form></dialog>
}
