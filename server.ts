/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import crypto from "crypto";
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

// -------------------------------------------------------------
// CREDGUARD SUBSCRIPTION LICENSING ENGINE & MIDDIWARE
// -------------------------------------------------------------
const LICENSE_SALT = "CredGuardSecretSalt@2026";
let serverActiveLicenseKey = ""; // Starts empty/unlicensed so the user can test the apply license flow!

// -------------------------------------------------------------
// CORPORATE REST API KEYS & AUTHENTICATION (SANDBOX vs LIVE)
// -------------------------------------------------------------
interface DeveloperApiKeys {
  sandboxKey: string;
  sandboxCreated: string;
  sandboxCalls: number;
  liveKey: string;
  liveCreated: string;
  liveCalls: number;
}

let activeApiKeys: DeveloperApiKeys = {
  sandboxKey: "cg_test_5f18d72ae5cf438bb36130636cd4f91d",
  sandboxCreated: new Date().toISOString(),
  sandboxCalls: 128,
  liveKey: "cg_live_9a3c8e10df22472ba5670891d966036f",
  liveCreated: new Date().toISOString(),
  liveCalls: 45
};

let developerWebhookEventsStore: any[] = [];

function getMonthDifference(date1: Date, date2: Date): number {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
}

function generateLicenseKey(monthStr: string, duration: string): string {
  // e.g. monthStr = "2026-06", duration = "M" | "Q" | "B" | "A"
  const formattedMonth = monthStr.replace("-", ""); // "202606"
  const code = duration.toUpperCase();
  const hash = crypto.createHash("sha256").update(monthStr + code + LICENSE_SALT).digest("hex").substring(0, 8).toUpperCase();
  return `CG-${code}${formattedMonth}-${hash}`;
}

interface ParsedLicense {
  isValid: boolean;
  durationCode: string;
  startDateStr: string; // "YYYY-MM"
  expirationDate: Date;
  daysRemaining: number;
}

function verifyAndParseLicenseKey(key: string, currentMonthStr: string): ParsedLicense {
  const trimmed = key.trim().toUpperCase();
  const result: ParsedLicense = {
    isValid: false,
    durationCode: "M",
    startDateStr: currentMonthStr,
    expirationDate: new Date(),
    daysRemaining: 0
  };

  const parts = trimmed.split("-");
  if (parts.length !== 3 || parts[0] !== "CG") {
    return result;
  }

  let duration = "M"; // default
  let startMonthRaw = "";

  const part1 = parts[1];
  if (part1.length === 7) {
    // New format with duration code (e.g. Q202606)
    duration = part1.substring(0, 1);
    startMonthRaw = part1.substring(1);
  } else if (part1.length === 6) {
    // Old format (pure monthly - 202606)
    duration = "M";
    startMonthRaw = part1;
  } else {
    return result;
  }

  // Validate startMonthRaw is YYYYMM
  if (!/^\d{6}$/.test(startMonthRaw)) {
    return result;
  }

  const yearStr = startMonthRaw.substring(0, 4);
  const monthStr = startMonthRaw.substring(4);
  const startMonthIso = `${yearStr}-${monthStr}`; // "YYYY-MM"

  // Verify hash integrity
  let expectedHash = "";
  if (part1.length === 7) {
    expectedHash = crypto.createHash("sha256").update(startMonthIso + duration + LICENSE_SALT).digest("hex").substring(0, 8).toUpperCase();
  } else {
    expectedHash = crypto.createHash("sha256").update(startMonthIso + LICENSE_SALT).digest("hex").substring(0, 8).toUpperCase();
  }

  if (expectedHash !== parts[2]) {
    return result;
  }

  // Calculate expiration date
  const startYear = parseInt(yearStr, 10);
  const startMonthIndex = parseInt(monthStr, 10); // 1-index
  let planMonths = 1;
  if (duration === "Q") planMonths = 3;
  else if (duration === "B") planMonths = 6;
  else if (duration === "A") planMonths = 12;

  // Lease expires at the absolute end of the duration period
  // e.g. Monthly for 2026-06 starts 2026-06-01, expires 2026-07-01 (1st of next month)
  const expirationDate = new Date(startYear, startMonthIndex - 1 + planMonths, 1, 0, 0, 0, 0);

  // Parse current system date (the server's actual clock time)
  const now = new Date();
  
  // Is current time less than the expiration date, and not before start date?
  const startDate = new Date(startYear, startMonthIndex - 1, 1, 0, 0, 0, 0);
  const isValid = now.getTime() >= startDate.getTime() && now.getTime() < expirationDate.getTime();

  const daysRemaining = (expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

  return {
    isValid,
    durationCode: duration,
    startDateStr: startMonthIso,
    expirationDate,
    daysRemaining
  };
}

function isLicenseValidForCurrentMonth(): boolean {
  if (!serverActiveLicenseKey) return false;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const parsed = verifyAndParseLicenseKey(serverActiveLicenseKey, currentMonth);
  return parsed.isValid;
}

// License & API Key guard middleware
app.use((req, res, next) => {
  // Allow static assets, favicon, frontend pages served by Vite/Express
  if (!req.path.startsWith("/api")) {
    return next();
  }
  
  // Allow license operations, developer key readouts, plus login/register endpoints
  if (
    req.path === "/api/license/status" ||
    req.path === "/api/license/apply" ||
    req.path === "/api/license/generate" ||
    req.path === "/api/developer/keys" ||
    req.path === "/api/developer/keys/rotate" ||
    req.path === "/api/auth/login" ||
    req.path === "/api/auth/register"
  ) {
    return next();
  }

  // Check for business Developer API Keys inside the Authorization Header
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  let isDevKeyValid = false;
  let detectedKeyType: "sandbox" | "live" | null = null;

  if (token) {
    if (token === activeApiKeys.sandboxKey) {
      isDevKeyValid = true;
      activeApiKeys.sandboxCalls++;
      detectedKeyType = "sandbox";
    } else if (token === activeApiKeys.liveKey) {
      isDevKeyValid = true;
      activeApiKeys.liveCalls++;
      detectedKeyType = "live";
    }
  }

  // If a valid Sandbox or Production Client Core API Key is detected, bypass main billing license lock
  if (isDevKeyValid && detectedKeyType) {
    // Log corporate integration usage inside audit tracking
    if (typeof auditLogsStore !== 'undefined' && Array.isArray(auditLogsStore)) {
      auditLogsStore.push({
        id: `aud_${Date.now()}_api`,
        action: detectedKeyType === "sandbox" ? "API_SANDBOX_CALL" : "API_PRODUCTION_CALL",
        detail: `Banking core accessed ${req.method} ${req.path} via authentic ${detectedKeyType === "sandbox" ? "Sandbox Test Key" : "Live Production Key"}.`,
        timestamp: new Date().toISOString(),
        actor: `External API Client (${detectedKeyType})`
      });
    }
    return next();
  }

  // If the license is not entered or not valid for the current month, lock all other API operations
  if (!isLicenseValidForCurrentMonth()) {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return res.status(402).json({
      error: "Licensing Error: Your subscription license has expired or has not been applied.",
      licenseExpired: true,
      currentMonth
    });
  }

  next();
});

// -------------------------------------------------------------
// LICENSE MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// Get License Status
app.get("/api/license/status", (req, res) => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  if (!serverActiveLicenseKey) {
    return res.json({
      isValid: false,
      currentMonth,
      expiresAt: null,
      daysRemaining: null,
      activeLicenseKey: null,
      durationCode: null,
      requiredFormat: `CG-M${currentMonth.replace("-", "")}-XXXXXXXX`
    });
  }

  const parsed = verifyAndParseLicenseKey(serverActiveLicenseKey, currentMonth);
  res.json({
    isValid: parsed.isValid,
    currentMonth,
    expiresAt: parsed.expirationDate.toISOString(),
    daysRemaining: parsed.daysRemaining,
    activeLicenseKey: serverActiveLicenseKey,
    durationCode: parsed.durationCode,
    requiredFormat: `CG-${parsed.durationCode || "M"}${currentMonth.replace("-", "")}-XXXXXXXX`
  });
});

