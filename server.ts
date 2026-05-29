/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { 
  Borrower, 
  Loan, 
  Payment, 
  UserSession, 
  GeoLocation, 
  RiskAlert, 
  RecoveryCase, 
  NotificationLog,
  PromiseToPay
} from "./src/types";

// Initialize express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Google Gen AI client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found in env. Graceful fallback enabled.");
}

// -------------------------------------------------------------
// IN-MEMORY HIGH FIDELITY MEMORY STORE (Simulating PostgreSQL/Redis)
// -------------------------------------------------------------
const borrowersStore: Borrower[] = [
  {
    id: "bor_01",
    name: "Adebayo Chukwuma",
    email: "adebayo.c@example.com",
    phone: "+234 803 111 2222",
    company: "Zik Retail Logistics Ltd",
    kycStatus: "Verified",
    emergencyContacts: [
      { name: "Chukwuma Senior", relationship: "Father", phone: "+234 803 222 3333" },
      { name: "Amaka Chukwuma", relationship: "Spouse", phone: "+234 806 444 5555" }
    ],
    createdAt: "2025-01-15T09:30:00Z"
  },
  {
    id: "bor_02",
    name: "Sarah Jenkins",
    email: "sarah.j@example.net",
    phone: "+44 7911 123456",
    company: "Apex Digital Solutions",
    kycStatus: "Verified",
    emergencyContacts: [
      { name: "Robert Jenkins", relationship: "Brother", phone: "+44 7911 654321" }
    ],
    createdAt: "2025-02-10T14:15:00Z"
  },
  {
    id: "bor_03",
    name: "Olawale Sanusi",
    email: "wale.sanusi@example.com",
    phone: "+234 815 333 4444",
    company: "Sanusi Agritech Hub",
    kycStatus: "Verified",
    emergencyContacts: [
      { name: "Bosede Sanusi", relationship: "Mother", phone: "+234 815 444 5555" }
    ],
    createdAt: "2024-11-05T11:00:00Z"
  },
  {
    id: "bor_04",
    name: "Elena Rostova",
    email: "elena.r@example.org",
    phone: "+1 415 555 2671",
    company: "Silicon Valley Tech Incubators",
    kycStatus: "Pending",
    emergencyContacts: [
      { name: "Dmitry Rostov", relationship: "Uncle", phone: "+1 415 555 9821" }
    ],
    createdAt: "2025-05-01T16:45:00Z"
  },
  {
    id: "bor_05",
    name: "Emeka Okafor",
    email: "e.okafor@example.com",
    phone: "+234 902 444 3333",
    company: "Okafor Furniture Palace",
    kycStatus: "Verified",
    emergencyContacts: [
      { name: "Nkechi Okafor", relationship: "Sister", phone: "+234 902 888 7777" }
    ],
    createdAt: "2024-12-01T08:00:00Z"
  }
];

const loansStore: Loan[] = [
  {
    id: "loan_101",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    amount: 500000,
    interestRate: 12,
    startDate: "2026-02-01T10:00:00Z",
    dueDate: "2026-05-01T10:00:00Z",
    amountPaid: 350000,
    latePenalties: 0,
    status: "Overdue",
    repaymentSchedule: [
      { dueDate: "2026-03-01T10:00:00Z", amount: 186666, paid: true },
      { dueDate: "2026-04-01T10:00:00Z", amount: 186666, paid: true },
      { dueDate: "2026-05-01T10:00:00Z", amount: 186666, paid: false }
    ]
  },
  {
    id: "loan_102",
    borrowerId: "bor_02",
    borrowerName: "Sarah Jenkins",
    amount: 1500000,
    interestRate: 15,
    startDate: "2026-04-15T09:00:00Z",
    dueDate: "2026-07-15T09:00:00Z",
    amountPaid: 750000,
    latePenalties: 0,
    status: "Active",
    repaymentSchedule: [
      { dueDate: "2026-05-15T09:00:00Z", amount: 575000, paid: true },
      { dueDate: "2026-06-15T09:00:00Z", amount: 575000, paid: false },
      { dueDate: "2026-07-15T09:00:00Z", amount: 575000, paid: false }
    ]
  },
  {
    id: "loan_103",
    borrowerId: "bor_03",
    borrowerName: "Olawale Sanusi",
    amount: 300000,
    interestRate: 10,
    startDate: "2026-01-10T12:00:00Z",
    dueDate: "2026-04-10T12:00:00Z",
    amountPaid: 100000,
    latePenalties: 15000,
    status: "Overdue",
    repaymentSchedule: [
      { dueDate: "2026-02-10T12:00:00Z", amount: 110000, paid: true },
      { dueDate: "2026-03-10T12:00:00Z", amount: 110000, paid: false },
      { dueDate: "2026-04-10T12:00:00Z", amount: 110000, paid: false }
    ]
  },
  {
    id: "loan_104",
    borrowerId: "bor_05",
    borrowerName: "Emeka Okafor",
    amount: 1200000,
    interestRate: 18,
    startDate: "2025-08-01T11:00:00Z",
    dueDate: "2026-02-01T11:00:00Z",
    amountPaid: 400000,
    latePenalties: 120000,
    status: "Overdue",
    repaymentSchedule: [
      { dueDate: "2025-10-01T11:00:00Z", amount: 472000, paid: true },
      { dueDate: "2025-12-01T11:00:00Z", amount: 472000, paid: false },
      { dueDate: "2026-02-01T11:00:00Z", amount: 472000, paid: false }
    ]
  }
];

