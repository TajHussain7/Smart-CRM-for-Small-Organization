import AccountButton from '@/components/account-button';
import { SchoolMenuButton, SchoolBottomNav } from '@/components/school/school-navigation';
import { Text, TextInput } from '@/components/responsive-text';
import { useState } from 'react';
import { router } from 'expo-router';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTeacherButton from './add-teacher-button';
import Icon from './school-icon';
import { addStudent, useStudents } from './students-store';
import data from './demo-data.json';

const grades = ['9th', '10th', '11th', '12th'];
const sections: Record<string, string[]> = data.sections;
const tones: Record<string, { backgroundColor: string; color: string }> = {
  slate: { backgroundColor: '#d5e3ff', color: '#667384' },
  blue: { backgroundColor: '#b7c7ff', color: '#0752ce' },
  cyan: { backgroundColor: '#a5edfa', color: '#087f93' },
};
function Choices({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return <View style={s.formGroup}><Text style={s.label}>{label}</Text><View style={s.choices}>{values.map(option => <Pressable accessibilityRole="radio" accessibilityLabel={label + ': ' + option} accessibilityState={{ checked: option === value }} key={option} onPress={() => onChange(option)} style={[s.choice, option === value && s.selectedChoice]}><Text style={[s.choiceText, option === value && { color: 'white' }]}>{option}</Text></Pressable>)}</View></View>;
}
export default function StudentsScreen() {
  const students = useStudents();
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('All');
  const [status, setStatus] = useState('All');
  const [draftGrade, setDraftGrade] = useState('All');
  const [draftStatus, setDraftStatus] = useState('All');
  const [panel, setPanel] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [newGrade, setNewGrade] = useState('10th');
  const [newStatus, setNewStatus] = useState('Pending');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const filterCount = Number(grade !== 'All') + Number(status !== 'All');
  const filtered = students.filter(student => (student.name.toLowerCase().includes(query.trim().toLowerCase()) || student.id.toLowerCase().includes(query.trim().toLowerCase())) && (grade === 'All' || student.grade === grade) && (status === 'All' || student.status === status));
  function clear() { setQuery(''); setGrade('All'); setStatus('All'); }
  function openAdd() { router.push('/admission'); }
  function submit() {
    if (!name.trim() || !id.trim()) { setError('Enter a student name and ID.'); return; }
    if (!/^[a-z0-9-]+$/i.test(id.trim())) { setError('Use letters, numbers, or hyphens for the ID.'); return; }
    if (!addStudent({ name: name.trim(), id: id.trim().toUpperCase(), grade: newGrade, status: newStatus })) { setError('A student with this ID already exists.'); return; }
    clear(); setPanel(null); setNotice(name.trim() + ' added to this demo session.');
  }
  return <SafeAreaView style={s.safe}>
    <View style={s.header}><SchoolMenuButton/><Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" style={s.iconButton} onPress={() => router.replace('./school-dashboard')}><Icon name="back" color="#414b56" /></Pressable><Text accessibilityRole="header" style={s.title}>School Management</Text><AccountButton/></View>
    <FlatList data={filtered} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}
      ListHeaderComponent={<>
        <View style={s.search}><Icon name="search" color="#687185" size={21} /><TextInput accessibilityLabel="Search students by name or ID" style={s.searchInput} placeholder="Search students by name or ID..." placeholderTextColor="#7e879b" value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" clearButtonMode="while-editing" /></View>
        <Pressable accessibilityRole="button" style={s.filter} onPress={() => { setDraftGrade(grade); setDraftStatus(status); setPanel('Filter Students'); }}><Icon name="filter" size={20} /><Text style={s.filterText}>Filter{filterCount ? ' (' + filterCount + ')' : ''}</Text></Pressable>
        <View style={s.enrollment}><Text style={s.enrollmentLabel}>TOTAL ENROLLMENT</Text><Text style={s.enrollmentValue}>{(1284 + students.length - 5).toLocaleString('en-US')}</Text><View style={s.trend}><Icon name="trend" color="#dbe7ff" size={16} /><Text style={s.trendText}>4% from last month</Text></View></View>
        <View style={s.metrics}><View style={s.metric}><Text style={s.metricLabel}>FEES PAID</Text><Text style={s.metricValue}>82%</Text></View><View style={s.metric}><Text style={s.metricLabel}>ATTENDANCE</Text><Text style={[s.metricValue, { color: '#087d91' }]}>94%</Text></View></View>
        {!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
        {(!!query || filterCount > 0) && <View style={s.results}><Text accessibilityLiveRegion="polite" style={s.resultText}>{filtered.length} student{filtered.length === 1 ? '' : 's'} found</Text><Pressable accessibilityRole="button" hitSlop={10} onPress={clear}><Text style={s.link}>Clear filters</Text></Pressable></View>}
      </>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`View profile for ${item.name}, ${item.id}`} onPress={() => router.push({ pathname: "/student/[id]", params: { id: item.id } })} style={s.card}><View style={s.cardTop}><View style={[s.studentAvatar, { backgroundColor: tones[item.tone].backgroundColor }]}><Icon name="profile" color={tones[item.tone].color} size={23} /></View><View style={s.identity}><Text style={s.studentName}>{item.name}</Text><Text style={s.studentId}>ID: {item.id}</Text></View><Text style={[s.badge, item.status === 'Paid' ? s.paid : s.pending]}>{item.status.toUpperCase()}</Text></View><View style={s.grade}><Icon name="students" size={14} color="#424c61" /><Text style={s.gradeText}>Grade: {item.grade}</Text></View></Pressable>}
      ListEmptyComponent={<View style={s.empty}><Icon name="search" color="#69758a" size={30} /><Text style={s.emptyTitle}>No students found</Text><Text style={s.note}>Try another name, ID, or filter.</Text></View>}
      ListFooterComponent={<><View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={{ flex: 1 }}><Pressable accessibilityRole="button" style={s.addCard} onPress={openAdd}><Icon name="addPerson" color="#778092" size={32} /><Text style={s.addTitle}>Add New Student</Text><Text style={s.addCaption}>Quickly register a new attendee</Text></Pressable></View><View style={{ flex: 1 }}><AddTeacherButton/></View></View><Pressable accessibilityRole="link" style={{ padding: 16, alignItems: 'center' }} onPress={() => router.push('/teacher-timetable')}><Text style={s.link}>Teacher Timetable →</Text></Pressable><Text style={s.sample}>Sample records · New students stay in this session only</Text></>}
    />
    <Pressable accessibilityRole="button" accessibilityLabel="Add new student" style={s.floatingAdd} onPress={openAdd}><Icon name="plus" color="white" size={26} /></Pressable>
    <SchoolBottomNav active="Tasks"/>
    <Modal visible={panel !== null} transparent animationType="fade" onRequestClose={() => setPanel(null)}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={s.dialog} accessibilityViewIsModal><View style={s.dialogHeader}><Text accessibilityRole="header" style={s.dialogTitle}>{panel}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close dialog" style={s.iconButton} onPress={() => setPanel(null)}><Icon name="close" /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled">
        {panel === 'Filter Students' ? <><Choices label="Grade" values={['All', ...grades]} value={draftGrade} onChange={setDraftGrade} /><Choices label="Fee status" values={['All', 'Paid', 'Pending']} value={draftStatus} onChange={setDraftStatus} /><View style={s.formActions}><Pressable accessibilityRole="button" style={s.secondary} onPress={() => { setDraftGrade('All'); setDraftStatus('All'); }}><Text style={s.link}>Reset</Text></Pressable><Pressable accessibilityRole="button" style={s.submit} onPress={() => { setGrade(draftGrade); setStatus(draftStatus); setPanel(null); }}><Text style={s.submitText}>Apply filters</Text></Pressable></View></>
          : panel === 'Add New Student' ? <><Text style={s.note}>Add a sample student for this session. Changes are not saved to a server.</Text><Text style={s.label}>Full name</Text><TextInput accessibilityLabel="Full name" style={s.input} value={name} onChangeText={setName} maxLength={80} autoCapitalize="words" placeholder="e.g. Alex Johnson" placeholderTextColor="#8793a7" /><Text style={s.label}>Student ID</Text><TextInput accessibilityLabel="Student ID" style={s.input} value={id} onChangeText={setId} maxLength={20} autoCapitalize="characters" autoCorrect={false} placeholder="e.g. S116" placeholderTextColor="#8793a7" /><Choices label="Grade" values={grades} value={newGrade} onChange={setNewGrade} /><Choices label="Fee status" values={['Pending', 'Paid']} value={newStatus} onChange={setNewStatus} />{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}<Pressable accessibilityRole="button" style={s.submit} onPress={submit}><Text style={s.submitText}>Add Student</Text></Pressable></>
            : <><Text style={s.note}>School workspace · Sample data</Text>{(sections[panel || ''] || []).map(line => <Text key={line} style={s.detailLine}>• {line}</Text>)}</>}
      </ScrollView></View></KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fa' },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8, borderBottomWidth: 1, borderColor: '#e4e7ee' },
  iconButton: { minWidth: 36, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '600', color: '#0050d5', flex: 1 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#194b60', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#d4e0e7' },
  avatarText: { color: 'white', fontSize: 11, fontWeight: '600' },
  content: { padding: 16, paddingTop: 30, maxWidth: 640, width: '100%', alignSelf: 'center', paddingBottom: 30 },
  search: { minHeight: 50, backgroundColor: 'white', borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  searchInput: { flex: 1, minWidth: 0, fontSize: 15, color: '#303a4b', minHeight: 48 },
  filter: { minHeight: 50, borderWidth: 1, borderColor: '#cdd2e3', backgroundColor: 'white', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 28, boxShadow: '0 2px 5px #142f5010' },
  filterText: { color: '#2465ee', fontSize: 16, fontWeight: '600' },
  enrollment: { padding: 16, paddingVertical: 18, borderRadius: 12, backgroundColor: '#2860ed', marginBottom: 18 },
  enrollmentLabel: { color: '#dbe7ff', fontSize: 11, fontWeight: '500', marginBottom: 4 },
  enrollmentValue: { fontSize: 34, fontWeight: '600', color: '#dbe7ff' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  trendText: { color: '#dbe7ff', fontSize: 12, letterSpacing: 0.4, fontWeight: '600' },
  metrics: { flexDirection: 'row', gap: 18, marginBottom: 14 },
  metric: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 12, padding: 16, boxShadow: '0 2px 4px #142f5010' },
  metricLabel: { fontSize: 11, color: '#626b7d', marginBottom: 4 },
  metricValue: { fontSize: 25, fontWeight: '600', color: '#0056df' },
  card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: '0 2px 4px #142f5010' },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  studentAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1d2021', marginBottom: 4 },
  studentId: { fontSize: 12, color: '#495368' },
  badge: { fontSize: 9, fontWeight: '700', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 14, overflow: 'hidden', alignSelf: 'flex-start' },
  paid: { backgroundColor: '#d9fce6', color: '#287b4c' },
  pending: { backgroundColor: '#ffe1e4', color: '#ba3442' },
  grade: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 },
  gradeText: { fontSize: 12, color: '#424c61' },
  addCard: { minHeight: 124, padding: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: '#cdd2e3', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addTitle: { color: '#4a5263', fontSize: 16, fontWeight: '600', marginTop: 14 },
  addCaption: { color: '#5a6374', fontSize: 11, marginTop: 2 },
  sample: { color: '#69758a', fontSize: 11, textAlign: 'center', marginTop: 20 },
  floatingAdd: { position: 'absolute', right: 22, bottom: 110, width: 58, height: 58, borderRadius: 29, backgroundColor: '#0050d5', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 14px #064bcb55' },
  nav: { minHeight: 64, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 7, gap: 6, backgroundColor: '#f9fafc', borderTopWidth: 1, borderColor: '#e0e4eb' },
  navButton: { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 3 },
  activeNav: { backgroundColor: '#2864ed' },
  navText: { fontSize: 11, color: '#51586a' },
  results: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  resultText: { fontSize: 13, color: '#536179' },
  link: { fontSize: 14, color: '#0050d5' },
  notice: { backgroundColor: '#e7f8ed', color: '#24633d', padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 14 },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, color: '#69758a', marginTop: 14 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#12213a66' },
  dialog: { backgroundColor: 'white', width: '100%', maxWidth: 440, maxHeight: '85%', padding: 24, borderRadius: 16 },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dialogTitle: { fontSize: 21, fontWeight: '500', color: '#171b22', flex: 1 },
  note: { color: '#68758b', fontSize: 13, lineHeight: 21, marginBottom: 16 },
  label: { color: '#495368', fontSize: 14, marginBottom: 8 },
  input: { minHeight: 46, borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#303a4b', marginBottom: 16 },
  formGroup: { marginBottom: 18 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { padding: 12, borderWidth: 1, borderColor: '#cdd2e3', borderRadius: 8 },
  selectedChoice: { backgroundColor: '#0050d5', borderColor: '#0050d5' },
  choiceText: { color: '#495368', fontSize: 14 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  submit: { backgroundColor: '#0050d5', padding: 14, borderRadius: 9, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 15 },
  secondary: { borderWidth: 1, borderColor: '#0050d5', padding: 14, borderRadius: 9 },
  error: { color: '#ba3442', fontSize: 14, marginBottom: 14 },
  detailLine: { fontSize: 15, lineHeight: 28, color: '#171b22' },
});