// Generate License Key for any specified month and subscription tier (Requires Admin credentials)
app.post("/api/license/generate", (req, res) => {
  const { email, password, targetMonth, duration } = req.body;
  if (!email || !targetMonth) {
    return res.status(400).json({ error: "Email and targetMonth (YYYY-MM) are required parameters." });
  }

  // Validate super admin authority
  if (email.toLowerCase() !== "fidelisemus@gmail.com" || password !== "admin123") {
    return res.status(403).json({ error: "Access Denied: Only the Master System Administrator (fidelisemus@gmail.com) can generate subscription license keys." });
  }

  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(targetMonth)) {
    return res.status(400).json({ error: "Invalid targetMonth format. Please use YYYY-MM structure (e.g. 2026-06)." });
  }

  // Determine duration code
  let durationCode = "M";
  const rawDuration = String(duration || "monthly").toLowerCase();
  if (rawDuration === "q" || rawDuration === "quarterly") {
    durationCode = "Q";
  } else if (rawDuration === "b" || rawDuration === "biannually" || rawDuration === "bi-annually" || rawDuration === "bi_annually") {
    durationCode = "B";
  } else if (rawDuration === "a" || rawDuration === "annually" || rawDuration === "annual") {
    durationCode = "A";
  }

  const generatedKey = generateLicenseKey(targetMonth, durationCode);
  res.json({
    success: true,
    targetMonth,
    duration: durationCode,
    key: generatedKey
  });
});

// Apply License Key
app.post("/api/license/apply", (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ error: "License key parameter is missing." });
  }

  const trimmedKey = key.trim();
  const currentMonth = new Date().toISOString().substring(0, 7);

  const parsed = verifyAndParseLicenseKey(trimmedKey, currentMonth);
  if (parsed.isValid) {
    serverActiveLicenseKey = trimmedKey;
    let planName = "Monthly";
    if (parsed.durationCode === "Q") planName = "Quarterly";
    else if (parsed.durationCode === "B") planName = "Bi-Annually";
    else if (parsed.durationCode === "A") planName = "Annually";

    return res.json({
      success: true,
      message: `License key applied successfully! CredGuard has been unlocked under a ${planName} lease (expires on ${parsed.expirationDate.toISOString().substring(0, 10)}).`
    });
  } else {
    // Check if key structure matches block for error feedback
    const parts = trimmedKey.split("-");
    if (parts.length === 3 && parts[0].toUpperCase() === "CG") {
      const part1 = parts[1];
      let duration = "M";
      let rawMonth = "";
      if (part1.length === 7) {
        duration = part1.substring(0, 1);
        rawMonth = part1.substring(1);
      } else if (part1.length === 6) {
        rawMonth = part1;
      }
      
      if (/^\d{6}$/.test(rawMonth)) {
        const estMonth = `${rawMonth.substring(0, 4)}-${rawMonth.substring(4)}`;
        const testParsed = verifyAndParseLicenseKey(trimmedKey, estMonth);
        if (testParsed.expirationDate.getTime() < Date.now()) {
          return res.status(400).json({
            error: `This license key has expired! It was valid from ${testParsed.startDateStr} until ${testParsed.expirationDate.toISOString().substring(0, 10)}. Please generate and apply a new key.`
          });
        } else if (testParsed.startDateStr > currentMonth) {
          return res.status(400).json({
            error: `This license key is scheduled for a future period starting ${testParsed.startDateStr}. It cannot be activated for the current month '${currentMonth}' yet.`
          });
        }
      }
    }
    
    return res.status(400).json({ error: "Invalid license key signature. Check spelling and ensure keys are generated correctly from the administrator panel." });
  }
});

// Developer API Key management endpoints
app.get("/api/developer/keys", (req, res) => {
  res.json(activeApiKeys);
});

app.post("/api/developer/keys/rotate", (req, res) => {
  const { type } = req.body; // "sandbox" | "live"
  const tokenPart = crypto.randomBytes(16).toString("hex");
  
  if (type === "sandbox") {
    activeApiKeys.sandboxKey = `cg_test_${tokenPart}`;
    activeApiKeys.sandboxCreated = new Date().toISOString();
    activeApiKeys.sandboxCalls = 0;
    
    if (typeof auditLogsStore !== "undefined" && Array.isArray(auditLogsStore)) {
      auditLogsStore.push({
        id: `aud_${Date.now()}_rotate`,
        action: "API_KEY_ROTATED",
        detail: "API keys management updated: Re-generated Sandbox/Test API key token.",
        timestamp: new Date().toISOString(),
        actor: "Operator Console"
      });
    }
    return res.json({ success: true, message: "Sandbox API key rotated successfully", keys: activeApiKeys });
  } else if (type === "live") {
    activeApiKeys.liveKey = `cg_live_${tokenPart}`;
    activeApiKeys.liveCreated = new Date().toISOString();
    activeApiKeys.liveCalls = 0;
    
    if (typeof auditLogsStore !== "undefined" && Array.isArray(auditLogsStore)) {
      auditLogsStore.push({
        id: `aud_${Date.now()}_rotate`,
        action: "API_KEY_ROTATED",
        detail: "API keys management updated: Re-generated Live/Production API key token.",
        timestamp: new Date().toISOString(),
        actor: "Operator Console"
      });
    }
    return res.json({ success: true, message: "Live production API key rotated successfully", keys: activeApiKeys });
  } else {
    return res.status(400).json({ error: "Invalid type requested. Must be 'sandbox' or 'live'" });
  }
});

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

