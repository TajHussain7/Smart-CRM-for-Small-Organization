import { getAccount, saveAccount } from './account-store';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '@/components/responsive-text';
import { saveWorkspace } from './workspace-store';
import { useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const blue = '#064bcb';
const paths: Record<string, string> = {
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  user: 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3c0-5 16-5 16 0v3z',
  store: 'M3 3h18 M4 6h16l2 5H2z M4 11v10h16V11 M8 21v-7h8',
  type: 'M12 2l4 7H8z M3 14h7v7H3z M21 17.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
  arrow: 'M4 12h16 M13 5l7 7-7 7', back: 'M20 12H4 M11 5l-7 7 7 7',
  chevron: 'M6 9l6 6 6-6',
  rocket: 'M9 15l-4-4C9 4 14 2 22 2c0 8-2 13-9 17l-4-4z M9 15l-3 3 M5 15c-3 1-3 6-3 7 1 0 6 0 7-3 M14 7l3 3 M5 11H2l3-6 5-1 M13 19v3l6-3 1-5',
};
function Icon({ name, color = '#74798b', size = 24 }: { name: string; color?: string; size?: number }) {
  const svg = name === 'brand'
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 38"><path fill="#064bcb" d="M1 13 21 2l20 11-20 11L1 13Zm7 7 13 7 13-7v10l-13 7-13-7Zm30-4h3v12h-3Z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + paths[name] + '"/></svg>';
  return <Image source={{ uri: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg) }} style={{ width: size, height: size }} accessibilityElementsHidden />;
}
type FieldProps = { label: string; icon: string; placeholder: string; value: string; onChange: (value: string) => void; password?: boolean; email?: boolean; workspace: boolean; action?: React.ReactNode };
function Field({ label, icon, placeholder, value, onChange, password, email, workspace, action }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return <View style={[s.field, workspace && s.workspaceField]}>
    <View style={s.labelRow}><Text style={[s.label, workspace && s.workspaceLabel]}>{label}</Text>{action}</View>
    <View style={[s.inputWrap, workspace && s.workspaceInput, focused && s.focused]}>
      <Icon name={icon} />
      <TextInput accessibilityLabel={label} style={s.input} placeholder={placeholder} placeholderTextColor="#8792a7" value={value} onChangeText={onChange} secureTextEntry={password && !visible} keyboardType={email ? 'email-address' : 'default'} autoCapitalize={email || password ? 'none' : 'words'} autoCorrect={false} autoComplete={password ? (workspace ? 'new-password' : 'current-password') : email ? 'email' : label === 'Owner Name' ? 'name' : 'off'} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? "Hide password" : "Show password"} onPress={() => setVisible(!visible)} style={s.passwordToggle}><Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={21} color="#64748b" /></Pressable>}
    </View>
  </View>;
}
export default function AuthScreen({ workspace = false }: { workspace?: boolean }) {
  const [business, setBusiness] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [notice, setNotice] = useState('');
  function submit() {
    if (workspace && (!business.trim() || !owner.trim())) { setNotice('Please enter your business name and owner name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setNotice('Please enter a valid email address.'); return; }
    if (!password || (workspace && password.length < 8)) { setNotice(workspace ? 'Use at least 8 characters for your password.' : 'Please enter your password.'); return; }
    if (workspace) { if (!saveWorkspace(business)) { setNotice('Select at least one feature for each enabled module.'); return; } saveAccount({...getAccount(),name:owner.trim(),email:email.trim()}); router.replace('/school-dashboard'); return; }
    setNotice(workspace ? 'Your workspace details are ready. Workspace creation will be available when the service is connected.' : 'Your details are ready. Sign-in will be available when the service is connected.');
  }
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={[s.page, workspace && s.workspacePage]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
      {workspace && <Pressable accessibilityRole="button" accessibilityLabel="Back to login" style={s.back} onPress={() => router.replace('/')}><Icon name="back" color={blue} /><Text style={s.backText}>Create Workspace</Text></Pressable>}
      <View style={[s.card, workspace && s.workspaceCard]}>
        {!workspace && <View style={s.brand}><Icon name="brand" size={42} /></View>}
        <Text accessibilityRole="header" style={[s.title, workspace && s.workspaceTitle]}>{workspace ? 'Workspace Setup' : 'Welcome Back'}</Text>
        <Text style={[s.subtitle, workspace && s.workspaceSubtitle]}>{workspace ? 'Set up your school with Gym and Barber services included.' : 'Sign in to manage your school, team and services.'}</Text>
        <View style={[s.form, workspace && s.workspaceForm]}>
          {workspace && <><Field workspace label="School Name" icon="store" placeholder="e.g. Sunrise School" value={business} onChange={setBusiness} /><Field workspace label="Owner Name" icon="user" placeholder="Full Name" value={owner} onChange={setOwner} /></>}
          <Field workspace={workspace} label="Email" icon="mail" placeholder={workspace ? 'name@business.com' : 'name@school.edu'} value={email} onChange={setEmail} email />
          <Field workspace={workspace} label="Password" icon="lock" placeholder={workspace ? 'Min. 8 characters' : '••••••••'} value={password} onChange={setPassword} password action={!workspace && <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setNotice('Password recovery will be available when the service is connected.')}><Text style={s.link}>Forgot password?</Text></Pressable>} />
          {workspace && <View style={s.moduleSection}><Text style={s.label}>Included services</Text>{[{name:'School',icon:'school-outline' as const,detail:'Students, admission, fees and timetable'},{name:'Gym',icon:'barbell-outline' as const,detail:'Training sessions for students'},{name:'Barber',icon:'cut-outline' as const,detail:'Clients, appointments and services'}].map(item=><View key={item.name} style={s.included}><Ionicons name={item.icon} size={24} color={blue}/><View style={{flex:1,gap:4}}><Text style={s.moduleTitle}>{item.name}</Text><Text style={s.moduleDescription}>{item.detail}</Text></View><Text style={s.includedBadge}>Included</Text></View>)}<Text style={s.moduleDescription}>One overview, alerts and reports page for all services.</Text></View>}
          {!workspace && <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember(!remember)} style={s.remember}><View style={[s.checkbox, remember && { backgroundColor: blue, borderColor: blue }]}><Text style={{ color: 'white' }}>{remember ? '✓' : ''}</Text></View><Text style={s.rememberText}>Remember me for 30 days</Text></Pressable>}
          <Pressable accessibilityRole="button" style={({ pressed }) => [s.primary, workspace && s.workspacePrimary, pressed && { opacity: 0.8 }]} onPress={submit}><Text style={[s.primaryText, workspace && { fontSize: 20 }]}>{workspace ? 'Create Workspace' : 'Login'}</Text><Icon name={workspace ? 'rocket' : 'arrow'} color="white" size={26} /></Pressable>
        </View>
        {!!notice && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
        {!workspace && <><View style={s.divider}><View style={s.line} /><Text style={s.dividerText}>OR CONTINUE WITH</Text><View style={s.line} /></View><Pressable accessibilityRole="button" style={s.google} onPress={() => setNotice('Google sign-in will be available when the service is connected.')}><Text style={s.googleG}>G</Text><Text style={s.googleText}>Sign in with Google</Text></Pressable><View style={s.footer}><Text style={s.footerText}>Don’t have a workspace? </Text><Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('./create-workspace')}><Text style={[s.footerText, { color: '#0054ed' }]}>Create one</Text></Pressable></View></>}
        <View style={s.previews}>
          <Text style={s.previewLabel}>School workspace</Text>
          <Pressable accessibilityRole="link" style={s.previewButton} onPress={() => router.push('/school-dashboard')}><Text style={s.link}>Preview School Dashboard</Text><Icon name="arrow" color={blue} size={20} /></Pressable>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  passwordToggle: { minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center' },
  moduleSection:{gap:12,marginBottom:22},
  included:{flexDirection:'row',alignItems:'center',gap:10,padding:12,borderRadius:12,backgroundColor:'#edf4ff',flexWrap:'wrap'},
  includedBadge:{fontSize:12,fontWeight:'600',color:blue},
  moduleTitle:{fontSize:16,fontWeight:'600',color:'#22324b'},
  moduleDescription:{fontSize:12,lineHeight:18,color:'#66758c'},
  moduleCard:{borderWidth:1,borderColor:'#dce3ef',borderRadius:12,overflow:'hidden',backgroundColor:'#fafbfd'},
  moduleSelected:{borderColor:'#6c9be9',backgroundColor:'#f3f7ff'},
  moduleHeading:{flexDirection:'row',alignItems:'center',gap:10,padding:14,minHeight:64},
  featureList:{paddingHorizontal:14,paddingBottom:10,borderTopWidth:1,borderColor:'#dce5f5'},
  feature:{flexDirection:'row',alignItems:'center',gap:10,minHeight:44,paddingVertical:10},
  featureText:{fontSize:14,color:'#344763',flex:1},
  safe: { flex: 1, backgroundColor: '#f7f8fa' },
  previews: { marginTop: 24, gap: 10 },
  previewLabel: { color: '#68758b', fontSize: 12, textAlign: 'center', marginBottom: 2 },
  previewButton: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#d7dfec', borderRadius: 9, backgroundColor: '#f4f7ff', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  page: { padding: 16, paddingTop: 16, alignItems: 'center', flexGrow: 1 },
  workspacePage: { paddingTop: 12 },
  card: { width: '100%', maxWidth: 430, backgroundColor: 'white', borderWidth: 1, borderColor: '#d7dfec', borderRadius: 16, paddingHorizontal: 18, paddingTop: 28, paddingBottom: 24 },
  workspaceCard: { maxWidth: 518, paddingHorizontal: 18, paddingTop: 24, paddingBottom: 24, borderColor: '#bec1d8' },
  brand: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 22, backgroundColor: '#eef4ff', marginBottom: 20 },
  title: { textAlign: 'center', fontSize: 30, fontWeight: '600', color: '#1d2021', letterSpacing: -0.7, marginBottom: 12 },
  workspaceTitle: { textAlign: 'left', fontWeight: '700' },
  subtitle: { textAlign: 'center', fontSize: 18, lineHeight: 25, color: '#484b60' },
  workspaceSubtitle: { textAlign: 'left', fontSize: 17, lineHeight: 25 },
  form: { marginTop: 28 },
  workspaceForm: { marginTop: 28 },
  field: { marginBottom: 20 },
  workspaceField: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10, paddingHorizontal: 4 },
  label: { fontSize: 15, fontWeight: '600', letterSpacing: 0.5, color: '#484b60' },
  workspaceLabel: { fontSize: 16, fontWeight: '400', letterSpacing: 0, color: '#484b60' },
  inputWrap: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#bec1d8', borderRadius: 10, backgroundColor: '#f2f3f5', paddingHorizontal: 14 },
  workspaceInput: { minHeight: 54, backgroundColor: '#f7f8fa', borderRadius: 9 },
  focused: { borderColor: blue },
  input: { flex: 1, minWidth: 0, fontSize: 18, color: '#202326', minHeight: 52, paddingVertical: 12 },
  link: { color: '#0053e5', fontSize: 14, fontWeight: '600' },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: '#bcc2db', borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  rememberText: { fontSize: 16, flex: 1, color: '#484b60' },
  primary: { backgroundColor: blue, minHeight: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, boxShadow: '0 3px 5px #00000022' },
  workspacePrimary: { marginTop: 16, minHeight: 56, borderRadius: 14 },
  primaryText: { color: 'white', fontSize: 25 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, marginBottom: 24 },
  line: { height: 1, flex: 1, backgroundColor: '#bec3d9' },
  dividerText: { fontSize: 12, letterSpacing: 1.3, color: '#414558' },
  google: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', minHeight: 51, borderWidth: 1, borderColor: '#bcc2db', borderRadius: 9 },
  googleG: { color: '#4285f4', fontSize: 21, fontWeight: '700' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#202326' },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 },
  footerText: { fontSize: 13, color: '#373d53' },
  back: { width: '100%', maxWidth: 518, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, marginBottom: 28 },
  backText: { color: '#0053e5', fontSize: 23, fontWeight: '600' },
  options: { borderWidth: 1, borderColor: '#bec1d8', borderRadius: 8, marginTop: 8 },
  option: { padding: 14 },
  notice: { marginTop: 16, color: '#344d79', fontSize: 14, lineHeight: 21, backgroundColor: '#eff5ff', padding: 12, borderRadius: 8 },
});