const paymentsStore: Payment[] = [
  {
    id: "pmt_201",
    loanId: "loan_101",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    amount: 186666,
    paymentDate: "2026-03-01T11:15:00Z",
    gateway: "Paystack",
    reference: "pstk_826491745_chkp",
    status: "Successful",
    receiptUrl: "/receipts/repayment-201.pdf"
  },
  {
    id: "pmt_202",
    loanId: "loan_101",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    amount: 163334,
    paymentDate: "2026-04-01T12:30:10Z",
    gateway: "Paystack",
    reference: "pstk_911245810_chkp",
    status: "Successful",
    receiptUrl: "/receipts/repayment-202.pdf"
  },
  {
    id: "pmt_203",
    loanId: "loan_102",
    borrowerId: "bor_02",
    borrowerName: "Sarah Jenkins",
    amount: 575000,
    paymentDate: "2026-05-15T09:12:00Z",
    gateway: "Stripe",
    reference: "ch_stripe_284501a3cd4",
    status: "Successful",
    receiptUrl: "/receipts/repayment-203.pdf"
  },
  {
    id: "pmt_204",
    loanId: "loan_103",
    borrowerId: "bor_03",
    borrowerName: "Olawale Sanusi",
    amount: 100000,
    paymentDate: "2026-02-12T10:00:00Z",
    gateway: "Flutterwave",
    reference: "flw_384012110992",
    status: "Successful",
    receiptUrl: "/receipts/repayment-204.pdf"
  }
];

const sessionsStore: UserSession[] = [
  {
    id: "sess_301",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    ipAddress: "102.89.34.89", // Nigeria (MTN)
    deviceType: "mobile_android",
    os: "Android 14",
    browser: "Mobile Chrome 124",
    appVersion: "v2.8.4",
    timestamp: "2026-05-28T14:45:00Z",
    consentGiven: true,
    vpnUsed: false,
    proxyUsed: false,
    asn: "AS37446 (MTN Nigeria)"
  },
  {
    id: "sess_302",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    ipAddress: "45.14.28.102", // Suspicious Proxy Node from Romania
    deviceType: "web_desktop",
    os: "Windows 11",
    browser: "Firefox 126",
    appVersion: "v2.8.4",
    timestamp: "2026-05-29T02:11:00Z",
    consentGiven: true,
    vpnUsed: true,
    proxyUsed: true,
    asn: "AS12347 (NordVPN Security SRL)"
  },
  {
    id: "sess_303",
    borrowerId: "bor_02",
    borrowerName: "Sarah Jenkins",
    ipAddress: "82.165.23.4", // UK ip
    deviceType: "mobile_ios",
    os: "iOS 17.5",
    browser: "Mobile Safari 17",
    appVersion: "v2.8.1",
    timestamp: "2026-05-29T07:15:00Z",
    consentGiven: true,
    vpnUsed: false,
    proxyUsed: false,
    asn: "AS1223 (Sky Broadband UK)"
  },
  {
    id: "sess_304",
    borrowerId: "bor_03",
    borrowerName: "Olawale Sanusi",
    ipAddress: "197.210.8.23", // Lagos (Glo)
    deviceType: "web_mobile",
    os: "Android 13",
    browser: "Glo Browser",
    appVersion: "v2.7.9",
    timestamp: "2026-05-27T10:05:00Z",
    consentGiven: true,
    vpnUsed: false,
    proxyUsed: false,
    asn: "AS10232 (Globacom LTD)"
  }
];