// Additional Database Stores matching the schema in user screenshot
const adminUsersStore = [
  { id: "adm_01", name: "Aisha Yusuf", email: "aisha.y@core-ops.com", role: "Senior Case Officer", joinedAt: "2024-01-01T08:00:00Z" },
  { id: "adm_02", name: "Chinedu Okafor", email: "chinedu.o@core-ops.com", role: "Field Recovery Lead", joinedAt: "2024-03-12T10:30:00Z" },
  { id: "adm_03", name: "System Administrator", email: "fidelisemus@gmail.com", role: "Super Admin", joinedAt: "2025-05-25T12:00:00Z" }
];

const recoveryActionsStore = [
  { id: "act_01", caseId: "case_501", actionType: "Call Outcome", timestamp: "2026-05-10T11:00:00Z", agent: "Aisha Yusuf", status: "Logged", note: "Spoke with borrower's father. Promised partial settlement within 3 days." },
  { id: "act_02", caseId: "case_501", actionType: "Pledge Confirmation", timestamp: "2026-05-16T09:00:00Z", agent: "System Core", status: "Failed", note: "Automatic tracking of Paystack transaction timed out. Repayment failed." },
  { id: "act_03", caseId: "case_502", actionType: "Dunning Level 2 Notice", timestamp: "2026-04-20T14:30:00Z", agent: "System Core", status: "Executed", note: "Legal dunning notice dispatched to office coordinates in Lagos." }
];

const auditLogsStore = [
  { id: "aud_01", action: "KYC_VERIFICATION", detail: "User Adebayo Chukwuma KYC marked Verified by Aisha Yusuf", timestamp: "2026-05-28T09:30:00Z", actor: "Aisha Yusuf" },
  { id: "aud_02", action: "LOAN_DISBURSEMENT", detail: "Loan loan_101 of N500k disbursed to borrower Adebayo Chukwuma.", timestamp: "2026-02-01T10:00:00Z", actor: "Financial Desk" },
  { id: "aud_03", action: "LOGIN_SUCCESS", detail: "Sarah Jenkins authenticated successfully from UK.", timestamp: "2026-05-29T07:15:00Z", actor: "System Session Core" }
];

const consentRecordsStore = [
  { id: "con_01", borrowerName: "Adebayo Chukwuma", consentType: "GEO_LOCATION", granted: true, timestamp: "2026-05-28T14:45:00Z", ip: "102.89.34.89" },
  { id: "con_02", borrowerName: "Sarah Jenkins", consentType: "BIOMETRIC_CHECK", granted: true, timestamp: "2026-05-29T07:15:00Z", ip: "82.165.23.4" },
  { id: "con_03", borrowerName: "Olawale Sanusi", consentType: "TELEMETRY_RECORDING", granted: true, timestamp: "2026-05-27T10:05:00Z", ip: "197.210.8.23" }
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
  
  // Try finding in adminUsersStore
  const admin = adminUsersStore.find(a => a.email && a.email.toLowerCase() === (email || "").toLowerCase());
  if (admin) {
    if (password === "admin123") {
      return res.json({
        status: "Success",
        token: `jwt_session_token_encrypted_098234_${admin.id}`,
        role: "Operator",
        borrower: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "Operator"
        }
      });
    } else {
      return res.status(401).json({ error: "Invalid password for administrator." });
    }
  }

  const borrower = borrowersStore.find(b => b.email && b.email.toLowerCase() === (email || "").toLowerCase());
  if (!borrower) {
    return res.status(401).json({ error: "No matching borrower credentials found." });
  }
  res.json({
    status: "Success",
    token: `jwt_session_token_encrypted_098234_${borrower.id}`,
    role: "Borrower",
    borrower
  });
});

// BORROWERS ENDPOINTS
app.get(["/api/borrowers", "/borrowers"], (req, res) => {
  res.json(borrowersStore);
});

app.get(["/api/borrowers/:id", "/borrowers/:id", "/api/borrowers/:borrowerId", "/borrowers/:borrowerId"], (req, res) => {
  const targetId = req.params.borrowerId || req.params.id;
  const borrower = borrowersStore.find(b => b.id === targetId);
  if (!borrower) return res.status(404).json({ error: "Borrower identity not found. Please check of the id value." });
  res.json(borrower);
});

app.post(["/api/borrowers", "/borrowers"], (req, res) => {
  const bData: Borrower = req.body;
  if (!bData.name || !bData.email) return res.status(400).json({ error: "Required fields missing. 'name' and 'email' are mandatory properties." });
  bData.id = bData.id || `bor_${Date.now()}`;
  bData.createdAt = new Date().toISOString();
  bData.kycStatus = bData.kycStatus || "Verified";
  borrowersStore.push(bData);
  res.status(201).json(bData);
});

// LOANS ENDPOINTS
app.get(["/api/loans", "/loans"], (req, res) => {
  res.json(loansStore);
});

app.get(["/api/loans/:id", "/loans/:id", "/api/loans/:loanId", "/loans/:loanId"], (req, res) => {
  const targetLoanId = req.params.loanId || req.params.id;
  const loan = loansStore.find(l => l.id === targetLoanId);
  if (!loan) return res.status(404).json({ error: "Loan instance not found on the systems ledger database." });
  res.json(loan);
});

