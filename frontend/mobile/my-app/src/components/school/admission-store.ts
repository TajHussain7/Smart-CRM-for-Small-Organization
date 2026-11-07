import { addStudent, getStudent } from './students-store';
import { updateProfile } from './profile-store';
export type Admission={id:string;name:string;grade:string;guardian:string;email:string;phone:string;address:string};
export function admitStudent(input:Admission){
 const value=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,v.trim()])) as Admission;
 if(!value.name||!value.grade||!value.guardian)return 'Student name, class and guardian are required.';
 if(!/^[a-z0-9-]+$/i.test(value.id))return 'Enter a student ID using letters, numbers or hyphens.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))return 'Enter a valid guardian email.';
 if(value.phone.replace(/\D/g,'').length<7)return 'Enter a valid guardian phone number.';
 if(getStudent(value.id)||!addStudent({id:value.id,name:value.name,grade:value.grade,status:'Pending'}))return 'Student ID already exists.';
 updateProfile(value.id,value);return '';
}
