/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  createdAt: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string; // denormalized for speed
  amount: number;
  interestRate: number; // e.g., 15 for 15%
  startDate: string;
  dueDate: string;
  amountPaid: number;
  latePenalties: number;
  status: 'Active' | 'Paid' | 'Overdue' | 'Written_Off';
  repaymentSchedule: {
    dueDate: string;
    amount: number;
    paid: boolean;
  }[];
}

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  paymentDate: string;
  gateway: 'Paystack' | 'Flutterwave' | 'Monnify' | 'Stripe' | 'Bank_Transfer';
  reference: string;
  status: 'Successful' | 'Pending' | 'Failed';
  receiptUrl?: string;
}

export interface UserSession {
  id: string;
  borrowerId: string;
  borrowerName: string;
  ipAddress: string;
  deviceType: 'mobile_ios' | 'mobile_android' | 'web_desktop' | 'web_mobile';
  os: string;
  browser: string;
  appVersion: string;
  timestamp: string;
  consentGiven: boolean;
  vpnUsed: boolean;
  proxyUsed: boolean;
  asn?: string;
}

export interface GeoLocation {
  ipAddress: string;
  timestamp: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface RiskAlert {
  id: string;
  borrowerId: string;
  borrowerName: string;
  type: 'VPN_DETECTED' | 'LOCATION_SHIELD_ALERT' | 'MULTIPLE_ACCOUNTS_SAME_IP' | 'SUSPICIOUS_LOGIN_PATTERN' | 'PAYMENT_DELAY_PREDICTION';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  details: string;
  createdAt: string;
  resolved: boolean;
}

export interface PromiseToPay {
  id: string;
  caseId: string;
  borrowerName: string;
  promisedAmount: number;
  promisedDate: string;
  status: 'Pending' | 'Kept' | 'Broken';
}

export interface RecoveryCase {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  overdueAmount: number;
  daysOverdue: number;
  assignedAgent: string;
  promiseToPayHistory: PromiseToPay[];
  logs: {
    timestamp: string;
    action: string;
    note: string;
    agent: string;
  }[];
  stage: 'First_Notice' | 'Dunning' | 'Legal_Escalation' | 'Settlement';
}

export interface NotificationLog {
  id: string;
  borrowerId: string;
  borrowerName: string;
  type: 'SMS' | 'Email' | 'WhatsApp';
  channel: string;
  trigger: 'Before_Due' | 'On_Due' | 'After_Overdue';
  status: 'Sent' | 'Delivered' | 'Failed';
  message: string;
  timestamp: string;
}