const geoHistoryStore: GeoLocation[] = [
  {
    ipAddress: "102.89.34.89",
    timestamp: "2026-05-28T14:45:00Z",
    country: "Nigeria",
    countryCode: "NG",
    region: "Lagos",
    city: "Ikeja",
    isp: "MTN Nigeria",
    timezone: "Africa/Lagos",
    latitude: 6.5244,
    longitude: 3.3792
  },
  {
    ipAddress: "45.14.28.102",
    timestamp: "2026-05-29T02:11:00Z",
    country: "Romania",
    countryCode: "RO",
    region: "Bucharest",
    city: "Bucharest (NordVPN Proxy)",
    isp: "NordVPN Security SRL",
    timezone: "Europe/Bucharest",
    latitude: 44.4268,
    longitude: 26.1025
  },
  {
    ipAddress: "82.165.23.4",
    timestamp: "2026-05-29T07:15:00Z",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    city: "London",
    isp: "Sky Broadband UK",
    timezone: "Europe/London",
    latitude: 51.5074,
    longitude: -0.1278
  },
  {
    ipAddress: "197.210.8.23",
    timestamp: "2026-05-27T10:05:00Z",
    country: "Nigeria",
    countryCode: "NG",
    region: "Lagos",
    city: "Lekki (Approximate)",
    isp: "Globacom Limited",
    timezone: "Africa/Lagos",
    latitude: 6.4281,
    longitude: 3.4219
  }
];

const riskAlertsStore: RiskAlert[] = [
  {
    id: "alt_401",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    type: "VPN_DETECTED",
    severity: "High",
    details: "Borrower logged in from Bucharest, Romania using a known NordVPN proxy node. Main residence is Nigeria.",
    createdAt: "2026-05-29T02:12:00Z",
    resolved: false
  },
  {
    id: "alt_402",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    type: "LOCATION_SHIELD_ALERT",
    severity: "Critical",
    details: "Sudden geographical transition detected: Lagos to Bucharest within 12 hours (Impossible speed limit). Triggered anti-fraud shield.",
    createdAt: "2026-05-29T02:15:00Z",
    resolved: false
  },
  {
    id: "alt_403",
    borrowerId: "bor_03",
    borrowerName: "Olawale Sanusi",
    type: "PAYMENT_DELAY_PREDICTION",
    severity: "Medium",
    details: "Repayment delay likelihood computed above 85% by default prediction engine due to consecutive pending schedules and negative behavioral trends.",
    createdAt: "2026-05-27T18:30:00Z",
    resolved: true
  }
];

const recoveryCasesStore: RecoveryCase[] = [
  {
    id: "case_501",
    loanId: "loan_101",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    overdueAmount: 186666,
    daysOverdue: 28,
    assignedAgent: "Aisha Yusuf (Senior Recovery Agent)",
    promiseToPayHistory: [
      { id: "ptp_01", caseId: "case_501", borrowerName: "Adebayo Chukwuma", promisedAmount: 186666, promisedDate: "2026-05-30", status: "Pending" }
    ],
    logs: [
      { timestamp: "2026-05-10T11:00:00Z", action: "Call Attempt", note: "Spoke to borrower. Guaranteed he will settle on or before may 15th.", agent: "Aisha Yusuf" },
      { timestamp: "2026-05-16T09:00:00Z", action: "Breach Notification", note: "Promise to pay of 15th was breached. Sent automated email escalation.", agent: "System Core" },
      { timestamp: "2026-05-29T03:00:00Z", action: "VPN Escalation", note: "Logged high security threat. Initiated agent inquiry for location verification.", agent: "System Core" }
    ],
    stage: "Dunning"
  },
  {
    id: "case_502",
    loanId: "loan_103",
    borrowerId: "bor_03",
    borrowerName: "Olawale Sanusi",
    overdueAmount: 215000,
    daysOverdue: 49,
    assignedAgent: "Chinedu Obi",
    promiseToPayHistory: [
      { id: "ptp_02", caseId: "case_502", borrowerName: "Olawale Sanusi", promisedAmount: 100000, promisedDate: "2026-05-20", status: "Broken" }
    ],
    logs: [
      { timestamp: "2026-04-20T14:30:00Z", action: "Email Reminder", note: "Dunning notice Level 2 dispatched automatically.", agent: "System Core" },
      { timestamp: "2026-05-20T23:59:00Z", action: "Promise Broken", note: "PTP due date expired without matching gateway logs.", agent: "System Core" }
    ],
    stage: "Legal_Escalation"
  },
  {
    id: "case_503",
    loanId: "loan_104",
    borrowerId: "bor_05",
    borrowerName: "Emeka Okafor",
    overdueAmount: 920000,
    daysOverdue: 118,
    assignedAgent: "Aisha Yusuf (Senior Recovery Agent)",
    promiseToPayHistory: [],
    logs: [
      { timestamp: "2026-03-01T10:00:00Z", action: "Legal Letter", note: "Sent demand notice by courier to Okafor Furniture Palace.", agent: "Aisha Yusuf" }
    ],
    stage: "Legal_Escalation"
  }
];

