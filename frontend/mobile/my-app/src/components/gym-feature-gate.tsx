import { Text } from '@/components/responsive-text';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkspace, type GymFeature } from './workspace-store';
export default function GymFeatureGate({ feature, children }: { feature: GymFeature | 'dashboard'; children: ReactNode }) {
  const workspace = useWorkspace();
  if (workspace.gym && (feature === 'dashboard' || workspace.features.includes(feature))) return children;
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f9fc' }}><View style={{ padding: 24, gap: 20 }}><Text style={{ fontSize: 22 }}>Feature not enabled</Text><Text>This Gym feature is not selected for your School workspace.</Text><Pressable accessibilityRole="link" onPress={() => router.replace('/school-dashboard')}><Text style={{ color: '#0754d5' }}>Back to School workspace</Text></Pressable></View></SafeAreaView>;
}
