import { getStudent, deleteStudent, studentGrades } from '@/api/students';
import { addStudent, removeStudent } from './students-store';
import { Select } from '@/components/workspace-ui';
import { SchoolMenuButton, SchoolBottomNav } from '@/components/school/school-navigation';
import { Text, TextInput } from '@/components/responsive-text';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './school-icon';
import { useProfile, updateProfile, type ProfileFields } from './profile-store';

const fields: [keyof ProfileFields, string][] = [['name', 'Student name'],  ['address', 'Address'], ['guardian', 'Guardian name'], ['phone', 'Phone number'], ['email', 'Email']];
const empty: ProfileFields = { name: '', grade: '', address: '', guardian: '', phone: '', email: '', section: 'A', monthlyFee: '' };
function Detail({ label, value }: { label: string; value?: string }) {
  return <View style={s.detail}><Text style={s.label}>{label}</Text><Text style={s.value}>{value || 'Not provided'}</Text></View>;
}
export default function StudentProfileScreen({ studentId }: { studentId: string }) {
  const profile = useProfile(studentId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileFields>(empty);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    void reload;
    let active = true; setLoading(true); setLoadError('');
    getStudent(studentId).then(student => { if (active) addStudent(student); })
      .catch(error => { if (active) setLoadError(error.message || 'Unable to load student.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [studentId, reload]));
  function back() { if (router.canGoBack()) router.back(); else router.replace('/students'); }
  async function save() {
    if (saving) return;
    const clean = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as ProfileFields;
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) { setError('Enter a valid email address.'); return; }
    setSaving(true); setError('');
    try { await updateProfile(studentId, clean); setEditing(false); setNotice('Student details saved.'); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to save student.'); }
    finally { setSaving(false); }
  }
  if (loading || loadError || !profile) return <SafeAreaView style={s.safe}><View style={s.content}><Text style={s.title}>{loading ? 'Loading student...' : 'Unable to load student'}</Text><Text style={s.note}>{loadError}</Text>{!loading && <><Pressable onPress={() => setReload(value => value + 1)}><Text style={s.note}>Retry</Text></Pressable><Pressable onPress={() => router.push('/')}><Text style={s.note}>Log in</Text></Pressable></>}<Pressable accessibilityRole="button" style={s.button} onPress={back}><Text style={s.buttonText}>Back to Tasks</Text></Pressable></View></SafeAreaView>;
  const { student } = profile;
  return <SafeAreaView style={s.safe}>
    <View style={s.header}><SchoolMenuButton/><Pressable accessibilityRole="button" accessibilityLabel="Back to Tasks" onPress={back} style={s.iconButton}><Icon name="back"/></Pressable><Text style={s.title}>Student Information</Text></View>
    <ScrollView contentContainerStyle={s.content}>
      <View style={[s.card, s.hero]}><View style={s.avatar}><Text style={s.initials}>{student.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('')}</Text></View><Text style={s.name}>{student.name}</Text><Text style={s.id}>ID: {student.id}</Text><Pressable accessibilityRole="button" style={[s.button, s.edit]} onPress={() => { setDraft({ name: student.name, grade: student.grade, address: student.address, guardian: student.guardian, phone: student.phone, email: student.email, section: student.section, monthlyFee: String(student.monthlyFee) }); setError(''); setEditing(true); }}><Icon name="edit" color="white" size={16}/><Text style={s.buttonText}>Edit Student</Text></Pressable></View>
      <View style={s.card}><Text style={s.sectionLabel}>PERSONAL DETAILS</Text><Detail label="DATE OF BIRTH" value={student.birthDate}/><Detail label="GENDER" value={student.gender}/><Detail label="BLOOD GROUP" value={student.bloodGroup}/><Detail label="GRADE / SECTION" value={`${student.grade} / ${student.section}`}/><Detail label="ADDRESS" value={student.address}/></View>
      <View style={s.card}><Text style={s.sectionLabel}>GUARDIAN DETAILS</Text><Detail label="GUARDIAN" value={student.guardian}/><Detail label="PHONE" value={student.phone}/><Detail label="EMAIL" value={student.email}/><Detail label="EMERGENCY PHONE" value={student.emergencyPhone}/></View>
      <View style={s.card}><Text style={s.sectionTitle}>Attendance Overview</Text><Text style={s.note}>Attendance records have not been provided for {student.name}.</Text></View>
      <View style={s.card}><View style={s.row}><Text style={s.sectionTitle}>Fee History</Text><Text style={[s.badge, student.status === 'Paid' ? s.paid : s.pending]}>{student.status}</Text></View><Text style={s.note}>Monthly fee: Rs. {student.monthlyFee.toLocaleString()}. Fee status: {student.status}. Detailed payment history has not been provided.</Text></View>
      {!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}{!!error && !editing && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable style={s.button} onPress={() => { setError(''); setConfirmDelete(true); }}><Text style={s.buttonText}>Delete Student</Text></Pressable>
      {confirmDelete && <View style={s.card}><Text style={s.note}>Delete {student.name}? This cannot be undone.</Text><Pressable disabled={saving} style={s.button} onPress={async () => {
        setSaving(true); setError('');
        try { await deleteStudent(student._id); removeStudent(student._id); router.replace('/students'); }
        catch (error) { setError(error instanceof Error ? error.message : 'Unable to delete student.'); }
        finally { setSaving(false); }
      }}><Text style={s.buttonText}>{saving ? 'Deleting...' : 'Confirm Delete'}</Text></Pressable><Pressable disabled={saving} onPress={() => setConfirmDelete(false)}><Text style={s.note}>Cancel</Text></Pressable></View>}
    </ScrollView>
    <SchoolBottomNav active="Profile"/>
    <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}><KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={s.dialog} accessibilityViewIsModal><View style={s.row}><Text style={s.sectionTitle}>Edit Student</Text><Pressable accessibilityRole="button" accessibilityLabel="Close edit" style={s.iconButton} onPress={() => setEditing(false)}><Icon name="close"/></Pressable></View><ScrollView keyboardShouldPersistTaps="handled"><Text style={s.note}>Update details for {student.id}.</Text>{fields.map(([key, label]) => <View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={draft[key]} onChangeText={value => setDraft(previous => ({ ...previous, [key]: value }))} maxLength={key === 'address' ? 180 : 80} keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'} autoCapitalize={key === 'email' ? 'none' : 'words'}/></View>)}<Select label="Grade" value={draft.grade} options={studentGrades.map(value => ({ value, label: value }))} onChange={grade => setDraft({ ...draft, grade })}/><Select label="Section" value={draft.section} options={['A', 'B'].map(value => ({ value, label: value }))} onChange={section => setDraft({ ...draft, section })}/><Text style={s.label}>Monthly Fee</Text><TextInput style={s.input} accessibilityLabel="Monthly Fee" keyboardType="numeric" value={draft.monthlyFee} onChangeText={monthlyFee => setDraft({ ...draft, monthlyFee })}/>{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" style={s.button} disabled={saving} onPress={save}><Text style={s.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text></Pressable></ScrollView></View></KeyboardAvoidingView></Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, minHeight: 58, borderBottomWidth: 1, borderColor: '#e1e6ee' }, title: { color: '#0050d5', fontSize: 19, fontWeight: '600' }, iconButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' }, card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 11, padding: 20 }, hero: { alignItems: 'center' }, avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dce8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }, initials: { fontSize: 25, color: '#0752ce', fontWeight: '600' }, name: { fontSize: 22, color: '#202734', textAlign: 'center' }, id: { fontSize: 12, color: '#536179', backgroundColor: '#eef1f5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 }, button: { backgroundColor: '#064bcb', padding: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, buttonText: { color: 'white', fontSize: 14, fontWeight: '500' }, edit: { alignSelf: 'stretch', marginTop: 22 }, sectionLabel: { color: '#0752d3', fontSize: 11, letterSpacing: 1, fontWeight: '600', marginBottom: 16 }, sectionTitle: { fontSize: 18, color: '#202734', fontWeight: '500' }, detail: { marginBottom: 14 }, label: { fontSize: 11, color: '#647086', marginBottom: 6 }, value: { color: '#273140', fontSize: 14 }, note: { color: '#718097', fontSize: 13, lineHeight: 21, marginTop: 12, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, badge: { paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, borderRadius: 12, overflow: 'hidden' }, paid: { color: '#287b4c', backgroundColor: '#d9fce6' }, pending: { color: '#ba3442', backgroundColor: '#ffe1e4' }, sample: { textAlign: 'center', color: '#718097', fontSize: 11, marginVertical: 8 }, notice: { backgroundColor: '#e7f8ed', color: '#24633d', padding: 12, borderRadius: 8 }, nav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e1e6ee', padding: 8, backgroundColor: 'white' }, navButton: { flex: 1, alignItems: 'center', gap: 4, padding: 6 }, navText: { fontSize: 11, color: '#0752ce' }, overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#12213a66' }, dialog: { width: '100%', maxWidth: 440, maxHeight: '85%', backgroundColor: 'white', borderRadius: 14, padding: 20 }, input: { borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 7, minHeight: 45, padding: 10, marginBottom: 16, color: '#273140', fontSize: 15 }, error: { color: '#ba3442', marginBottom: 12 },
});
