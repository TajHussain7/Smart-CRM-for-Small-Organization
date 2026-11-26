import { createTeacher, updateTeacher, getTeacher, type TeacherRecord } from '@/api/teachers';
import { Text, TextInput } from '@/components/responsive-text';
import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { addTeacher } from './teachers-store';
export default function AddTeacherButton({ teacher, onSaved }: { teacher?: TeacherRecord; onSaved?: (teacher: TeacherRecord) => void }) {
  const [open,setOpen]=useState(false);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [subject,setSubject]=useState('');
  const [error,setError]=useState('');
  const [phone,setPhone]=useState('');
  const [saving,setSaving]=useState(false);
  async function openForm() {
    setError(''); setSaving(true);
    try {
      const record = teacher ? await getTeacher(teacher._id) : null;
      setName(record?.name || ''); setEmail(record?.email || ''); setSubject(record?.subject || ''); setPhone(record?.phone || ''); setOpen(true);
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to load teacher.'); }
    finally { setSaving(false); }
  }
  async function save() {
    if (saving) return;
    if (name.trim().length < 2 || !subject.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a name (2+ characters), subject and valid email.'); return; }
    setSaving(true); setError('');
    try {
      const input = { name: name.trim(), email: email.trim().toLowerCase(), subject: subject.trim(), phone: phone.trim() };
      const record = teacher ? await updateTeacher(teacher._id, input) : await createTeacher(input);
      addTeacher(record); setOpen(false); onSaved?.(record);
      if (!teacher && !onSaved) router.push({ pathname: '/teacher-timetable', params: { teacherId: record._id } });
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save teacher.'); }
    finally { setSaving(false); }
  }
  return <><Pressable accessibilityRole="button" style={s.button} disabled={saving} onPress={openForm}><Text style={s.buttonText}>{teacher ? 'Edit Teacher' : '＋ Add Teacher'}</Text></Pressable>{!!error && !open && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}><KeyboardAvoidingView style={s.overlay} behavior={Platform.OS==='ios'?'padding':'height'}><View style={s.dialog} accessibilityViewIsModal><View style={s.row}><Text style={s.title}>{teacher ? 'Edit Teacher' : 'Add Teacher'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={()=>setOpen(false)} style={s.close}><Text>✕</Text></Pressable></View><ScrollView keyboardShouldPersistTaps="handled"><Text style={s.note}>Save teacher information, then schedule their weekly timetable.</Text><Text style={s.label}>Full name</Text><TextInput accessibilityLabel="Teacher full name" style={s.input} value={name} onChangeText={setName} maxLength={100}/><Text style={s.label}>Email</Text><TextInput accessibilityLabel="Teacher email" style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" maxLength={100}/><Text style={s.label}>Subject / Speciality</Text><TextInput accessibilityLabel="Teacher subject" style={s.input} value={subject} onChangeText={setSubject} maxLength={100}/><Text style={s.label}>Phone</Text><TextInput accessibilityLabel="Teacher phone" style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30}/>{!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" style={s.button} disabled={saving} onPress={save}><Text style={s.buttonText}>{saving ? 'Saving...' : teacher ? 'Save Teacher' : 'Add Teacher & Open Timetable'}</Text></Pressable></ScrollView></View></KeyboardAvoidingView></Modal></>;
}
const s=StyleSheet.create({button:{backgroundColor:'#0754d5',padding:15,borderRadius:9,alignItems:'center',justifyContent:'center',minHeight:50},buttonText:{color:'white',fontSize:14,fontWeight:'600'},overlay:{flex:1,backgroundColor:'#12213a66',padding:20,alignItems:'center',justifyContent:'center'},dialog:{backgroundColor:'white',padding:22,borderRadius:14,width:'100%',maxWidth:450,maxHeight:'85%'},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},title:{fontSize:21,color:'#253246'},close:{padding:12},note:{color:'#758197',fontSize:13,lineHeight:20,marginVertical:16},label:{color:'#59677e',fontSize:12,marginBottom:6},input:{borderWidth:1,borderColor:'#cdd6e6',borderRadius:8,padding:12,minHeight:46,marginBottom:16,color:'#273447'},error:{color:'#ba3442',marginBottom:14}});
