import { Text } from '@/components/responsive-text';

import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Alert, Modal, Switch } from 'react-native';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  gymMembers,
  type GymMember,
} from "./members-data";

const BLUE = "#0754D5";

const C = {
  blue: BLUE,
  bright: "#2865EF",
  bg: "#F7F9FC",
  white: "#FFFFFF",
  text: "#232936",
  muted: "#717B8D",
  border: "#D7DFEB",
  teal: "#007A8D",
  red: "#D32F40",
};

const paths: Record<string, string> = {
  back: "M19 12H5M12 5l-7 7 7 7",
  user: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 11v6M12 7h.01",
  alert: "M12 3l10 18H2zM12 9v5M12 17h.01",
  download: "M12 3v12M7 10l5 5 5-5M4 17v4h16v-4",
  renewal: "M20 7v5h-5M4 17v-5h5M5 9a7 7 0 0 1 13-2l2 5M4 12l2 5a7 7 0 0 0 13-2",
  close: "M5 5l14 14M19 5L5 19",
  check: "M5 12l5 5L20 7",
  calendar: "M4 5h16v16H4zM8 3v4M16 3v4M4 10h16",
  chevron: "M6 9l6 6 6-6",
  gym: "M2 9v6M5 6v12M19 6v12M22 9v6M5 12h14",
};

