import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/responsive-text';
import { SchoolMenuButton, SchoolBottomNav } from '@/components/school/school-navigation';
import SchoolReports from '@/components/school/reports-screen';
import StudentTrainingReport from '@/components/gym/student-training-report';
import BarberReports from '@/components/barber-reports';
import AccountButton from '@/components/account-button';
import { ui } from '@/components/workspace-ui';
export default function Reports(){const [section,setSection]=useState('School');return <SafeAreaView style={ui.safe}><View style={ui.header}><SchoolMenuButton/><Text style={ui.title}>Workspace Reports</Text><AccountButton/></View><View style={{flexDirection:'row',padding:12,gap:8}}>{['School','Gym','Barber'].map(label=><Pressable key={label} accessibilityRole="tab" accessibilityState={{selected:section===label}} style={[ui.input,{flex:1,backgroundColor:section===label?'#e1ecff':'white'}]} onPress={()=>setSection(label)}><Text>{label}</Text></Pressable>)}</View><View style={{flex:1}}>{section==='School'?<SchoolReports/>:<ScrollView contentContainerStyle={ui.content}>{section==='Gym'?<StudentTrainingReport/>:<BarberReports/>}</ScrollView>}</View><SchoolBottomNav/></SafeAreaView>;}