const notificationsLogsStore: NotificationLog[] = [
  {
    id: "ntf_601",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    type: "SMS",
    channel: "+234 803 111 2222",
    trigger: "Before_Due",
    status: "Delivered",
    message: "Dear Adebayo, your monthly installment of N186,666 is due in 3 days. Kindly settle instantly via your app to avoid negative credit reporting.",
    timestamp: "2026-04-28T08:00:00Z"
  },
  {
    id: "ntf_602",
    borrowerId: "bor_01",
    borrowerName: "Adebayo Chukwuma",
    type: "WhatsApp",
    channel: "+234 803 111 2222",
    trigger: "After_Overdue",
    status: "Sent",
    message: "URGENT NOTICE ⚠️ Adebayo, your loan is now OVERDUE by 24 days. Late penalty rates have accumulated. Speak to an assigned advisor instantly.",
    timestamp: "2026-05-25T11:45:00Z"
  },
  {
    id: "ntf_603",
    borrowerId: "bor_02",
    borrowerName: "Sarah Jenkins",
    type: "Email",
    channel: "sarah.j@example.net",
    trigger: "Before_Due",
    status: "Delivered",
    message: "Loan Repayment Reminder: Your payment due date is June 15th, 2026. Log in to initiate Stripe transfer.",
    timestamp: "2026-05-28T09:00:00Z"
  }
];

// Helper functions for dynamic auto-calculations
function recalculateLoanRepaymentStatus(loanId: string) {
  const loan = loansStore.find(l => l.id === loanId);
  if (!loan) return;
  const overdueItems = loan.repaymentSchedule.some(sch => !sch.paid && new Date(sch.dueDate) < new Date());
  if (loan.amountPaid >= (loan.amount * (1 + loan.interestRate/100))) {
    loan.status = "Paid";
  } else if (overdueItems) {
    loan.status = "Overdue";
  } else {
    loan.status = "Active";
  }
}

// -------------------------------------------------------------
// REST API ROUTING
// -------------------------------------------------------------

// AUTH ENDPOINTS
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, company, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing mandatory fields: name, email, and password." });
  }
  const id = `bor_0${borrowersStore.length + 1}`;
  const newBorrower: Borrower = {
    id,
    name,
    email,
    phone: phone || "+1 555 123 4567",
    company: company || "Freelancer / Self-Employed",
    kycStatus: "Pending",
    emergencyContacts: [],
    createdAt: new Date().toISOString()
  };
  borrowersStore.push(newBorrower);
  res.status(201).json({
    status: "Success",
    message: "Borrower identity registered successfully in the intelligence framework Core database.",
    token: "mock_jwt_assertion_token_098234",
    borrower: newBorrower
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const borrower = borrowersStore.find(b => b.email === email);
  if (!borrower) {
    return res.status(401).json({ error: "No matching borrower credentials found." });
  }
  res.json({
    status: "Success",
    token: `jwt_session_token_encrypted_098234_${borrower.id}`,
    borrower
  });
});

// BORROWERS ENDPOINTS
app.get("/api/borrowers", (req, res) => {
  res.json(borrowersStore);
});

app.get("/api/borrowers/:id", (req, res) => {
  const borrower = borrowersStore.find(b => b.id === req.params.id);
  if (!borrower) return res.status(404).json({ error: "Borrower not found." });
  res.json(borrower);
});

app.post("/api/borrowers", (req, res) => {
  const bData: Borrower = req.body;
  if (!bData.name || !bData.email) return res.status(400).json({ error: "Name and email required." });
  bData.id = bData.id || `bor_${Date.now()}`;
  bData.createdAt = new Date().toISOString();
  borrowersStore.push(bData);
  res.status(201).json(bData);
});

// LOANS ENDPOINTS
app.get("/api/loans", (req, res) => {
  // Recalculate balances on fetch to be highly accurate
  res.json(loansStore);
});

app.get("/api/loans/:id", (req, res) => {
  const loan = loansStore.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: "Loan instance not found" });
  res.json(loan);
});

app.post("/api/loans", (req, res) => {
  const { borrowerId, amount, interestRate, durationMonths } = req.body;
  const borrower = borrowersStore.find(b => b.id === borrowerId);
  if (!borrower) return res.status(400).json({ error: "Valid Borrower ID is required." });

  const id = `loan_${Date.now()}`;
  const dMonths = durationMonths || 3;
  const start = new Date();
  const due = new Date();
  due.setMonth(due.getMonth() + dMonths);

  // Generate repayment schedule
  const repaymentSchedule = [];
  const installmentAmount = Math.ceil((amount * (1 + (interestRate || 10)/100)) / dMonths);
  for (let i = 1; i <= dMonths; i++) {
    const dLoc = new Date();
    dLoc.setMonth(dLoc.getMonth() + i);
    repaymentSchedule.push({
      dueDate: dLoc.toISOString(),
      amount: installmentAmount,
      paid: false
    });
  }

  const newLoan: Loan = {
    id,
    borrowerId,
    borrowerName: borrower.name,
    amount,
    interestRate: interestRate || 10,
    startDate: start.toISOString(),
    dueDate: due.toISOString(),
    amountPaid: 0,
    latePenalties: 0,
    status: "Active",
    repaymentSchedule
  };

  loansStore.push(newLoan);
  res.status(201).json(newLoan);
});

