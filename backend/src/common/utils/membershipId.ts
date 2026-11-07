export async function generateUniqueMembershipId(
  workspaceId: string,
  MemberModel: { findOne: (q: object) => Promise<unknown> }
): Promise<string> {
  let attempts = 0;
  while (attempts < 15) {
    const id = `MS-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await MemberModel.findOne({ workspaceId, membershipId: id });
    if (!existing) return id;
    attempts++;
  }
  // Fallback: timestamp-based
  return `MS-${Date.now().toString().slice(-6)}`;
}

