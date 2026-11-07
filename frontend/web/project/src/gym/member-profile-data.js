const samplePayments = [
    {
        id: "PAY-001",
        amount: 199,
        date: "Aug 01, 2024",
        status: "Paid",
    },
    {
        id: "PAY-002",
        amount: 199,
        date: "Jul 01, 2024",
        status: "Paid",
    },
    {
        id: "PAY-003",
        amount: 199,
        date: "Jun 01, 2024",
        status: "Paid",
    },
    {
        id: "PAY-004",
        amount: 199,
        date: "May 01, 2024",
        status: "Paid",
    },
];
export const memberProfileData = {
    "1": {
        email: "sarah.smith@example.com",
        phone: "+1 (555) 012-3456",
        address: "125 Oak Street, Springfield, OR",
        dateOfBirth: "March 12, 1998",
        joinedDate: "Jan 10, 2023",
        planName: "Premium Fitness Plus",
        billingCycle: "Monthly",
        price: 149,
        autoRenew: true,
        payments: samplePayments.map((p) => ({
            ...p,
            amount: 149,
        })),
    },
    "2": {
        email: "marcus.johnson@example.com",
        phone: "+1 (555) 023-4567",
        address: "84 Green Avenue, Portland, OR",
        dateOfBirth: "February 08, 1995",
        joinedDate: "Mar 15, 2023",
        planName: "Standard Fitness",
        billingCycle: "Monthly",
        price: 79,
        autoRenew: false,
        payments: samplePayments.map((p) => ({
            ...p,
            amount: 79,
        })),
    },
    "3": {
        email: "elena.rodriguez@example.com",
        phone: "+1 (555) 012-3456",
        address: "742 Evergreen Terrace, Springfield, OR",
        dateOfBirth: "May 12, 2004",
        joinedDate: "Oct 2023",
        planName: "Advanced Academic Plus",
        billingCycle: "Monthly",
        price: 199,
        autoRenew: true,
        payments: samplePayments,
    },
    "4": {
        email: "david.lee@example.com",
        phone: "+1 (555) 034-5678",
        address: "21 River Road, Eugene, OR",
        dateOfBirth: "June 14, 1996",
        joinedDate: "Feb 2023",
        planName: "Standard Fitness",
        billingCycle: "Monthly",
        price: 79,
        autoRenew: true,
        payments: samplePayments.map((p) => ({
            ...p,
            amount: 79,
        })),
    },
};
// Remaining demo members use fallback profile details
// until complete member records or APIs are available.
export function getMemberProfile(id, name, plan) {
    const saved = memberProfileData[id];
    if (saved)
        return saved;
    const price = plan === "Premium" ? 149 : 79;
    return {
        email: name.toLowerCase().replace(/\s+/g, ".") +
            "@example.com",
        phone: "Not provided",
        address: "Not provided",
        dateOfBirth: "Not provided",
        joinedDate: "Not provided",
        planName: plan === "Premium"
            ? "Premium Fitness Plus"
            : "Standard Fitness",
        billingCycle: "Monthly",
        price,
        autoRenew: false,
        payments: [],
    };
}
