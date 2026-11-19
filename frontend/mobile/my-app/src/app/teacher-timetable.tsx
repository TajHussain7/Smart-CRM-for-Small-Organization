import { useLocalSearchParams } from 'expo-router';
import TeacherTimetableScreen from '@/components/school/teacher-timetable-screen';
export default function TeacherTimetableRoute(){const {teacherId}=useLocalSearchParams<{teacherId?:string}>();return <TeacherTimetableScreen key={teacherId} teacherId={teacherId}/>;}