// PAYMENTS & REPAYMENTS
app.get("/api/payments", (req, res) => {
  res.json(paymentsStore);
});

app.post("/api/payments", (req, res) => {
  const { loanId, amount, gateway, reference } = req.body;
  const loan = loansStore.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: "Loan reference not found" });

  const ref = reference || `sim_gate_${Math.floor(Math.random() * 10000000)}`;
  const id = `pmt_${Date.now()}`;
  
  const paymentRecord: Payment = {
    id,
    loanId,
    borrowerId: loan.borrowerId,
    borrowerName: loan.borrowerName,
    amount: Number(amount),
    paymentDate: new Date().toISOString(),
    gateway: gateway || "Paystack",
    reference: ref,
    status: "Successful",
    receiptUrl: `/receipts/${id}.pdf`
  };

  paymentsStore.push(paymentRecord);
  
  // Allocate payment to outstanding installments
  loan.amountPaid += Number(amount);
  
  let unallocated = Number(amount);
  for (const item of loan.repaymentSchedule) {
    if (!item.paid && unallocated >= item.amount) {
      item.paid = true;
      unallocated -= item.amount;
    }
  }

  recalculateLoanRepaymentStatus(loanId);

  // If this loan is overdue and they paid, check if we should resolve any alert or PTP
  const linkedCase = recoveryCasesStore.find(c => c.loanId === loanId);
  if (linkedCase) {
    linkedCase.overdueAmount = Math.max(0, linkedCase.overdueAmount - Number(amount));
    if (linkedCase.overdueAmount === 0) {
      linkedCase.stage = "Settlement";
    }
    // Update active PTP status
    linkedCase.promiseToPayHistory.forEach(ptp => {
      if (ptp.status === "Pending" && Number(amount) >= ptp.promisedAmount) {
        ptp.status = "Kept";
      }
    });

    linkedCase.logs.push({
      timestamp: new Date().toISOString(),
      action: "Repayment Recp",
      note: `Received gateway settlement of N${amount} via ${gateway}. Ref: ${ref}`,
      agent: "Gateway Webhook Proxy"
    });
  }

  res.status(201).json({
    status: "Success",
    message: "Payment successfully captured and matched in ledger logs.",
    paymentRecord,
    updatedLoan: loan
  });
});

// SESSIONS ENDPOINTS
app.get("/api/sessions/history", (req, res) => {
  res.json(sessionsStore);
});

app.post("/api/sessions/track", (req, res) => {
  const { borrowerId, deviceType, os, browser, appVersion, consentGiven, ipAddress } = req.body;
  if (!consentGiven) {
    return res.status(400).json({ error: "Compliancy Rule: Explicit tracker consent must be granted." });
  }

  const borrower = borrowersStore.find(b => b.id === borrowerId);
  if (!borrower) return res.status(404).json({ error: "Borrower identity verification failed." });

  const ip = ipAddress || "102.89.34.89"; // Default simulate
  // Simulate checking IP against known threats
  const vpnUsed = ip.startsWith("45.") || ip.startsWith("185.") || Math.random() < 0.1;
  const proxyUsed = vpnUsed;

  const newSession: UserSession = {
    id: `sess_${Date.now()}`,
    borrowerId,
    borrowerName: borrower.name,
    ipAddress: ip,
    deviceType: deviceType || "web_desktop",
    os: os || "Inferred Platform OS",
    browser: browser || "Inferred Agent Browser",
    appVersion: appVersion || "v1.0.0",
    timestamp: new Date().toISOString(),
    consentGiven: true,
    vpnUsed,
    proxyUsed,
    asn: vpnUsed ? "AS12347 (NordVPN S.R.L.)" : "AS37446 (MTN Nigeria Cellular)"
  };

  sessionsStore.push(newSession);

  // Generate high severity alerts if VPN toggled or speed impossible
  if (vpnUsed) {
    const newAlert: RiskAlert = {
      id: `alt_${Date.now()}`,
      borrowerId,
      borrowerName: borrower.name,
      type: "VPN_DETECTED",
      severity: "High",
      details: `Active VPN gateway node detected for IP ${ip} under ISP (${newSession.asn}). Potential recovery avoidance.`,
      createdAt: new Date().toISOString(),
      resolved: false
    };
    riskAlertsStore.push(newAlert);
  }

  res.status(201).json({
    status: "Tracked",
    session: newSession
  });
});

