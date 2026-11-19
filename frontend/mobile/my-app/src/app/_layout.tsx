import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return <View style={{ flex: 1, width: '100%', maxWidth: 840, alignSelf: 'center', backgroundColor: '#f7f8fa' }}><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f7f8fa' } }} /></View>;
}
