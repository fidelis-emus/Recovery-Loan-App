/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Search, 
  Plus, 
  FileCheck, 
  CreditCard, 
  ArrowUpRight, 
  ChevronRight, 
  MapPin, 
  Cpu, 
  Smartphone, 
  AlertTriangle, 
  Heart, 
  Mail, 
  Phone, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Download,
  Copy,
  Check,
  Send,
  Zap,
  Filter,
  RefreshCw,
  Sliders,
  Shield,
  LifeBuoy,
  Sun,
  Moon,
  User,
  Lock,
  LogIn,
  LogOut
} from 'lucide-react';
import { Borrower, Loan, Payment, UserSession, RiskAlert, RecoveryCase, NotificationLog, GeoLocation } from './types';
import { SDK_TEMPLATES } from './utils/sdkTemplates';
import { TravelMap } from './components/TravelMap';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'borrowers' | 'loans' | 'recovery' | 'audits' | 'sdks'>('analytics');

  // Backend state stores
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [geoHistory, setGeoHistory] = useState<GeoLocation[]>([]);

  // Local interaction triggers
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [analyzingLoanId, setAnalyzingLoanId] = useState<string>('');
  const [predictionReport, setPredictionReport] = useState<{ predictedScore: number; reportText: string; method: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [repaymentModalLoan, setRepaymentModalLoan] = useState<Loan | null>(null);
  const [customRepaymentAmount, setCustomRepaymentAmount] = useState<string>('');

  // Device telemetry and session filters (Name, Email, Date Range Picker)
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [sessionStartDate, setSessionStartDate] = useState<string>('');
  const [sessionEndDate, setSessionEndDate] = useState<string>('');

  // Theme & Simulated Authentication state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    role: 'Operator' | 'Borrower';
    id?: string;
    lastLoginIp?: string;
    clientApp?: string;
    token?: string;
  }>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      email: 'fidelisemus@gmail.com',
      name: 'Fidelis Emus',
      role: 'Operator',
      lastLoginIp: '197.210.8.23',
      clientApp: 'CredGuard Desktop Console'
    };
  });

  const [simulatedLoginEmail, setSimulatedLoginEmail] = useState('');
  const [simulatedLoginPassword, setSimulatedLoginPassword] = useState('');
  const [simulatedRegisterForm, setSimulatedRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: ''
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // New Entity Creation forms
  const [newBorrowerForm, setNewBorrowerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: ''
  });
  const [newLoanForm, setNewLoanForm] = useState({
    borrowerId: '',
    amount: 100000,
    interestRate: 15,
    durationMonths: 3
  });
  const [newPaymentForm, setNewPaymentForm] = useState({
    loanId: '',
    amount: 50000,
    gateway: 'Paystack' as Payment['gateway'],
    reference: ''
  });

  // Action fields for Recovery Case Updates
  const [recoveryActionForm, setRecoveryActionForm] = useState({
    caseId: '',
    actionType: 'LOG_NOTE' as 'LOG_NOTE' | 'PROMISE_TO_PAY' | 'ESCALATE' | 'ASSIGN_AGENT',
    note: '',
    agentName: '',
    amountPromised: '',
    datePromised: ''
  });

  // Direct notifications controls
  const [notificationTrigger, setNotificationTrigger] = useState({
    borrowerId: '',
    type: 'SMS' as 'SMS' | 'Email' | 'WhatsApp',
    triggerCode: 'Before_Due' as 'Before_Due' | 'On_Due' | 'After_Overdue'
  });

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [showConsentWarning, setShowConsentWarning] = useState(true);

  // Success indicator for copy actions
  const [copiedSdkKey, setCopiedSdkKey] = useState<string | null>(null);

  // Load backend stores safely
  const fetchAllData = async () => {
    try {
      const [bRes, lRes, pRes, sRes, aRes, cRes, nRes, gRes] = await Promise.all([
        fetch('/api/borrowers'),
        fetch('/api/loans'),
        fetch('/api/payments'),
        fetch('/api/sessions/history'),
        fetch('/api/risk/alerts'),
        fetch('/api/recovery/cases'),
        fetch('/api/notifications/logs'),
        fetch('/api/geo/location-history')
      ]);

      if (bRes.ok) setBorrowers(await bRes.json());
      if (lRes.ok) setLoans(await lRes.json());
      if (pRes.ok) setPayments(await pRes.json());
      if (sRes.ok) setSessions(await sRes.json());
      if (aRes.ok) setAlerts(await aRes.json());
      if (cRes.ok) setCases(await cRes.json());
      if (nRes.ok) setNotifications(await nRes.json());
      if (gRes.ok) setGeoHistory(await gRes.json());
    } catch (e) {
      console.error('Failed to sync state from local server core. Falling back.', e);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Default form placeholders
    if (loans.length > 0 && !newPaymentForm.loanId) {
      setNewPaymentForm(prev => ({ ...prev, loanId: loans[0].id }));
    }
    if (borrowers.length > 0 && !newLoanForm.borrowerId) {
      setNewLoanForm(prev => ({ ...prev, borrowerId: borrowers[0].id }));
    }
  }, []);

  useEffect(() => {
    if (borrowers.length > 0 && !newLoanForm.borrowerId) {
      setNewLoanForm(prev => ({ ...prev, borrowerId: borrowers[0].id }));
    }
  }, [borrowers]);

  useEffect(() => {
    if (loans.length > 0 && !newPaymentForm.loanId) {
      setNewPaymentForm(prev => ({ ...prev, loanId: loans[0].id }));
    }
  }, [loans]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions]);

  // Handle predictions on demand
  const queryPrediction = async (loanId: string) => {
    if (!loanId) return;
    setIsAiLoading(true);
    setPredictionReport(null);
    try {
      const res = await fetch(`/api/risk/predict-default/${loanId}`);
      if (res.ok) {
        const payload = await res.json();
        setPredictionReport(payload);
      }
    } catch (err) {
      console.error('Prediction network request returned an exception:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simulated Authentications & Login Identity Controllers
  const handleSimulatedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!simulatedLoginEmail || !simulatedLoginPassword) {
      setAuthError('Email and Password are required.');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: simulatedLoginEmail,
          password: simulatedLoginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
      } else {
        setCurrentUser({
          email: data.borrower.email,
          name: data.borrower.name,
          role: 'Borrower',
          id: data.borrower.id,
          lastLoginIp: '102.89.34.89',
          clientApp: 'Mobile Android Applet / Client API SDK',
          token: data.token
        });
        setAuthSuccess(`Securely authenticated as ${data.borrower.name}!`);
        setTimeout(() => {
          setShowAuthDialog(false);
          setSimulatedLoginEmail('');
          setSimulatedLoginPassword('');
          setAuthSuccess('');
        }, 1500);
      }
    } catch (err) {
      setAuthError('System experienced an unexpected auth failure. Please retry.');
    }
  };

  const handleSimulatedRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    const { name, email, password, phone, company } = simulatedRegisterForm;
    if (!name || !email || !password) {
      setAuthError('Name, Email and Password are required fields.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, company })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Identity registration failed.');
      } else {
        setCurrentUser({
          email: data.borrower.email,
          name: data.borrower.name,
          role: 'Borrower',
          id: data.borrower.id,
          lastLoginIp: '102.89.34.89',
          clientApp: 'Mobile Android Applet / Client API SDK',
          token: data.token
        });
        setAuthSuccess('Identity registered and active in Ledger!');
        fetchAllData();
        setTimeout(() => {
          setShowAuthDialog(false);
          setSimulatedRegisterForm({ name: '', email: '', password: '', phone: '', company: '' });
          setAuthSuccess('');
        }, 1550);
      }
    } catch (err) {
      setAuthError('Identity database connection interrupted.');
    }
  };

  const handleLogout = () => {
    setCurrentUser({
      email: 'fidelisemus@gmail.com',
      name: 'Fidelis Emus',
      role: 'Operator',
      lastLoginIp: '197.210.8.23',
      clientApp: 'CredGuard Desktop Console'
    });
    setShowProfileMenu(false);
  };

  // Submit operations
  const handleCreateBorrower = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/borrowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBorrowerForm.name,
          email: newBorrowerForm.email,
          phone: newBorrowerForm.phone,
          company: newBorrowerForm.company,
          kycStatus: 'Verified',
          emergencyContacts: newBorrowerForm.emergencyName ? [{
            name: newBorrowerForm.emergencyName,
            relationship: newBorrowerForm.emergencyRelationship,
            phone: newBorrowerForm.emergencyPhone
          }] : []
        })
      });
      if (res.ok) {
        setNewBorrowerForm({ name: '', email: '', phone: '', company: '', emergencyName: '', emergencyRelationship: '', emergencyPhone: '' });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoanForm)
      });
      if (res.ok) {
        setNewLoanForm(prev => ({ ...prev, amount: 100000 }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPaymentForm)
      });
      if (res.ok) {
        setNewPaymentForm(prev => ({ ...prev, amount: 50000, reference: '' }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInstantSettle = async (loanId: string, amount: number) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId,
          amount,
          gateway: 'Paystack',
          reference: `inst_gate_${Math.floor(Math.random() * 9000000 + 1000000)}`
        })
      });
      if (res.ok) {
        setRepaymentModalLoan(null);
        setCustomRepaymentAmount('');
        fetchAllData();
      }
    } catch (err) {
      console.error('Instant payment log failed', err);
    }
  };

  const handleRecoveryAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryActionForm.caseId) return;
    try {
      const res = await fetch('/api/recovery/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recoveryActionForm)
      });
      if (res.ok) {
        setRecoveryActionForm(prev => ({ ...prev, note: '', amountPromised: '', datePromised: '' }));
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTrigger.borrowerId) return;
    try {
      const res = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationTrigger)
      });
      if (res.ok) {
        fetchAllData();
        alert("Verification reminder triggered and successfully logged!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSdkKey(lang);
    setTimeout(() => setCopiedSdkKey(null), 2000);
  };

  // Derived dashboard analytics
  const totalOutstandingLoanAmount = loans.reduce((acc, current) => acc + (current.amount * (1 + current.interestRate/100)) + current.latePenalties - current.amountPaid, 0);
  const overdueLoans = loans.filter(l => l.status === 'Overdue');
  const outstandingOverdueAmount = overdueLoans.reduce((acc, current) => acc + (current.amount * (1 + current.interestRate/100)) + current.latePenalties - current.amountPaid, 0);
  const paidOverdueLoansRatio = loans.length > 0 ? (loans.filter(l => l.status === 'Paid').length / loans.length) * 100 : 0;

  // Recovery Cases metrics for Circular Gauge
  const resolvedCasesCount = cases.filter(c => c.stage === 'Settlement' || c.overdueAmount === 0).length;
  const activeCasesCount = cases.filter(c => c.stage !== 'Settlement' && c.overdueAmount > 0).length;
  const totalOverdueCasesCount = resolvedCasesCount + activeCasesCount;
  const recoveryPerformancePercent = totalOverdueCasesCount > 0
    ? Math.round((resolvedCasesCount / totalOverdueCasesCount) * 100)
    : 0;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200`}>
      {/* Top Professional Header */}
      <header id="header-bar" className="sticky top-0 z-20 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div id="app-logo" className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-soft">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CredGuard Core</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Recovery &amp; Loan Intelligence System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Theme Toggle Switcher */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Simulated Authentication Profile Dropdown Component */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60 font-semibold"
              >
                <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-350 px-1.5 py-0.5 rounded font-sans leading-none">
                  {currentUser.role}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl z-[999] text-xs space-y-3 text-slate-800 dark:text-slate-200">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{currentUser.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                  </div>

                  <div className="space-y-2 py-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Current Role:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser.role} Mode</span>
                    </div>
                    {currentUser.id && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Borrower ID:</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{currentUser.id}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Session IP:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">{currentUser.lastLoginIp}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Agent Interface:</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{currentUser.clientApp}</span>
                    </div>
                    {currentUser.token && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-1">JWT Session Token</span>
                        <div className="font-mono text-[9px] bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 break-all select-all flex items-center justify-between gap-1">
                          <span className="truncate max-w-[160px]">{currentUser.token}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(currentUser.token || '');
                              alert('JWT Token assertion copied to clipboard');
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 text-[10px] shrink-0 hover:underline font-sans ml-1 font-semibold"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    {currentUser.role === 'Operator' ? (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setAuthDialogMode('login');
                          setShowAuthDialog(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        <LogIn className="h-3 w-3" />
                        Borrower Simulate
                      </button>
                    ) : (
                      <button
                        onClick={handleLogout}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3 w-3 text-rose-500" />
                        Operator Mode
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Plug-in Core Active
            </span>
            <button 
              onClick={fetchAllData}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              Sync Feeds
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Compliance Guard & Integration Banner */}
        {showConsentWarning && (
          <div id="consent-alert" className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900">NDPR &amp; GDPR Consent Enforcement Mode Active</h3>
                  <p className="mt-1 text-xs text-yellow-800 leading-relaxed">
                    Device telemetry and geographic auditing are only performed when explicit authorization is provided. 
                    No raw hardware codes or MAC signatures are cached. All tracked sessions are fully compliant with sovereign privacy statutes.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowConsentWarning(false)}
                className="text-yellow-600 hover:text-yellow-900 text-xs font-semibold shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div id="navigation-tabs" className="mb-8 border-b border-slate-200 flex flex-wrap gap-2">
          {[
            { id: 'analytics', label: 'Aggregates & Reports', icon: TrendingUp },
            { id: 'borrowers', label: 'Borrowers & KYC', icon: Users },
            { id: 'loans', label: 'Loan Portfolio Management', icon: CreditCard },
            { id: 'recovery', label: 'Overdue Dunning & Cases', icon: ShieldAlert },
            { id: 'audits', label: 'Device & Geo Audits', icon: MapPin },
            { id: 'sdks', label: 'Plug-In SDKs', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  active 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CORE CONTENT */}
        
        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div id="analytics-tab" className="space-y-8">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Borrowers</span>
                  <Users className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-950">{borrowers.length}</span>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">Verified Active</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Outstanding Book</span>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-950">₦{totalOutstandingLoanAmount.toLocaleString()}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">+12% interest</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delinquent Book (Overdue)</span>
                  <ShieldAlert className="h-5 w-5 text-tomato text-rose-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-rose-600">₦{outstandingOverdueAmount.toLocaleString()}</span>
                  <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-medium">{overdueLoans.length} cases</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Flag Rules Status</span>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-amber-600">{alerts.filter(a => !a.resolved).length}</span>
                  <span className="text-xs text-amber-650 bg-amber-50 px-2 py-0.5 rounded font-medium">Unresolved</span>
                </div>
              </div>

              {/* Recovery Performance Circular Progress Gauge Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovery Performance</span>
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  {/* Gauge Ring */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="text-slate-100 stroke-current"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="text-emerald-500 stroke-current transition-all duration-700 ease-in-out"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 * (1 - recoveryPerformancePercent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-slate-900">{recoveryPerformancePercent}%</span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-slate-950 truncate">{resolvedCasesCount} / {totalOverdueCasesCount}</div>
                    <span className="text-xs text-slate-500 block truncate">Resolved Cases</span>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5 whitespace-nowrap">
                      {activeCasesCount} active cases
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Cognitive Forecaster Engine Block */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 text-xs text-indigo-100 font-bold tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Cognitive Predictor AI
                    </span>
                    <span className="text-xs text-indigo-200 font-serif">Models: gemini-3.5-flash</span>
                  </div>
                  <h3 className="text-lg font-bold">Predict Default Probability &amp; Waive Decisions</h3>
                  <p className="text-xs text-indigo-100 max-w-2xl">
                    Our AI-powered engine uses active telemetry, session metadata, VPN heuristics, and payment gateway logs to predict dynamic default chances and formulate custom collections messages.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <select 
                    value={analyzingLoanId}
                    onChange={(e) => setAnalyzingLoanId(e.target.value)}
                    className="rounded-lg bg-indigo-850 border border-indigo-700 text-sm text-indigo-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a loan to analyze...</option>
                    {loans.filter(l => l.status === 'Overdue' || l.status === 'Active').map(l => (
                      <option key={l.id} value={l.id}>
                        {l.borrowerName} (₦{(l.amount * (1 + l.interestRate/100)).toLocaleString()}) - {l.status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => queryPrediction(analyzingLoanId)}
                    disabled={!analyzingLoanId || isAiLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-indigo-550 hover:bg-indigo-500 text-sm font-semibold py-2 px-4 transition-colors text-white cursor-pointer disabled:opacity-50"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Generate Prediction'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {predictionReport && (
                <div className="mt-6 border-t border-indigo-800/80 pt-6 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border-4 border-indigo-500/50 flex items-center justify-center bg-indigo-950 font-bold text-lg">
                        {predictionReport.predictedScore}%
                      </div>
                      <div>
                        <span className="text-xs text-indigo-200">Forecast Risk Ratio Score</span>
                        <h4 className="text-sm font-bold">Risk Status: {predictionReport.predictedScore >= 75 ? 'Critical Concern' : 'Moderate Concern'}</h4>
                      </div>
                    </div>
                    <div className="text-xs text-indigo-300 bg-indigo-950/50 p-2 rounded border border-indigo-800">
                      Method: <span className="font-semibold text-indigo-100">{predictionReport.method}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-5 border border-indigo-800/40 text-slate-100 space-y-4 max-h-96 overflow-y-auto">
                    <div className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2">Cognitive Intelligence Report</div>
                    <div className="text-sm leading-relaxed whitespace-pre-line text-slate-200">
                      {predictionReport.reportText}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Interactive Repayment Chart & Performance section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900">Delinquency Tracking Insights</h3>
                    <p className="text-xs text-slate-500">Real-time status of current active loans book</p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Last updated: 2026-05-29</span>
                </div>

                <div className="space-y-4">
                  {loans.map(loan => {
                    const totalDue = (loan.amount * (1 + loan.interestRate/100)) + loan.latePenalties;
                    const paidPercentage = Math.min((loan.amountPaid / totalDue) * 100, 100);
                    return (
                      <div key={loan.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-mono text-slate-400">ID: {loan.id}</span>
                            <h4 className="font-semibold text-sm text-slate-900">{loan.borrowerName}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-extrabold ${
                              loan.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              loan.status === 'Overdue' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Settled: ₦{loan.amountPaid.toLocaleString()}</span>
                            <span>Remaining Total Due: ₦{(totalDue - loan.amountPaid).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                loan.status === 'Paid' ? 'bg-emerald-500' :
                                loan.status === 'Overdue' ? 'bg-rose-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${paidPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CSV Exporter, Backup & Live Activity Logs */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900">Audit Export Toolkit</h3>
                  <p className="text-xs text-slate-500">Generate on-demand CSV files for sovereign regulatory authorities</p>
                </div>

                <div className="space-y-3">
                  <a 
                    href="/api/export/csv/borrowers" 
                    target="_blank"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 transition-colors text-xs text-slate-700 font-semibold cursor-pointer"
                  >
                    <span>Borrower Identity Log CSV</span>
                    <Download className="h-4 w-4 text-slate-500" />
                  </a>

                  <a 
                    href="/api/export/csv/loans" 
                    target="_blank"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 transition-colors text-xs text-slate-700 font-semibold cursor-pointer"
                  >
                    <span>Loan Portfolio Log CSV</span>
                    <Download className="h-4 w-4 text-slate-500" />
                  </a>

                  <a 
                    href="/api/export/csv/recovery" 
                    target="_blank"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 transition-colors text-xs text-slate-700 font-semibold cursor-pointer"
                  >
                    <span>Delinquency Cases CSV</span>
                    <Download className="h-4 w-4 text-slate-500" />
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-[11px] leading-relaxed text-orange-950 space-y-1">
                  <h4 className="font-bold">Integration Notice</h4>
                  <p>These REST API tables hook directly to Paystack Webhooks and your legacy Mobile frameworks in perfect legal harmony.</p>
                </div>
              </div>

            </div>

            {/* Global Clients Ledger Listing Section */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Global Clients &amp; Credit Issuance Register</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Master real-time ledger of all registered borrowers, borrowed principal amounts, transaction timestamps, and current lifecycle status.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-150 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5">Client Location / Name</th>
                      <th className="p-3.5">Email &amp; Phone Identity</th>
                      <th className="p-3.5">Approved Loan Value</th>
                      <th className="p-3.5">Registered Timestamp</th>
                      <th className="p-3.5 text-center">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-slate-705 dark:text-slate-300">
                    {borrowers.map((borrower) => {
                      // Match borrower with their loan record
                      const matchedLoan = loans.find(l => l.borrowerName.toLowerCase() === borrower.name.toLowerCase() || l.id === borrower.id);
                      const amountBorrowed = matchedLoan ? matchedLoan.amount : 0;
                      const loanStatus = matchedLoan ? matchedLoan.status : 'No Loan';
                      const loanDate = matchedLoan ? new Date(matchedLoan.startDate).toLocaleDateString() : 'N/A';
                      const loanTime = matchedLoan ? new Date(matchedLoan.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                      
                      return (
                        <tr key={borrower.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors">
                          <td className="p-3.5 font-semibold text-slate-950 dark:text-white">
                            <div>{borrower.name}</div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">ID: {borrower.id}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono">{borrower.email}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{borrower.phone}</div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                            {amountBorrowed > 0 ? `₦${amountBorrowed.toLocaleString()}` : <span className="text-slate-400 dark:text-slate-500 font-normal">No Active Facility</span>}
                          </td>
                          <td className="p-3.5">
                            {matchedLoan ? (
                              <div>
                                <div>{loanDate}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{loanTime}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-mono">N/A</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              loanStatus === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' :
                              loanStatus === 'Overdue' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 animate-pulse' :
                              loanStatus === 'Active' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-850/40' :
                              'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                            }`}>
                              <span className={`h-1 w-1 rounded-full ${
                                loanStatus === 'Paid' ? 'bg-emerald-500' :
                                loanStatus === 'Overdue' ? 'bg-rose-500' :
                                loanStatus === 'Active' ? 'bg-sky-500' : 'bg-slate-400'
                              }`} />
                              {loanStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BORROWERS & KYC REGISTRY */}
        {activeTab === 'borrowers' && (
          <div id="borrowers-tab" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Borrower Identity &amp; Emergency Registry</h2>
                <p className="text-xs text-slate-500">Sync status, KYC ratings, and emergency backup channels.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Borrowers Table */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-4">Borrower Name</th>
                      <th className="p-4">KYC Rating</th>
                      <th className="p-4">Work / Company</th>
                      <th className="p-4">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200">
                    {borrowers
                      .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(b => (
                        <tr 
                          key={b.id} 
                          onClick={() => setSelectedBorrower(b)}
                          className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${selectedBorrower?.id === b.id ? 'bg-indigo-50/50' : ''}`}
                        >
                          <td className="p-4 font-semibold text-slate-900">
                            <div>{b.name}</div>
                            <span className="text-slate-400 text-xs font-mono">{b.id}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.kycStatus === 'Verified' ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100 text-amber-850'}`}>
                              {b.kycStatus}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{b.company}</td>
                          <td className="p-4 text-xs space-y-0.5">
                            <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {b.email}</div>
                            <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {b.phone}</div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sidebar Detail / New Borrower form */}
              <div className="space-y-6">
                
                {selectedBorrower ? (
                  <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Selected Identity Details</h3>
                      <button onClick={() => setSelectedBorrower(null)} className="text-xs text-indigo-600 font-semibold cursor-pointer">Deselect</button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-slate-400">Borrower ID</span>
                        <p className="text-sm font-mono font-bold text-indigo-900">{selectedBorrower.id}</p>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400">Corporate Affiliation</span>
                        <p className="text-sm font-medium">{selectedBorrower.company}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-500" /> Compliance Emergency Contacts</span>
                        <div className="mt-2 space-y-2">
                          {selectedBorrower.emergencyContacts && selectedBorrower.emergencyContacts.length > 0 ? (
                            selectedBorrower.emergencyContacts.map((c, i) => (
                              <div key={i} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                                <div className="font-semibold text-slate-800">{c.name} ({c.relationship})</div>
                                <div className="text-slate-500 font-mono mt-0.5">{c.phone}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No emergency backup identities filed.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Register Legacy Borrower Sync</h3>
                    <form onSubmit={handleCreateBorrower} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newBorrowerForm.name}
                          onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Adebayo Chukwuma"
                          className="w-full p-2 border border-slate-350 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Email Address</label>
                          <input
                            type="email"
                            required
                            value={newBorrowerForm.email}
                            onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="adebayo@mail.com"
                            className="w-full p-2 border border-slate-350 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Phone</label>
                          <input
                            type="text"
                            required
                            value={newBorrowerForm.phone}
                            onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+234 803 111 2222"
                            className="w-full p-2 border border-slate-350 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Workforce Company</label>
                        <input
                          type="text"
                          value={newBorrowerForm.company}
                          onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Apex Retail Systems"
                          className="w-full p-2 border border-slate-350 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1">Emergency Contact Information</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={newBorrowerForm.emergencyName}
                            onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, emergencyName: e.target.value }))}
                            className="p-2 border border-slate-350 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Relationship"
                            value={newBorrowerForm.emergencyRelationship}
                            onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, emergencyRelationship: e.target.value }))}
                            className="p-2 border border-slate-350 rounded"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Contact Phone"
                          value={newBorrowerForm.emergencyPhone}
                          onChange={(e) => setNewBorrowerForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                          className="w-full p-2 border border-slate-350 rounded"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1 text-xs cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Register Borrower Profile
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOAN PORTFOLIO MANAGEMENT */}
        {activeTab === 'loans' && (
          <div id="loans-tab" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Active Loan Portfolio Repayment Ledger</h2>
                <p className="text-xs text-slate-500">Calculate schedules, late penalty fees, starting and maturity dates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Portfolio List */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-4">Loan Target / Borrower</th>
                      <th className="p-4">Principal &amp; Interest</th>
                      <th className="p-4">Maturity Timeline</th>
                      <th className="p-4">Accumulated Penalties</th>
                      <th className="p-4">Gateway Ref</th>
                      <th className="p-4 text-center">Checkout &amp; Settle</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200">
                    {loans.map(loan => {
                      const totalOwed = loan.amount * (1 + loan.interestRate / 100) + loan.latePenalties;
                      const remaining = Math.max(0, totalOwed - loan.amountPaid);
                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/50 group">
                          <td className="p-4 font-semibold text-slate-900">
                            <div>{loan.borrowerName}</div>
                            <span className="text-slate-400 font-mono text-xs">{loan.id}</span>
                          </td>
                          <td className="p-4 text-slate-800">
                            <div className="font-bold">₦{loan.amount.toLocaleString()}</div>
                            <span className="text-xs text-emerald-700 font-medium">Interest: {loan.interestRate}%</span>
                          </td>
                          <td className="p-4 font-serif text-xs">
                            <div>Start: {new Date(loan.startDate).toLocaleDateString()}</div>
                            <div className="text-slate-500">Maturity: {new Date(loan.dueDate).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <span className={`${loan.latePenalties > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                              ₦{loan.latePenalties.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs uppercase font-extrabold ${
                              loan.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              loan.status === 'Overdue' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {remaining > 0 ? (
                              <button
                                onClick={() => {
                                  setRepaymentModalLoan(loan);
                                  setCustomRepaymentAmount(remaining.toString());
                                }}
                                className="inline-flex items-center gap-1 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                              >
                                <CreditCard className="h-3 w-3" />
                                <span>Pay Now</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold font-sans bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                <Check className="h-3 w-3 shrink-0" />
                                <span>Fully Paid</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sub-form to Log Repayment of a Loan */}
              <div className="space-y-6">
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-500" /> Gateway Settlement Emulator
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Test your legacy app webhooks securely. Registering a payment here will update outstanding balances across the core recovery logs.
                  </p>
                  
                  <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Target Loan File</label>
                      <select
                        required
                        value={newPaymentForm.loanId}
                        onChange={(e) => setNewPaymentForm(prev => ({ ...prev, loanId: e.target.value }))}
                        className="w-full p-2 border border-slate-350 rounded bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select an active loan...</option>
                        {loans.map(l => (
                          <option key={l.id} value={l.id}>{l.borrowerName} ({l.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Repayment Amount (₦)</label>
                      <input
                        type="number"
                        required
                        value={newPaymentForm.amount}
                        onChange={(e) => setNewPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        placeholder="186666"
                        className="w-full p-2 border border-slate-350 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Gateway Provider</label>
                        <select
                          value={newPaymentForm.gateway}
                          onChange={(e) => setNewPaymentForm(prev => ({ ...prev, gateway: e.target.value as any }))}
                          className="w-full p-2 border border-slate-350 rounded bg-white"
                        >
                          <option value="Paystack">Paystack</option>
                          <option value="Flutterwave">Flutterwave</option>
                          <option value="Monnify">Monnify</option>
                          <option value="Stripe">Stripe</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Transaction ID Reference</label>
                        <input
                          type="text"
                          value={newPaymentForm.reference}
                          onChange={(e) => setNewPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                          placeholder="Automatic Generated"
                          className="w-full p-2 border border-slate-350 rounded"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Force Credit Payment Ledger
                    </button>
                  </form>
                </div>

                {/* Quick Add Loan Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Grant Dynamic Credit Loan Line</h3>
                  <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Receiving Borrower</label>
                      <select
                        required
                        value={newLoanForm.borrowerId}
                        onChange={(e) => setNewLoanForm(prev => ({ ...prev, borrowerId: e.target.value }))}
                        className="w-full p-2 border border-slate-350 rounded bg-white"
                      >
                        <option value="">Select recipient...</option>
                        {borrowers.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.company})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Amount Principal (₦)</label>
                      <input
                        type="number"
                        required
                        value={newLoanForm.amount}
                        onChange={(e) => setNewLoanForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full p-2 border border-slate-350 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Interest Rate %</label>
                        <input
                          type="number"
                          value={newLoanForm.interestRate}
                          onChange={(e) => setNewLoanForm(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                          className="w-full p-2 border border-slate-350 rounded"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Duration (Months)</label>
                        <input
                          type="number"
                          value={newLoanForm.durationMonths}
                          onChange={(e) => setNewLoanForm(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                          className="w-full p-2 border border-slate-350 rounded"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded transition-colors text-xs cursor-pointer"
                    >
                      Provision Active Loan Record
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DELINQUENT CASES & WORKFLOW DUNNING */}
        {activeTab === 'recovery' && (
          <div id="recovery-tab" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Delinquent Collections Dunning Flow</h2>
                <p className="text-xs text-slate-500">Coordinate promise-to-pay pledges, agent assignments, and escalating protocols.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              
              <div className="col-span-3 lg:col-span-2 space-y-6">
                
                {cases.map(c => (
                  <div key={c.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    {/* Header bar of Case */}
                    <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs text-indigo-700 font-mono font-bold uppercase">{c.stage} STAGE</span>
                        <h3 className="font-bold text-slate-900">{c.borrowerName} Collections File</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
                          Agent: {c.assignedAgent}
                        </span>
                        <span className="text-rose-700 bg-rose-50 text-xs font-extrabold px-2 py-1 rounded">
                          {c.daysOverdue} Days Delay
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400">Total Delinquent Amount Due</span>
                        <div className="text-2xl font-extrabold text-slate-950">₦{c.overdueAmount.toLocaleString()}</div>
                      </div>

                      {/* Promises to Pay Log */}
                      <div className="md:col-span-2 space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
                        <span className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1">Pledges &amp; Promises log (PTP)</span>
                        <div className="mt-2 space-y-1.5">
                          {c.promiseToPayHistory && c.promiseToPayHistory.length > 0 ? (
                            c.promiseToPayHistory.map((ptp, i) => (
                              <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2 border border-slate-150 rounded">
                                <div>
                                  <span className="font-semibold text-slate-800">Promise ₦{ptp.promisedAmount.toLocaleString()}</span>
                                  <span className="text-slate-400 font-serif ml-1">for {new Date(ptp.promisedDate).toLocaleDateString()}</span>
                                </div>
                                <span className={`text-[10px] uppercase font-mono px-2 py-0.2 rounded ${
                                  ptp.status === 'Kept' ? 'bg-emerald-100 text-emerald-800' :
                                  ptp.status === 'Broken' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {ptp.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No formal active repayment commitments requested.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline of Logs inside the Case */}
                    <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Case Audit Logs</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-3">
                        {c.logs.map((log, index) => (
                          <div key={index} className="text-xs leading-relaxed flex items-start gap-2">
                            <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <div>
                              <span className="font-bold text-slate-800">[{log.action}]</span>
                              <span className="text-slate-600"> {log.note}</span>
                              <span className="text-[#64748b] bg-slate-100 px-1 py-0.2 rounded text-[10px] ml-1 font-mono">{log.agent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar controls: Log workflows & Trigger Notices */}
              <div className="space-y-6 col-span-3 lg:col-span-1">

                {/* Recovery Performance Circular Gauge Sidebar Card */}
                <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recovery Performance</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 font-sans">
                    <div className="relative flex items-center justify-center shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="text-slate-100 stroke-current"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="text-emerald-500 stroke-current transition-all duration-700 ease-in-out"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 * (1 - recoveryPerformancePercent / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-sm font-bold text-slate-900">{recoveryPerformancePercent}%</span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-2xl font-black text-emerald-600 truncate">{resolvedCasesCount} / {totalOverdueCasesCount}</div>
                      <span className="text-xs text-slate-500 block truncate">Resolved Cases</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                        {activeCasesCount} active overdue cases
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5"><Sliders className="h-4 w-4 text-indigo-505 text-indigo-500" /> Dispatch Dunning Notice</h3>
                  <p className="text-xs text-slate-500">
                    Send automated notifications based on loan timelines to channels compliant with NDPR rules.
                  </p>

                  <form onSubmit={handleTriggerNotification} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Target Borrower Receiver</label>
                      <select
                        required
                        value={notificationTrigger.borrowerId}
                        onChange={(e) => setNotificationTrigger(prev => ({ ...prev, borrowerId: e.target.value }))}
                        className="w-full p-2 border border-slate-350 rounded bg-white"
                      >
                        <option value="">Choose recipient...</option>
                        {borrowers.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.company})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Contact Vector</label>
                        <select
                          value={notificationTrigger.type}
                          onChange={(e) => setNotificationTrigger(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full p-2 border border-slate-350 rounded bg-white"
                        >
                          <option value="SMS">SMS</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Workflow Trigger</label>
                        <select
                          value={notificationTrigger.triggerCode}
                          onChange={(e) => setNotificationTrigger(prev => ({ ...prev, triggerCode: e.target.value as any }))}
                          className="w-full p-2 border border-slate-350 rounded bg-white"
                        >
                          <option value="Before_Due">Before Due Date</option>
                          <option value="On_Due">On Due Date</option>
                          <option value="After_Overdue">After Overdue</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="h-3 w-3" /> Broadcast Delinquency Warning
                    </button>
                  </form>
                </div>

                {/* Case Actions Updates Form */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900">Append Delinquency Workflow Event</h3>
                  
                  <form onSubmit={handleRecoveryAction} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Delinquent Case Target</label>
                      <select
                        required
                        value={recoveryActionForm.caseId}
                        onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, caseId: e.target.value }))}
                        className="w-full p-2 border border-slate-350 rounded bg-white"
                      >
                        <option value="">Select active case...</option>
                        {cases.map(c => (
                          <option key={c.id} value={c.id}>{c.borrowerName} ({c.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Operational Workout Action</label>
                      <select
                        value={recoveryActionForm.actionType}
                        onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, actionType: e.target.value as any }))}
                        className="w-full p-2 border border-slate-350 rounded bg-white"
                      >
                        <option value="LOG_NOTE">Add Collector Note</option>
                        <option value="PROMISE_TO_PAY">Commit Promise-to-Pay (PTP)</option>
                        <option value="ESCALATE">Escalate Status Stage</option>
                        <option value="ASSIGN_AGENT">Reassign Legal Agent</option>
                      </select>
                    </div>

                    {recoveryActionForm.actionType === 'PROMISE_TO_PAY' && (
                      <div className="grid grid-cols-2 gap-2 border border-indigo-100 p-2.5 rounded bg-indigo-50/20">
                        <div className="space-y-1 text-[11px]">
                          <label className="font-semibold text-slate-700">Commit Sum (₦)</label>
                          <input
                            type="number"
                            required
                            value={recoveryActionForm.amountPromised}
                            onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, amountPromised: e.target.value }))}
                            placeholder="120000"
                            className="p-1 border border-slate-350 rounded w-full"
                          />
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <label className="font-semibold text-slate-700">Due Date</label>
                          <input
                            type="date"
                            required
                            value={recoveryActionForm.datePromised}
                            onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, datePromised: e.target.value }))}
                            className="p-1 border border-slate-350 rounded w-full"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Collector/Agent Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Aisha Yusuf"
                        value={recoveryActionForm.agentName}
                        onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, agentName: e.target.value }))}
                        className="w-full p-2 border border-slate-350 rounded"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Explanatory Context Log Note</label>
                      <textarea
                        value={recoveryActionForm.note}
                        onChange={(e) => setRecoveryActionForm(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Agreed to settle tomorrow. No waivers allowed."
                        rows={2}
                        className="w-full p-2 border border-slate-350 rounded font-normal"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition-colors text-xs cursor-pointer"
                    >
                      Apply Action to Registry
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 5: SESSIONS, RECTIFIED DEVICE & GEOLOCATION AUDITING */}
        {activeTab === 'audits' && (() => {
          // Filter sessions by Name, Email, and Date range
          const filteredSessions = sessions.filter(sess => {
            // 1. Search Query (Name/Email)
            if (sessionSearch.trim()) {
              const query = sessionSearch.toLowerCase().trim();
              const nameMatch = sess.borrowerName.toLowerCase().includes(query);
              const matchBorrower = borrowers.find(b => b.id === sess.borrowerId);
              const emailMatch = matchBorrower ? matchBorrower.email.toLowerCase().includes(query) : false;
              if (!nameMatch && !emailMatch) {
                return false;
              }
            }

            // 2. Date Range
            const sessDate = new Date(sess.timestamp);
            if (sessionStartDate) {
              const start = new Date(sessionStartDate);
              start.setHours(0, 0, 0, 0);
              if (sessDate < start) {
                return false;
              }
            }
            if (sessionEndDate) {
              const end = new Date(sessionEndDate);
              end.setHours(23, 59, 59, 999);
              if (sessDate > end) {
                return false;
              }
            }

            return true;
          });

          const currSession = filteredSessions.find(s => s.id === selectedSessionId) || filteredSessions[0] || null;
          const currGeo = currSession ? geoHistory.find(g => g.ipAddress === currSession.ipAddress) : null;
          const mapLat = currGeo?.latitude ?? 6.5244;
          const mapLon = currGeo?.longitude ?? 3.3792;
          const zoomFactor = 0.08 / Math.pow(2, (mapZoom ?? 13) - 10);
          const bboxString = `${mapLon - zoomFactor},${mapLat - zoomFactor},${mapLon + zoomFactor},${mapLat + zoomFactor}`;
          const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxString}&layer=mapnik&marker=${mapLat}%2C${mapLon}`;

          return (
            <div id="audits-tab" className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-150">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Device &amp; Approximate Geo-IP Lookup</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Log user logins safely with explicit user consent tokens to audit risk &amp; bypass VPN frauds.</p>
                </div>
              </div>

              {/* Advanced Filter Panel Component */}
              <div id="session-filters-panel" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Filter className="h-4 w-4 text-indigo-505 text-indigo-550 text-indigo-600 dark:text-indigo-405" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter Audited Telemetry Nodes</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                  {/* Name or Email Filter */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Search className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      <span>Search Client Identity</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter client name or email..."
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      <span>From Date</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={sessionStartDate}
                      onChange={(e) => setSessionStartDate(e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      <span>To Date</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={sessionEndDate}
                      onChange={(e) => setSessionEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Reset button and status metrics */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div className="text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold text-indigo-650 text-indigo-600 dark:text-indigo-400">{filteredSessions.length}</span> of <span className="font-semibold">{sessions.length}</span> global telemetry events
                  </div>
                  {(sessionSearch || sessionStartDate || sessionEndDate) && (
                    <button
                      onClick={() => {
                        setSessionSearch('');
                        setSessionStartDate('');
                        setSessionEndDate('');
                      }}
                      className="text-xs text-rose-600 dark:text-rose-455 hover:underline font-semibold cursor-pointer text-left"
                    >
                      Reset All Filters ×
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Telemetry Tracking logs list */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Dynamic User Audited Signals</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tracked sessions. Click any audited signal card below to plot its exact telemetry location on the interactive map.</p>
                  </div>

                  <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <p className="font-semibold text-sm">No telemetry matches found</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Adjust your search parameters or dates to locate records.</p>
                      </div>
                    ) : (
                      filteredSessions.map(sess => {
                        const geo = geoHistory.find(g => g.ipAddress === sess.ipAddress);
                        const isHighlighted = currSession?.id === sess.id;
                        return (
                          <div 
                            key={sess.id} 
                            onClick={() => setSelectedSessionId(sess.id)}
                            className={`p-4 rounded-xl border transition-all flex flex-col gap-4 shadow-sm cursor-pointer ${
                              isHighlighted 
                                ? 'border-indigo-600 ring-2 ring-indigo-50 bg-indigo-50/10 dark:ring-indigo-950/45' 
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">{sess.borrowerName}</h4>
                                  <span className={`text-[10px] px-2 py-0.2 rounded font-extrabold ${sess.vpnUsed ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {sess.vpnUsed ? 'vpn/proxy detected' : 'direct connection'}
                                  </span>
                                </div>
                                <div className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">Session: {sess.id} | Timestamp: {new Date(sess.timestamp).toLocaleString()}</div>
                                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
                                  <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                                  <span>App: {sess.appVersion} | OS: {sess.os} | Browser: {sess.browser}</span>
                                </div>
                              </div>

                              <div className="text-left md:text-right text-xs">
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sess.ipAddress}</span>
                                <div className="text-indigo-650 font-serif text-[11px] font-bold dark:text-indigo-400">{sess.asn || 'Inferred ISP Lookup'}</div>
                              </div>
                            </div>

                            {/* Geographical Location & Position Map Section */}
                            {geo ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-150 dark:border-slate-850 text-xs">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Est. Geographic Position</span>
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                                    <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                    <span>{geo.city}, {geo.region}, {geo.country} ({geo.countryCode})</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Audited Coordinates</span>
                                  <div className="font-mono font-medium text-slate-700 dark:text-slate-300">
                                    {geo.latitude.toFixed(4)}° N, {geo.longitude.toFixed(4)}° E
                                  </div>
                                </div>
                                <div className="flex items-center justify-start sm:justify-end">
                                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/45 px-2.5 py-1 rounded-md inline-block">
                                    {isHighlighted ? 'Showing on Map' : 'Click to Plot Position'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-150 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 animate-pulse" />
                                <span>Resolving sovereign geolite lookup for {sess.ipAddress}...</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Live Geo-Audit Map Console Panel */}
                <div className="space-y-6">
                  {/* Map Card */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                          <MapPin className="h-4 w-4 text-rose-500 animate-bounce shrink-0" />
                          Live Geo-IP Coordinates Plot
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate">Selected: {currSession?.borrowerName || 'Unknown'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded border border-indigo-900/50 shrink-0 select-all">
                        {mapLat.toFixed(4)}, {mapLon.toFixed(4)}
                      </span>
                    </div>

                    {/* Interactive Leaflet Map Wrapper */}
                    <div className="relative h-64 bg-slate-100 border-b border-slate-200 overflow-hidden">
                      <TravelMap
                        currSession={currSession}
                        allSessions={filteredSessions}
                        geoHistory={geoHistory}
                        zoomLevel={mapZoom}
                        theme={theme}
                      />
                      <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-1 rounded border border-slate-200/80 text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1 z-[1000]">
                        <span>Leaflet &amp; CartoDB Map Service</span>
                      </div>
                    </div>

                    {/* Map Navigation & Custom Interactive Zoom Controls */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-indigo-505 text-indigo-500" />
                          Interactive Map Zoom
                        </span>
                        <span className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          Level {mapZoom}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="18"
                        value={mapZoom}
                        onChange={(e) => setMapZoom(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Far Out (City)</span>
                        <span>Street Focus</span>
                      </div>
                    </div>

                    {/* Meta information of the selected node */}
                    {currGeo ? (
                      <div className="p-4 space-y-3 text-xs text-slate-700 font-sans">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500 font-medium">Estimated Locale</span>
                          <span className="font-semibold text-slate-950">{currGeo.city}, {currGeo.region}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500 font-medium">Sovereign Node</span>
                          <span className="font-semibold text-slate-950">{currGeo.country} ({currGeo.countryCode})</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500 font-medium">ISP Provider info</span>
                          <span className="font-semibold text-indigo-600 truncate max-w-[150px]">{currGeo.isp}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500 font-medium">Registered Timezone</span>
                          <span className="font-mono text-[11px] text-slate-900">{currGeo.timezone}</span>
                        </div>

                        <div className="pt-2">
                          <a 
                            href={`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLon}#map=16/${mapLat}/${mapLon}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full text-center inline-flex items-center justify-center gap-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 font-bold rounded-lg py-2 shadow transition-colors cursor-pointer"
                            referrerPolicy="no-referrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Verify sovereign Map coordinates</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-xs text-slate-500 text-center">
                        No geographic metadata loaded for this session.
                      </div>
                    )}
                  </div>

                  {/* Sandbox lookup presets */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div>
                      <h3 className="font-bold text-slate-900">Regulatory Check Sandbox</h3>
                      <p className="text-xs text-slate-500">Click a sovereign node sandbox case study below to center the interactive map dynamically on that coordinate system.</p>
                    </div>

                    <div 
                      onClick={() => setSelectedSessionId('sess_301')}
                      className={`space-y-3 font-mono text-xs text-slate-700 bg-slate-50 hover:bg-indigo-50/20 border p-4 rounded-lg cursor-pointer transition-colors ${
                        currSession?.id === 'sess_301' ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-2 flex justify-between items-center">
                        <span>Internal Geo-IP Database</span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Demo #1</span>
                      </div>
                      <div>IP: <span className="font-bold text-slate-950">102.89.34.89</span></div>
                      <div>Estimated City: <span className="text-slate-950 font-sans">Ikeja, Lagos</span></div>
                      <div>Country Node: <span className="text-slate-950 font-sans">Nigeria (NG)</span></div>
                    </div>

                    <div 
                      onClick={() => setSelectedSessionId('sess_302')}
                      className={`space-y-3 font-mono text-xs text-slate-700 bg-red-50/50 hover:bg-rose-50/80 border p-4 rounded-lg cursor-pointer transition-colors ${
                        currSession?.id === 'sess_302' ? 'border-red-400 bg-red-50/80' : 'border-red-100'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-red-700 tracking-wider mb-2 flex justify-between items-center">
                        <span>VPN Proxy Match Database</span>
                        <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-sans uppercase font-bold">Demo #2</span>
                      </div>
                      <div>IP: <span className="font-bold text-slate-950">45.14.28.102</span></div>
                      <div>Threat Match: <span className="text-rose-700 font-sans font-bold">Romania (Bucharest Node)</span></div>
                      <div>Hosting / ASN: <span className="text-slate-950 font-sans">NordVPN S.R.L</span></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* TAB 6: CONNECT INTEGRATION SDKS & WEBHOOK MANUAL */}
        {activeTab === 'sdks' && (
          <div id="sdks-tab" className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Corporate REST API SDK Integration Modules</h2>
              <p className="text-xs text-slate-500">Integrate with your live Android, Flutter, iOS, and Web legacy codebases effortlessly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* SDK index list selector */}
              <div className="md:col-span-1 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Target Platform SDK</div>
                
                {[
                  { id: 'js', label: 'JavaScript & Web SDK', lang: 'javascript' },
                  { id: 'kt', label: 'Android Kotlin SDK', lang: 'android' },
                  { id: 'swift', label: 'iOS Swift Module', lang: 'swift' },
                  { id: 'webhook', label: 'Webhook Validation Script', lang: 'webhook' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => copyToClipboard(SDK_TEMPLATES[item.lang as keyof typeof SDK_TEMPLATES], item.id)}
                    className="w-full text-left p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/20 text-xs font-semibold flex items-center justify-between transition-all group shrink-0 cursor-pointer"
                  >
                    <span className="text-slate-800">{item.label}</span>
                    {copiedSdkKey === item.id ? (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
                    )}
                  </button>
                ))}

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] leading-relaxed text-indigo-950 space-y-1.5 mt-6">
                  <h4 className="font-bold">Automated Sync Flow</h4>
                  <p>When borrowers hit payment gateways like Stripe or Paystack, gateway webhooks notify CredGuard, realigning collections automatically.</p>
                </div>
              </div>

              {/* Detailed code playground view */}
              <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col">
                <div className="bg-slate-950 text-slate-400 px-4 py-2.5 flex items-center justify-between border-b border-slate-900 text-xs">
                  <span className="font-mono text-[11px] text-slate-300">integration_playground_sdk.ts</span>
                  <span className="text-slate-500">Read Only</span>
                </div>
                <div className="bg-slate-900 p-5 overflow-x-auto max-h-[500px]">
                  <pre className="text-xs text-indigo-200 font-mono leading-relaxed select-all">
                    {SDK_TEMPLATES.javascript}
                  </pre>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                  <span>Press copy on the left to copy complete native class code safely.</span>
                  <span className="font-mono">v1.2.0 Stable</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Modern Humble Footer */}
      <footer id="dashboard-footer" className="bg-slate-950 text-slate-400 py-12 mt-16 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider">CredGuard Middle-Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving as a secure plugin core that layers risk mitigation, IP analytics, and AI predictive collections on top of your live operational databases.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="text-white font-bold tracking-wider">SOVEREIGN PRIVACY FRAMEWORKS</h4>
            <p className="leading-relaxed">
              Adheres strictly to legal frameworks including NDPR and GDPR. Biometric tracking, hidden trackers, hardware MAC keys, and device profiling are categorically excluded.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="text-white font-bold tracking-wider">SYSTEM ASSURANCE</h4>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-400" /> API Gateway
                </span>
                <span className="text-slate-400 uppercase font-mono tracking-widest text-[9px]">ACTIVE</span>
              </div>
              <p className="text-[10px] text-slate-405 text-slate-500">Standard JWT Handshakes and cryptographic webhook security verified.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Settle & Payoff Checkout Overlay Modal */}
      {repaymentModalLoan && (() => {
        const totalOwed = repaymentModalLoan.amount * (1 + repaymentModalLoan.interestRate / 100) + repaymentModalLoan.latePenalties;
        const remaining = Math.max(0, totalOwed - repaymentModalLoan.amountPaid);
        return (
          <div id="repayment-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6 animate-scaleUp">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600 shrink-0" />
                    Instant Settle Checkout
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Force gateway credit ledger match & auto-recovery synchronization</p>
                </div>
                <button 
                  onClick={() => setRepaymentModalLoan(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors cursor-pointer"
                >
                  <span className="font-sans text-lg font-bold block px-2 leading-none">×</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium font-sans">Active Borrower</span>
                  <span className="font-bold text-slate-950">{repaymentModalLoan.borrowerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium font-sans">Internal Loan File</span>
                  <span className="font-mono text-[11px] text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{repaymentModalLoan.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Already Paid</span>
                    <span className="font-extrabold text-slate-800 text-sm">₦{repaymentModalLoan.amountPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Outstanding Balance</span>
                    <span className="font-black text-emerald-700 text-base">₦{remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Select Settlement Presets</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleInstantSettle(repaymentModalLoan.id, remaining)}
                    disabled={remaining <= 0}
                    type="button"
                    className="p-3.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-left transition-all font-semibold disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-85 block mb-1">Pay Full payoff</span>
                    <span className="text-sm font-black font-sans">₦{remaining.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={() => handleInstantSettle(repaymentModalLoan.id, Math.round(remaining / 2))}
                    disabled={remaining <= 100}
                    type="button"
                    className="p-3.5 border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 rounded-xl text-left transition-all font-semibold disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-85 block mb-1">Pay Half Balance</span>
                    <span className="text-sm font-black font-sans text-slate-900">₦{Math.round(remaining / 2).toLocaleString()}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">Custom Allocation (₦)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    max={remaining}
                    placeholder="e.g. 25000"
                    value={customRepaymentAmount}
                    onChange={(e) => setCustomRepaymentAmount(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                  <button
                    onClick={() => {
                      const amount = Number(customRepaymentAmount);
                      if (amount > 0) {
                        handleInstantSettle(repaymentModalLoan.id, amount);
                      }
                    }}
                    type="button"
                    disabled={!Number(customRepaymentAmount) || Number(customRepaymentAmount) <= 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    Apply Settle
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Simulated Borrower Auth Modal Module */}
      {showAuthDialog && (
        <div id="simulated-auth-modal" className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp text-slate-800 dark:text-slate-100">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-indigo-600 shrink-0" />
                  {authDialogMode === 'login' ? 'Simulated Borrower Login' : 'Borrower Registration'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {authDialogMode === 'login' 
                    ? 'Authenticate as an existing customer inside the mobile application layer.' 
                    : 'Register a new borrower profile in the CredGuard cryptographic ledger.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAuthDialog(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <span className="font-sans text-lg font-bold block px-2 leading-none">×</span>
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold animate-pulse">
                ✨ {authSuccess}
              </div>
            )}

            {authDialogMode === 'login' ? (
              <form onSubmit={handleSimulatedLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Simulated Borrower Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. fidelisemus@gmail.com or other"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium focus:ring-2 focus:ring-indigo-505 text-slate-900 dark:text-white"
                    value={simulatedLoginEmail}
                    onChange={e => setSimulatedLoginEmail(e.target.value)}
                  />
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between">
                    <span>Demo account: any borrower email will pass</span>
                    <button 
                      type="button" 
                      onClick={() => setSimulatedLoginEmail('fidelisemus@gmail.com')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Use Fidelis
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Security Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium focus:ring-2 focus:ring-indigo-505 text-slate-900 dark:text-white"
                    value={simulatedLoginPassword}
                    onChange={e => setSimulatedLoginPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthDialogMode('register');
                      setAuthError('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Need an account? New Register
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Sign In Simulated
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSimulatedRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Fidelis Emus"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                      value={simulatedRegisterForm.name}
                      onChange={e => setSimulatedRegisterForm({...simulatedRegisterForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="fidelis@gmail.com"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                      value={simulatedRegisterForm.email}
                      onChange={e => setSimulatedRegisterForm({...simulatedRegisterForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Simulated Phone</label>
                    <input
                      type="text"
                      placeholder="+234 81 2345 6789"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                      value={simulatedRegisterForm.phone}
                      onChange={e => setSimulatedRegisterForm({...simulatedRegisterForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Employment Profile</label>
                    <input
                      type="text"
                      placeholder="Freelance Engineer"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                      value={simulatedRegisterForm.company}
                      onChange={e => setSimulatedRegisterForm({...simulatedRegisterForm, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Access Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Create security password"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                    value={simulatedRegisterForm.password}
                    onChange={e => setSimulatedRegisterForm({...simulatedRegisterForm, password: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthDialogMode('login');
                      setAuthError('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Already registered? Log In
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Create Sim Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}