app.post(["/api/loans", "/loans"], (req, res) => {
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

// -------------------------------------------------------------
// CORPORATE REST API COMPONENT LOGIC & ADDITIONAL ENDPOINTS
// -------------------------------------------------------------

// 1. Risk Analysis Scorecard calculation
app.post(["/api/risk/score", "/risk/score"], (req, res) => {
  const { borrowerId } = req.body;
  if (!borrowerId) {
    return res.status(400).json({ error: "Required attribute missing: 'borrowerId' is required in request payload." });
  }

  const borrower = borrowersStore.find(b => b.id === borrowerId);
  if (!borrower) {
    return res.status(404).json({ error: "Borrower identity could not be resolved." });
  }

  const borrowerLoans = loansStore.filter(l => l.borrowerId === borrowerId);
  const overdueCount = borrowerLoans.filter(l => l.status === "Overdue" || l.status === "Written_Off").length;
  const totalOutstanding = borrowerLoans.reduce((sum, l) => sum + (l.amount - l.amountPaid), 0);
  
  let riskScore = 15; // base score
  const reasons: string[] = [];

  if (overdueCount > 0) {
    riskScore += 45;
    reasons.push(`${overdueCount} active overdue or default loan instance(s) flagged on profile.`);
  }
  if (totalOutstanding > 5000) {
    riskScore += 20;
    reasons.push("Outstanding aggregate borrowing principal exceeds corporate soft threshold ($5,000).");
  }
  if (borrower.kycStatus === "Pending") {
    riskScore += 15;
    reasons.push("KYC verification is incomplete or waiting operator audit.");
  }
  
  const payoutConsistency = borrower.payoutConsistency || 92;
  if (payoutConsistency < 85) {
    riskScore += 10;
    reasons.push("Historic bank account payout consistency below 85% safety bound.");
  }

  riskScore = Math.min(riskScore, 100);
  
  const riskBand = riskScore >= 75 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 30 ? "MEDIUM" : "LOW";

  res.json({
    success: true,
    borrowerId,
    borrowerName: borrower.name,
    riskScore,
    riskBand,
    analytics: {
      totalOutstanding,
      overdueCount,
      kycStatus: borrower.kycStatus,
      payoutConsistency
    },
    computations: reasons,
    assessmentDate: new Date().toISOString()
  });
});

// 2. Automated Recovery Trigger
app.post(["/api/recovery/trigger", "/recovery/trigger"], (req, res) => {
  const { loanId, actionType, note, agentName } = req.body;
  if (!loanId || !actionType) {
    return res.status(400).json({ error: "Required fields missing. Both 'loanId' and 'actionType' represent mandatory properties." });
  }

  const loan = loansStore.find(l => l.id === loanId);
  if (!loan) {
    return res.status(404).json({ error: "Loan instance not found under active records." });
  }

  // Find or provision a recovery case file
  let rCase = recoveryCasesStore.find(c => c.loanId === loanId);
  if (!rCase) {
    rCase = {
      id: `case_${Date.now()}`,
      loanId,
      borrowerName: loan.borrowerName,
      borrowerId: loan.borrowerId,
      outstandingBalance: loan.amount - loan.amountPaid,
      overdueAmount: Math.ceil((loan.amount - loan.amountPaid) * 0.4), // simulated overdue portion
      daysOverdue: 42,
      assignedAgent: agentName || "AI AutoDUN Agent",
      stage: "First_Notice",
      promiseToPayHistory: [],
      logs: []
    };
    recoveryCasesStore.push(rCase);
  }

  const timestamp = new Date().toISOString();
  const agent = agentName || rCase.assignedAgent;

  // Append action to recovery logs
  rCase.logs.push({
    timestamp,
    action: actionType,
    note: note || `Automated recovery trigger fired via core API: [${actionType}]`,
    agent
  });

  // Escalate stage if requested
  if (actionType === "DUNNING_EMAIL" || actionType === "DUNNING_SMS") {
    rCase.stage = "Dunning";
  } else if (actionType === "LEGAL_LETTER") {
    rCase.stage = "Legal_Escalation";
  }

  // Add dunning notice
  const notifyId = `ntf_${Date.now()}`;
  notificationsLogsStore.push({
    id: notifyId,
    borrowerId: loan.borrowerId,
    borrowerName: loan.borrowerName,
    type: actionType.includes("EMAIL") ? "Email" : "SMS",
    channel: actionType.includes("EMAIL") ? "email@borrower.com" : "+234_simulate",
    trigger: actionType,
    status: "Sent",
    message: `[CredGuard Notice] Fired dunning action sequence. Action: ${actionType}. Details: ${note || 'Amortization penalty warning.'}`,
    timestamp
  });

  res.json({
    success: true,
    message: "Recovery action pipeline initiated successfully.",
    actionDetails: {
      caseId: rCase.id,
      loanId,
      actionLogged: actionType,
      agentAssigned: agent,
      newCaseStage: rCase.stage,
      timestamp
    }
  });
});

// 3. Webhook Integration Events
app.post(["/api/events", "/events"], (req, res) => {
  const { eventType, payload, timestamp } = req.body;
  if (!eventType || !payload) {
    return res.status(400).json({ error: "Incomplete event metadata. Properties 'eventType' and 'payload' must be provided." });
  }

  const id = `evt_${Date.now()}`;
  const storedEvent = {
    id,
    eventType,
    payload,
    receivedAt: timestamp || new Date().toISOString(),
    status: "Processed"
  };

  developerWebhookEventsStore.push(storedEvent);

  // Add telemetry lock to audit store
  auditLogsStore.push({
    id: `aud_${Date.now()}_evt`,
    action: "INTEGRATION_EVENT_INGESTED",
    detail: `Webhook event received: [${eventType}]. Stored ID: ${id}`,
    timestamp: new Date().toISOString(),
    actor: "External Integration Portal"
  });

  res.json({
    success: true,
    eventId: id,
    eventType,
    processed: true,
    timestamp: new Date().toISOString(),
    verificationSignature: crypto.createHash("sha256").update(id + JSON.stringify(payload)).digest("hex")
  });
});

// 4. Real-Time Fraud & Telemetry Analyzer
app.post(["/api/fraud/analyze", "/fraud/analyze"], (req, res) => {
  const { borrowerId, ipAddress, deviceFingerprint, vpnUsed } = req.body;
  if (!borrowerId || !ipAddress) {
    return res.status(400).json({ error: "Validation mismatch. Fields 'borrowerId' and 'ipAddress' are mandatory." });
  }

  const borrower = borrowersStore.find(b => b.id === borrowerId);
  const reasons: string[] = [];
  let fraudScore = 12; // base score

  const ipStr = String(ipAddress);
  const isVpn = vpnUsed === true || ipStr.startsWith("45.") || ipStr.startsWith("185.") || Math.random() < 0.15;

  if (isVpn) {
    fraudScore += 45;
    reasons.push("Anonymous host proxy or commercial VPN network detected on request socket.");
  }
  if (deviceFingerprint && deviceFingerprint.length < 8) {
    fraudScore += 15;
    reasons.push("Suspicious or incomplete client device hardware signature.");
  }
  if (Math.random() < 0.1) {
    fraudScore += 30;
    reasons.push("Speed-limit velocity check failed: account accessed from distinct geographic locations under 5 minutes.");
  }

  fraudScore = Math.min(fraudScore, 100);
  const recommendedAction = fraudScore >= 70 ? "BLOCK" : fraudScore >= 40 ? "CHALLENGE" : "PASS";

  res.json({
    success: true,
    assessmentId: `frd_${Date.now()}`,
    borrowerId,
    fraudScore,
    riskRating: fraudScore >= 70 ? "CRITICAL" : fraudScore >= 40 ? "HIGH" : "LOW",
    recommendedAction,
    findings: reasons,
    checkedAt: new Date().toISOString()
  });
});

// 5. Create Dynamic Direct Debit Consent Mandate
app.post(["/api/consent/create", "/consent/create"], (req, res) => {
  const { borrowerId, consentType, granted, ipAddress } = req.body;
  if (!borrowerId || !consentType || granted === undefined) {
    return res.status(400).json({ error: "Required parameters missing. Support 'borrowerId', 'consentType', and 'granted' (boolean) fields safely." });
  }

  const borrower = borrowersStore.find(b => b.id === borrowerId);
  const borrowerName = borrower ? borrower.name : "Anonymous Borrower Core";

  const id = `con_${Date.now()}`;
  const record = {
    id,
    borrowerName,
    borrowerId,
    consentType,
    granted: granted === true,
    timestamp: new Date().toISOString(),
    ip: ipAddress || "185.90.10.15"
  };

  consentRecordsStore.push(record);

  res.status(201).json({
    success: true,
    message: "Privacy mandate or direct debit authorization recorded legally.",
    consentRecord: record,
    complianceHash: crypto.createHash("sha1").update(id + consentType + String(granted)).digest("hex")
  });
});

// 6. Retrieve active consent registries for a given borrower
app.get(["/api/consent/:borrowerId", "/consent/:borrowerId"], (req, res) => {
  const { borrowerId } = req.params;
  const listings = consentRecordsStore.filter(c => (c as any).borrowerId === borrowerId);
  
  res.json({
    success: true,
    borrowerId,
    activeConsents: listings,
    retrievedAt: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// DYNAMIC DB TABLES & SCHEMAS MANAGEMENT ACTIONS
// -------------------------------------------------------------

// Privilege management state
const dbPermissions = {
  globalBorrowerAccessEnabled: false,
  explicitPermittedEmails: ["fidelisemus@gmail.com"],
  accessRequests: [
    { id: "req_01", name: "Sarah Jenkins", email: "sarah.jenkins@gmail.com", role: "Borrower", status: "Pending", requestedAt: "2026-05-29T08:00:00Z" },
    { id: "req_02", name: "Adebayo Chukwuma", email: "adebayo.c@yahoo.com", role: "Borrower", status: "Approved", requestedAt: "2026-05-28T14:45:00Z" }
  ] as Array<{ id: string; name: string; email: string; role: string; status: "Pending" | "Approved" | "Rejected"; requestedAt: string }>
};

// Helper to check DB access permission
function checkDbAccess(req: express.Request): { allowed: boolean; reason?: string } {
  const userEmail = (req.headers["x-user-email"] as string || "").toLowerCase();
  const userRole = req.headers["x-user-role"] as string;

  // Master operator / system admin always has full privileges
  if (userRole === "Operator") {
    return { allowed: true };
  }

  // Check if email explicitly permitted
  if (userEmail && dbPermissions.explicitPermittedEmails.some(e => e.toLowerCase() === userEmail)) {
    return { allowed: true };
  }

  // Check if approved access request lists
  const isApproved = dbPermissions.accessRequests.some(
    r => r.email.toLowerCase() === userEmail && r.status === "Approved"
  );
  if (isApproved) {
    return { allowed: true };
  }

  // Check global borrower database access override status
  if (dbPermissions.globalBorrowerAccessEnabled && userRole === "Borrower") {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Privilege configuration authorization error. The Database & SQL Workspace sandbox is locked. Access must be explicitly granted by an Administrator."
  };
}

// Express Authorization Middleware for DB access
function requireDbAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  const check = checkDbAccess(req);
  if (!check.allowed) {
    return res.status(403).json({ error: check.reason });
  }
  next();
}

// REST endpoints for access configuration management
app.get("/api/db/config", (req, res) => {
  // Return configuration to anyone, but let them know if they are allowed or not
  const check = checkDbAccess(req);
  res.json({
    ...dbPermissions,
    senderAllowed: check.allowed
  });
});

app.post("/api/db/config/toggle", (req, res) => {
  const senderRole = req.headers["x-user-role"] as string;
  if (senderRole !== "Operator") {
    return res.status(403).json({ error: "Only operators can toggle global guest visibility levels." });
  }

  const { enabled } = req.body;
  dbPermissions.globalBorrowerAccessEnabled = !!enabled;

  // Audit event logs
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "PRIVILEGE_MUTATION",
    detail: `Global borrower database view privilege ${enabled ? 'ENABLED' : 'DISABLED'} by administrator.`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, config: dbPermissions });
});

app.post("/api/db/config/grant", (req, res) => {
  const senderRole = req.headers["x-user-role"] as string;
  if (senderRole !== "Operator") {
    return res.status(403).json({ error: "Only operators can manually authorize explicit user accounts." });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail parameter is required." });
  }

  const lowered = email.toLowerCase().trim();
  if (!dbPermissions.explicitPermittedEmails.includes(lowered)) {
    dbPermissions.explicitPermittedEmails.push(lowered);
  }

  // Mark all pending requests from this email as Approved
  dbPermissions.accessRequests.forEach(r => {
    if (r.email.toLowerCase() === lowered) {
       r.status = "Approved";
    }
  });

  // Audit event logs
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "PRIVILEGE_MUTATION",
    detail: `Explicit DB permissions granted to account: ${lowered}`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, config: dbPermissions });
});

app.post("/api/db/config/revoke", (req, res) => {
  const senderRole = req.headers["x-user-role"] as string;
  if (senderRole !== "Operator") {
    return res.status(403).json({ error: "Only operators can revoke explicit user database access." });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail to revoke is required." });
  }

  const lowered = email.toLowerCase().trim();
  dbPermissions.explicitPermittedEmails = dbPermissions.explicitPermittedEmails.filter(e => e.toLowerCase() !== lowered);
  
  // Also change status in requests to 'Rejected'
  dbPermissions.accessRequests.forEach(r => {
    if (r.email.toLowerCase() === lowered) {
       r.status = "Rejected";
    }
  });

  // Audit event logs
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "PRIVILEGE_REVOCATION",
    detail: `Explicit DB permissions revoked from account: ${lowered}`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, config: dbPermissions });
});

