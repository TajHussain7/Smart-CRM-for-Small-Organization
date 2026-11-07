export enum MembershipStatus {
  ACTIVE = "Active",
  EXPIRING_SOON = "Expiring Soon",
  EXPIRED = "Expired",
}

export const EXPIRING_SOON_THRESHOLD_DAYS = 7;

export function getMembershipStatus(expiryDate: Date): MembershipStatus {
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilExpiry < 0) return MembershipStatus.EXPIRED;
  if (daysUntilExpiry <= EXPIRING_SOON_THRESHOLD_DAYS) return MembershipStatus.EXPIRING_SOON;
  return MembershipStatus.ACTIVE;
}

