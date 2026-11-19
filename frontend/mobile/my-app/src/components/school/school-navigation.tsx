import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../responsive-text';
import WorkspaceMenu from '../workspace-menu';
import Icon from './school-icon';

const destinations = [
  { label: 'Dashboard', icon: 'dashboard', route: '/school-dashboard' },
  { label: 'Tasks', icon: 'tasks', route: '/students' },
  { label: 'Alerts', icon: 'alerts', route: '/alerts' },
  { label: 'Profile', icon: 'profile', route: '/settings' },
] as const;

export function SchoolBottomNav({active}:{active?:typeof destinations[number]['label']}) {
  return <View style={s.bar}>{destinations.map(item => <Pressable key={item.label} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{selected:active===item.label}} style={[s.tab,active===item.label&&s.selected]} onPress={()=>router.replace(item.route)}><Icon name={item.icon} color={active===item.label?'white':'#59677e'} size={22}/><Text style={[s.label,active===item.label&&s.white]}>{item.label}</Text></Pressable>)}</View>;
}

export function SchoolMenuButton() {
  const [open,setOpen]=useState(false);
  return <><Pressable accessibilityRole="button" accessibilityLabel="Open workspace menu" style={s.menu} onPress={()=>setOpen(true)}><Icon name="menu" size={25}/></Pressable>{open&&<WorkspaceMenu initialModule="School" onClose={()=>setOpen(false)}/>}</>;
}

const s=StyleSheet.create({bar:{flexDirection:'row',gap:4,paddingHorizontal:8,paddingVertical:8,borderTopWidth:1,borderColor:'#dce3ee',backgroundColor:'white'},tab:{flex:1,minWidth:0,minHeight:52,paddingVertical:6,paddingHorizontal:2,alignItems:'center',justifyContent:'center',gap:4,borderRadius:22},selected:{backgroundColor:'#2864ed'},label:{fontSize:12,color:'#59677e',textAlign:'center'},white:{color:'white'},menu:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'}});
