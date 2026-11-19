export const memberProfileData = {};

export function getMemberProfile(id, name, plan) {
    const saved = memberProfileData[id];
    if (saved) return saved;
    const price = plan === "Premium" ? 8000 : plan === "Annual Pass" ? 60000 : 5000;
    return {
        email: name ? name.toLowerCase().replace(/\s+/g, ".") + "@example.com" : "Not provided",
        phone: "Not provided",
        address: "Not provided",
        dateOfBirth: "Not provided",
        joinedDate: "Not provided",
        planName: plan || "Standard Fitness",
        billingCycle: plan === "Annual Pass" ? "Yearly" : "Monthly",
        price,
        autoRenew: false,
        payments: [],
    };
}
