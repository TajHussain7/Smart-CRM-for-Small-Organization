import { SchoolMenuButton, SchoolBottomNav } from '@/components/school/school-navigation';
import { Text, TextInput } from '@/components/responsive-text';
import { useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '@/components/school/students-store';
import { schoolTheme as theme } from '@/components/school/theme';

export default function ProfilePage() {
  const students = useStudents();
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const matches = students.filter(student => `${student.name} ${student.id}`.toLowerCase().includes(term));
  return <SafeAreaView style={s.screen}>
    <View style={s.header}><SchoolMenuButton/>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" style={s.icon} onPress={() => router.canGoBack() ? router.back() : router.replace('/school-dashboard')}><Ionicons name="arrow-back" size={22} color={theme.primary}/></Pressable>
      <Text style={s.title}>Student Profiles</Text>
    </View>
    <FlatList data={matches} keyExtractor={student => student.id} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={s.intro}><Text style={s.description}>Select a student to view or edit their information.</Text><TextInput accessibilityLabel="Search students by name or ID" placeholder="Search by name or ID…" placeholderTextColor={theme.muted} value={query} onChangeText={setQuery} style={s.search}/></View>}
      ListEmptyComponent={<Text style={s.description}>No students found. Add students from Tasks or try another search.</Text>}
      renderItem={({item}) => <Pressable accessibilityRole="link" accessibilityLabel={`View ${item.name} profile`} style={s.card} onPress={() => router.push({pathname:'/student/[id]',params:{id:item.id}})}>
        <View style={s.avatar}><Ionicons name="person-outline" color={theme.primary} size={24}/></View>
        <View style={s.identity}><Text style={s.name}>{item.name}</Text><Text style={s.description}>{item.id} · Grade {item.grade}</Text></View>
        <Ionicons name="chevron-forward" color={theme.primary} size={20}/>
      </Pressable>}/>
    <SchoolBottomNav active="Profile"/>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:theme.background},header:{flexDirection:'row',alignItems:'center',padding:12,gap:8,borderBottomWidth:1,borderColor:theme.border},icon:{padding:10},title:{fontSize:20,fontWeight:'700',color:theme.primary},content:{padding:16,gap:12},intro:{gap:16,marginBottom:8},description:{fontSize:13,color:theme.muted,lineHeight:20},search:{minHeight:48,borderWidth:1,borderColor:theme.border,borderRadius:10,paddingHorizontal:14,backgroundColor:theme.surface,color:theme.text},card:{flexDirection:'row',alignItems:'center',gap:12,padding:16,backgroundColor:theme.surface,borderWidth:1,borderColor:theme.border,borderRadius:12},avatar:{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center',backgroundColor:theme.primarySoft},identity:{flex:1,gap:4},name:{fontSize:16,fontWeight:'600',color:theme.text},nav:{flexDirection:'row',backgroundColor:theme.surface,padding:8,borderTopWidth:1,borderColor:theme.border},navItem:{flex:1,alignItems:'center',padding:8,gap:4},
});
