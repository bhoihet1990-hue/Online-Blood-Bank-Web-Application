/* ==========================================================================
   LifePulse - Online Blood Bank System
   Initial Preloaded Mock Data & System Constants
   ========================================================================== */

const INITIAL_DATA = {
    // 1. Real-Time Blood Stock Inventory
    bloodInventory: {
        "A+":  { units: 145, maxCapacity: 200, whole: 80, prbc: 45, ffp: 12, sdp: 8, expiringIn3Days: 5, lastUpdated: "2026-08-09" },
        "A-":  { units: 42,  maxCapacity: 100, whole: 20, prbc: 15, ffp: 5,  sdp: 2, expiringIn3Days: 1, lastUpdated: "2026-08-09" },
        "B+":  { units: 198, maxCapacity: 250, whole: 110, prbc: 60, ffp: 18, sdp: 10, expiringIn3Days: 8, lastUpdated: "2026-08-10" },
        "B-":  { units: 28,  maxCapacity: 100, whole: 14, prbc: 10, ffp: 3,  sdp: 1, expiringIn3Days: 3, lastUpdated: "2026-08-08" },
        "AB+": { units: 84,  maxCapacity: 150, whole: 44, prbc: 25, ffp: 10, sdp: 5, expiringIn3Days: 2, lastUpdated: "2026-08-09" },
        "AB-": { units: 18,  maxCapacity: 80,  whole: 8,  prbc: 6,  ffp: 3,  sdp: 1, expiringIn3Days: 4, lastUpdated: "2026-08-07" },
        "O+":  { units: 260, maxCapacity: 300, whole: 150, prbc: 80, ffp: 20, sdp: 10, expiringIn3Days: 12, lastUpdated: "2026-08-10" },
        "O-":  { units: 35,  maxCapacity: 150, whole: 18, prbc: 12, ffp: 3,  sdp: 2, expiringIn3Days: 0, lastUpdated: "2026-08-10" }
    },

    // 2. Verified Donors Database
    donors: [
        {
            id: "DNR-8012",
            name: "Dr. Ethan Vance",
            bloodGroup: "O-",
            city: "Central City",
            phone: "+1 (555) 019-2831",
            email: "ethan.vance@medmail.org",
            age: 34,
            weight: 78,
            lastDonationDate: "2026-04-12",
            totalDonations: 14,
            status: "AVAILABLE",
            verified: true
        },
        {
            id: "DNR-8015",
            name: "Sofia Rodriguez",
            bloodGroup: "A+",
            city: "Downtown Metro",
            phone: "+1 (555) 392-1029",
            email: "sofia.r@techcorp.com",
            age: 28,
            weight: 62,
            lastDonationDate: "2026-06-01",
            totalDonations: 6,
            status: "AVAILABLE",
            verified: true
        },
        {
            id: "DNR-8019",
            name: "Marcus Sterling",
            bloodGroup: "B+",
            city: "Westside District",
            phone: "+1 (555) 748-2910",
            email: "m.sterling@designhub.io",
            age: 41,
            weight: 85,
            lastDonationDate: "2026-07-20",
            totalDonations: 9,
            status: "COOLING_PERIOD",
            verified: true
        },
        {
            id: "DNR-8022",
            name: "Elena Rostova",
            bloodGroup: "AB+",
            city: "North Park",
            phone: "+1 (555) 839-4012",
            email: "elena.rostova@university.edu",
            age: 23,
            weight: 56,
            lastDonationDate: "2026-02-14",
            totalDonations: 3,
            status: "AVAILABLE",
            verified: true
        },
        {
            id: "DNR-8028",
            name: "David Kim",
            bloodGroup: "O+",
            city: "Central City",
            phone: "+1 (555) 629-1144",
            email: "dkim@cityhospital.org",
            age: 37,
            weight: 74,
            lastDonationDate: "2026-05-18",
            totalDonations: 11,
            status: "AVAILABLE",
            verified: true
        },
        {
            id: "DNR-8034",
            name: "Amara Okonjo",
            bloodGroup: "B-",
            city: "Eastside Tech",
            phone: "+1 (555) 902-3381",
            email: "amara.o@biomed.com",
            age: 31,
            weight: 65,
            lastDonationDate: "2026-07-10",
            totalDonations: 5,
            status: "COOLING_PERIOD",
            verified: true
        }
    ],

    // 3. Emergency & Hospital Blood Requests
    emergencyRequests: [
        {
            id: "REQ-9901",
            patientName: "Lucas Hayes",
            bloodGroup: "O-",
            component: "Whole Blood",
            units: 3,
            hospital: "St. Jude Emergency Trauma Center",
            city: "Central City",
            contact: "+1 (555) 019-9921",
            urgency: "CRITICAL",
            notes: "Acute blood loss following highway collision. Surgery ongoing.",
            requestDate: "2026-08-09 23:45",
            status: "APPROVED"
        },
        {
            id: "REQ-9904",
            patientName: "Beatriz Gomez",
            bloodGroup: "B+",
            component: "Single Donor Platelets (SDP)",
            units: 2,
            hospital: "City Oncology & Blood Institute",
            city: "Westside District",
            contact: "+1 (555) 441-2093",
            urgency: "URGENT",
            notes: "Post-chemotherapy severe thrombocytopenia.",
            requestDate: "2026-08-10 01:15",
            status: "PENDING"
        },
        {
            id: "REQ-9907",
            patientName: "Arthur Pendelton",
            bloodGroup: "A+",
            component: "Packed Red Blood Cells (PRBC)",
            units: 4,
            hospital: "Metropolitan General Surgery Ward",
            city: "Downtown Metro",
            contact: "+1 (555) 882-1920",
            urgency: "STANDARD",
            notes: "Scheduled hip replacement procedure tomorrow morning.",
            requestDate: "2026-08-10 02:00",
            status: "PENDING"
        }
    ],

    // 4. Upcoming Blood Donation Camps & Drives
    camps: [
        {
            id: "CMP-401",
            title: "Mega City Blood Drive 2026",
            date: "2026-08-15",
            time: "09:00 AM - 05:00 PM",
            venue: "Metropolitan Civic Center Plaza",
            city: "Central City",
            organizer: "Red Cross & LifePulse Foundation",
            targetUnits: 300,
            registeredDonors: 184,
            contactPhone: "+1 (555) 800-CAMP"
        },
        {
            id: "CMP-402",
            title: "University Youth Donation Camp",
            date: "2026-08-20",
            time: "10:00 AM - 04:00 PM",
            venue: "State University Student Union Center",
            city: "North Park",
            organizer: "University Medical Association",
            targetUnits: 200,
            registeredDonors: 142,
            contactPhone: "+1 (555) 800-YOUTH"
        },
        {
            id: "CMP-403",
            title: "Corporate Tech Park Donation Drive",
            date: "2026-08-25",
            time: "08:30 AM - 03:30 PM",
            venue: "Silicon Plaza Auditorium",
            city: "Eastside Tech",
            organizer: "LifePulse Emergency Response Team",
            targetUnits: 150,
            registeredDonors: 98,
            contactPhone: "+1 (555) 800-TECH"
        }
    ],

    // 5. Blood Compatibility Reference Rules
    compatibilityMap: {
        "O-":  { give: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], receive: ["O-"], note: "Universal Red Cell Donor" },
        "O+":  { give: ["O+", "A+", "B+", "AB+"], receive: ["O-", "O+"], note: "Most common blood type" },
        "A-":  { give: ["A-", "A+", "AB-", "AB+"], receive: ["O-", "A-"], note: "Can receive from negative types O- and A-" },
        "A+":  { give: ["A+", "AB+"], receive: ["O-", "O+", "A-", "A+"], note: "Can give to A+ and AB+" },
        "B-":  { give: ["B-", "B+", "AB-", "AB+"], receive: ["O-", "B-"], note: "Can receive from O- and B-" },
        "B+":  { give: ["B+", "AB+"], receive: ["O-", "O+", "B-", "B+"], note: "Can receive from all B and O types" },
        "AB-": { give: ["AB-", "AB+"], receive: ["O-", "A-", "B-", "AB-"], note: "Can receive from all Rh-negative blood" },
        "AB+": { give: ["AB+"], receive: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], note: "Universal Red Cell Recipient" }
    }
};