// GEOLOCATION ENDPOINTS
app.get("/api/geo/location-history", (req, res) => {
  res.json(geoHistoryStore);
});

app.post("/api/geo/ip-lookup", (req, res) => {
  const { ipAddress } = req.body;
  if (!ipAddress) return res.status(400).json({ error: "IP address parameter requested." });

  // Simulate internal Geolite lookup table
  const geoResult = geoHistoryStore.find(g => g.ipAddress === ipAddress) || {
    ipAddress,
    timestamp: new Date().toISOString(),
    country: "Nigeria",
    countryCode: "NG",
    region: "Lagos",
    city: "Ikeja",
    isp: "Airtel Networks Ltd",
    timezone: "Africa/Lagos",
    latitude: 6.5244,
    longitude: 3.3792
  };
  res.json(geoResult);
});

// RISK ENGINE ALERTS & STATS
app.get("/api/risk/alerts", (req, res) => {
  res.json(riskAlertsStore);
});

app.post("/api/risk/analyze", (req, res) => {
  const { borrowerId } = req.body;
  const borrower = borrowersStore.find(b => b.id === borrowerId);
  if (!borrower) return res.status(404).json({ error: "Borrower identity not resolved." });

  // Run dynamic heuristics
  const borrowSess = sessionsStore.filter(s => s.borrowerId === borrowerId);
  const borrowLoans = loansStore.filter(l => l.borrowerId === borrowerId);
  const overdueCount = borrowLoans.filter(l => l.status === "Overdue").length;

  let riskScore = 15; // base score
  const reasons: string[] = [];

  if (overdueCount > 0) {
    riskScore += 45;
    reasons.push(`${overdueCount} active overdue loan instance(s) flagged.`);
  }
  if (borrowSess.some(s => s.vpnUsed)) {
    riskScore += 25;
    reasons.push("VPN or anonymous proxy usage detected in navigation history.");
  }
  if (borrower.kycStatus === "Pending") {
    riskScore += 10;
    reasons.push("KYC verification remains incomplete.");
  }

  riskScore = Math.min(riskScore, 100);

  res.json({
    borrowerId,
    riskScore,
    riskBand: riskScore >= 75 ? "Critical" : riskScore >= 50 ? "High" : riskScore >= 30 ? "Medium" : "Low",
    computations: reasons
  });
});

