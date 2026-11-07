import { View } from 'react-native';
import { Text } from '../responsive-text';
import { useTraining } from '../training-store';
import { ui } from '../workspace-ui';
export default function StudentTrainingReport(){const sessions=useTraining();return <View style={{gap:14}}><Text style={ui.title}>Gym · Student Training</Text><View style={ui.card}><Text>Sessions booked: {sessions.length}</Text><Text>Students participating: {new Set(sessions.map(s=>s.studentId)).size}</Text><Text style={ui.note}>Current session data. Gym access uses School students; no memberships.</Text></View>{sessions.map(s=><View key={s.id} style={ui.card}><Text>{s.student} · {s.studentId}</Text><Text>{s.type} · {s.trainer}</Text><Text>{s.date} · {s.time}</Text></View>)}{!sessions.length&&<Text style={ui.note}>No training sessions booked yet.</Text>}</View>;}
