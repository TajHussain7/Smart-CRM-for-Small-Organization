import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { signIn, useSession } from './session';
import { styles } from './styles';
export default function AuthScreen({register=false}:{register?:boolean}) {
  const session=useSession();
  const [name,setName]=useState(''),[businessName,setBusiness]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  if(session.user)return <Redirect href="/school-dashboard"/>;
  async function submit() {
    if(busy)return;
    setBusy(true);setError('');
    try {
      if(!email.trim()||!password||(register&&(!name.trim()||!businessName.trim())))throw new Error('Complete all required fields.');
      await signIn({email:email.trim(),password,...(register?{name:name.trim(),businessName:businessName.trim(),schoolEnabled:true,gymEnabled:true,barberEnabled:true}:{})},register);
    }catch(e){setError(e instanceof Error?e.message:'Unable to sign in.');}finally{setBusy(false);}
  }
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Text style={styles.brand}>Smart CRM</Text><Text style={styles.title}>{register?'Create your workspace':'Welcome back'}</Text><Text style={styles.muted}>School, Gym and Barber management in one workspace.</Text>
    <View style={styles.card}>
      {register&&<><Text>Owner name</Text><TextInput accessibilityLabel="Owner name" style={styles.input} value={name} onChangeText={setName}/><Text>Workspace name</Text><TextInput accessibilityLabel="Workspace name" style={styles.input} value={businessName} onChangeText={setBusiness}/></>}
      <Text>Email</Text><TextInput accessibilityLabel="Email" style={styles.input} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <Text>Password{register?' (minimum 6 characters)':''}</Text><TextInput accessibilityLabel="Password" style={styles.input} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} onSubmitEditing={submit}/>
      {!!(error||session.error)&&<Text accessibilityRole="alert" style={styles.error}>{error||session.error}</Text>}
      <Pressable accessibilityRole="button" style={styles.button} disabled={busy} onPress={submit}>{busy?<ActivityIndicator color="white"/>:<Text style={styles.white}>{register?'Create workspace':'Sign in'}</Text>}</Pressable>
      <Pressable accessibilityRole="link" style={styles.secondary} disabled={busy} onPress={()=>router.replace(register?'/':'/create-workspace')}><Text>{register?'Already registered? Sign in':'Create a workspace'}</Text></Pressable>
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
