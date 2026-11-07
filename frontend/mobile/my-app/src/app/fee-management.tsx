import AccountButton from '@/components/account-button';
import { SchoolMenuButton } from '@/components/school/school-navigation';
import { Text } from '@/components/responsive-text';
import { schoolTheme } from '@/components/school/theme';

import React from "react";
import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

import FeeManagementScreen from "@/components/school/fee-management-screen";

export default function FeeManagementPage() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}><SchoolMenuButton/>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={schoolTheme.primary}
          />
        </Pressable>

        <Text style={styles.title}>
          Fee Management
        </Text>

        <View style={styles.spacer} />

        <Pressable
          onPress={() => {}}
          style={styles.iconButton}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={schoolTheme.primary}
          />
        </Pressable>

        <AccountButton/>
      </View>

      <FeeManagementScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: schoolTheme.background,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: schoolTheme.surface,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: schoolTheme.border,
  },
  backButton: {
    padding: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: schoolTheme.primary,
  },
  spacer: {
    flex: 1,
  },
  iconButton: {
    padding: 3,
  },
});
