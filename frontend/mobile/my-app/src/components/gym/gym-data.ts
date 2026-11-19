
export const gymStats = [
  {
    label: "ACTIVE MEMBERS",
    value: "250",
    icon: "members",
    color: "#0957CF",
  },
  {
    label: "REVENUE",
    value: "$15k",
    icon: "revenue",
    color: "#007B8C",
  },
  {
    label: "EXPIRING SOON",
    value: "12",
    icon: "calendar",
    color: "#D61F2C",
  },
  {
    label: "SESSIONS TODAY",
    value: "18",
    icon: "training",
    color: "#53627D",
  },
] as const;

export const gymActions = [
  { label: "Members", icon: "members" },
  { label: "Membership Renewal", icon: "renewal" },
  { label: "Training Sessions", icon: "clock" },
  { label: "Reports", icon: "reports" },
] as const;

export const revenuePeriods = {
  "Last 30 Days": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    values: [58, 76, 86, 72],
  },
  "Last 3 Months": {
    labels: ["Aug", "Sep", "Oct"],
    values: [54, 72, 91],
  },
  "Last 6 Months": {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    values: [35, 49, 62, 57, 78, 95],
  },
} as const;

export const membershipGrowth = [
  {
    label: "New Signups",
    value: 32,
    percentage: 65,
    color: "#007A89",
    icon: "members",
  },
  {
    label: "Renewals",
    value: 118,
    percentage: 85,
    color: "#0755D7",
    icon: "renewal",
  },
] as const;

export type CheckIn = {
  id: string;
  name: string;
  plan: string;
  time: string;
  status: "ACTIVE" | "EXPIRING";
};

export const recentCheckIns: CheckIn[] = [
  {
    id: "1",
    name: "Alex Rivera",
    plan: "Standard Membership",
    time: "08:15 AM",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    plan: "Premium Plus",
    time: "07:50 AM",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Michael Chen",
    plan: "Annual Pass",
    time: "07:30 AM",
    status: "EXPIRING",
  },
  {
    id: "4",
    name: "Emily Davis",
    plan: "Premium Plus",
    time: "07:20 AM",
    status: "ACTIVE",
  },
];
