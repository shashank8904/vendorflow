// ─── Types ───────────────────────────────────────────────────────────────────

export type VendorStatus = "active" | "inactive" | "on_hold";
export type POStatus = "pending" | "confirmed" | "delayed" | "cancelled" | "delivered";
export type CallStatus = "completed" | "failed" | "in_progress" | "scheduled" | "no_answer";
export type UserRole = "admin" | "manager" | "operator" | "viewer";

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  status: VendorStatus;
  lastContact: string;
  openPurchaseOrders: number;
  notes: string;
  createdAt: string;
  responseRate: number;
  avgResponseTime: number; // minutes
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  expectedDelivery: string;
  status: POStatus;
  assignedAgent: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  aiInsights: string[];
}

export interface TimelineEvent {
  id: string;
  type: "created" | "call" | "update" | "delivery" | "issue" | "resolved";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface AICall {
  id: string;
  vendorId: string;
  vendorName: string;
  poId?: string;
  poNumber?: string;
  status: CallStatus;
  startedAt: string;
  duration: number; // seconds
  aiConfidence: number; // 0-100
  summary: string;
  transcript: TranscriptMessage[];
  extractedInfo: ExtractedInfo;
  agentName: string;
}

export interface TranscriptMessage {
  id: string;
  role: "agent" | "vendor";
  content: string;
  timestamp: number; // seconds from start
}

export interface ExtractedInfo {
  deliveryDate?: string;
  delayReason?: string;
  confirmedQuantity?: number;
  totalAmount?: number;
  contactName?: string;
  additionalNotes?: string;
  confidence: number;
}

export interface ActivityEvent {
  id: string;
  type: "call" | "po_update" | "vendor_added" | "alert" | "success";
  title: string;
  description: string;
  timestamp: string;
  meta?: string;
}

export interface AnalyticsData {
  totalCalls: number;
  successfulCalls: number;
  avgCallDuration: number;
  avgVendorResponseTime: number;
  callSuccessRate: number;
  monthlyTrend: MonthlyTrendPoint[];
  callsByStatus: PieDataPoint[];
  vendorResponseTimes: BarDataPoint[];
  revenueAtRisk: LineDataPoint[];
}

export interface MonthlyTrendPoint {
  month: string;
  calls: number;
  successful: number;
  failed: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface BarDataPoint {
  vendor: string;
  responseTime: number;
  calls: number;
}

export interface LineDataPoint {
  date: string;
  value: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v1",
    companyName: "Apex Components Ltd.",
    contactPerson: "Rajesh Sharma",
    phone: "+91 98765 43210",
    email: "rajesh@apexcomponents.com",
    address: "Plot 42, MIDC Industrial Area, Pune, Maharashtra 411018",
    gstNumber: "27AAAPL1234C1Z5",
    status: "active",
    lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    openPurchaseOrders: 3,
    notes: "Preferred vendor for electronic components. Net-30 payment terms.",
    createdAt: "2024-01-15T10:00:00Z",
    responseRate: 94,
    avgResponseTime: 18,
  },
  {
    id: "v2",
    companyName: "TechnoForge Industries",
    contactPerson: "Priya Menon",
    phone: "+91 87654 32109",
    email: "priya@technoforge.in",
    address: "Sector 18, Gurgaon, Haryana 122015",
    gstNumber: "06AAACT5678D2Z3",
    status: "active",
    lastContact: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    openPurchaseOrders: 1,
    notes: "Metal fabrication specialist. Usually delivers 2 days early.",
    createdAt: "2024-02-20T09:00:00Z",
    responseRate: 88,
    avgResponseTime: 32,
  },
  {
    id: "v3",
    companyName: "GlobalParts Supply Co.",
    contactPerson: "Amit Verma",
    phone: "+91 76543 21098",
    email: "amit@globalparts.com",
    address: "Warehouse 7, Andheri East, Mumbai, Maharashtra 400069",
    gstNumber: "27AAAAG9012E3Z1",
    status: "on_hold",
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    openPurchaseOrders: 2,
    notes: "Payment dispute pending. On hold until resolved.",
    createdAt: "2023-11-05T14:00:00Z",
    responseRate: 72,
    avgResponseTime: 48,
  },
  {
    id: "v4",
    companyName: "Sunrise Logistics Pvt.",
    contactPerson: "Kavitha Rao",
    phone: "+91 65432 10987",
    email: "kavitha@sunriselogistics.co",
    address: "NH-48, Whitefield, Bengaluru, Karnataka 560066",
    gstNumber: "29AAAAS3456F4Z9",
    status: "active",
    lastContact: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    openPurchaseOrders: 5,
    notes: "Last-mile logistics partner. Excellent track record.",
    createdAt: "2024-03-10T11:00:00Z",
    responseRate: 97,
    avgResponseTime: 12,
  },
  {
    id: "v5",
    companyName: "MegaSource Distributors",
    contactPerson: "Suresh Kumar",
    phone: "+91 54321 09876",
    email: "suresh@megasource.net",
    address: "Industrial Area Phase 2, Chandigarh 160002",
    gstNumber: "04AAAAM7890G5Z7",
    status: "inactive",
    lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    openPurchaseOrders: 0,
    notes: "Seasonal vendor. Active Oct-Mar only.",
    createdAt: "2023-09-01T08:00:00Z",
    responseRate: 61,
    avgResponseTime: 72,
  },
  {
    id: "v6",
    companyName: "Precision Parts Corp.",
    contactPerson: "Nisha Jain",
    phone: "+91 43210 98765",
    email: "nisha@precisionparts.in",
    address: "Plot 101, SEZ Noida, Uttar Pradesh 201305",
    gstNumber: "09AAAAP2345H6Z2",
    status: "active",
    lastContact: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    openPurchaseOrders: 2,
    notes: "CNC machining vendor. ISO 9001 certified.",
    createdAt: "2024-04-22T13:00:00Z",
    responseRate: 91,
    avgResponseTime: 22,
  },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po1",
    poNumber: "PO-2025-0041",
    vendorId: "v1",
    vendorName: "Apex Components Ltd.",
    amount: 284500,
    expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    assignedAgent: "CALL-E Alpha",
    description: "500 units of PCB Assembly Rev3 + 200 units Capacitor Banks",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    aiInsights: [
      "Vendor confirmed delivery on time with 95% confidence",
      "Shipment currently in transit – tracking ID AWB-78234",
      "Recommend follow-up 24h before delivery for final confirmation",
    ],
    timeline: [
      { id: "t1", type: "created", title: "PO Created", description: "Purchase order created by Suhas Nair", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), actor: "Suhas Nair" },
      { id: "t2", type: "call", title: "AI Call Initiated", description: "CALL-E Alpha placed call to Rajesh Sharma", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Alpha" },
      { id: "t3", type: "update", title: "Order Confirmed", description: "Vendor confirmed the order and delivery date", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actor: "Rajesh Sharma" },
      { id: "t4", type: "call", title: "Follow-up Call", description: "Checked shipment status – in transit", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Alpha" },
    ],
  },
  {
    id: "po2",
    poNumber: "PO-2025-0038",
    vendorId: "v3",
    vendorName: "GlobalParts Supply Co.",
    amount: 156000,
    expectedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "delayed",
    assignedAgent: "CALL-E Beta",
    description: "1000 units Hydraulic Valves Grade A",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    aiInsights: [
      "Delivery delayed by 4-5 days due to supplier-side quality hold",
      "Vendor cited material certification issues at origin facility",
      "Consider alternate sourcing for next quarter to mitigate risk",
      "₹1.56L revenue at risk – escalation recommended",
    ],
    timeline: [
      { id: "t1", type: "created", title: "PO Created", description: "Purchase order created by Meera Pillai", timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), actor: "Meera Pillai" },
      { id: "t2", type: "call", title: "Initial Confirmation Call", description: "Vendor confirmed order receipt", timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Beta" },
      { id: "t3", type: "issue", title: "Delay Reported", description: "AI detected delay signal during follow-up call", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Beta" },
      { id: "t4", type: "update", title: "ERP Updated", description: "Expected delivery updated to +5 days", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), actor: "System" },
    ],
  },
  {
    id: "po3",
    poNumber: "PO-2025-0044",
    vendorId: "v4",
    vendorName: "Sunrise Logistics Pvt.",
    amount: 92000,
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    assignedAgent: "CALL-E Gamma",
    description: "Last-mile delivery service for Q3 batch – Zones 4, 7, 12",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiInsights: [
      "Initial AI call scheduled for tomorrow 10:00 AM",
      "Vendor has 97% on-time rate for similar zone deliveries",
    ],
    timeline: [
      { id: "t1", type: "created", title: "PO Created", description: "Purchase order auto-generated from ERP trigger", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), actor: "System" },
    ],
  },
  {
    id: "po4",
    poNumber: "PO-2025-0035",
    vendorId: "v2",
    vendorName: "TechnoForge Industries",
    amount: 445000,
    expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "delivered",
    assignedAgent: "CALL-E Alpha",
    description: "Steel Fabrication Batch – 200 custom frames",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiInsights: ["Delivered 2 days ahead of schedule", "Quality check passed – 0 defects reported"],
    timeline: [
      { id: "t1", type: "created", title: "PO Created", description: "PO raised by procurement team", timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), actor: "Anand Iyer" },
      { id: "t2", type: "call", title: "Confirmation Call", description: "Vendor confirmed receipt and timeline", timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Alpha" },
      { id: "t3", type: "delivery", title: "Delivered", description: "All 200 frames received and quality-checked", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actor: "Warehouse Team" },
    ],
  },
  {
    id: "po5",
    poNumber: "PO-2025-0042",
    vendorId: "v6",
    vendorName: "Precision Parts Corp.",
    amount: 198750,
    expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    assignedAgent: "CALL-E Beta",
    description: "CNC Machined Brackets – Batch Q3-2025",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    aiInsights: ["Production confirmed at 80% completion", "No issues detected – smooth execution expected"],
    timeline: [
      { id: "t1", type: "created", title: "PO Created", description: "Created by Suhas Nair", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), actor: "Suhas Nair" },
      { id: "t2", type: "call", title: "Kickoff Call", description: "AI confirmed production schedule", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), actor: "CALL-E Beta" },
    ],
  },
];

