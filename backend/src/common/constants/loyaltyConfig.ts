export const POINTS_PER_RUPEES_SPENT = 100; // har Rs 100 kharch pe 1 point
export const LOYALTY_TIER_THRESHOLDS = {
  SILVER: 0,
  GOLD: 500,
  PLATINUM: 1500,
};

export const calculatePointsEarned = (amount: number): number => {
  return Math.floor(amount / POINTS_PER_RUPEES_SPENT);
};

export const getLoyaltyTier = (points: number): string => {
  if (points >= LOYALTY_TIER_THRESHOLDS.PLATINUM) return "PLATINUM";
  if (points >= LOYALTY_TIER_THRESHOLDS.GOLD) return "GOLD";
  return "SILVER";
};