app.post("/api/db/config/request-access", (req, res) => {
  const { name, email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email target is required to process request payload." });
  }

  const lowered = email.toLowerCase().trim();
  
  // Check if they already have access
  if (dbPermissions.explicitPermittedEmails.includes(lowered)) {
    return res.json({ success: true, status: "Approved", message: "You already have active authorization!" });
  }

  // Find if pending request already exists
  const existing = dbPermissions.accessRequests.find(r => r.email.toLowerCase() === lowered);
  if (existing) {
    if (existing.status === "Approved") {
       return res.json({ success: true, status: "Approved", message: "Your access has already been approved!" });
    }
    existing.status = "Pending"; // reset to pending if requested again
    return res.json({ success: true, status: "Pending", message: "A request is already pending processing." });
  }

  const newRequest = {
    id: `req_${Date.now()}`,
    name: name || "Anonymous User",
    email: lowered,
    role: role || "Borrower",
    status: "Pending" as const,
    requestedAt: new Date().toISOString()
  };

  dbPermissions.accessRequests.push(newRequest);

  res.json({ success: true, status: "Pending", request: newRequest });
});

app.post("/api/db/config/process-request", (req, res) => {
  const senderRole = req.headers["x-user-role"] as string;
  if (senderRole !== "Operator") {
    return res.status(403).json({ error: "Only operators can approve or decline authorization requests." });
  }

  const { requestId, status } = req.body; // status: 'Approved' | 'Rejected'
  if (!requestId || !status) {
    return res.status(400).json({ error: "requestId and status are required." });
  }

  const reqObj = dbPermissions.accessRequests.find(r => r.id === requestId);
  if (!reqObj) {
    return res.status(404).json({ error: "Access request object not identified." });
  }

  reqObj.status = status;

  if (status === "Approved") {
    const lowered = reqObj.email.toLowerCase().trim();
    if (!dbPermissions.explicitPermittedEmails.includes(lowered)) {
      dbPermissions.explicitPermittedEmails.push(lowered);
    }
  } else {
    // If rejected, clean from explicit permitted emails
    const lowered = reqObj.email.toLowerCase().trim();
    dbPermissions.explicitPermittedEmails = dbPermissions.explicitPermittedEmails.filter(e => e.toLowerCase() !== lowered);
  }

  // Audit event logs
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "PRIVILEGE_PROCESS",
    detail: `Database access request from '${reqObj.email}' was '${status}' by admin.`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, config: dbPermissions });
});

