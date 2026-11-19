import { Text, TextInput } from '@/components/responsive-text';

import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  gymMembers,
  type GymMember,
  type MembershipPlan,
} from "./members-data";

const BLUE = "#0754D5";

const C = {
  blue: BLUE,
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#202630",
  muted: "#727C8E",
  border: "#D8DFEA",
  teal: "#007E8D",
  red: "#D52838",
};

const iconPaths = {
  menu: "M4 7h16M4 12h16M4 17h16",
  search:
    "M11 19a8 8 0 1 0 0-16a8 8 0 0 0 0 16ZM17 17l5 5",
  filter: "M4 7h16M7 12h10M10 17h4",
  personAdd:
    "M15 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8 10a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM19 8v6M16 11h6",
  plus: "M12 4v16M4 12h16",
  more: "M12 5h.01M12 12h.01M12 19h.01",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M6 9l6 6 6-6",
  dashboard:
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  profile:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
  tasks:
    "M5 5h14v16H5zM9 3h6v4H9zM8 13l2 2 5-5",
  alerts:
    "M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10ZM10 21h4",
};

type IconName = keyof typeof iconPaths;
type FilterType = "All Members" | MembershipPlan;

function Icon({
  name,
  color = BLUE,
  size = 19,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'viewBox="0 0 24 24" fill="none" ' +
    `stroke="${color}" stroke-width="1.8" ` +
    'stroke-linecap="round" stroke-linejoin="round">' +
    `<path d="${iconPaths[name]}"/></svg>`;

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

// ----------------------------
// Member Card
// ----------------------------

function MemberCard({
  member,
  onViewProfile,
}: {
  member: GymMember;
  onViewProfile: (member: GymMember) => void;
}) {
  const isPremium = member.plan === "Premium";

  return (
    <View style={s.memberCard}>
      <View style={s.memberHeader}>
        <View
          style={[
            s.avatar,
            { backgroundColor: member.avatarColor },
          ]}
        >
          <Text style={s.avatarInitials}>
            {member.initials}
          </Text>

          <View style={s.onlineDot} />
        </View>

        <View style={s.memberInfo}>
          <Text style={s.memberName}>
            {member.name}
          </Text>

          <Text style={s.memberId}>
            ID: {member.membershipId}
          </Text>
        </View>

        <Pressable
          hitSlop={10}
          onPress={() =>
            Alert.alert(
              "Member Options",
              `${member.name}\n\nEdit, renew and manage options will be available later.`
            )
          }
        >
          <Icon
            name="more"
            color="#344052"
            size={21}
          />
        </Pressable>
      </View>

      <View style={s.detailRow}>
        <Text style={s.detailLabel}>
          Membership Plan
        </Text>

        <View
          style={[
            s.planBadge,
            {
              backgroundColor: isPremium
                ? "#007E8D"
                : "#657184",
            },
          ]}
        >
          <Text style={s.planBadgeText}>
            {member.plan.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={s.detailRow}>
        <Text style={s.detailLabel}>
          Expiry Date
        </Text>

        <Text
          style={[
            s.expiryDate,
            member.status !== "Active" && {
              color: C.red,
            },
          ]}
        >
          {member.expiryDate}
        </Text>
      </View>

      <View style={s.memberFooter}>
        <View style={s.classesRow}>
          {member.status !== "Active" ? (
            <Text style={s.expiringText}>
              ◉ {member.status}
            </Text>
          ) : member.classes.length > 0 ? (
            member.classes.map((label) => (
              <View
                key={label}
                style={s.classBadge}
              >
                <Text style={s.classBadgeText}>
                  {label}
                </Text>
              </View>
            ))
          ) : (
            <Text style={s.noClasses}>
              No active classes
            </Text>
          )}
        </View>

        <Pressable
          style={s.viewProfile}
          onPress={() => onViewProfile(member)}
        >
          <Text style={s.viewProfileText}>
            View Profile
          </Text>

          <Icon
            name="arrow"
            size={14}
            color={BLUE}
          />
        </Pressable>
      </View>
    </View>
  );
}

// ----------------------------
// Main Screen
// ----------------------------

export default function GymMembersScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("All Members");
  const [showCount, setShowCount] = useState(4);
  const [showAdvanced, setShowAdvanced] =
    useState(false);
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Expiring Soon" | "Expired">(
      "All"
    );

  const filteredMembers = useMemo(() => {
    const search = query.toLowerCase().trim();

    return gymMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search) ||
        member.membershipId.toLowerCase().includes(search);

      const matchesPlan =
        filter === "All Members" ||
        member.plan === filter;

      const matchesStatus =
        statusFilter === "All" ||
        member.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [query, filter, statusFilter]);

  const displayedMembers =
    filteredMembers.slice(0, showCount);

  function changeFilter(value: FilterType) {
    setFilter(value);
    setShowCount(4);
  }

  function viewProfile(member: GymMember) {
    Alert.alert(
      "Member Profile",
      `${member.name}\n` +
        `Member ID: ${member.membershipId}\n` +
        `Plan: ${member.plan}\n` +
        `Expiry: ${member.expiryDate}\n\n` +
        "The detailed profile screen will be created next."
    );
  }

  function placeholder(name: string) {
    Alert.alert(
      name,
      "This screen will be implemented in the next phase."
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
          style={s.headerMenu}
          onPress={() => router.back()}
          accessibilityLabel="Back to Gym Dashboard"
        >
          <Icon name="menu" size={21} />
        </Pressable>

        <Text style={s.headerTitle}>
          School · Gym Module
        </Text>

        <Pressable
          onPress={() => placeholder("Search")}
        >
          <Icon
            name="search"
            color="#303846"
            size={19}
          />
        </Pressable>

        <Pressable
          style={s.headerAvatar}
          onPress={() => placeholder("Profile")}
        >
          <Text style={s.headerAvatarText}>
            GC
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Screen title */}
        <Text style={s.pageTitle}>
          Member Directory
        </Text>

        <Text style={s.pageDescription}>
          Manage and track all registered members and
          their subscription status.
        </Text>

        {/* Add Member and Filter */}
        <View style={s.toolbar}>
          <Pressable
            style={s.addMemberButton}
            onPress={() =>
              router.push("/gym-add-member")
            }
          >
            <Icon
              name="personAdd"
              color="#FFFFFF"
              size={17}
            />
            <Text style={s.addMemberText}>
              Add Member
            </Text>
          </Pressable>

          <Pressable
            style={[
              s.filterButton,
              showAdvanced && s.filterButtonActive,
            ]}
            onPress={() =>
              setShowAdvanced(!showAdvanced)
            }
            accessibilityLabel="Additional filters"
          >
            <Icon
              name="filter"
              size={18}
              color="#344052"
            />
          </Pressable>
        </View>

        {/* Search and Membership Filters */}
        <View style={s.searchCard}>
          <View style={s.searchBox}>
            <Icon
              name="search"
              color="#667085"
              size={18}
            />

            <TextInput
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setShowCount(4);
              }}
              placeholder="Search members by name, email, or ID..."
              placeholderTextColor="#929AAA"
              style={s.searchInput}
              autoCapitalize="none"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
          >
            {(
              [
                "All Members",
                "Premium",
                "Standard",
              ] as FilterType[]
            ).map((item) => (
              <Pressable
                key={item}
                onPress={() => changeFilter(item)}
                style={[
                  s.filterChip,
                  filter === item && s.selectedChip,
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    filter === item && s.selectedChipText,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {showAdvanced && (
            <View style={s.advancedFilters}>
              <Text style={s.advancedTitle}>
                Membership Status
              </Text>

              <View style={s.statusFilterRow}>
                {(
                  [
                    "All",
                    "Active",
                    "Expiring Soon",
                    "Expired",
                  ] as const
                ).map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      s.statusFilterChip,
                      statusFilter === item &&
                        s.statusFilterSelected,
                    ]}
                    onPress={() => {
                      setStatusFilter(item);
                      setShowCount(4);
                    }}
                  >
                    <Text style={s.statusFilterText}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Member Cards */}
        <View style={s.membersList}>
          {displayedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onViewProfile={viewProfile}
            />
          ))}

          {displayedMembers.length === 0 && (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>
                No members found
              </Text>
              <Text style={s.emptyDescription}>
                Try changing the search or membership filters.
              </Text>
            </View>
          )}
        </View>

        {/* Pagination */}
        {showCount < filteredMembers.length && (
          <Pressable
            style={s.loadMoreButton}
            onPress={() =>
              setShowCount((count) => count + 4)
            }
          >
            <Text style={s.loadMoreText}>
              Load More Members
            </Text>

            <Icon
              name="chevron"
              size={15}
              color={BLUE}
            />
          </Pressable>
        )}

        <Text style={s.listCount}>
          Showing {displayedMembers.length} of{" "}
          {filteredMembers.length} members
        </Text>
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        style={s.floatingButton}
        onPress={() =>
          router.push("/gym-add-member")
        }
        accessibilityLabel="Add new member"
      >
        <Icon
          name="plus"
          color="#FFFFFF"
          size={26}
        />
      </Pressable>

      {/* Screenshot-style Bottom Navigation */}
      <View style={s.bottomNav}>
        {(
          [
            { label: "Dashboard", icon: "dashboard" },
            { label: "Profile", icon: "profile" },
            { label: "Tasks", icon: "tasks" },
            { label: "Alerts", icon: "alerts" },
          ] as const
        ).map((item) => {
          const active = item.label === "Profile";

          return (
            <Pressable
              key={item.label}
              style={[
                s.navItem,
                active && s.navActive,
              ]}
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
                size={19}
                color={
                  active ? "#FFFFFF" : "#596376"
                }
              />

              <Text
                style={[
                  s.navText,
                  active && s.navTextActive,
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

// ----------------------------
// Styles
// ----------------------------

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    minHeight: 59,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 11,
  },
  headerMenu: {
    padding: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "600",
    color: BLUE,
  },
  headerAvatar: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#17485F",
    borderWidth: 2,
    borderColor: "#D3E4EB",
    alignItems: "center",
    justifyContent: "center",
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
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 90,
  },
  pageTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: C.text,
  },
  pageDescription: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: 330,
  },
  toolbar: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 9,
    marginBottom: 20,
  },
  addMemberButton: {
    minHeight: 33,
    paddingHorizontal: 13,
    backgroundColor: BLUE,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  addMemberText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 12,
  },
  filterButton: {
    width: 34,
    height: 33,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#E9F0FF",
  },
  searchCard: {
    backgroundColor: C.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    marginBottom: 17,
  },
  searchBox: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    backgroundColor: "#F3F5F9",
    borderRadius: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: C.text,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  filterChip: {
    backgroundColor: "#F0F1F3",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectedChip: {
    backgroundColor: "#E2E9FF",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#687184",
  },
  selectedChipText: {
    color: BLUE,
  },
  advancedFilters: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },
  advancedTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    marginBottom: 10,
  },
  statusFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusFilterChip: {
    backgroundColor: "#F2F4F8",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusFilterSelected: {
    backgroundColor: "#DCE8FF",
  },
  statusFilterText: {
    fontSize: 10,
    color: "#475467",
  },
  membersList: {
    gap: 15,
  },
  memberCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 0,
    shadowColor: "#26415C",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: "700",
    color: "#31556C",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#24C973",
    borderWidth: 2,
    borderColor: C.white,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  memberId: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },
  detailRow: {
    minHeight: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: "#515C6F",
    fontWeight: "500",
  },
  planBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 3,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: C.white,
  },
  expiryDate: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
  },
  memberFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E6EAF0",
    minHeight: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  classesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  classBadge: {
    height: 22,
    minWidth: 22,
    paddingHorizontal: 5,
    borderRadius: 12,
    backgroundColor: "#E8EEFC",
    justifyContent: "center",
    alignItems: "center",
  },
  classBadgeText: {
    color: "#65769A",
    fontSize: 9,
    fontWeight: "700",
  },
  expiringText: {
    fontSize: 10,
    color: C.red,
  },
  noClasses: {
    fontSize: 10,
    color: C.muted,
  },
  viewProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 7,
  },
  viewProfileText: {
    fontSize: 11,
    color: BLUE,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: C.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 35,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
  },
  emptyDescription: {
    color: C.muted,
    fontSize: 12,
    textAlign: "center",
  },
  loadMoreButton: {
    minHeight: 44,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#D0DCF4",
    borderRadius: 24,
    paddingHorizontal: 17,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FAFCFF",
  },
  loadMoreText: {
    color: BLUE,
    fontWeight: "600",
    fontSize: 12,
  },
  listCount: {
    marginTop: 12,
    textAlign: "center",
    color: C.muted,
    fontSize: 10,
  },
  floatingButton: {
    position: "absolute",
    right: 18,
    bottom: 88,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: BLUE,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomNav: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: "#FAFBFD",
  },
  navItem: {
    flex: 1,
    height: 49,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  navActive: {
    backgroundColor: "#2864EF",
  },
  navText: {
    color: "#596478",
    fontSize: 10,
  },
  navTextActive: {
    color: C.white,
  },
});