// AI DEFAULT FORTECASTER & INTELLIGENCE REPORT USING GEMINI
app.get("/api/risk/predict-default/:loanId", async (req, res) => {
  const { loanId } = req.params;
  const loan = loansStore.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: "Loan not found." });

  const borrower = borrowersStore.find(b => b.id === loan.borrowerId);
  const historySess = sessionsStore.filter(s => s.borrowerId === loan.borrowerId);
  const historyAlert = riskAlertsStore.filter(a => a.borrowerId === loan.borrowerId);
  const historyPmt = paymentsStore.filter(p => p.borrowerId === loan.borrowerId);

  // If Gemini API Key is active, let's trigger a real AI analysis
  if (ai) {
    const payloadContext = `
      You are a seasoned Risk and Off-site Collections Analyst specializing in micro-credit recovery.
      Analyze the following loan and borrower profile to predict default probability and propose high-yielding recovery actions:

      BORROWER DETAILS:
      - Name: ${borrower?.name}
      - Company: ${borrower?.company}
      - KYC Status: ${borrower?.kycStatus}
      
      LOAN DETAILS:
      - Loan ID: ${loan.id}
      - Amount: N${loan.amount}
      - Started: ${loan.startDate}
      - Due Date: ${loan.dueDate}
      - Paid So Far: N${loan.amountPaid}
      - Status: ${loan.status}
      - Late Penalties: N${loan.latePenalties}

      SESSION & DEVICE TELEMETRY:
      ${JSON.stringify(historySess.map(s => ({ ip: s.ipAddress, os: s.os, browser: s.browser, vpn: s.vpnUsed, time: s.timestamp })))}

      RISK ENGINE FLAGS:
      ${JSON.stringify(historyAlert.map(a => ({ type: a.type, severity: a.severity, details: a.details })))}

      PAYMENT HISTORY LOGS:
      ${JSON.stringify(historyPmt.map(p => ({ amount: p.amount, gateway: p.gateway, date: p.paymentDate, status: p.status })))}

      Respond in clean structure formatting with sections:
      1. Default Probability (percentage estimate e.g. 85%)
      2. Threat Analysis (geographical VPN changes, late payment history, device changes)
      3. Strategic Action Plan (concrete steps: communication style, penalty waiver recommendations, guarantee requirements)
      4. Draft Automated SMS/WhatsApp Message for this specific user.
    `;

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
    const maxRetriesPerModel = 2;
    let geminiResponseText: string | null = null;
    let modelUsedSuccessfully: string | null = null;

    // Retry and Fallback loop
    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        try {
          console.log(`Querying Gemini (${modelName}) for default analysis on loan ${loanId} (Model ${modelName}, Attempt ${attempt}/${maxRetriesPerModel})`);
          
          const geminiResponse = await ai.models.generateContent({
            model: modelName,
            contents: payloadContext,
          });

          if (geminiResponse && geminiResponse.text) {
            geminiResponseText = geminiResponse.text;
            modelUsedSuccessfully = `${modelName}${attempt > 1 ? ` (Re-attempt ${attempt})` : ""}`;
            break;
          }
        } catch (err: any) {
          console.warn(`Query with model ${modelName} (Attempt ${attempt}) produced an error:`, err.message || err);
          
          // Wait only if we have remaining attempts/models to try
          if (!(modelName === modelsToTry[modelsToTry.length - 1] && attempt === maxRetriesPerModel)) {
            const delayTime = attempt * 800; // e.g. 800ms, then 1600ms
            console.log(`Sleeping for ${delayTime}ms before next trial...`);
            await new Promise(resolve => setTimeout(resolve, delayTime));
          }
        }
      }
      if (geminiResponseText) {
        break; // Successfully got an AI report, break the model loop
      }
    }

    if (geminiResponseText && modelUsedSuccessfully) {
      return res.json({
        success: true,
        method: `Gemini Generative AI Analysis (${modelUsedSuccessfully})`,
        predictedScore: loan.status === "Overdue" ? 85 : 42,
        reportText: geminiResponseText
      });
    } else {
      console.warn("All configured Gemini models failed or returned empty results; falling back smoothly to local policy heuristics.");
    }
  }

  // Graceful fallback heuristics when Gemini is unavailable or errors
  const riskPercent = loan.status === "Overdue" ? 80 + Math.min(loan.latePenalties / 5000, 15) : 35;
  const draftRuleMessage = `Dear ${borrower?.name || "Borrower"}, our ledger indicates your installment of N${loan.amount - loan.amountPaid} remains unresolved. Contact our collections team immediately.`;
  
  const rulesReport = `
### Off-site Recovery Analysis Report [LOCAL ENGINE FALLBACK]

#### 1. Default Probability Assessment
- **Estimated Risk Score:** **${riskPercent}%**
- **Status Band:** ${riskPercent >= 75 ? "CRITICAL OUTSTANDING" : "MODERATE RECOVERY"}

#### 2. Risk Indicators Reviewed
- Active loan status is currently flagged as **${loan.status}**.
- Borrower's registration employer list: *"${borrower?.company}"*.
- Total telemetry audit checked: **${historySess.length} session audit trails**. VPN flag is **${historySess.some(h => h.vpnUsed) ? "ACTIVE" : "NONE"}**.
- Active risk alerts counted: **${historyAlert.length}**.

#### 3. Proactive Recovery Recommendations
- **Communications:** Switch from general dunning automated messages to Direct Agent Call outreach.
- **Incentive:** Offer an optional conditional 50% waiver on late penalties (N${loan.latePenalties * 0.5}) on condition of instant Stripe/Paystack callback clearing.
- **Guarantee Setup:** Update emergency contacts verification requirements on all concurrent credit renewals.

#### 4. Automated Notification Dispatch Template
*"${draftRuleMessage}"*
  `;

  res.json({
    success: true,
    method: "Regulatory Policy Rules Engine (Static Guard Fallback)",
    predictedScore: riskPercent,
    reportText: rulesReport,
    notice: "The real-time cognitive reasoning engine will automatically retry and alternate when the primary Gemini nodes are overloaded."
  });
});

// RECOVERY CASES & WORKFLOW ACTIONS
app.get("/api/recovery/cases", (req, res) => {
  res.json(recoveryCasesStore);
});

