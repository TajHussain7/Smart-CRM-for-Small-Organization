import { Text } from '@/components/responsive-text';
import { useWorkspace, type GymFeature } from '../workspace-store';
import React, { useState } from "react";
import { useWindowDimensions, View, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  gymStats,
  gymActions,
  revenuePeriods,
  membershipGrowth,
  recentCheckIns,
} from "./gym-data";
import { router } from "expo-router";

const BLUE = "#0755D7";

const C = {
  background: "#F7F9FC",
  white: "#FFFFFF",
  blue: BLUE,
  darkBlue: "#064BBC",
  text: "#202531",
  muted: "#667085",
  border: "#D5DBE6",
  lightBlue: "#CEDDF7",
  teal: "#007A89",
  red: "#CF202E",
};

// SVG paths for icons used in the dashboard.
const paths: Record<string, string> = {
  menu: "M4 7h16M4 12h16M4 17h16",
  members:
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM19 8v6M16 11h6",
  revenue:
    "M3 6h18v12H3zM7 10h10M7 14h10M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6",
  calendar:
    "M4 5h16v16H4zM8 3v4M16 3v4M4 10h16M8 14h3M8 17h3",
  training:
    "M7 4l3 3-3 3M17 20l-3-3 3-3M10 7h4a4 4 0 0 1 4 4M14 17h-4a4 4 0 0 1-4-4",
  renewal:
    "M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 12.5-2",
  clock:
    "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18ZM12 7v5l3 2",
  reports:
    "M4 4h16v16H4zM8 16v-4M12 16V8M16 16v-6",
  dashboard:
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  tasks:
    "M5 5h14v16H5zM9 3h6v4H9zM8 13l2 2 5-5",
  alerts:
    "M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10ZM10 21h4",
  profile:
    "M12 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
  plus: "M12 4v16M4 12h16",
  chevron: "M6 9l6 6 6-6",
  close: "M5 5l14 14M19 5L5 19",
  trend: "M3 17l6-6 4 4 8-8M16 7h5v5",
  search: "M11 19a8 8 0 1 0 0-16a8 8 0 0 0 0 16ZM17 17l5 5",
};

type IconName = keyof typeof paths;