// Active schemas registry for added fields
const customAddedColumns: Record<string, string[]> = {};

// Helper to look up active tables
function getLiveTablesMap() {
  return {
    admin_users: adminUsersStore,
    borrowers: borrowersStore,
    loans: loansStore,
    payments: paymentsStore,
    sessions: sessionsStore,
    geolocation_logs: geoHistoryStore,
    risk_alerts: riskAlertsStore,
    recovery_cases: recoveryCasesStore,
    recovery_actions: recoveryActionsStore,
    notifications: notificationsLogsStore,
    audit_logs: auditLogsStore,
    consent_records: consentRecordsStore
  };
}

// 1. Get List of all 12 DB tables and Row Counts
app.get("/api/db/tables", requireDbAccess, (req, res) => {
  const liveMap = getLiveTablesMap();
  const tablesMetadata = [
    { id: "admin_users", name: "admin_users", count: liveMap.admin_users.length, description: "System administrators, roles, and credential references.", schema: ["id", "name", "email", "role", "joinedAt"] },
    { id: "borrowers", name: "borrowers", count: liveMap.borrowers.length, description: "Customer/Borrower profiles and core identity verification records.", schema: ["id", "name", "email", "phone", "company", "kycStatus", "createdAt"] },
    { id: "loans", name: "loans", count: liveMap.loans.length, description: "Loan portfolio tracking details, margins, rates, and outcomes.", schema: ["id", "borrowerId", "borrowerName", "amount", "interestRate", "dueDate", "amountPaid", "status"] },
    { id: "payments", name: "payments", count: liveMap.payments.length, description: "Repayments and collection clears logged via platform payment thresholds.", schema: ["id", "loanId", "borrowerId", "borrowerName", "amount", "paymentDate", "gateway", "status"] },
    { id: "sessions", name: "sessions", count: liveMap.sessions.length, description: "Authenticated borrower login profiles, IP footprints, and telemetry checks.", schema: ["id", "borrowerId", "borrowerName", "ipAddress", "deviceType", "os", "browser", "timestamp"] },
    { id: "geolocation_logs", name: "geolocation_logs", count: liveMap.geolocation_logs.length, description: "Auditable geographic coordinates, ISP registries, and Speed-Limit anomalies.", schema: ["ipAddress", "timestamp", "country", "region", "city", "isp", "timezone", "latitude", "longitude"] },
    { id: "risk_alerts", name: "risk_alerts", count: liveMap.risk_alerts.length, description: "Proactive fraud alerts, VPN overrides, and negative behavioral delay indexes.", schema: ["id", "borrowerId", "borrowerName", "type", "severity", "details", "createdAt", "resolved"] },
    { id: "recovery_cases", name: "recovery_cases", count: liveMap.recovery_cases.length, description: "Overdue loan collections, assigned agents, and dunning cycles.", schema: ["id", "loanId", "borrowerId", "borrowerName", "overdueAmount", "daysOverdue", "assignedAgent", "stage"] },
    { id: "recovery_actions", name: "recovery_actions", count: liveMap.recovery_actions.length, description: "Direct notes, promise to pay actions, and legal escalations tracker.", schema: ["id", "caseId", "actionType", "timestamp", "agent", "status", "note"] },
    { id: "notifications", name: "notifications", count: liveMap.notifications.length, description: "Automated pre-due SMS alerts, WhatsApp bulletins, and credit warnings dispatched.", schema: ["id", "borrowerId", "borrowerName", "type", "channel", "trigger", "status", "message"] },
    { id: "audit_logs", name: "audit_logs", count: liveMap.audit_logs.length, description: "System operational audit trails capturing critical administrative executions securely.", schema: ["id", "action", "detail", "timestamp", "actor"] },
    { id: "consent_records", name: "consent_records", count: liveMap.consent_records.length, description: "Explicit consumer privacy consent registries (GDPR & NDPR mandated check).", schema: ["id", "borrowerName", "consentType", "granted", "timestamp", "ip"] }
  ];

  // Append any custom added columns
  const enriched = tablesMetadata.map(tab => {
    const extra = customAddedColumns[tab.id] || [];
    return {
      ...tab,
      schema: [...tab.schema, ...extra]
    };
  });

  res.json(enriched);
});

// 2. Clear / Populate database tables
app.post("/api/db/actions/reset", requireDbAccess, (req, res) => {
  // Simple administrative system action to clear rows or seed tables
  const { tableName } = req.body;
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[tableName];
  if (targetArray) {
    targetArray.length = 0; // Clear the array in-place
    // Log the audit
    auditLogsStore.push({
      id: `aud_${Date.now()}`,
      action: "TABLE_TRUNCATING",
      detail: `All records cleared from table '${tableName}' by administrator.`,
      timestamp: new Date().toISOString(),
      actor: "Super Admin"
    });
    return res.json({ success: true, message: `All rows cleared successfully from ${tableName}.` });
  }
  res.status(404).json({ error: "Table not found." });
});

// 3. Get all records for a specific table
app.get("/api/db/:tableName", requireDbAccess, (req, res) => {
  const { tableName } = req.params;
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[tableName.toLowerCase()];
  
  if (!targetArray) {
    return res.status(404).json({ error: "Table not found in catalog systems." });
  }
  res.json(targetArray);
});

