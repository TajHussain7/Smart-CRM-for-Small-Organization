import { Text, TextInput } from '@/components/responsive-text';

import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const BLUE = "#0054D6";

const C = {
  blue: BLUE,
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#20242C",
  muted: "#737D91",
  border: "#D3DAE6",
  paleBlue: "#ECF3FF",
  lightBlue: "#DDEAFF",
  error: "#D71930",
};

const iconPaths = {
  back: "M19 12H5m7-7-7 7 7 7",
  person:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
  card:
    "M3 5h18v14H3zM3 9h18M7 15h5",
  chevron: "M6 9l6 6 6-6",
  camera:
    "M4 7h4l2-3h4l2 3h4v13H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM19 2v5m-2.5-2.5h5",
  info:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 11v6M12 7h.01",
  save:
    "M4 3h14l3 3v15H3V3zM7 3v7h10V3M7 21v-8h10v8",
  dashboard:
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  tasks:
    "M5 5h14v16H5zM9 3h6v4H9zM8 13l2 2 5-5",
  alerts:
    "M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10ZM10 21h4",
  profile:
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2z",
};

type IconName = keyof typeof iconPaths;

function Icon({
  name,
  size = 20,
  color = BLUE,
}: {
  name: IconName;
  size?: number;
  color?: string;
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
        uri: "data:image/svg+xml;utf8," +
          encodeURIComponent(svg),
      }}
      style={{ width: size, height: size }}
    />
  );
}

const plans = [
  "Basic Monthly",
  "Standard Monthly",
  "Premium Monthly",
  "Annual Membership",
];