function GymIcon({
  name,
  size = 21,
  color = BLUE,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'viewBox="0 0 24 24" fill="none" ' +
    'stroke="' + color + '" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' + paths[name] + '"/></svg>';

  return (
    <Image
      source={{
        uri:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(svg),
      }}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
    />
  );
}

// --------------------------------
// Main Dashboard
// --------------------------------

export default function GymDashboard() {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale > 1.3;
  const workspace = useWorkspace();
  const actionFeatures: Record<string, GymFeature> = { Members: "members", "Membership Renewal": "renewal", "Training Sessions": "training", Reports: "reports" };
  const actions = gymActions.filter(item => workspace.features.includes(actionFeatures[item.label]));
  const [period, setPeriod] =
    useState<keyof typeof revenuePeriods>("Last 30 Days");

  const [periodMenu, setPeriodMenu] = useState(false);
  const [checkInsExpanded, setCheckInsExpanded] =
    useState(false);

  const [menuVisible, setMenuVisible] = useState(false);

  const chart = revenuePeriods[period];

function handleAction(name: string) {
  // Gym Members Directory
  if (name === "Members") {
    router.push("/gym-members");
    return;
  }

  // Membership Renewal
  if (name === "Membership Renewal") {
    router.push("/gym-renewal");
    return;
  }

  // Gym Reports
  if (name === "Reports") {
    router.push("/gym-reports");
    return;
  }

  // Training session booking
  if (name === "Training Sessions") {
    router.push("/gym-training");
    return;
  }
}


  const visibleCheckIns = checkInsExpanded
    ? recentCheckIns
    : recentCheckIns.slice(0, 3);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          style={s.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Open Gym Menu"
        >
          <GymIcon name="menu" size={22} />
        </Pressable>

        <Text style={s.headerTitle}>
          School · Gym Module
        </Text>

        <Pressable
          style={s.headerAvatar}
          accessibilityRole="link" accessibilityLabel="Back to School workspace" onPress={() => router.replace("/school-dashboard")}
        >
          <Text style={s.headerAvatarText}>GC</Text>
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner */}
        <View style={s.welcomeBanner}>
          <Text style={s.welcomeTitle}>
            Gym Overview
          </Text>

          <Text style={s.welcomeDescription}>
            School workspace · Sample gym activity. Backend connection pending.
          </Text>
        </View>

        {/* KPI Cards */}
        <View style={s.statsGrid}>
          {gymStats.map((item) => (
            <View
              key={item.label}
              style={[s.statCard, compact && { width: '100%' }]}
            >
              <View style={s.statTop}>
                <Text style={s.statLabel}>
                  {item.label}
                </Text>
                <GymIcon
                  name={item.icon}
                  size={19}
                  color={item.color}
                />
              </View>

              <Text
                style={[
                  s.statValue,
                  item.label === "EXPIRING SOON" && {
                    color: C.red,
                  },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={s.quickSection}>
          <Text style={s.quickTitle}>
            Quick Actions
          </Text>

          <View style={s.quickGrid}>
            {actions.map((item) => (
              <Pressable
                key={item.label}
                style={s.quickAction}
                onPress={() => handleAction(item.label)}
              >
                <GymIcon
                  name={item.icon}
                  color="#282D39"
                  size={23}
                />

                <Text style={s.quickActionText}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Revenue Analytics */}
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <View>
              <Text style={s.panelTitle}>
                Revenue
              </Text>
              <Text style={s.panelTitle}>
                Analytics
              </Text>
            </View>

            <Pressable
              style={s.periodButton}
              onPress={() => setPeriodMenu(!periodMenu)}
            >
              <Text style={s.periodText}>
                {period}
              </Text>
              <GymIcon
                name="chevron"
                size={13}
                color="#536176"
              />
            </Pressable>
          </View>

          {periodMenu && (
            <View style={s.periodOptions}>
              {(Object.keys(
                revenuePeriods
              ) as (keyof typeof revenuePeriods)[]).map(
                (option) => (
                  <Pressable
                    key={option}
                    style={s.periodOption}
                    onPress={() => {
                      setPeriod(option);
                      setPeriodMenu(false);
                    }}
                  >
                    <Text style={s.periodOptionText}>
                      {option}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          )}

          <View style={s.chartArea}>
            {chart.values.map((value, index) => (
              <View
                key={chart.labels[index]}
                style={s.chartColumn}
              >
                <View style={s.barContainer}>
                  <View
                    style={[
                      s.chartBar,
                      {
                        height: `${value}%`,
                        backgroundColor:
                          C.lightBlue,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={s.chartLabel}
                  numberOfLines={1}
                >
                  {chart.labels[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Membership Growth */}
        <View style={[s.panel, s.growthPanel]}>
          <View style={s.growthHeading}>
            <Text style={s.panelTitle}>
              Membership Growth
            </Text>

            <View style={s.trendWrap}>
              <GymIcon
                name="trend"
                size={14}
                color="#008A99"
              />
              <Text style={s.trendText}>
                +12%
              </Text>
            </View>
          </View>

          {membershipGrowth.map((item, index) => (
            <View
              key={item.label}
              style={[
                s.growthItem,
                index === 0 && {
                  marginBottom: 13,
                },
              ]}
            >
              <View
                style={[
                  s.growthIcon,
                  {
                    backgroundColor:
                      index === 0
                        ? "#E3F4F5"
                        : "#E8EFFF",
                  },
                ]}
              >
                <GymIcon
                  name={item.icon}
                  size={19}
                  color={item.color}
                />
              </View>

              <View style={s.growthContent}>
                <View style={s.growthRow}>
                  <Text style={s.growthLabel}>
                    {item.label}
                  </Text>
                  <Text style={s.growthCount}>
                    {item.value}
                  </Text>
                </View>

                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Check-ins */}
        <View style={[s.panel, s.checkInsPanel]}>
          <View style={s.checkInsHeader}>
            <Text style={s.panelTitle}>
              Recent Check-ins
            </Text>

            <Pressable
              onPress={() =>
                setCheckInsExpanded(!checkInsExpanded)
              }
            >
              <Text style={s.viewAll}>
                {checkInsExpanded ? "Show Less" : "View All"}
              </Text>
            </Pressable>
          </View>

          {visibleCheckIns.map((member, index) => (
            <View
              key={member.id}
              style={[
                s.checkInRow,
                index !== visibleCheckIns.length - 1 &&
                  s.checkInDivider,
              ]}
            >
              <View style={s.memberAvatar}>
                <Text style={s.memberInitials}>
                  {member.name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")}
                </Text>
              </View>

              <View style={s.memberInfo}>
                <Text style={s.memberName}>
                  {member.name}
                </Text>
                <Text style={s.memberPlan}>
                  {member.plan}
                </Text>
              </View>

              <View style={s.checkInRight}>
                <Text style={s.checkInTime}>
                  {member.time}
                </Text>
                <View
                  style={[
                    s.statusPill,
                    member.status === "EXPIRING"
                      ? s.expiringPill
                      : s.activePill,
                  ]}
                >
                  <Text
                    style={[
                      s.statusText,
                      {
                        color:
                          member.status === "EXPIRING"
                            ? "#C62936"
                            : "#007A89",
                      },
                    ]}
                  >
                    {member.status === "EXPIRING"
                      ? "Expiring"
                      : "Active"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      {workspace.features.includes("members") && <Pressable
  style={s.floatingAdd}
  onPress={() => router.push("/gym-add-member")}
  accessibilityRole="button"
  accessibilityLabel="Add new gym member"
>
        <GymIcon
          name="plus"
          size={27}
          color="#FFFFFF"
        />
      </Pressable>}

      <View style={s.bottomNav}>
        <Pressable accessibilityRole="link" style={s.bottomItem} onPress={() => router.replace('/school-dashboard')}><GymIcon name="dashboard"/><Text style={s.bottomLabel}>School</Text></Pressable>
        <View accessibilityRole="text" style={[s.bottomItem,s.bottomActive]}><GymIcon name="dashboard" color="white"/><Text style={[s.bottomLabel,{color:'white'}]}>Gym Overview</Text></View>
        {workspace.features.includes('members') && <Pressable accessibilityRole="link" style={s.bottomItem} onPress={() => router.push('/gym-members')}><GymIcon name="members"/><Text style={s.bottomLabel}>Members</Text></Pressable>}
      </View>

      {/* Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeading}>
              <Text style={s.modalTitle}>
                Gym Menu
              </Text>
              <Pressable
                onPress={() => setMenuVisible(false)}
              >
                <GymIcon name="close" />
              </Pressable>
            </View>

            {actions.map((item) => (
              <Pressable
                key={item.label}
                style={s.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleAction(item.label);
                }}
              >
                <GymIcon name={item.icon} />
                <Text style={s.menuItemText}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --------------------------------
// Styles
// --------------------------------

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E7F0",
    gap: 12,
  },
  menuButton: {
    width: 28,
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: BLUE,
    fontSize: 19,
    fontWeight: "600",
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#153E53",
    borderWidth: 2,
    borderColor: "#D5E5EB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  welcomeBanner: {
    backgroundColor: "#2862EA",
    paddingHorizontal: 24,
    paddingVertical: 23,
    borderRadius: 12,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: C.white,
    marginBottom: 8,
  },
  welcomeDescription: {
    color: "#E6EDFF",
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 340,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    minHeight: 112,
    padding: 15,
    backgroundColor: C.white,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 11,
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#1B3456",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: "#606979",
    flex: 1,
  },
  statValue: {
    fontSize: 27,
    fontWeight: "700",
    color: C.text,
    marginTop: 13,
  },
  quickSection: {
    marginTop: 23,
    marginBottom: 26,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: C.text,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  quickAction: {
    width: "47%",
    flexGrow: 1,
    height: 89,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: C.text,
    fontWeight: "500",
    textAlign: "center",
  },
  panel: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    padding: 17,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#253B5C",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: C.text,
    lineHeight: 22,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 4,
  },
  periodText: {
    fontSize: 11,
    color: BLUE,
  },
  periodOptions: {
    alignSelf: "flex-end",
    backgroundColor: "#F4F7FD",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 7,
    marginTop: 7,
    width: 145,
  },
  periodOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E9F2",
  },
  periodOptionText: {
    fontSize: 12,
    color: C.text,
  },
  chartArea: {
    flexDirection: "row",
    height: 208,
    gap: 3,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    height: 172,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  chartLabel: {
    fontSize: 10,
    color: "#535B6C",
    marginTop: 12,
  },
  growthPanel: {
    paddingBottom: 21,
  },
  growthHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 23,
  },
  trendWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendText: {
    fontSize: 12,
    color: "#008A99",
    fontWeight: "700",
  },
  growthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  growthIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  growthContent: {
    flex: 1,
  },
  growthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  growthLabel: {
    fontSize: 13,
    color: C.text,
  },
  growthCount: {
    fontSize: 12,
    color: C.text,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E8EAEE",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  checkInsPanel: {
    paddingBottom: 5,
  },
  checkInsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 11,
    color: BLUE,
  },
  checkInRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  checkInDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAF0",
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#153C4B",
    alignItems: "center",
    justifyContent: "center",
  },
  memberInitials: {
    color: "#E1F5F4",
    fontSize: 11,
    fontWeight: "700",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
  },
  memberPlan: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },
  checkInRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  checkInTime: {
    fontSize: 10,
    fontWeight: "500",
    color: C.text,
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePill: {
    backgroundColor: "#DDF5F3",
  },
  expiringPill: {
    backgroundColor: "#FDE3E5",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "600",
  },
  floatingAdd: {
    position: "absolute",
    bottom: 83,
    right: 19,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomNav: {
    minHeight: 65,
    backgroundColor: "#F9FAFC",
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 6,
  },
  bottomItem: {
    flex: 1,
    minHeight: 51,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 26,
  },
  bottomActive: {
    backgroundColor: "#2862EA",
  },
  bottomLabel: {
    fontSize: 10,
    color: "#515B6E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: C.white,
    padding: 20,
    borderRadius: 14,
    gap: 8,
  },
  modalHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: C.text,
  },
  menuItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EBF1",
  },
  menuItemText: {
    fontSize: 14,
    color: C.text,
  },
});
