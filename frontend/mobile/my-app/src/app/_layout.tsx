import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initialize, useSession } from '../live/session';
export default function Layout(){
  const {ready,user}=useSession();const segments=useSegments();
  useEffect(()=>{initialize();},[]);
  useEffect(()=>{
    if(!ready)return;
    const first=(segments as string[])[0];
    const auth=!first||first==='create-workspace';
    if(!user&&!auth)router.replace('/');
  },[ready,user,segments]);
  if(!ready)return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator/></View>;
  return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false}}/></>;
}
