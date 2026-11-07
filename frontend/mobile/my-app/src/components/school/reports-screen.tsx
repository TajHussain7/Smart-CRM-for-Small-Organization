import { Text } from '@/components/responsive-text';
import { schoolTheme } from './theme';
import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

// ------------------------------
// Theme colors
// ------------------------------

const COLORS = {
  primary: schoolTheme.primary,
  chartBlue: "#2863ED",
  background: schoolTheme.background,
  white: schoolTheme.surface,
  text: schoolTheme.text,
  muted: schoolTheme.muted,
  border: schoolTheme.border,
  lightBlue: "#D6E4FF",
  teal: "#006A7C",
  track: "#E5E7EB",
};

// ------------------------------
// Temporary frontend mock data
// ------------------------------

const summary = [
  {
    id: "attendance",
    title: "Avg Attendance",
    value: "92%",
    change: "2%",
    positive: true,
  },
  {
    id: "revenue",
    title: "Total Revenue",
    value: "$12.4k",
    change: "8%",
    positive: true,
  },
  {
    id: "pending",
    title: "Pending Fees",
    value: "15",
    change: "3%",
    positive: false,
  },
];

const attendance = [
  { day: "Mon", value: 80 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 95 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 91 },
];

const revenue = [
  {
    name: "Tuition",
    amount: 8200,
    color: schoolTheme.primary,
  },
  {
    name: "Facilities",
    amount: 3100,
    color: "#006A7C",
  },
  {
    name: "Other",
    amount: 1100,
    color: "#536176",
  },
];

type PaymentStatus = "PAID" | "OVERDUE" | "PROCESSING";

type Payment = {
  id: string;
  initials: string;
  name: string;
  className: string;
  date: string;
  amount: number;
  status: PaymentStatus;
};

const payments: Payment[] = [
  {
    id: "1",
    initials: "JD",
    name: "Jane Doe",
    className: "Class 4A",
    date: "14 Oct",
    amount: 450,
    status: "PAID",
  },
  {
    id: "2",
    initials: "MS",
    name: "Mark Smith",
    className: "Class 3B",
    date: "12 Oct",
    amount: 320,
    status: "OVERDUE",
  },
  {
    id: "3",
    initials: "AW",
    name: "Alice Wong",
    className: "Class 4A",
    date: "11 Oct",
    amount: 500,
    status: "PROCESSING",
  },
];

const formatMoney = (value: number) =>
  "$" + value.toLocaleString("en-US");

// ------------------------------
// Summary KPI Card
// ------------------------------

