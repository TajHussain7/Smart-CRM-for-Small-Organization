import { Text } from '@/components/responsive-text';

import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { GymMember } from "./members-data";
import {
  getMemberProfile,
  type MemberPayment,
} from "./member-profile-data";

const BLUE = "#0755D7";

const C = {
  blue: BLUE,
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#20242D",
  muted: "#737C8D",
  border: "#D7DEEA",
  teal: "#007E8A",
  green: "#17B96C",
};

const paths: Record<string, string> = {
  back: "M19 12H5m7-7-7 7 7 7",
  edit: "M4 20l4-1 12-12-3-3L5 16zM15 5l3 3",
  mail: "M3 5h18v14H3zM3 6l9 8 9-8",
  phone:
    "M6 3h4l1 5-2 2a15 15 0 0 0 5 5l2-2 5 1v4c0 2-2 3-4 3C9 20 4 15 3 7c0-2 1-4 3-4",
  location:
    "M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  calendar:
    "M4 5h16v16H4zM8 3v4M16 3v4M4 10h16",
  shield:
    "M12 2l8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6zM9 12l2 2 4-4",
  renew:
    "M20 7v5h-5M4 17v-5h5M5 9a7 7 0 0 1 13-2l2 5M4 12l2 5a7 7 0 0 0 13-2",
  clock:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2",
  check:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM7 12l3 3 7-7",
  download:
    "M12 3v12M7 10l5 5 5-5M4 17v4h16v-4",
  dashboard:
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  tasks:
    "M5 5h14v16H5zM9 3h6v4H9zM8 13l2 2 5-5",
  alerts:
    "M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10ZM10 21h4",
  profile:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
};