function Icon({
  name,
  color = BLUE,
  size = 19,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'viewBox="0 0 24 24" fill="none" ' +
    `stroke="${color}" stroke-width="1.8" ` +
    'stroke-linecap="round" stroke-linejoin="round">' +
    `<path d="${paths[name] || paths.user}"/></svg>`;

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

type PlanId = "standard" | "premium" | "annual";

const plans = [
  {
    id: "standard",
    name: "Standard",
    price: 49.99,
    durationMonths: 1,
    description: "Basic gym access & locker room usage.",
  },
  {
    id: "premium",
    name: "Premium Plus",
    price: 79.99,
    durationMonths: 1,
    description: "All access, group classes & spa perks.",
  },
  {
    id: "annual",
    name: "Annual Pass",
    price: 799,
    durationMonths: 12,
    description: "Best value. Save 15% yearly.",
  },
] as const;

const money = (amount: number) =>
  `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SERVICE_TAX_RATE = 0.1;

export default function MembershipRenewalScreen() {
  const { memberId } = useLocalSearchParams<{
    memberId?: string;
  }>();

  const initialMember =
    gymMembers.find((member) => member.id === memberId) ??
    null;

  const [member, setMember] =
    useState<GymMember | null>(initialMember);

  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>(
      initialMember?.plan === "Standard"
        ? "standard"
        : "premium"
    );

  const [memberModal, setMemberModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const plan = plans.find(
    (item) => item.id === selectedPlan
  )!;

  const summary = useMemo(() => {
    // Integer cents prevent floating-point tax errors.
    const subtotalCents = Math.round(plan.price * 100);
    const taxCents = Math.round(
      subtotalCents * SERVICE_TAX_RATE
    );

    return {
      subtotal: subtotalCents / 100,
      tax: taxCents / 100,
      total: (subtotalCents + taxCents) / 100,
    };
  }, [plan]);

  function selectMember(selected: GymMember) {
    setMember(selected);
    setSelectedPlan(
      selected.plan === "Standard"
        ? "standard"
        : "premium"
    );
    setMemberModal(false);
  }

  function renewMembership() {
    if (!member) {
      Alert.alert(
        "Select Member",
        "Please select a member before renewing a membership."
      );
      setMemberModal(true);
      return;
    }

    Alert.alert(
      "Confirm Renewal",
      `Member: ${member.name}\n` +
        `Plan: ${plan.name}\n` +
        `Duration: ${plan.durationMonths} month(s)\n` +
        `Total: ${money(summary.total)}\n\n` +
        "This is a frontend preview. No payment will be " +
        "charged and no database record will be changed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Preview",
          onPress: () =>
            Alert.alert(
              "Renewal Preview",
              "The renewal form is validated. Actual renewal " +
                "will be available after backend integration."
            ),
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <Icon name="back" size={21} />
        </Pressable>

        <Text style={s.headerTitle}>
          School · Gym Module
        </Text>

        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>GC</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Member */}
        <Pressable
          style={s.memberCard}
          onPress={() => setMemberModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose a member"
        >
          <View style={s.memberIcon}>
            <Icon name="user" size={27} />
          </View>

          <View style={s.memberInfo}>
            <Text style={s.memberName}>
              {member?.name ?? "Select a Member"}
            </Text>

            <View style={s.memberStatusRow}>
              {member && (
                <>
                  <View style={s.memberPlanBadge}>
                    <Text style={s.memberPlanText}>
                      {member.plan === "Premium"
                        ? "Premium Plus"
                        : "Standard"}
                    </Text>
                  </View>

                  <Text
                    style={[
                      s.memberStatus,
                      {
                        color:
                          member.status === "Active"
                            ? "#16824B"
                            : C.red,
                      },
                    ]}
                  >
                    {member.status}
                  </Text>
                </>
              )}
            </View>
          </View>

          <Icon
            name="chevron"
            size={18}
            color="#7A8494"
          />
        </Pressable>

        {/* Reminder Information */}
        <View style={s.infoBanner}>
          <Icon name="info" size={20} />

          <View style={s.infoContent}>
            <Text style={s.infoText}>
              A payment reminder and renewal alert can
              be sent to the member&apos;s registered email
              and mobile app notification center.
            </Text>

            <View style={s.reminderRow}>
              <Text style={s.reminderLabel}>
                Enable renewal reminder
              </Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: "#D1D8E4",
                  true: "#A8C5FF",
                }}
                thumbColor={
                  reminderEnabled ? BLUE : "#F4F4F4"
                }
              />
            </View>
          </View>
        </View>

        {/* Renewal Plans */}
        <Text style={s.sectionTitle}>
          Select Renewal Plan
        </Text>

        <View style={s.plansList}>
          {plans.map((item) => {
            const active = selectedPlan === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  s.planCard,
                  active && s.selectedPlanCard,
                ]}
                onPress={() => setSelectedPlan(item.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <View style={s.planTitleRow}>
                  <Text
                    style={[
                      s.planTitle,
                      active && { color: BLUE },
                    ]}
                  >
                    {item.name}
                  </Text>

                  <View
                    style={[
                      s.radio,
                      active && s.radioSelected,
                    ]}
                  >
                    {active && (
                      <View style={s.radioDot} />
                    )}
                  </View>
                </View>

                <View style={s.planPriceRow}>
                  <Text style={s.planPrice}>
                    {money(item.price)}
                  </Text>

                  <Text style={s.planDuration}>
                    /{item.durationMonths === 12
                      ? "yr"
                      : "mo"}
                  </Text>
                </View>

                <Text style={s.planDescription}>
                  {item.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Renewal Summary */}
        <View style={s.summaryCard}>
          <View style={s.summaryHeader}>
            <Text style={s.summaryTitle}>
              RENEWAL SUMMARY
            </Text>

            <Pressable
              style={s.receiptButton}
              onPress={() =>
                Alert.alert(
                  "Download Receipt",
                  "A receipt will be available after " +
                    "a renewal payment is processed."
                )
              }
            >
              <Icon name="download" size={15} />
              <Text style={s.receiptText}>
                Download Receipt
              </Text>
            </Pressable>
          </View>

          <View style={s.summaryBody}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>
                Membership: {plan.name}
              </Text>
              <Text style={s.summaryAmount}>
                {money(summary.subtotal)}
              </Text>
            </View>

            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>
                Service Tax (10%)
              </Text>
              <Text style={s.summaryAmount}>
                {money(summary.tax)}
              </Text>
            </View>

            <View style={s.summaryTotalRow}>
              <Text style={s.totalLabel}>
                Total Amount
              </Text>
              <Text style={s.totalAmount}>
                {money(summary.total)}
              </Text>
            </View>
          </View>

          <View style={s.summaryFooter}>
            <Icon
              name="calendar"
              size={15}
              color="#788295"
            />
            <Text style={s.summaryFootnote}>
              Next billing date will be calculated
              when the renewal is confirmed.
            </Text>
          </View>
        </View>

        {/* Promotional Banner */}
        <View style={s.promoBanner}>
          <View style={s.promoIconWrap}>
            <Icon
              name="gym"
              size={36}
              color="#C9E9FF"
            />
          </View>

          <Text style={s.promoTitle}>
            Stronger Memberships.
            {"\n"}Stronger Business.
          </Text>

          <Text style={s.promoDescription}>
            Modernizing membership management
            for elite gyms.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Renewal Action */}
      <View style={s.bottomAction}>
        <Pressable
          style={s.renewButton}
          onPress={renewMembership}
        >
          <Icon
            name="renewal"
            size={18}
            color="#FFFFFF"
          />
          <Text style={s.renewButtonText}>
            Renew Membership
          </Text>
        </Pressable>
      </View>

      {/* Member Selection Modal */}
      <Modal
        visible={memberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                Select Gym Member
              </Text>
              <Pressable
                onPress={() => setMemberModal(false)}
              >
                <Icon
                  name="close"
                  size={20}
                  color="#596579"
                />
              </Pressable>
            </View>

            <ScrollView
              style={s.memberList}
              showsVerticalScrollIndicator={false}
            >
              {gymMembers.map((item) => (
                <Pressable
                  key={item.id}
                  style={s.memberOption}
                  onPress={() => selectMember(item)}
                >
                  <View style={s.optionAvatar}>
                    <Text style={s.optionInitials}>
                      {item.initials}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={s.optionName}>
                      {item.name}
                    </Text>
                    <Text style={s.optionDetail}>
                      {item.membershipId} • {item.plan}
                    </Text>
                  </View>

                  {member?.id === item.id && (
                    <Icon name="check" size={18} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    minHeight: 58,
    backgroundColor: C.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    flex: 1,
    color: BLUE,
    fontSize: 18,
    fontWeight: "600",
  },
  headerAvatar: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#173F54",
    borderWidth: 2,
    borderColor: "#CDE0E8",
  },
  headerAvatarText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "700",
  },
  scroll: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: 13,
    paddingTop: 15,
    paddingBottom: 27,
  },
  memberCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    gap: 13,
    marginBottom: 18,
    elevation: 1,
    shadowColor: "#183454",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  memberIcon: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DFE8FF",
  },
  memberInfo: { flex: 1, gap: 6 },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
    color: C.text,
  },
  memberStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  memberPlanBadge: {
    backgroundColor: "#E3F7F8",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  memberPlanText: {
    color: C.teal,
    fontSize: 10,
    fontWeight: "600",
  },
  memberStatus: {
    fontSize: 10,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderWidth: 1,
    borderColor: "#DCE7FC",
    backgroundColor: "#EEF4FF",
    borderRadius: 10,
    padding: 13,
    marginBottom: 23,
  },
  infoContent: { flex: 1 },
  infoText: {
    color: "#67768D",
    fontSize: 12,
    lineHeight: 17,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  reminderLabel: {
    fontSize: 11,
    color: "#556782",
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  plansList: {
    gap: 12,
    marginBottom: 19,
  },
  planCard: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    minHeight: 100,
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: "#2C72F4",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  planTitle: {
    color: "#657083",
    fontSize: 12,
    fontWeight: "600",
  },
  radio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#BBC4D4",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: BLUE,
    backgroundColor: BLUE,
  },
  radioDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: C.white,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  planPrice: {
    color: C.text,
    fontSize: 23,
    fontWeight: "700",
  },
  planDuration: {
    color: "#8A93A1",
    fontSize: 11,
  },
  planDescription: {
    color: "#596477",
    fontSize: 11,
    marginTop: 5,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.white,
    overflow: "hidden",
    marginBottom: 20,
  },
  summaryHeader: {
    minHeight: 53,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E7EE",
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#647086",
    letterSpacing: 0.5,
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  receiptText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "600",
  },
  summaryBody: {
    padding: 14,
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#657083",
    flexShrink: 1,
  },
  summaryAmount: {
    fontSize: 12,
    color: "#596579",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#DFE5ED",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: C.text,
  },
  totalAmount: {
    fontSize: 21,
    fontWeight: "700",
    color: BLUE,
  },
  summaryFooter: {
    backgroundColor: "#F5F7FB",
    borderTopWidth: 1,
    borderTopColor: "#E3E8F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  summaryFootnote: {
    color: "#667285",
    fontSize: 10,
    flex: 1,
    lineHeight: 15,
  },
  promoBanner: {
    minHeight: 150,
    backgroundColor: "#123B54",
    borderRadius: 11,
    padding: 17,
    justifyContent: "flex-end",
    overflow: "hidden",
    gap: 7,
  },
  promoIconWrap: {
    position: "absolute",
    right: 19,
    top: 17,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF15",
    alignItems: "center",
    justifyContent: "center",
  },
  promoTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  promoDescription: {
    color: "#D9EAF4",
    fontSize: 11,
    lineHeight: 16,
  },
  bottomAction: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  renewButton: {
    minHeight: 49,
    backgroundColor: BLUE,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    elevation: 2,
  },
  renewButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000066",
    padding: 20,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 13,
    padding: 17,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "600",
  },
  memberList: {
    flexGrow: 0,
  },
  memberOption: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF2",
  },
  optionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E7EEFD",
    alignItems: "center",
    justifyContent: "center",
  },
  optionInitials: {
    color: BLUE,
    fontSize: 12,
    fontWeight: "700",
  },
  optionName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
  },
  optionDetail: {
    color: C.muted,
    fontSize: 10,
    marginTop: 3,
  },
});
