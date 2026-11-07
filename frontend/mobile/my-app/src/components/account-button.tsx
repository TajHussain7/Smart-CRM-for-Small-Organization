import { Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAccount } from './account-store';
import { Text } from './responsive-text';
export default function AccountButton(){const account=useAccount();return <Pressable accessibilityRole="button" accessibilityLabel="Open profile settings" onPress={()=>router.push('/settings')} style={{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center',marginLeft:'auto'}}>{account.photo?<Image source={{uri:account.photo}} style={{width:34,height:34,borderRadius:17}}/>:<Text style={{color:'#0755d7',fontWeight:'700'}}>{account.name.split(' ').slice(0,2).map(n=>n[0]).join('')}</Text>}</Pressable>;}