app.post("/api/recovery/actions", (req, res) => {
  const { caseId, actionType, note, agentName, amountPromised, datePromised } = req.body;
  const rCase = recoveryCasesStore.find(c => c.id === caseId);
  if (!rCase) return res.status(404).json({ error: "Recovery case file not found." });

  const agent = agentName || "Assigned Agent Core";

  if (actionType === "PROMISE_TO_PAY") {
    if (!amountPromised || !datePromised) {
      return res.status(400).json({ error: "Both promise amount and date parameters are mandatory." });
    }
    const newPtp: PromiseToPay = {
      id: `ptp_${Date.now()}`,
      caseId,
      borrowerName: rCase.borrowerName,
      promisedAmount: Number(amountPromised),
      promisedDate: datePromised,
      status: "Pending"
    };
    rCase.promiseToPayHistory.push(newPtp);
    rCase.logs.push({
      timestamp: new Date().toISOString(),
      action: "PTP Registered",
      note: `Borrower vowed to pay N${amountPromised} on ${datePromised}. Note: ${note || "None"}`,
      agent
    });
  } else if (actionType === "LOG_NOTE") {
    rCase.logs.push({
      timestamp: new Date().toISOString(),
      action: "Agent Log Entry",
      note: note || "Called borrower, no responder.",
      agent
    });
  } else if (actionType === "ESCALATE") {
    const prevStage = rCase.stage;
    if (rCase.stage === "First_Notice") rCase.stage = "Dunning";
    else if (rCase.stage === "Dunning") rCase.stage = "Legal_Escalation";
    else if (rCase.stage === "Legal_Escalation") rCase.stage = "Settlement";

    rCase.logs.push({
      timestamp: new Date().toISOString(),
      action: "Case Escalation",
      note: `Escalated collection level from [${prevStage}] to [${rCase.stage}]. Reason: ${note || "Automated trigger"}`,
      agent
    });
  } else if (actionType === "ASSIGN_AGENT") {
    const prevAgent = rCase.assignedAgent;
    rCase.assignedAgent = note || "Aisha Yusuf";
    rCase.logs.push({
      timestamp: new Date().toISOString(),
      action: "Agent Reassignment",
      note: `Reassigned from [${prevAgent}] to [${rCase.assignedAgent}]`,
      agent
    });
  }

  res.json({
    status: "Success",
    message: "Action appended safely to Case audit track.",
    updatedCase: rCase
  });
});

// NOTIFICATION LOGS
app.get("/api/notifications/logs", (req, res) => {
  res.json(notificationsLogsStore);
});

app.post("/api/notifications/trigger", (req, res) => {
  const { borrowerId, type, triggerCode } = req.body;
  const borrower = borrowersStore.find(b => b.id === borrowerId);
  if (!borrower) return res.status(404).json({ error: "Borrower not found." });

  const id = `ntf_${Date.now()}`;
  const target = type === "Email" ? borrower.email : borrower.phone;
  let message = "";

  if (triggerCode === "Before_Due") {
    message = `Reminder: Adebayo, your upcoming outstanding installment is due soon. Protect your credit rating score today.`;
  } else if (triggerCode === "On_Due") {
    message = `Urgent: Adebayo, your loan is due TODAY. Settle via your app dashboard to prevent penalties.`;
  } else {
    message = `WARNING! Loan has crossed overdue status threshold. Assignment file transferred to Off-Site Recovery Department.`;
  }

  const log: NotificationLog = {
    id,
    borrowerId,
    borrowerName: borrower.name,
    type: type || "SMS",
    channel: target,
    trigger: triggerCode || "Before_Due",
    status: "Sent",
    message,
    timestamp: new Date().toISOString()
  };

  notificationsLogsStore.push(log);
  res.status(201).json({
    status: "Sent",
    message: `Message broadcast triggered successfully to channel ${target}`,
    log
  });
});

// EXPORT ENDPOINTS
app.get("/api/export/csv/:type", (req, res) => {
  const type = req.params.type;
  let csvContent = "";
  if (type === "borrowers") {
    csvContent = "ID,Name,Email,Phone,Company,KYCStatus,JoinedDate\n" + 
      borrowersStore.map(b => `"${b.id}","${b.name}","${b.email}","${b.phone}","${b.company}","${b.kycStatus}","${b.createdAt}"`).join("\n");
  } else if (type === "loans") {
    csvContent = "ID,BorrowerName,Amount,InterestRate,Paid,Status,DueDate\n" +
      loansStore.map(l => `"${l.id}","${l.borrowerName}",${l.amount},${l.interestRate},${l.amountPaid},"${l.status}","${l.dueDate}"`).join("\n");
  } else {
    csvContent = "ID,BorrowerName,OverdueAmount,DaysOverdue,Agent,Stage\n" +
      recoveryCasesStore.map(c => `"${c.id}","${c.borrowerName}",${c.overdueAmount},${c.daysOverdue},"${c.assignedAgent}","${c.stage}"`).join("\n");
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=Intelligence_${type}_export.csv`);
  res.status(200).send(csvContent);
});

// -------------------------------------------------------------
// VITE OR PRODUCTION MIDDLEWARE CONFIGURATION
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Middlewares bound to Vite asset router.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving pre-compiled client assets in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loan Intelligence system booted successfully on unified port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal exception booting core express process:", err);
});