function SummaryCard({
  item,
}: {
  item: (typeof summary)[number];
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        {item.title}
      </Text>

      <View style={styles.summaryBottom}>
        <Text
          style={[
            styles.summaryValue,
            !item.positive && styles.negativeValue,
          ]}
        >
          {item.value}
        </Text>

        <View style={styles.changeWrap}>
          <Ionicons
            name={
              item.positive
                ? "trending-up"
                : "trending-down"
            }
            size={14}
            color={
              item.positive ? "#006A7C" : "#B91C1C"
            }
          />

          <Text
            style={[
              styles.changeText,
              !item.positive && {
                color: "#B91C1C",
              },
            ]}
          >
            {item.change}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ------------------------------
// Attendance Bar Chart
// ------------------------------

function AttendanceChart() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>
          Attendance Trends
        </Text>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Attendance Details",
              "Detailed attendance reports will be connected later."
            )
          }
        >
          <Text style={styles.detailsLink}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartColumns}>
          {attendance.map((item) => {
            const highlighted = item.day === "Wed";

            return (
              <View
                key={item.day}
                style={styles.chartColumn}
              >
                <Text
                  style={[
                    styles.chartValue,
                    highlighted && {
                      color: COLORS.primary,
                    },
                  ]}
                >
                  {item.value}%
                </Text>

                <View style={styles.chartBarArea}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${item.value}%`,
                        backgroundColor: highlighted
                          ? COLORS.chartBlue
                          : COLORS.lightBlue,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.chartDay}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ------------------------------
// Revenue Growth
// ------------------------------

function RevenueGrowth() {
  const total = revenue.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Revenue Growth
      </Text>

      <View style={styles.revenueCard}>
        <View style={styles.revenueHeader}>
          <Ionicons
            name="cash-outline"
            size={22}
            color={COLORS.primary}
          />

          <Text style={styles.revenueHeaderText}>
            MONTHLY OVERVIEW
          </Text>
        </View>

        <View style={styles.revenueBody}>
          {revenue.map((item) => {
            const percentage =
              (item.amount / total) * 100;

            return (
              <View
                key={item.name}
                style={styles.revenueItem}
              >
                <View style={styles.revenueRow}>
                  <Text style={styles.revenueName}>
                    {item.name}
                  </Text>

                  <Text style={styles.revenueAmount}>
                    {formatMoney(item.amount)}
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ------------------------------
// Payment Status
// ------------------------------

function PaymentBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const options = {
    PAID: {
      background: "#DCFCE7",
      text: "#15803D",
    },
    OVERDUE: {
      background: "#FEE2E2",
      text: "#B91C1C",
    },
    PROCESSING: {
      background: "#D9E6FF",
      text: "#536176",
    },
  };

  const selected = options[status];

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: selected.background },
      ]}
    >
      <Text
        style={[
          styles.statusText,
          { color: selected.text },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

// ------------------------------
// Recent Payments
// ------------------------------

function RecentPayments() {
  // Ready for additional mock records or API data.
  const visiblePayments = payments.slice(0, 3);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Recent Payments
      </Text>

      <View style={styles.paymentsCard}>
        {visiblePayments.map((payment, index) => (
          <View
            key={payment.id}
            style={[
              styles.paymentRow,
              index !== visiblePayments.length - 1 &&
                styles.paymentDivider,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {payment.initials}
              </Text>
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>
                {payment.name}
              </Text>

              <Text style={styles.paymentDetail}>
                {payment.className} • {payment.date}
              </Text>
            </View>

            <View style={styles.paymentRight}>
              <Text style={styles.paymentAmount}>
                {formatMoney(payment.amount)}.00
              </Text>

              <PaymentBadge status={payment.status} />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() =>
            Alert.alert(
              "Payments",
              "Full payment history will be available when the payments module is integrated."
            )
          }
        >
          <Text style={styles.showMoreText}>
            Show More Payments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------------------
// Main Reports Screen
// ------------------------------

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Summary Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryList}
        >
          {summary.map((item) => (
            <SummaryCard key={item.id} item={item} />
          ))}
        </ScrollView>

        {/* Attendance */}
        <AttendanceChart />

        {/* Revenue */}
        <RevenueGrowth />

        {/* Recent Payments */}
        <RecentPayments />

        {/* Export Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.exportButton}
          onPress={() =>
            Alert.alert(
              "Export Reports",
              "PDF/CSV export will be enabled later."
            )
          }
        >
          <Ionicons
            name="download-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.exportText}>
            Export PDF/CSV
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ------------------------------
// Styles
// ------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingTop: 14,
    paddingBottom: 28,
  },

  // Summary Cards
  summaryList: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 5,
  },

  summaryCard: {
    width: 163,
    minHeight: 86,
    padding: 13,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "space-between",
  },

  summaryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#454B5B",
    letterSpacing: 0.2,
  },

  summaryBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },

  negativeValue: {
    color: "#B91C1C",
  },

  changeWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },

  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#006A7C",
  },

  // Common Section
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },

  detailsLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },

  // Attendance Chart
  chartCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingTop: 20,
    paddingBottom: 14,
  },

  chartColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 185,
    gap: 9,
  },

  chartColumn: {
    flex: 1,
    alignItems: "center",
  },

  chartValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  chartBarArea: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },

  chartBar: {
    width: "100%",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },

  chartDay: {
    marginTop: 13,
    color: COLORS.muted,
    fontSize: 12,
  },

  // Revenue
  revenueCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    overflow: "hidden",
  },

  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F6FC",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  revenueHeaderText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  revenueBody: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 17,
  },

  revenueItem: {
    gap: 7,
  },

  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  revenueName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },

  revenueAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },

  progressTrack: {
    height: 9,
    backgroundColor: COLORS.track,
    borderRadius: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  // Recent Payments
  paymentsCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: "hidden",
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 15,
    gap: 11,
  },

  paymentDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  avatar: {
    width: 43,
    height: 43,
    backgroundColor: "#E5E7EB",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#454B5B",
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  paymentDetail: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },

  paymentRight: {
    alignItems: "flex-end",
    gap: 5,
  },

  paymentAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 9,
    alignSelf: "flex-end",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  showMoreButton: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },

  showMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.muted,
  },

  // Export Button
  exportButton: {
    marginTop: 28,
    marginHorizontal: 16,
    height: 56,
    borderRadius: 11,
    backgroundColor: COLORS.chartBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#1649BD",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  exportText: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.white,
  },
});