function Icon({
  name,
  size = 18,
  color = BLUE,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'viewBox="0 0 24 24" fill="none" ' +
    `stroke="${color}" stroke-width="1.8" ` +
    'stroke-linecap="round" stroke-linejoin="round">' +
    `<path d="${paths[name] || paths.profile}"/></svg>`;

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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={s.infoRow}>
      <Icon name={icon} size={17} color="#566176" />

      <View style={s.infoContent}>
        <Text style={s.infoLabel}>
          {label}
        </Text>
        <Text style={s.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function PaymentRow({
  payment,
}: {
  payment: MemberPayment;
}) {
  return (
    <View style={s.paymentRow}>
      <View style={s.paidIcon}>
        <Icon
          name="check"
          size={19}
          color="#20B96D"
        />
      </View>

      <View style={s.paymentInfo}>
        <Text style={s.paymentAmount}>
          ${payment.amount.toFixed(2)}
        </Text>
        <Text style={s.paymentDate}>
          {payment.date}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          Alert.alert(
            "Download Receipt",
            "Receipt download will be enabled after payment integration."
          )
        }
        accessibilityLabel={`Download receipt ${payment.id}`}
      >
        <Icon
          name="download"
          size={19}
          color="#536176"
        />
      </Pressable>
    </View>
  );
}

export default function MemberProfileScreen({
  member,
}: {
  member: GymMember;
}) {
  const details = getMemberProfile(
    member.id,
    member.name,
    member.plan
  );

  const [autoRenew, setAutoRenew] =
    useState(details.autoRenew);
  const [showAllPayments, setShowAllPayments] =
    useState(false);

  const visiblePayments = showAllPayments
    ? details.payments
    : details.payments.slice(0, 3);

  function placeholder(title: string) {
    Alert.alert(
      title,
      "This feature will be connected in a later development phase."
    );
  }

  const bottomItems = [
    { label: "Dashboard", icon: "dashboard" },
    { label: "Tasks", icon: "tasks" },
    { label: "Alerts", icon: "alerts" },
    { label: "Profile", icon: "profile" },
  ];

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back to Member Directory"
          hitSlop={8}
        >
          <Icon name="back" size={20} />
        </Pressable>

        <Text style={s.headerTitle}>
          School · Gym Module
        </Text>

        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>
            GC
          </Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Overview */}
        <View style={s.profileCard}>
          <View
            style={[
              s.largeAvatar,
              { backgroundColor: member.avatarColor },
            ]}
          >
            <Text style={s.largeInitials}>
              {member.initials}
            </Text>

            <View style={s.activeDot} />
          </View>

          <View style={s.nameRow}>
            <Text style={s.memberName}>
              {member.name}
            </Text>

            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>
                {member.status === "Active"
                  ? "Active Member"
                  : member.status}
              </Text>
            </View>
          </View>

          <Text style={s.memberMetadata}>
            Member ID: {member.membershipId} • Joined{" "}
            {details.joinedDate}
          </Text>

         <Pressable
            style={s.renewButton}
            onPress={() =>
                router.push({
                pathname: "/gym-renewal",
                params: {
                    memberId: member.id,
                },
                })
            }
            >
            <Icon
                name="renew"
                size={16}
                color="#FFFFFF"
            />

            <Text style={s.renewText}>
                Renew Membership
            </Text>
            </Pressable>

          <Pressable
            style={s.scheduleButton}
            onPress={() =>
              placeholder("Schedule Session")
            }
          >
            <Icon
              name="calendar"
              size={15}
            />
            <Text style={s.scheduleText}>
              Schedule Session
            </Text>
          </Pressable>
        </View>

        {/* Personal Details */}
        <View style={s.card}>
          <View style={s.cardHeading}>
            <Text style={s.sectionTitle}>
              Personal Details
            </Text>

            <Pressable
              onPress={() =>
                placeholder("Edit Personal Details")
              }
              accessibilityLabel="Edit personal details"
            >
              <Icon name="edit" size={19} />
            </Pressable>
          </View>

          <View style={s.infoList}>
            <InfoRow
              icon="mail"
              label="Email Address"
              value={details.email}
            />

            <InfoRow
              icon="phone"
              label="Phone Number"
              value={details.phone}
            />

            <InfoRow
              icon="location"
              label="Address"
              value={details.address}
            />

            <InfoRow
              icon="calendar"
              label="Date of Birth"
              value={details.dateOfBirth}
            />
          </View>
        </View>

        {/* Membership */}
        <View style={s.card}>
          <View style={s.cardHeading}>
            <Text style={s.sectionTitle}>
              Membership
            </Text>

            <Icon
              name="shield"
              size={19}
              color="#536176"
            />
          </View>

          <View style={s.currentPlanCard}>
            <Text style={s.planCaption}>
              Current Plan
            </Text>

            <Text style={s.planName}>
              {details.planName}
            </Text>

            <Text style={s.planEnd}>
              Ends on {member.expiryDate}
            </Text>
          </View>

          <View style={s.membershipRow}>
            <Text style={s.membershipLabel}>
              Billing Cycle
            </Text>

            <Text style={s.membershipValue}>
              {details.billingCycle}
            </Text>
          </View>

          <View style={s.membershipRow}>
            <Text style={s.membershipLabel}>
              Price
            </Text>

            <Text style={s.membershipValue}>
              ${details.price.toFixed(2)}/mo
            </Text>
          </View>

          <View style={s.membershipRow}>
            <Text style={s.membershipLabel}>
              Auto-renew
            </Text>

            <Pressable
              accessibilityRole="switch"
              accessibilityState={{
                checked: autoRenew,
              }}
              onPress={() =>
                setAutoRenew(!autoRenew)
              }
              style={[
                s.switchTrack,
                autoRenew && s.switchOn,
              ]}
            >
              <View
                style={[
                  s.switchThumb,
                  autoRenew && s.switchThumbOn,
                ]}
              />
            </Pressable>
          </View>
        </View>

        {/* Payment History */}
        <View style={s.card}>
          <View style={s.cardHeading}>
            <Text style={s.sectionTitle}>
              Payment History
            </Text>

            <Pressable
              onPress={() =>
                setShowAllPayments(!showAllPayments)
              }
            >
              <Text style={s.viewAllText}>
                {showAllPayments
                  ? "Show Less"
                  : "View All"}
              </Text>
            </Pressable>
          </View>

          <View style={s.paymentsList}>
            {visiblePayments.length ? (
              visiblePayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                />
              ))
            ) : (
              <Text style={s.noPayments}>
                No payment history available
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={s.bottomNav}>
        {bottomItems.map((item) => {
          const selected =
            item.label === "Profile";

          return (
            <Pressable
              key={item.label}
              style={[
                s.navItem,
                selected && s.selectedNav,
              ]}
              onPress={() => {
                if (item.label === "Dashboard") {
                  router.replace("/school-dashboard");
                } else if (!selected) {
                  placeholder(item.label);
                }
              }}
            >
              <Icon
                name={item.icon}
                size={19}
                color={
                  selected
                    ? "#FFFFFF"
                    : "#536176"
                }
              />

              <Text
                style={[
                  s.navLabel,
                  selected && s.selectedNavLabel,
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
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    color: BLUE,
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  headerAvatar: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#174D61",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D2E2EA",
  },
  headerAvatarText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 15,
    paddingBottom: 28,
    gap: 17,
    maxWidth: 640,
    alignSelf: "center",
    width: "100%",
  },
  profileCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 21,
    alignItems: "center",
    shadowColor: "#263B5B",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  largeAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#DCE5EE",
    position: "relative",
    marginBottom: 21,
  },
  largeInitials: {
    fontSize: 31,
    color: "#365C75",
    fontWeight: "700",
  },
  activeDot: {
    position: "absolute",
    bottom: 2,
    right: 1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#20C96B",
    borderWidth: 3,
    borderColor: C.white,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  memberName: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
  },
  activeBadge: {
    backgroundColor: "#E0F8EB",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    color: "#138345",
    fontWeight: "600",
  },
  memberMetadata: {
    fontSize: 11,
    color: C.muted,
    marginTop: 6,
    marginBottom: 16,
    textAlign: "center",
  },
  renewButton: {
    minWidth: 208,
    minHeight: 38,
    borderRadius: 6,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 7,
  },
  renewText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },
  scheduleButton: {
    minWidth: 171,
    height: 35,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#C9D6EB",
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  scheduleText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 21,
    shadowColor: "#263B5B",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: C.text,
  },
  infoList: {
    gap: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "500",
    color: C.text,
    lineHeight: 17,
  },
  currentPlanCard: {
    backgroundColor: "#F2F4F6",
    borderRadius: 7,
    padding: 15,
    marginBottom: 13,
  },
  planCaption: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 5,
  },
  planName: {
    fontSize: 15,
    fontWeight: "700",
    color: BLUE,
    marginBottom: 8,
  },
  planEnd: {
    fontSize: 11,
    color: "#636C7A",
  },
  membershipRow: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAF0",
    gap: 10,
  },
  membershipLabel: {
    color: "#5F6878",
    fontSize: 12,
  },
  membershipValue: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
  },
  switchTrack: {
    width: 37,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#D0D5DE",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  switchOn: {
    backgroundColor: BLUE,
  },
  switchThumb: {
    height: 15,
    width: 15,
    borderRadius: 8,
    backgroundColor: C.white,
  },
  switchThumbOn: {
    alignSelf: "flex-end",
  },
  viewAllText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "500",
  },
  paymentsList: {
    gap: 10,
  },
  paymentRow: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  paidIcon: {
    height: 26,
    width: 26,
    backgroundColor: "#E1FAEC",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },
  paymentDate: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },
  noPayments: {
    textAlign: "center",
    color: C.muted,
    fontSize: 12,
    paddingVertical: 15,
  },
  bottomNav: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFC",
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  navItem: {
    flex: 1,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 25,
  },
  selectedNav: {
    backgroundColor: "#2865ED",
  },
  navLabel: {
    color: "#596477",
    fontSize: 10,
  },
  selectedNavLabel: {
    color: C.white,
  },
});
