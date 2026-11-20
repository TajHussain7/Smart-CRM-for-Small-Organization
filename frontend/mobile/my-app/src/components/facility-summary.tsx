import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from './responsive-text';
import { useTraining } from './training-store';
import { useBookings } from './barber-bookings-store';
import { useStudents } from './school/students-store';
import { ui } from './workspace-ui';
export default function FacilitySummary(){const students=useStudents(),training=useTraining(),bookings=useBookings();return <View style={[ui.card,{marginVertical:16}]}><Text style={ui.title}>Workspace Overview</Text><Text style={ui.note}>School · Gym · Barber</Text>{[{label:'Student records',value:students.length,path:'/students' as const},{label:'Gym training sessions',value:training.length,path:'/gym-training' as const},{label:'Barber appointments',value:bookings.filter(b=>b.status!=='Cancelled').length,path:'/barber/appointments' as const}].map(item=><Pressable key={item.label} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,gap:10}} onPress={()=>router.push(item.path)}><Text>{item.label}</Text><Text style={{color:'#0755d7',fontWeight:'700'}}>{item.value} →</Text></Pressable>)}<Text style={ui.note}>Session records; Barber includes sample appointments.</Text></View>;}