// 4. Add a record/row to a specific table
app.post("/api/db/:tableName", requireDbAccess, (req, res) => {
  const { tableName } = req.params;
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[tableName.toLowerCase()];
  
  if (!targetArray) {
    return res.status(404).json({ error: "Table not found in catalog systems." });
  }

  const newRow = { ...req.body };
  // Enforce unique id if missing
  if (!newRow.id && !newRow.ipAddress) {
    newRow.id = `${tableName.substring(0, 3)}_${Math.floor(Math.random() * 1000 + 100)}`;
  }
  if (!newRow.timestamp && !newRow.createdAt && !newRow.joinedAt) {
    const defaultTime = new Date().toISOString();
    if (tableName === "admin_users") newRow.joinedAt = defaultTime;
    else if (tableName === "audit_logs" || tableName === "consent_records" || tableName === "notifications" || tableName === "recovery_actions" || tableName === "sessions" || tableName === "geolocation_logs") {
      newRow.timestamp = defaultTime;
    } else {
      newRow.createdAt = defaultTime;
    }
  }

  targetArray.push(newRow);

  // System audit tracking
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "RECORD_INSERTION",
    detail: `Inserted new row in table '${tableName}' with ID '${newRow.id || newRow.ipAddress}'.`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.status(201).json({ success: true, row: newRow });
});

// 5. Update a record in a specific table
app.put("/api/db/:tableName/:id", requireDbAccess, (req, res) => {
  const { tableName, id } = req.params;
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[tableName.toLowerCase()];
  
  if (!targetArray) {
    return res.status(404).json({ error: "Table not found in database catalog." });
  }

  const index = targetArray.findIndex((item: any) => String(item.id || item.ipAddress) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: "No matching record with specified key identified." });
  }

  const updatedRecord = { ...targetArray[index], ...req.body };
  targetArray[index] = updatedRecord;

  // System audit tracking
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "RECORD_MUTATION",
    detail: `Modified record ID '${id}' in table '${tableName}'.`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, row: updatedRecord });
});

// 6. Delete a record from a specific table
app.delete("/api/db/:tableName/:id", requireDbAccess, (req, res) => {
  const { tableName, id } = req.params;
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[tableName.toLowerCase()];
  
  if (!targetArray) {
    return res.status(404).json({ error: "Table not found." });
  }

  const index = targetArray.findIndex((item: any) => String(item.id || item.ipAddress) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: "No matching record found to prune." });
  }

  const deletedItem = targetArray.splice(index, 1)[0];

  // System audit tracking
  auditLogsStore.push({
    id: `aud_${Date.now()}`,
    action: "RECORD_DELETION",
    detail: `Pruned record ID '${id}' from table '${tableName}'.`,
    timestamp: new Date().toISOString(),
    actor: "Admin UI Database Manager"
  });

  res.json({ success: true, deleted: deletedItem });
});

// 7. Dynamic Column / Attribute Injection API
app.post("/api/db/:tableName/columns", requireDbAccess, (req, res) => {
  const { tableName } = req.params;
  const { columnName } = req.body;
  
  if (!columnName || !/^[a-zA-Z0-9_]+$/.test(columnName)) {
    return res.status(400).json({ error: "Valid column name matching [a-zA-Z0-9_] is required." });
  }

  const nameKey = tableName.toLowerCase();
  if (!customAddedColumns[nameKey]) {
    customAddedColumns[nameKey] = [];
  }

  if (!customAddedColumns[nameKey].includes(columnName)) {
    customAddedColumns[nameKey].push(columnName);
  }

  // Inject defaults to existing store records for schema safety
  const liveMap = getLiveTablesMap();
  const targetArray = (liveMap as any)[nameKey];
  if (targetArray) {
    targetArray.forEach((item: any) => {
      if (item[columnName] === undefined) {
        item[columnName] = "";
      }
    });
  }

  res.json({ success: true, message: `Column '${columnName}' successfully added to ${tableName} schema.` });
});

// 8. Simulated SQL Terminal Compiler Executive
app.post("/api/db/query", requireDbAccess, (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "No SQL query provided." });
  }

  const normalizedQuery = query.trim().replace(/\s+/g, ' ');
  const selectRegex = /^SELECT\s+(\*|[a-zA-Z0-9_,\s]+)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?/i;
  const match = selectRegex.exec(normalizedQuery);
  
  if (!match) {
    return res.json({
      success: false,
      error: "SQL Query syntax not supported in simulation. Try standard SELECT * FROM [tableName] WHERE [field] = [value]"
    });
  }
  
  const fieldsStr = match[1].trim();
  const rawTableName = match[2].trim().toLowerCase();
  const whereClause = match[3] ? match[3].trim() : null;
  
  const liveMap = getLiveTablesMap();
  const activeTables: Record<string, any[]> = liveMap as any;
  
  if (!activeTables[rawTableName]) {
    return res.status(404).json({
      success: false,
      error: `Table '${rawTableName}' does not exist in the database catalog.`
    });
  }
  
  let rows = [...activeTables[rawTableName]];
  
  if (whereClause) {
    try {
      const conditionRegex = /([a-zA-Z0-9_]+)\s*(=|>|<|>=|<=|LIKE)\s*(.+)/i;
      const condMatch = conditionRegex.exec(whereClause);
      if (condMatch) {
        const field = condMatch[1].trim();
        const op = condMatch[2].trim().toUpperCase();
        let valStr = condMatch[3].trim();
        
        if ((valStr.startsWith("'") && valStr.endsWith("'")) || (valStr.startsWith('"') && valStr.endsWith('"'))) {
          valStr = valStr.substring(1, valStr.length - 1);
        }
        
        rows = rows.filter(row => {
          const rowVal = row[field];
          if (rowVal === undefined) return false;
          
          if (op === "=") {
            return String(rowVal).toLowerCase() === valStr.toLowerCase();
          } else if (op === "LIKE") {
            return String(rowVal).toLowerCase().includes(valStr.toLowerCase());
          } else {
            const numRowVal = Number(rowVal);
            const numVal = Number(valStr);
            if (isNaN(numRowVal) || isNaN(numVal)) {
              return false;
            }
            if (op === ">") return numRowVal > numVal;
            if (op === "<") return numRowVal < numVal;
            if (op === ">=") return numRowVal >= numVal;
            if (op === "<=") return numRowVal <= numVal;
          }
          return false;
        });
      }
    } catch (e) {
      console.error("Failed to compile SQLite parser WHERE filter:", e);
    }
  }
  
  if (fieldsStr !== "*") {
    const fields = fieldsStr.split(',').map(f => f.trim());
    rows = rows.map(row => {
      const projected: Record<string, any> = {};
      fields.forEach(f => {
        projected[f] = row[f];
      });
      return projected;
    });
  }
  
  res.json({
    success: true,
    query: query,
    rowCount: rows.length,
    rows: rows
  });
});