export const MOCK_AI_CALLS: AICall[] = [
  {
    id: "call1",
    vendorId: "v1",
    vendorName: "Apex Components Ltd.",
    poId: "po1",
    poNumber: "PO-2025-0041",
    status: "completed",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 187,
    aiConfidence: 96,
    agentName: "CALL-E Alpha",
    summary: "Vendor confirmed shipment is in transit. AWB tracking provided. Delivery on schedule for Thursday. No issues flagged.",
    extractedInfo: {
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      confirmedQuantity: 700,
      totalAmount: 284500,
      contactName: "Rajesh Sharma",
      additionalNotes: "Shipment tracking: AWB-78234. Driver contact: +91 99887 76655",
      confidence: 96,
    },
    transcript: [
      { id: "m1", role: "agent", content: "Hello, this is CALL-E from VendorFlow. Am I speaking with Rajesh Sharma from Apex Components?", timestamp: 0 },
      { id: "m2", role: "vendor", content: "Yes, this is Rajesh. How can I help you?", timestamp: 8 },
      { id: "m3", role: "agent", content: "I'm calling regarding Purchase Order PO-2025-0041 for 500 PCB assemblies and 200 capacitor banks. Expected delivery is Thursday. Can you confirm the current status?", timestamp: 12 },
      { id: "m4", role: "vendor", content: "Yes, the order is already shipped. It left our warehouse this morning. AWB tracking number is AWB-78234. You should receive it by Thursday afternoon.", timestamp: 24 },
      { id: "m5", role: "agent", content: "Excellent. And can you confirm the quantities – 500 PCB assemblies and 200 capacitor banks?", timestamp: 48 },
      { id: "m6", role: "vendor", content: "That's correct. All 700 units are on the truck. Quality checked and packed.", timestamp: 58 },
      { id: "m7", role: "agent", content: "Perfect. Is there any risk of delay or anything we should be aware of?", timestamp: 68 },
      { id: "m8", role: "vendor", content: "No, everything looks good. The driver's number is +91 99887 76655 if you need real-time updates.", timestamp: 76 },
      { id: "m9", role: "agent", content: "Thank you Rajesh. I'll update the system and our team will be ready for receipt. Have a great day!", timestamp: 92 },
      { id: "m10", role: "vendor", content: "Thanks. Bye!", timestamp: 98 },
    ],
  },
  {
    id: "call2",
    vendorId: "v3",
    vendorName: "GlobalParts Supply Co.",
    poId: "po2",
    poNumber: "PO-2025-0038",
    status: "completed",
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    duration: 243,
    aiConfidence: 83,
    agentName: "CALL-E Beta",
    summary: "Delivery delayed by 4-5 business days. Vendor cited material certification issue at supplier factory. AI flagged this as high-risk and escalated to procurement manager.",
    extractedInfo: {
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      delayReason: "Material certification hold at origin factory – third-party lab testing required",
      confirmedQuantity: 1000,
      contactName: "Amit Verma",
      additionalNotes: "Escalated to procurement. Alternate sourcing research initiated.",
      confidence: 83,
    },
    transcript: [
      { id: "m1", role: "agent", content: "Hello, am I speaking with Amit Verma from GlobalParts Supply?", timestamp: 0 },
      { id: "m2", role: "vendor", content: "Yes, speaking.", timestamp: 6 },
      { id: "m3", role: "agent", content: "Hi Amit, I'm calling about PO-2025-0038 for 1000 hydraulic valves. The expected delivery was yesterday. Can you update us on the status?", timestamp: 10 },
      { id: "m4", role: "vendor", content: "Yes, I was going to call you. We're facing a delay. Our supplier has put a quality hold on the batch. They need third-party certification for the material.", timestamp: 25 },
      { id: "m5", role: "agent", content: "I understand. What's the revised delivery estimate?", timestamp: 46 },
      { id: "m6", role: "vendor", content: "We're looking at 4 to 5 business days from now. So approximately next Tuesday or Wednesday.", timestamp: 52 },
      { id: "m7", role: "agent", content: "And will the full quantity of 1000 valves be delivered, or is there a partial shipment option?", timestamp: 68 },
      { id: "m8", role: "vendor", content: "Full 1000. We won't split the batch because it's a single certification batch.", timestamp: 78 },
      { id: "m9", role: "agent", content: "Understood. I'm flagging this as a delay in our system and will notify the procurement team. Is there anything you need from our side?", timestamp: 89 },
      { id: "m10", role: "vendor", content: "No, we'll keep you posted. Sorry for the inconvenience.", timestamp: 102 },
    ],
  },
  {
    id: "call3",
    vendorId: "v4",
    vendorName: "Sunrise Logistics Pvt.",
    poId: "po3",
    poNumber: "PO-2025-0044",
    status: "scheduled",
    startedAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    aiConfidence: 0,
    agentName: "CALL-E Gamma",
    summary: "Call scheduled for tomorrow 10:00 AM to confirm PO receipt and delivery zones.",
    extractedInfo: { confidence: 0 },
    transcript: [],
  },
  {
    id: "call4",
    vendorId: "v2",
    vendorName: "TechnoForge Industries",
    poId: "po4",
    poNumber: "PO-2025-0035",
    status: "completed",
    startedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 156,
    aiConfidence: 99,
    agentName: "CALL-E Alpha",
    summary: "Vendor confirmed PO and delivery timeline. Production already started. 100% confidence.",
    extractedInfo: {
      deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      confirmedQuantity: 200,
      totalAmount: 445000,
      contactName: "Priya Menon",
      confidence: 99,
    },
    transcript: [
      { id: "m1", role: "agent", content: "Hi, is this Priya Menon from TechnoForge Industries?", timestamp: 0 },
      { id: "m2", role: "vendor", content: "Yes, hi! You're calling about the steel frames order?", timestamp: 7 },
      { id: "m3", role: "agent", content: "Exactly, PO-2025-0035. 200 custom frames. Can you confirm receipt and the production timeline?", timestamp: 12 },
      { id: "m4", role: "vendor", content: "Yes, we received it. Production started this morning. We're on track for delivery as per schedule.", timestamp: 23 },
    ],
  },
  {
    id: "call5",
    vendorId: "v5",
    vendorName: "MegaSource Distributors",
    status: "no_answer",
    startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    duration: 32,
    aiConfidence: 0,
    agentName: "CALL-E Beta",
    summary: "No answer after 3 attempts. Voicemail left. Retrying in 4 hours.",
    extractedInfo: { confidence: 0 },
    transcript: [],
  },
  {
    id: "call6",
    vendorId: "v6",
    vendorName: "Precision Parts Corp.",
    poId: "po5",
    poNumber: "PO-2025-0042",
    status: "completed",
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    duration: 198,
    aiConfidence: 91,
    agentName: "CALL-E Beta",
    summary: "Production at 80% completion. No issues. Delivery confirmed for the scheduled date.",
    extractedInfo: {
      deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      confirmedQuantity: 300,
      contactName: "Nisha Jain",
      additionalNotes: "Production running smoothly. Final QC scheduled 2 days before delivery.",
      confidence: 91,
    },
    transcript: [
      { id: "m1", role: "agent", content: "Hello Nisha, calling about PO-2025-0042 for CNC machined brackets.", timestamp: 0 },
      { id: "m2", role: "vendor", content: "Yes, production is going well. We're at about 80% now.", timestamp: 8 },
      { id: "m3", role: "agent", content: "Great. Delivery still on track for the 23rd?", timestamp: 14 },
      { id: "m4", role: "vendor", content: "Absolutely. We'll have QC done by the 21st and ship on the 22nd.", timestamp: 19 },
    ],
  },
];

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "a1", type: "call", title: "AI Call Completed", description: "CALL-E Alpha finished call with Apex Components – delivery confirmed", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), meta: "PO-2025-0041" },
  { id: "a2", type: "alert", title: "Delay Detected", description: "GlobalParts Supply reporting 4-5 day delay on hydraulic valves", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), meta: "PO-2025-0038" },
  { id: "a3", type: "po_update", title: "PO Created", description: "New purchase order created for Sunrise Logistics – ₹92,000", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), meta: "PO-2025-0044" },
  { id: "a4", type: "success", title: "Order Delivered", description: "TechnoForge delivered 200 steel frames – 2 days early", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), meta: "PO-2025-0035" },
  { id: "a5", type: "call", title: "Call Scheduled", description: "Follow-up call with Sunrise Logistics scheduled for tomorrow 10:00 AM", timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), meta: "PO-2025-0044" },
  { id: "a6", type: "vendor_added", title: "New Vendor Onboarded", description: "Precision Parts Corp. added to the platform", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_ANALYTICS: AnalyticsData = {
  totalCalls: 248,
  successfulCalls: 211,
  avgCallDuration: 187,
  avgVendorResponseTime: 28,
  callSuccessRate: 85.1,
  monthlyTrend: [
    { month: "Feb", calls: 28, successful: 22, failed: 6 },
    { month: "Mar", calls: 34, successful: 29, failed: 5 },
    { month: "Apr", calls: 41, successful: 36, failed: 5 },
    { month: "May", calls: 38, successful: 31, failed: 7 },
    { month: "Jun", calls: 45, successful: 40, failed: 5 },
    { month: "Jul", calls: 62, successful: 53, failed: 9 },
  ],
  callsByStatus: [
    { name: "Completed", value: 211, color: "#10B981" },
    { name: "Failed", value: 22, color: "#EF4444" },
    { name: "No Answer", value: 11, color: "#F59E0B" },
    { name: "Scheduled", value: 4, color: "#4F46E5" },
  ],
  vendorResponseTimes: [
    { vendor: "Sunrise", responseTime: 12, calls: 48 },
    { vendor: "Apex", responseTime: 18, calls: 62 },
    { vendor: "Precision", responseTime: 22, calls: 31 },
    { vendor: "TechnoForge", responseTime: 32, calls: 44 },
    { vendor: "GlobalParts", responseTime: 48, calls: 38 },
    { vendor: "MegaSource", responseTime: 72, calls: 25 },
  ],
  revenueAtRisk: [
    { date: "Feb 1", value: 120000 },
    { date: "Mar 1", value: 95000 },
    { date: "Apr 1", value: 180000 },
    { date: "May 1", value: 75000 },
    { date: "Jun 1", value: 220000 },
    { date: "Jul 1", value: 156000 },
  ],
};

// Dashboard summary stats
export const MOCK_STATS = {
  totalVendors: 6,
  activePOs: 3,
  pendingCalls: 2,
  delayedOrders: 1,
  todayCompletedCalls: 3,
};
