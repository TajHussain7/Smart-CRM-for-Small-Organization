import { SchoolMenuButton, SchoolBottomNav } from '@/components/school/school-navigation';
import { Text, TextInput } from '@/components/responsive-text';
import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './school-icon';
import { useProfile, updateProfile, type ProfileFields } from './profile-store';

const fields: [keyof ProfileFields, string][] = [['name', 'Student name'], ['grade', 'Grade / Section'], ['address', 'Address'], ['guardian', 'Guardian name'], ['phone', 'Phone number'], ['email', 'Email']];
const empty: ProfileFields = { name: '', grade: '', address: '', guardian: '', phone: '', email: '' };
function Detail({ label, value }: { label: string; value?: string }) {
  return <View style={s.detail}><Text style={s.label}>{label}</Text><Text style={s.value}>{value || 'Not provided'}</Text></View>;
}
export default function StudentProfileScreen({ studentId }: { studentId: string }) {
  const profile = useProfile(studentId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileFields>(empty);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  function back() { if (router.canGoBack()) router.back(); else router.replace('/students'); }
  function save() {
    const clean = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as ProfileFields;
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) { setError('Enter a valid email address.'); return; }
    if (!updateProfile(studentId, clean)) { setError('Student name and grade are required.'); return; }
    setEditing(false); setNotice('Student details updated for this demo session.');
  }
  if (!profile) return <SafeAreaView style={s.safe}><View style={s.content}><Text style={s.title}>Student not found</Text><Text style={s.note}>This record is unavailable. Session-only students are cleared when the app restarts.</Text><Pressable accessibilityRole="button" style={s.button} onPress={back}><Text style={s.buttonText}>Back to Tasks</Text></Pressable></View></SafeAreaView>;
  const { student } = profile;
  return <SafeAreaView style={s.safe}>
    <View style={s.header}><SchoolMenuButton/><Pressable accessibilityRole="button" accessibilityLabel="Back to Tasks" onPress={back} style={s.iconButton}><Icon name="back"/></Pressable><Text style={s.title}>Student Information</Text></View>
    <ScrollView contentContainerStyle={s.content}>
      <View style={[s.card, s.hero]}><View style={s.avatar}><Text style={s.initials}>{student.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('')}</Text></View><Text style={s.name}>{student.name}</Text><Text style={s.id}>ID: {student.id}</Text><Pressable accessibilityRole="button" style={[s.button, s.edit]} onPress={() => { setDraft({ name: student.name, grade: student.grade, address: student.address, guardian: student.guardian, phone: student.phone, email: student.email }); setError(''); setEditing(true); }}><Icon name="edit" color="white" size={16}/><Text style={s.buttonText}>Edit Student</Text></Pressable></View>
      <View style={s.card}><Text style={s.sectionLabel}>PERSONAL DETAILS</Text><Detail label="DATE OF BIRTH"/><Detail label="GRADE / SECTION" value={student.grade}/><Detail label="ADDRESS" value={student.address}/></View>
      <View style={s.card}><Text style={s.sectionLabel}>GUARDIAN DETAILS</Text><Detail label="GUARDIAN" value={student.guardian}/><Detail label="PHONE" value={student.phone}/><Detail label="EMAIL" value={student.email}/></View>
      <View style={s.card}><Text style={s.sectionTitle}>Attendance Overview</Text><Text style={s.note}>Attendance records have not been provided for {student.name}.</Text></View>
      <View style={s.card}><View style={s.row}><Text style={s.sectionTitle}>Fee History</Text><Text style={[s.badge, student.status === 'Paid' ? s.paid : s.pending]}>{student.status}</Text></View><Text style={s.note}>Fee status: {student.status}. Detailed payment history has not been provided.</Text></View>
      {!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}<Text style={s.sample}>Sample records · Changes last for this session only</Text>
    </ScrollView>
    <SchoolBottomNav active="Profile"/>
    <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}><KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={s.dialog} accessibilityViewIsModal><View style={s.row}><Text style={s.sectionTitle}>Edit Student</Text><Pressable accessibilityRole="button" accessibilityLabel="Close edit" style={s.iconButton} onPress={() => setEditing(false)}><Icon name="close"/></Pressable></View><ScrollView keyboardShouldPersistTaps="handled"><Text style={s.note}>Changes apply to {student.id} for this demo session.</Text>{fields.map(([key, label]) => <View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={draft[key]} onChangeText={value => setDraft(previous => ({ ...previous, [key]: value }))} maxLength={key === 'address' ? 180 : 80} keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'} autoCapitalize={key === 'email' ? 'none' : 'words'}/></View>)}{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" style={s.button} onPress={save}><Text style={s.buttonText}>Save Changes</Text></Pressable></ScrollView></View></KeyboardAvoidingView></Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 58, borderBottomWidth: 1, borderColor: '#e1e6ee' }, title: { color: '#0050d5', fontSize: 19, fontWeight: '600' }, iconButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }, card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 11, padding: 20 }, hero: { alignItems: 'center' }, avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dce8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }, initials: { fontSize: 25, color: '#0752ce', fontWeight: '600' }, name: { fontSize: 22, color: '#202734', textAlign: 'center' }, id: { fontSize: 12, color: '#536179', backgroundColor: '#eef1f5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 }, button: { backgroundColor: '#064bcb', padding: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, buttonText: { color: 'white', fontSize: 14, fontWeight: '500' }, edit: { alignSelf: 'stretch', marginTop: 22 }, sectionLabel: { color: '#0752d3', fontSize: 11, letterSpacing: 1, fontWeight: '600', marginBottom: 16 }, sectionTitle: { fontSize: 18, color: '#202734', fontWeight: '500' }, detail: { marginBottom: 14 }, label: { fontSize: 11, color: '#647086', marginBottom: 6 }, value: { color: '#273140', fontSize: 14 }, note: { color: '#718097', fontSize: 13, lineHeight: 21, marginTop: 12, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, badge: { paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, borderRadius: 12, overflow: 'hidden' }, paid: { color: '#287b4c', backgroundColor: '#d9fce6' }, pending: { color: '#ba3442', backgroundColor: '#ffe1e4' }, sample: { textAlign: 'center', color: '#718097', fontSize: 11, marginVertical: 8 }, notice: { backgroundColor: '#e7f8ed', color: '#24633d', padding: 12, borderRadius: 8 }, nav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e1e6ee', padding: 8, backgroundColor: 'white' }, navButton: { flex: 1, alignItems: 'center', gap: 4, padding: 6 }, navText: { fontSize: 11, color: '#0752ce' }, overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#12213a66' }, dialog: { width: '100%', maxWidth: 440, maxHeight: '85%', backgroundColor: 'white', borderRadius: 14, padding: 20 }, input: { borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 7, minHeight: 45, padding: 10, marginBottom: 16, color: '#273140', fontSize: 15 }, error: { color: '#ba3442', marginBottom: 12 },
});
