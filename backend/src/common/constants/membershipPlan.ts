export enum MembershipPlan {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  ANNUAL = "ANNUAL",
}

export const PLAN_DURATION_DAYS: Record<MembershipPlan, number> = {
  [MembershipPlan.STANDARD]: 30,
  [MembershipPlan.PREMIUM]: 90,
  [MembershipPlan.ANNUAL]: 365,
};

export const PLAN_LABELS: Record<MembershipPlan, string> = {
  [MembershipPlan.STANDARD]: "Standard",
  [MembershipPlan.PREMIUM]: "Premium",
  [MembershipPlan.ANNUAL]: "Annual",
};