// 9. AI-driven record synthesis utilizing Gemini API
app.post("/api/db/ai-synthesize", requireDbAccess, async (req, res) => {
  const { tableName, prompt } = req.body;
  if (!tableName) {
    return res.status(400).json({ error: "Table name is required." });
  }

  const liveMap = getLiveTablesMap();
  const activeTables: Record<string, any[]> = liveMap as any;

  if (!activeTables[tableName.toLowerCase()]) {
    return res.status(404).json({ error: `Table '${tableName}' does not exist.` });
  }

  const schemaInfo: Record<string, string> = {
    admin_users: "JSON array of AdminUser objects containing: id (e.g., adm_401), name (string), email (string), role (string e.g., Regional Manager), joinedAt (ISO string)",
    borrowers: "JSON array of Borrower objects containing: id (e.g., bor_401), name (string), email (string), phone (string), company (string), kycStatus ('Pending' or 'Verified' or 'Rejected'), createdAt (ISO string)",
    loans: "JSON array of Loan objects containing: id (e.g., loan_401), borrowerId (string), borrowerName (string), amount (number), interestRate (number), startDate (ISO string), dueDate (ISO string), amountPaid (number), latePenalties (number), status ('Active' or 'Paid' or 'Overdue')",
    payments: "JSON array of Payment objects containing: id (e.g., pmt_401), loanId (string), borrowerId (string), borrowerName (string), amount (number), paymentDate (ISO string), gateway ('Stripe' or 'Paystack'), status ('Successful')",
    sessions: "JSON array of UserSession objects containing: id (e.g., sess_401), borrowerId (string), borrowerName (string), ipAddress (string), deviceType ('web_desktop' or 'mobile_android'), os (string), browser (string), timestamp (ISO string), consentGiven (boolean), vpnUsed (boolean), proxyUsed (boolean)",
    geolocation_logs: "JSON array of GeoLocation objects containing: ipAddress (string), timestamp (ISO string), country (string), region (string), city (string), isp (string), timezone (string), latitude (number), longitude (number)",
    risk_alerts: "JSON array of RiskAlert objects containing: id (e.g., alt_401), borrowerId (string), borrowerName (string), type ('VPN_DETECTED' or 'LOCATION_SHIELD_ALERT'), severity ('High' or 'Critical'), details (string), createdAt (ISO string), resolved (boolean)",
    recovery_cases: "JSON array of RecoveryCase objects containing: id (e.g., case_401), loanId (string), borrowerId (string), borrowerName (string), overdueAmount (number), daysOverdue (number), assignedAgent (string), stage ('Dunning' or 'Legal_Escalation'), promiseToPayHistory (empty array), logs (empty array)",
    recovery_actions: "JSON array of RecoveryAction objects containing: id (e.g., act_401), caseId (string), actionType (string), timestamp (ISO string), agent (string), status (string), note (string)",
    notifications: "JSON array of NotificationLog objects containing: id (e.g., ntf_401), borrowerId (string), borrowerName (string), type ('SMS' or 'Email'), channel (string), trigger ('On_Due' or 'After_Overdue'), status ('Delivered'), message (string), timestamp (ISO string)",
    audit_logs: "JSON array of AuditLog objects containing: id (e.g., aud_401), action (string e.g., LOGIN_EVENT), detail (string), timestamp (ISO string), actor (string)",
    consent_records: "JSON array of ConsentRecord objects containing: id (e.g., con_401), borrowerName (string), consentType (string), granted (boolean), timestamp (ISO) , ip (string)"
  };

  const currentSchemaText = schemaInfo[tableName.toLowerCase()] || "JSON array of objects with realistic keys";

  if (!ai) {
    // Graceful fallback with static realistic record
    const mockId = `${tableName.substring(0, 3)}_${Math.floor(Math.random() * 900 + 100)}`;
    const mockRow: any = { id: mockId };
    
    // Add realistic mock fields
    if (tableName === "admin_users") {
      mockRow.name = "Olumide Johnson";
      mockRow.email = "olumide.j@core-ops.com";
      mockRow.role = "Regional Risk Inspector";
      mockRow.joinedAt = new Date().toISOString();
    } else if (tableName === "audit_logs") {
      mockRow.action = "AI_TRIGGER_SIMULATOR";
      mockRow.detail = "Simulated synthetic insert executed locally due to offline fallback mode.";
      mockRow.timestamp = new Date().toISOString();
      mockRow.actor = "AI Agent";
    } else {
      mockRow.borrowerName = "Dynamic Sample Borrower";
      mockRow.note = "Static custom entry created in offline state.";
      mockRow.timestamp = new Date().toISOString();
    }

    activeTables[tableName.toLowerCase()].push(mockRow);
    return res.json({
      success: true,
      insertedCount: 1,
      rows: [mockRow],
      note: "Gemini client offline. Standard baseline mock injected automatically."
    });
  }

  try {
    const promptText = `
      You are an automated backend database synthesis agent.
      Return exactly 3 synthetically fabricated valid rows for table '${tableName}' conforming strictly to this format:
      ${currentSchemaText}
      
      User requested context: "${prompt || 'realistic production records'}"
      
      CRITICAL: You must return ONLY raw valid JSON text, with absolutely no preamble, no wrapping, and no markdown \`\`\`json blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText
    });

    let rawText = response.text ? response.text.trim() : "";
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "");
    }

    const parsedArray = JSON.parse(rawText);
    if (Array.isArray(parsedArray)) {
      parsedArray.forEach((row: any) => {
        if (!row.id && !row.ipAddress) {
          row.id = `${tableName.substring(0, 3)}_${Math.floor(Math.random() * 900 + 100)}`;
        }
        activeTables[tableName.toLowerCase()].push(row);
      });

      // Insert audit log
      auditLogsStore.push({
        id: `aud_${Date.now()}`,
        action: "AI_RECORD_SYNTHESIS",
        detail: `Synthesized & appended ${parsedArray.length} items to table '${tableName}' via system-cognitive generative procedures.`,
        timestamp: new Date().toISOString(),
        actor: "Gemini Generative Engine"
      });

      res.json({
        success: true,
        insertedCount: parsedArray.length,
        rows: parsedArray
      });
    } else {
      throw new Error("Generative engine return format is not a raw array list.");
    }
  } catch (error) {
    console.error("Failed AI synthesis:", error);
    // Fallback static insert
    const mockId = `${tableName.substring(0,3)}_${Math.floor(Math.random() * 100 + 500)}`;
    const fallbackItem = { id: mockId, name: "Fallback Profile Item", timestamp: new Date().toISOString() };
    activeTables[tableName.toLowerCase()].push(fallbackItem);
    res.json({
      success: true,
      insertedCount: 1,
      rows: [fallbackItem],
      note: "Recovered via standard local mock mapping fallback."
    });
  }
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

if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    console.error("Fatal exception booting core express process:", err);
  });
}

export default app;
