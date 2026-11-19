import { useLocalSearchParams } from 'expo-router';
import StudentProfileScreen from '@/components/school/student-profile-screen';

export default function StudentProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StudentProfileScreen key={id} studentId={typeof id === 'string' ? id : ''} />;
}