type FormField = "name" | "phone" | "email";

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  error,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad" | "email-address";
  error?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.floatingLabel}>{label}</Text>

      <TextInput
        style={[s.input, !!error && s.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B2B9C7"
        keyboardType={keyboardType || "default"}
        autoCapitalize={
          keyboardType === "email-address" ? "none" : "words"
        }
      />

      {error ? (
        <Text style={s.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

export default function AddMemberScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [plan, setPlan] = useState("");
  const [startDate, setStartDate] = useState("06/07/2026");
  const [expiryDate, setExpiryDate] = useState("07/07/2026");

  const [planModal, setPlanModal] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<FormField | "plan" | "startDate" | "expiryDate", string>>
  >({});

  function clearError(field: keyof typeof errors) {
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  function validDate(value: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return false;
    }
    const [month, day, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function dateValue(value: string) {
    const [month, day, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  function saveMember() {
    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = "Full name is required";
    }

    if (!/^[+\d\s()-]{7,20}$/.test(phone.trim())) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!plan) {
      nextErrors.plan = "Choose a membership plan";
    }

    if (!validDate(startDate)) {
      nextErrors.startDate = "Use MM/DD/YYYY";
    }

    if (!validDate(expiryDate)) {
      nextErrors.expiryDate = "Use MM/DD/YYYY";
    }

    if (
      validDate(startDate) &&
      validDate(expiryDate) &&
      dateValue(expiryDate) <= dateValue(startDate)
    ) {
      nextErrors.expiryDate =
        "Expiry date must be after start date";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // Frontend-only preview.
    // No member is saved to a database yet.
    Alert.alert(
      "Member Profile",
      `${name.trim()}'s information is valid.\n\n` +
        `Plan: ${plan}\n` +
        `Start: ${startDate}\n` +
        `Expiry: ${expiryDate}\n\n` +
        "Database saving will be added later.",
      [{ text: "OK" }]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.header}>
        <Pressable
          onPress={() => router.back()}
          style={s.backButton}
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={21} color="#252B35" />
        </Pressable>

        <Text style={s.headerTitle}>Add New Member</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information */}
          <View style={s.card}>
            <View style={s.cardHeading}>
              <Icon name="person" size={19} />
              <Text style={s.cardTitle}>
                Personal Information
              </Text>
            </View>

            <View style={s.fields}>
              <InputField
                label="Full Name"
                placeholder="e.g. John Doe"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  clearError("name");
                }}
                error={errors.name}
              />

              <InputField
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  clearError("phone");
                }}
                error={errors.phone}
              />

              <InputField
                label="Email Address"
                placeholder="john.doe@example.com"
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearError("email");
                }}
                error={errors.email}
              />
            </View>
          </View>

          {/* Membership Details */}
          <View style={s.card}>
            <View style={s.cardHeading}>
              <Icon name="card" size={20} />
              <Text style={s.cardTitle}>
                Membership Details
              </Text>
            </View>

            <View style={s.fields}>
              <View style={s.field}>
                <Text style={s.floatingLabel}>
                  Select Membership Plan
                </Text>

                <Pressable
                  style={[
                    s.selectInput,
                    !!errors.plan && s.inputError,
                  ]}
                  onPress={() => setPlanModal(true)}
                >
                  <Text
                    style={[
                      s.selectText,
                      !plan && { color: "#414754" },
                    ]}
                  >
                    {plan || "Choose a plan..."}
                  </Text>

                  <Icon
                    name="chevron"
                    size={17}
                    color="#788294"
                  />
                </Pressable>

                {errors.plan && (
                  <Text style={s.errorText}>
                    {errors.plan}
                  </Text>
                )}
              </View>

              <InputField
                label="Membership Start Date"
                value={startDate}
                placeholder="MM/DD/YYYY"
                onChangeText={(v) => {
                  setStartDate(v);
                  clearError("startDate");
                }}
                error={errors.startDate}
              />

              <InputField
                label="Membership Expiry Date"
                value={expiryDate}
                placeholder="MM/DD/YYYY"
                onChangeText={(v) => {
                  setExpiryDate(v);
                  clearError("expiryDate");
                }}
                error={errors.expiryDate}
              />
            </View>
          </View>

          {/* Upload Photo */}
          <Pressable
            style={s.uploadCard}
            onPress={() =>
              Alert.alert(
                "Upload Photo",
                "Photo picker integration will be added in the next phase."
              )
            }
          >
            <View style={s.cameraCircle}>
              <Icon name="camera" size={31} />
            </View>
            <Text style={s.uploadText}>Upload Photo</Text>
          </Pressable>

          {/* Information Banner */}
          <View style={s.infoBanner}>
            <Icon
              name="info"
              size={23}
              color="#536681"
            />
            <Text style={s.infoText}>
              Members will receive a welcome email automatically
              upon profile creation.
            </Text>
          </View>

          {/* Save Button */}
          <Pressable style={s.saveButton} onPress={saveMember}>
            <Icon name="save" color="#FFFFFF" size={18} />
            <Text style={s.saveText}>
              Save Member Profile
            </Text>
          </Pressable>

          <Text style={s.previewNote}>
            Preview mode · No data is saved yet
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom navigation */}
      <View style={s.bottomNav}>
        {(
          [
            { label: "Dashboard", icon: "dashboard" },
            { label: "Tasks", icon: "tasks" },
            { label: "Alerts", icon: "alerts" },
            { label: "Profile", icon: "profile" },
          ] as const
        ).map((item) => {
          const selected = item.label === "Tasks";

          return (
            <Pressable
              key={item.label}
              style={[
                s.navItem,
                selected && s.navSelected,
              ]}
              onPress={() => {
                if (item.label === "Dashboard") {
                  router.replace("/school-dashboard");
                } else {
                  Alert.alert(
                    item.label,
                    `${item.label} screen will be developed later.`
                  );
                }
              }}
            >
              <Icon
                name={item.icon}
                size={19}
                color={selected ? "#526887" : "#4B5568"}
              />
              <Text style={s.navLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Membership Plan Picker */}
      <Modal
        visible={planModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPlanModal(false)}
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setPlanModal(false)}
        >
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>
              Choose Membership Plan
            </Text>

            {plans.map((option) => (
              <Pressable
                key={option}
                style={s.planOption}
                onPress={() => {
                  setPlan(option);
                  clearError("plan");
                  setPlanModal(false);
                }}
              >
                <Text style={s.planOptionText}>
                  {option}
                </Text>

                {option === plan && (
                  <Text style={{ color: BLUE }}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    backgroundColor: "#F8FBFF",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backButton: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: BLUE,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 17,
    paddingTop: 22,
    paddingBottom: 28,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#1B3560",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 21,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: C.text,
  },
  fields: {
    gap: 19,
  },
  field: {
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -8,
    left: 10,
    zIndex: 2,
    backgroundColor: C.white,
    paddingHorizontal: 5,
    color: BLUE,
    fontSize: 11,
    fontWeight: "600",
  },
  input: {
    minHeight: 47,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "#9FA7B6",
    borderRadius: 6,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 13,
  },
  inputError: {
    borderColor: C.error,
  },
  errorText: {
    fontSize: 11,
    color: C.error,
    marginTop: 4,
  },
  selectInput: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: "#9FA7B6",
    borderRadius: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
  },
  selectText: {
    fontSize: 13,
    color: C.text,
  },
  uploadCard: {
    height: 126,
    backgroundColor: "#ECF2FB",
    borderWidth: 1,
    borderColor: "#D1DDEF",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D7E6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: "500",
  },
  infoBanner: {
    minHeight: 72,
    backgroundColor: "#F0F4FC",
    borderWidth: 1,
    borderColor: "#D3DEEE",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#4F596C",
    lineHeight: 18,
  },
  saveButton: {
    height: 54,
    backgroundColor: "#0753CD",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    shadowColor: "#0753CD",
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "600",
  },
  previewNote: {
    textAlign: "center",
    color: "#8992A1",
    fontSize: 10,
    marginTop: 3,
  },
  bottomNav: {
    minHeight: 72,
    backgroundColor: "#F8FAFF",
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  navItem: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 28,
  },
  navSelected: {
    backgroundColor: "#D8E6FF",
  },
  navLabel: {
    fontSize: 10,
    color: "#4F5A70",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 14,
    padding: 20,
    backgroundColor: C.white,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  planOption: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planOptionText: {
    color: C.text,
    fontSize: 14,
  },
});
