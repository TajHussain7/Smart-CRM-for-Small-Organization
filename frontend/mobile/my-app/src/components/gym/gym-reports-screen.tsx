import { Text } from '@/components/responsive-text';

import React, { useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#0754D5";

const C = {
  blue: BLUE,
  accent: "#2865EE",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#202630",
  muted: "#737C8C",
  border: "#D7DDE8",
  pale: "#D3E0F7",
  teal: "#007989",
};

const paths: Record<string, string> = {
  menu: "M4 7h16M4 12h16M4 17h16",
  dashboard:
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  reports:
    "M4 4h16v16H4zM8 16v-4M12 16V8M16 16v-6",
  tasks:
    "M5 5h14v16H5zM9 3h6v4H9zM8 13l2 2 5-5",
  profile:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
  arrow:
    "M19 12H5M12 5l-7 7 7 7",
  download:
    "M12 3v12M7 10l5 5 5-5M4 17v4h16v-4",
  trend:
    "M3 17l6-6 4 4 8-8M16 7h5v5",
  members:
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M16 11h6",
  fees: "M3 6h18v12H3zM7 10h10M7 14h10",
  training:
    "M7 4l3 3-3 3M17 20l-3-3 3-3M10 7h4a4 4 0 0 1 4 4M14 17h-4a4 4 0 0 1-4-4",
  bag: "M4 8h16v13H4zM9 8V6a3 3 0 0 1 6 0v2",
  chevron: "M6 9l6 6 6-6",
};

function Icon({
  name,
  color = BLUE,
  size = 18,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="1.8" ` +
    `stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${paths[name] || paths.reports}"/>` +
    `</svg>`;

  return (
    <Image
      source={{
        uri:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(svg),
      }}
      style={{ width: size, height: size }}
    />
  );
}

// Mock frontend values
const metrics = [
  {
    label: "Total Revenue",
    value: "$15k",
    note: "↗ +12.5%",
    noteColor: "#008B85",
  },
  {
    label: "Active Members",
    value: "250",
    note: "♧ +5 new",
    noteColor: "#008B85",
  },
  {
    label: "New Signups",
    value: "32",
    note: "Last 30 days",
    noteColor: "#737C8C",
  },
  {
    label: "Retention Rate",
    value: "92%",
    note: "",
    noteColor: "#737C8C",
  },
];

const revenueByPeriod = {
  "Last 30 Days": {
    labels: ["Oct 01", "Oct 15", "Oct 30"],
    values: [38, 66, 53, 91, 75, 60, 94],
  },
  "Last 3 Months": {
    labels: ["Aug", "Sep", "Oct"],
    values: [46, 54, 65, 60, 77, 83, 94],
  },
  "Last 6 Months": {
    labels: ["May", "Jul", "Oct"],
    values: [30, 42, 50, 63, 75, 84, 97],
  },
} as const;

type Period = keyof typeof revenueByPeriod;

const revenueRows = [
  {
    title: "Membership Fees",
    amount: "$10,250",
    icon: "fees",
  },
  {
    title: "Personal Training",
    amount: "$3,800",
    icon: "training",
  },
  {
    title: "Merchandise",
    amount: "$950",
    icon: "bag",
  },
];

function MetricCard({
  item,
}: {
  item: (typeof metrics)[number];
}) {
  return (
    <View style={s.metric}>
      <Text style={s.metricLabel}>
        {item.label}
      </Text>
      <Text style={s.metricValue}>
        {item.value}
      </Text>

      {item.label === "Retention Rate" ? (
        <View style={s.retentionTrack}>
          <View style={s.retentionFill} />
        </View>
      ) : (
        <Text
          style={[
            s.metricNote,
            { color: item.noteColor },
          ]}
        >
          {item.note}
        </Text>
      )}
    </View>
  );
}

// Membership growth illustration
function GrowthCurve() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 104">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C8DEFF"
            stop-opacity=".45"/>
          <stop offset="100%" stop-color="#FFFFFF"
            stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path
        d="M3 96 C60 89 104 75 147 58
           S232 15 312 12 L312 104 L3 104 Z"
        fill="url(#fill)"/>
      <path
        d="M3 96 C60 89 104 75 147 58
           S232 15 312 12"
        fill="none"
        stroke="#0754D5"
        stroke-width="5"
        stroke-linecap="round"/>
    </svg>
  `;

  return (
    <View style={s.growthChart}>
      <Image
        source={{
          uri:
            "data:image/svg+xml;utf8," +
            encodeURIComponent(svg),
        }}
        style={s.growthImage}
        contentFit="fill"
      />

      <View style={s.growthTag}>
        <Text style={s.growthTagText}>
          +22% Trend
        </Text>
      </View>
    </View>
  );
}

function PlanDonut() {
  const circumference = 2 * Math.PI * 34;
  const premium = circumference * 0.65;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="34"
        fill="none" stroke="#E5E8ED"
        stroke-width="11"/>
      <circle cx="50" cy="50" r="34"
        fill="none" stroke="#0754D5"
        stroke-width="11"
        stroke-dasharray="${premium} ${circumference}"
        transform="rotate(-90 50 50)"/>
    </svg>
  `;

  return (
    <View style={s.donutContainer}>
      <Image
        source={{
          uri:
            "data:image/svg+xml;utf8," +
            encodeURIComponent(svg),
        }}
        style={s.donutImage}
      />
      <Text style={s.donutCenter}>65%</Text>
    </View>
  );
}

export default function GymReportsScreen() {
  const [period, setPeriod] =
    useState<Period>("Last 30 Days");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedBar, setSelectedBar] =
    useState<number | null>(null);
  const [selectedRevenue, setSelectedRevenue] =
    useState<string | null>(null);

  const chart = revenueByPeriod[period];

  function placeholder(title: string) {
    Alert.alert(
      title,
      "This feature will be connected in a later phase."
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Icon name="arrow" size={19} />
        </Pressable>

        <Text style={s.headerTitle}>
          Reports
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          style={s.avatar}
          onPress={() => placeholder("Gym Profile")}
          accessibilityLabel="Gym profile"
        >
          <Text style={s.avatarText}>GC</Text>
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI cards */}
        <View style={s.metricsGrid}>
          {metrics.map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </View>

        {/* Revenue Analytics */}
        <View style={s.section}>
          <View style={s.sectionHeading}>
            <Text style={s.sectionTitle}>
              Revenue Analytics
            </Text>

            <Pressable
              onPress={() => setPeriodOpen(!periodOpen)}
              style={s.periodTrigger}
            >
              <Text style={s.periodText}>
                {period}
              </Text>
              <Icon
                name="chevron"
                size={12}
                color="#637086"
              />
            </Pressable>
          </View>

          {periodOpen && (
            <View style={s.periodOptions}>
              {(
                Object.keys(revenueByPeriod) as Period[]
              ).map((value) => (
                <Pressable
                  key={value}
                  style={s.periodOption}
                  onPress={() => {
                    setPeriod(value);
                    setSelectedBar(null);
                    setPeriodOpen(false);
                  }}
                >
                  <Text style={s.periodOptionText}>
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={s.revenueCard}>
            <View style={s.barChart}>
              {chart.values.map((value, index) => {
                const highlighted =
                  selectedBar === index ||
                  (selectedBar === null && index === 3);

                return (
                  <Pressable
                    key={`${period}-${index}`}
                    style={s.barColumn}
                    onPress={() => setSelectedBar(index)}
                    accessibilityLabel={`Revenue bar ${index + 1}: ${value}`}
                  >
                    <View
                      style={[
                        s.bar,
                        {
                          height: `${value}%`,
                          backgroundColor: highlighted
                            ? BLUE
                            : index > 3
                              ? "#6897E0"
                              : "#ADC8F2",
                        },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>

            <View style={s.chartAxis}>
              {chart.labels.map((label) => (
                <Text key={label} style={s.axisLabel}>
                  {label}
                </Text>
              ))}
            </View>

            {selectedBar !== null && (
              <Text style={s.selectedBarText}>
                Selected period value: {chart.values[selectedBar]}
              </Text>
            )}
          </View>
        </View>

        {/* Membership Analytics */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Membership Analytics
          </Text>

          <View style={s.analyticsCard}>
            <Text style={s.cardCaption}>
              Membership Growth
            </Text>
            <GrowthCurve />
          </View>

          <View style={[s.analyticsCard, s.planCard]}>
            <Text style={s.cardCaption}>
              Plan Distribution
            </Text>

            <View style={s.planContent}>
              <PlanDonut />

              <View style={s.planLegend}>
                <View style={s.legendRow}>
                  <View style={s.legendTitle}>
                    <View style={s.blueDot} />
                    <Text style={s.legendText}>
                      Premium
                    </Text>
                  </View>
                  <Text style={s.legendCount}>162</Text>
                </View>

                <View style={s.legendRow}>
                  <View style={s.legendTitle}>
                    <View style={s.grayDot} />
                    <Text style={s.legendText}>
                      Standard
                    </Text>
                  </View>
                  <Text style={s.legendCount}>88</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Revenue Summaries */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Revenue Summaries
          </Text>

          <View style={s.summaryCard}>
            <View style={s.tableHeading}>
              <Text style={s.tableHeadingText}>
                CATEGORY
              </Text>
              <Text style={s.tableHeadingText}>
                AMOUNT
              </Text>
            </View>

            {revenueRows.map((item) => (
              <Pressable
                key={item.title}
                style={s.revenueRow}
                onPress={() =>
                  setSelectedRevenue(
                    selectedRevenue === item.title
                      ? null
                      : item.title
                  )
                }
              >
                <View style={s.revenueTitleGroup}>
                  <Icon name={item.icon} size={17} />
                  <Text style={s.revenueName}>
                    {item.title}
                  </Text>
                </View>

                <Text style={s.revenueAmount}>
                  {item.amount}
                </Text>

                {selectedRevenue === item.title && (
                  <Text style={s.rowDetail}>
                    {item.title} revenue for the reporting period.
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Export */}
        <View style={s.exportArea}>
          <Pressable
            style={s.exportButton}
            onPress={() => placeholder("Export PDF / CSV")}
          >
            <Icon
              name="download"
              color="#FFFFFF"
              size={19}
            />
            <Text style={s.exportText}>
              Export PDF / CSV
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom navigation as in screenshot */}
      <View style={s.bottomNav}>
        {(
          [
            { label: "Dashboard", icon: "dashboard" },
            { label: "Reports", icon: "reports" },
            { label: "Tasks", icon: "tasks" },
            { label: "Profile", icon: "profile" },
          ] as const
        ).map((item) => {
          const active = item.label === "Reports";

          return (
            <Pressable
              key={item.label}
              style={[s.navItem, active && s.activeNav]}
              onPress={() => {
                if (item.label === "Dashboard") {
                  router.replace("/school-dashboard");
                } else if (!active) {
                  placeholder(item.label);
                }
              }}
            >
              <Icon
                name={item.icon}
                size={18}
                color={active ? "#FFFFFF" : "#526075"}
              />
              <Text
                style={[
                  s.navLabel,
                  active && s.activeNavLabel,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: BLUE,
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: "#164E68",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D3E2EF",
  },
  avatarText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 22,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 23,
  },
  metric: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 13,
    minHeight: 93,
    justifyContent: "space-between",
  },
  metricLabel: {
    color: "#697285",
    fontSize: 11,
    fontWeight: "600",
  },
  metricValue: {
    color: BLUE,
    fontSize: 25,
    fontWeight: "700",
    marginTop: 5,
  },
  metricNote: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 5,
  },
  retentionTrack: {
    height: 5,
    backgroundColor: "#E7EDF4",
    borderRadius: 5,
    marginTop: 7,
    overflow: "hidden",
  },
  retentionFill: {
    width: "92%",
    height: "100%",
    backgroundColor: C.teal,
    borderRadius: 5,
  },
  section: {
    marginBottom: 21,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  periodTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  periodText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "500",
  },
  periodOptions: {
    alignSelf: "flex-end",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    marginBottom: 9,
    width: 150,
    overflow: "hidden",
  },
  periodOption: {
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEFF5",
  },
  periodOptionText: {
    color: C.text,
    fontSize: 12,
  },
  revenueCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingTop: 23,
    paddingBottom: 14,
  },
  barChart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE2EC",
    paddingBottom: 1,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },
  axisLabel: {
    fontSize: 10,
    color: "#6B7483",
  },
  selectedBarText: {
    color: BLUE,
    fontSize: 10,
    marginTop: 9,
    textAlign: "center",
  },
  analyticsCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    padding: 14,
    marginTop: 9,
  },
  cardCaption: {
    fontSize: 12,
    color: "#626C7D",
    fontWeight: "600",
  },
  growthChart: {
    height: 110,
    marginTop: 8,
  },
  growthImage: {
    width: "100%",
    height: "100%",
  },
  growthTag: {
    position: "absolute",
    right: 3,
    top: 4,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  growthTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.white,
  },
  planCard: {
    marginTop: 10,
  },
  planContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  donutContainer: {
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  donutImage: {
    width: 96,
    height: 96,
    position: "absolute",
  },
  donutCenter: {
    fontSize: 13,
    color: BLUE,
    fontWeight: "700",
  },
  planLegend: {
    flex: 1,
    gap: 15,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendText: {
    color: C.text,
    fontSize: 12,
  },
  legendCount: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
  },
  blueDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: BLUE,
  },
  grayDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#DADDE3",
  },
  summaryCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    overflow: "hidden",
  },
  tableHeading: {
    height: 45,
    backgroundColor: "#F2F5FA",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableHeadingText: {
    fontSize: 10,
    color: "#687184",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  revenueRow: {
    minHeight: 58,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E9F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  revenueTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  revenueName: {
    color: C.text,
    fontSize: 12,
  },
  revenueAmount: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  rowDetail: {
    color: C.muted,
    fontSize: 11,
    width: "100%",
    marginTop: 10,
  },
  exportArea: {
    backgroundColor: "#EFF4FA",
    borderRadius: 11,
    paddingHorizontal: 3,
    paddingTop: 45,
    paddingBottom: 5,
    marginTop: 1,
  },
  exportButton: {
    height: 56,
    backgroundColor: "#2865EE",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  exportText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFC",
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  navItem: {
    flex: 1,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    gap: 3,
  },
  activeNav: {
    backgroundColor: "#2865EE",
  },
  navLabel: {
    color: "#596477",
    fontSize: 10,
  },
  activeNavLabel: {
    color: C.white,
  },
});
