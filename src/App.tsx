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
  LogOut,
  Database,
  Trash2,
  Edit3,
  Terminal,
  Table
} from 'lucide-react';
import { Borrower, Loan, Payment, UserSession, RiskAlert, RecoveryCase, NotificationLog, GeoLocation } from './types';
import { SDK_TEMPLATES } from './utils/sdkTemplates';
import { TravelMap } from './components/TravelMap';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab ] = useState<'analytics' | 'borrowers' | 'loans' | 'recovery' | 'audits' | 'sdks' | 'database'>('analytics');

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

  // Advanced Recovery Case Management Filter & Interactive State
  const [recoverySearch, setRecoverySearch] = useState<string>('');
  const [recoveryStageFilter, setRecoveryStageFilter] = useState<string>('All');
  const [recoveryAgentFilter, setRecoveryAgentFilter] = useState<string>('All');
  const [recoverySortBy, setRecoverySortBy] = useState<string>('Days_Overdue_Desc');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // States for inline action overrides per single case
  const [activeCardAction, setActiveCardAction] = useState<Record<string, 'LOG_NOTE' | 'PROMISE_TO_PAY' | 'ESCALATE' | 'ASSIGN_AGENT' | null>>({});
  const [cardPtpAmount, setCardPtpAmount] = useState<Record<string, string>>({});
  const [cardPtpDate, setCardPtpDate] = useState<Record<string, string>>({});
  const [cardLogContent, setCardLogContent] = useState<Record<string, string>>({});
  const [cardSelectedAgent, setCardSelectedAgent] = useState<Record<string, string>>({});

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

  // Integrated SQL Engine & Database Workstation States
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [selectedDbTable, setSelectedDbTable] = useState<any | null>(null);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [searchRowQuery, setSearchRowQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM borrowers WHERE kycStatus = \'Verified\'');
  const [sqlResult, setSqlResult] = useState<any | null>(null);
  const [sqlError, setSqlError] = useState('');
  const [aiSynthesisPrompt, setAiSynthesisPrompt] = useState('Realistic active transactions');
  const [synthesizing, setSynthesizing] = useState(false);
  const [newRecordModalOpen, setNewRecordModalOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, string>>({});
  const [newColumnName, setNewColumnName] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>({});
  const [tablesLoading, setTablesLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');

  // Functions to query backend operations
  const fetchDbTables = async () => {
    setTablesLoading(true);
    try {
      const res = await fetch('/api/db/tables');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDbTables(data);
      }
    } catch (e) {
      console.error("Failed loading database information matrix", e);
    } finally {
      setTablesLoading(false);
    }
  };

  const exploreTable = async (tableMeta: any) => {
    setSelectedDbTable(tableMeta);
    setSearchRowQuery('');
    setEditingRowId(null);
    try {
      const res = await fetch(`/api/db/${tableMeta.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTableRows(data);
      }
    } catch (e) {
      console.error("Failed exploring catalog tables metadata", e);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDbTable) return;
    try {
      const res = await fetch(`/api/db/${selectedDbTable.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecordData)
      });
      const data = await res.json();
      if (data.success) {
        setTableRows([...tableRows, data.row]);
        setNewRecordModalOpen(false);
        setNewRecordData({});
        fetchDbTables(); // update counts
      }
    } catch (e) {
      console.error("Failed compiling column inserts", e);
    }
  };

  const handleUpdateRecord = async (id: string, recordData: any) => {
    if (!selectedDbTable) return;
    try {
      const res = await fetch(`/api/db/${selectedDbTable.id}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordData)
      });
      const data = await res.json();
      if (data.success) {
        setTableRows(tableRows.map(row => String(row.id || row.ipAddress) === String(id) ? data.row : row));
        setEditingRowId(null);
      }
    } catch (e) {
      console.error("Failed updating rows indexes", e);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!selectedDbTable) return;
    if (!confirm("Are you certain you want to remove this record from high fidelity ledger?")) return;
    try {
      const res = await fetch(`/api/db/${selectedDbTable.id}/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setTableRows(tableRows.filter(row => String(row.id || row.ipAddress) !== String(id)));
        fetchDbTables(); // update counts
      }
    } catch (e) {
      console.error("Failed pruning data element", e);
    }
  };

  const handleAddCustomColumn = async () => {
    if (!selectedDbTable || !newColumnName) return;
    try {
      const res = await fetch(`/api/db/${selectedDbTable.id}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnName: newColumnName })
      });
      const data = await res.json();
      if (data.success) {
        const updatedSchema = [...selectedDbTable.schema, newColumnName];
        setSelectedDbTable({ ...selectedDbTable, schema: updatedSchema });
        setNewColumnName('');
        // Reload row values with default columns populated
        exploreTable({ ...selectedDbTable, schema: updatedSchema });
        fetchDbTables();
      } else {
        alert(data.error || "Cannot insert custom column.");
      }
    } catch (e) {
      console.error("Column mutation exception:", e);
    }
  };

  const handleResetTableState = async (tableName: string) => {
    if (!confirm(`Are you sure you want to completely erase all row parameters from ${tableName}?`)) return;
    try {
      const res = await fetch('/api/db/actions/reset', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName })
      });
      const data = await res.json();
      if (data.success) {
        setTableRows([]);
        fetchDbTables();
      }
    } catch (e) {
      console.error("Erase table records exception:", e);
    }
  };

  const handleRunSQLQuery = async () => {
    setSqlError('');
    setSqlResult(null);
    try {
      const res = await fetch('/api/db/query', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();
      if (data.success) {
        setSqlResult(data);
      } else {
        setSqlError(data.error || "SQL query runtime compiled with error state.");
      }
    } catch (e) {
      setSqlError("Failed communication with active DB query endpoints.");
    }
  };

  const handleAISynthesizeData = async () => {
    if (!selectedDbTable) return;
    setSynthesizing(true);
    try {
      const res = await fetch('/api/db/ai-synthesize', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName: selectedDbTable.id, prompt: aiSynthesisPrompt })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        setTableRows([...tableRows, ...data.rows]);
        fetchDbTables(); // reload count tags
      }
    } catch (e) {
      console.error("Failed AI synthesis dispatch:", e);
    } finally {
      setSynthesizing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDbTables();
    }
  }, [activeTab]);

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

  const handleInlineCaseAction = async (
    caseId: string,
    actionType: 'LOG_NOTE' | 'PROMISE_TO_PAY' | 'ESCALATE' | 'ASSIGN_AGENT',
    payload: { note?: string; agentName?: string; amountPromised?: number; datePromised?: string }
  ) => {
    try {
      const res = await fetch('/api/recovery/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          actionType,
          ...payload
        })
      });
      if (res.ok) {
        // Clear card-specific operational overrides
        setActiveCardAction(prev => ({ ...prev, [caseId]: null }));
        setCardPtpAmount(prev => ({ ...prev, [caseId]: '' }));
        setCardPtpDate(prev => ({ ...prev, [caseId]: '' }));
        setCardLogContent(prev => ({ ...prev, [caseId]: '' }));
        setCardSelectedAgent(prev => ({ ...prev, [caseId]: '' }));
        fetchAllData();
      } else {
        const errVal = await res.json();
        alert(errVal.error || "Operational pipeline update failed.");
      }
    } catch (err) {
      console.error('Failed to submit inline collections event:', err);
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
            { id: 'database', label: 'Database & Tables', icon: Database },
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
        {activeTab === 'recovery' && (() => {
          // Filter cases based on search, stage selection, and agent assignment
          const filteredAndSortedCases = cases.filter(c => {
            // 1. Search (Borrower Name, ID, or Company Name)
            if (recoverySearch.trim()) {
              const q = recoverySearch.toLowerCase().trim();
              const nameMatch = c.borrowerName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
              const bObj = borrowers.find(b => b.id === c.borrowerId);
              const compMatch = bObj ? bObj.company.toLowerCase().includes(q) : false;
              if (!nameMatch && !compMatch) return false;
            }
            // 2. Stage Filter
            if (recoveryStageFilter !== 'All') {
              if (c.stage !== recoveryStageFilter) return false;
            }
            // 3. Agent Filter
            if (recoveryAgentFilter !== 'All') {
              if (c.assignedAgent !== recoveryAgentFilter) return false;
            }
            return true;
          }).sort((a, b) => {
            if (recoverySortBy === 'Days_Overdue_Desc') {
              return b.daysOverdue - a.daysOverdue;
            }
            if (recoverySortBy === 'Days_Overdue_Asc') {
              return a.daysOverdue - b.daysOverdue;
            }
            if (recoverySortBy === 'Overdue_Amount_Desc') {
              return b.overdueAmount - a.overdueAmount;
            }
            if (recoverySortBy === 'Overdue_Amount_Asc') {
              return a.overdueAmount - b.overdueAmount;
            }
            return 0;
          });

          return (
            <div id="recovery-tab" className="space-y-8 text-slate-800 dark:text-slate-100 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delinquent Collections Dunning Flow</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Coordinate promise-to-pay pledges, agent assignments, and escalating protocols.</p>
                </div>
              </div>

              {/* Advanced Case Filtering and Search Dashboard */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Filter Recovery Cases</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                  {/* Search Query */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Search className="h-3 w-3 text-slate-400" />
                      <span>Search Borrower, ID, or Company</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter identity or institution..."
                      value={recoverySearch}
                      onChange={(e) => setRecoverySearch(e.target.value)}
                    />
                  </div>

                  {/* Filter by Agent */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-400" />
                      <span>Assigned Recovery Officer</span>
                    </label>
                    <select
                      value={recoveryAgentFilter}
                      onChange={(e) => setRecoveryAgentFilter(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs cursor-pointer"
                    >
                      <option value="All">All Officers (All Core)</option>
                      <option value="Aisha Yusuf">Aisha Yusuf (Senior Case Officer)</option>
                      <option value="Chinedu Okafor">Chinedu Okafor (Field Recovery Lead)</option>
                      <option value="Olumide Bakare">Olumide Bakare (Court Litigation Counsel)</option>
                      <option value="Fatima Bello">Fatima Bello (Direct Dialer Agent)</option>
                    </select>
                  </div>

                  {/* Sorting */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>Sorting Sequence</span>
                    </label>
                    <select
                      value={recoverySortBy}
                      onChange={(e) => setRecoverySortBy(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs cursor-pointer"
                    >
                      <option value="Days_Overdue_Desc">Days Overdue (High ➔ Low)</option>
                      <option value="Days_Overdue_Asc">Days Overdue (Low ➔ High)</option>
                      <option value="Overdue_Amount_Desc">Overdue Amount (High ➔ Low)</option>
                      <option value="Overdue_Amount_Asc">Overdue Amount (Low ➔ High)</option>
                    </select>
                  </div>
                </div>

                {/* Stage Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium mr-1">Escalation Stage:</span>
                    {['All', 'First_Notice', 'Dunning', 'Legal_Escalation', 'Settlement'].map((st) => {
                      const isActive = recoveryStageFilter === st;
                      const label = st === 'All' ? 'All' : st.replace('_', ' ');
                      return (
                        <button
                          key={st}
                          onClick={() => setRecoveryStageFilter(st)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-755'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Operational totals count and reset tool */}
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span>
                      Matching Records: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{filteredAndSortedCases.length}</span> / {cases.length}
                    </span>
                    {(recoverySearch || recoveryStageFilter !== 'All' || recoveryAgentFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setRecoverySearch('');
                          setRecoveryStageFilter('All');
                          setRecoveryAgentFilter('All');
                        }}
                        className="text-rose-600 hover:underline font-bold cursor-pointer font-sans"
                      >
                        Clear Filter Reset ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                
                <div className="col-span-3 lg:col-span-2 space-y-6 animate-fadeIn">
                  {filteredAndSortedCases.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No delinquent cases found matching query</p>
                      <p className="text-xs text-slate-405 text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium">
                        Adjust active status filters, reassert search tokens, or view alternative collector schedules.
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedCases.map(c => {
                      const isExpanded = expandedCaseId === c.id;
                      const bObj = borrowers.find(b => b.id === c.borrowerId || b.name === c.borrowerName);
                      const lObj = loans.find(l => l.id === c.loanId);

                      // Determine active stage color indicator
                      const activeIndex = ['First_Notice', 'Dunning', 'Legal_Escalation', 'Settlement'].indexOf(c.stage);

                      // Check for warning signs (over 30 days or broken promises)
                      const isHighRisk = c.daysOverdue > 30 || c.promiseToPayHistory.some(ptp => ptp.status === 'Broken');

                      return (
                        <div 
                          key={c.id} 
                          className={`rounded-xl border transition-all overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${
                            isHighRisk 
                              ? 'border-rose-200 dark:border-rose-950/40 ring-1 ring-rose-50/50 dark:ring-rose-950/20' 
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {/* Case Title Header */}
                          <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                                  c.stage === 'Settlement' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' :
                                  c.stage === 'Legal_Escalation' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-450 animate-pulse' :
                                  c.stage === 'Dunning' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400' :
                                  'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                                }`}>
                                  {c.stage.replace('_', ' ')} Stage
                                </span>
                                {isHighRisk && (
                                  <span className="text-[9px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                                    CRITICAL RETRIEVAL
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                                <span>{c.borrowerName} Collections File</span>
                                <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">({c.id})</span>
                              </h3>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {/* Quick expand button */}
                              <button 
                                onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? 'Hide Client Profile' : 'View Client Profile'}
                              </button>
                              
                              <span className="text-rose-750 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/45 text-xs font-extrabold px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                {c.daysOverdue} Days Delay
                              </span>
                            </div>
                          </div>

                          {/* Interactive Escalation Progression Steps Visualizer */}
                          <div className="px-5 py-3.5 bg-indigo-50/10 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850 text-xs">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                              <span>Systemic Escalation Pathway Protocol</span>
                              <span className="text-indigo-650 dark:text-indigo-400 font-mono">Current Level: {activeIndex + 1} / 4</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { k: 'First_Notice', label: '1. First Notice' },
                                { k: 'Dunning', label: '2. Formal Warnings' },
                                { k: 'Legal_Escalation', label: '3. Legal Prosecution' },
                                { k: 'Settlement', label: '4. Case Workout' }
                              ].map((item, idx) => {
                                const isCurrent = c.stage === item.k;
                                const isPassed = idx < activeIndex;
                                return (
                                  <div key={item.k} className="space-y-1">
                                    <div className={`h-1.5 rounded ${
                                      isCurrent ? 'bg-indigo-600 animate-pulse' :
                                      isPassed ? 'bg-emerald-550 bg-emerald-500' :
                                      'bg-slate-200 dark:bg-slate-800'
                                    }`} />
                                    <span className={`text-[9px] font-semibold block truncate ${
                                      isCurrent ? 'text-indigo-605 text-indigo-605 dark:text-indigo-400 font-bold' :
                                      isPassed ? 'text-emerald-650 text-emerald-600 dark:text-emerald-500' : 'text-slate-400'
                                    }`}>
                                      {item.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Collapsible Client Profile & Guarantee Information Card */}
                          {isExpanded && (
                            <div className="p-5 bg-slate-50/80 dark:bg-slate-950/45 border-b border-slate-250 dark:border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs animate-slideDown">
                              <div className="space-y-2">
                                <h4 className="font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider text-[10px]">Borrower Identity Contact Registry</h4>
                                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                                  <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> <span className="font-medium">{bObj?.email || 'N/A'}</span></div>
                                  <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /> <span className="font-mono">{bObj?.phone || 'N/A'}</span></div>
                                  <div className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">Affiliated Org: <span className="text-slate-900 dark:text-white font-bold ml-1">{bObj?.company || 'Independently Logged'}</span></div>
                                  {lObj && (
                                    <div className="text-slate-500 font-mono text-[10.5px]">
                                      Disbursed: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(lObj.startDate).toLocaleDateString()}</span> | Target Repay: <span className="font-semibold text-rose-650">{new Date(lObj.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2 bg-white dark:bg-slate-950/20 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                                <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <Heart className="h-3 w-3 inline shrink-0 text-rose-500" /> Emergency Guarantor Contact Nodes (Legal Backup)
                                </h4>
                                {bObj?.emergencyContacts && bObj.emergencyContacts.length > 0 ? (
                                  <div className="space-y-1">
                                    {bObj.emergencyContacts.map((contact, idx) => (
                                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850/60 pb-1.5 last:border-0 last:pb-0">
                                        <div className="text-slate-750 dark:text-slate-300">
                                          <span className="font-bold text-slate-900 dark:text-white">{contact.name}</span> ({contact.relationship})
                                        </div>
                                        <a href={`tel:${contact.phone}`} className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded hover:underline">
                                          {contact.phone}
                                        </a>
                                      </div>
                                    ))}
                                    <div className="pt-2">
                                      <button 
                                        onClick={() => handleInlineCaseAction(c.id, 'LOG_NOTE', { 
                                          note: `Primary unreachable. Escalated case to emergency co-signee guarantor ${bObj.emergencyContacts[0].name} (${bObj.emergencyContacts[0].phone}) demanding joint liability coverage.`, 
                                          agentName: currentUser.name 
                                        })}
                                        className="text-[10px] w-full text-center uppercase tracking-wide bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 font-bold p-1 rounded border border-rose-200/50 cursor-pointer"
                                      >
                                        Auto-Log Guarantor Default Notice Demand
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No formal emergency contact guarantee lists declared.</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Case Financial Core */}
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/25 p-3.5 rounded-lg border border-slate-150 dark:border-slate-855 dark:border-slate-850">
                              <span className="text-[10px] text-slate-450 text-slate-400 font-bold uppercase tracking-wider block">Delinquent Ledger Balance</span>
                              <div className="text-2xl font-black text-rose-600 dark:text-rose-455">₦{c.overdueAmount.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-1">
                                Base Loan Reference: {c.loanId}
                              </div>
                            </div>

                            {/* Promises to Pay Log */}
                            <div className="md:col-span-2 space-y-2.5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 tracking-wider flex items-center gap-1.5">
                                <Plus className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> Repay workout commitments (Promise to Pay - PTP)
                              </span>
                              
                              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2">
                                {c.promiseToPayHistory && c.promiseToPayHistory.length > 0 ? (
                                  c.promiseToPayHistory.map((ptp, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/65 p-2.5 border border-slate-150 dark:border-slate-850 rounded-lg shadow-2xs">
                                      <div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">Commit N{ptp.promisedAmount.toLocaleString()}</span>
                                        <span className="text-slate-400 font-serif ml-1 text-[11px]">vowed for {new Date(ptp.promisedDate).toLocaleDateString()}</span>
                                      </div>
                                      <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                                        ptp.status === 'Kept' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                        ptp.status === 'Broken' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse' : 
                                        'bg-yellow-101 bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                                      }`}>
                                        {ptp.status}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic py-1">No formal Promise-to-Pay pledges logged.</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Action Control Deck (Case management inline commands) */}
                          <div className="bg-slate-50/50 dark:bg-slate-950/30 p-3.5 border-t border-slate-150 dark:border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                              Assigned Agent: <span className="font-extrabold text-slate-800 dark:text-slate-200">{c.assignedAgent}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. Log call pill */}
                              <button 
                                onClick={() => setActiveCardAction(prev => ({ 
                                  ...prev, 
                                  [c.id]: prev[c.id] === 'LOG_NOTE' ? null : 'LOG_NOTE' 
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                  activeCardAction[c.id] === 'LOG_NOTE'
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:border-slate-350 hover:bg-slate-50'
                                }`}
                              >
                                Log Collector Call
                              </button>

                              {/* 2. PTP Commit Pill */}
                              <button 
                                onClick={() => setActiveCardAction(prev => ({ 
                                  ...prev, 
                                  [c.id]: prev[c.id] === 'PROMISE_TO_PAY' ? null : 'PROMISE_TO_PAY' 
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                  activeCardAction[c.id] === 'PROMISE_TO_PAY'
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:border-slate-350 hover:bg-slate-50'
                                }`}
                              >
                                PTP Pledge
                              </button>

                              {/* 3. Assign Agent Pill */}
                              <button 
                                onClick={() => setActiveCardAction(prev => ({ 
                                  ...prev, 
                                  [c.id]: prev[c.id] === 'ASSIGN_AGENT' ? null : 'ASSIGN_AGENT' 
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                  activeCardAction[c.id] === 'ASSIGN_AGENT'
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:border-slate-355 hover:bg-slate-50'
                                }`}
                              >
                                Reassign Agent
                              </button>

                              {/* 4. Escalate pill */}
                              {c.stage !== 'Settlement' && (
                                <button 
                                  onClick={() => setActiveCardAction(prev => ({ 
                                    ...prev, 
                                    [c.id]: prev[c.id] === 'ESCALATE' ? null : 'ESCALATE' 
                                  }))}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                                    activeCardAction[c.id] === 'ESCALATE'
                                      ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                                      : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 hover:border-rose-300'
                                  }`}
                                >
                                  Escalate Case ➔
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Dynamic Sub-forms Drawer Block */}
                          {activeCardAction[c.id] && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-950/30 animate-slideDown text-xs">
                              {/* Option A: Log Call Note */}
                              {activeCardAction[c.id] === 'LOG_NOTE' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-slate-900 dark:text-white pb-1">Log Call Note Outcome</h4>
                                    <span className="text-[10px] text-slate-400">Officer Reference: {currentUser.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full p-2 border border-slate-305 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                      placeholder="Identify workout agreements or refusal responses. E.g. borrower requested grace extensions."
                                      rows={2}
                                      value={cardLogContent[c.id] || ''}
                                      onChange={(e) => setCardLogContent(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => setActiveCardAction(prev => ({ ...prev, [c.id]: null }))}
                                        className="px-3 py-1 bg-slate-200 hover:bg-slate-305 dark:bg-slate-800 dark:hover:bg-slate-750 rounded text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => handleInlineCaseAction(c.id, 'LOG_NOTE', { 
                                          note: cardLogContent[c.id] || 'Called borrower to discuss critical default status.', 
                                          agentName: currentUser.name 
                                        })}
                                        className="px-4 py-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded cursor-pointer"
                                      >
                                        Save Case Note Log
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Option B: New Promise to Pay */}
                              {activeCardAction[c.id] === 'PROMISE_TO_PAY' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                                    <h4 className="font-extrabold text-slate-900 dark:text-white">Record Formal Promise-to-Pay Pledge</h4>
                                    <span className="text-[10px] text-slate-400">Regulatory Compliance Registry</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pb-2">
                                    <div className="space-y-1">
                                      <label className="font-semibold text-slate-700 dark:text-slate-300 block">Pledge Sum Amount (₦)</label>
                                      <input
                                        type="number"
                                        placeholder="150000"
                                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                                        value={cardPtpAmount[c.id] || ''}
                                        onChange={(e) => setCardPtpAmount(prev => ({ ...prev, [c.id]: e.target.value }))}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="font-semibold text-slate-700 dark:text-slate-300 block">Agreed Settlement Date</label>
                                      <input
                                        type="date"
                                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                                        value={cardPtpDate[c.id] || ''}
                                        onChange={(e) => setCardPtpDate(prev => ({ ...prev, [c.id]: e.target.value }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300 block">Commitment / Settlement Guarantee Notes</label>
                                    <input
                                      type="text"
                                      placeholder="Pledged to settle 50% outstanding amount via central portal transfer."
                                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                      value={cardLogContent[c.id] || ''}
                                      onChange={(e) => setCardLogContent(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button 
                                      onClick={() => setActiveCardAction(prev => ({ ...prev, [c.id]: null }))}
                                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (!cardPtpAmount[c.id] || !cardPtpDate[c.id]) {
                                          alert("Please specify both the pledged amount sum and promised date.");
                                          return;
                                        }
                                        handleInlineCaseAction(c.id, 'PROMISE_TO_PAY', {
                                          amountPromised: Number(cardPtpAmount[c.id]),
                                          datePromised: cardPtpDate[c.id],
                                          note: cardLogContent[c.id] || 'Registered client pledge to settle.',
                                          agentName: currentUser.name
                                        });
                                      }}
                                      className="px-4 py-1 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded cursor-pointer"
                                    >
                                      Commit PTP Schedule
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Option C: Assign Collector Agent */}
                              {activeCardAction[c.id] === 'ASSIGN_AGENT' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-slate-900 dark:text-white pb-1">Reassign Case Officer Routing</h4>
                                    <span className="text-[10px] text-slate-500 font-medium">Currently Managed by {c.assignedAgent}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                                    <div className="space-y-1">
                                      <select
                                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs cursor-pointer"
                                        value={cardSelectedAgent[c.id] || ''}
                                        onChange={(e) => setCardSelectedAgent(prev => ({ ...prev, [c.id]: e.target.value }))}
                                      >
                                        <option value="">Select custom agent officer...</option>
                                        <option value="Aisha Yusuf">Aisha Yusuf (Senior Case Officer)</option>
                                        <option value="Chinedu Okafor">Chinedu Okafor (Field Recovery Lead)</option>
                                        <option value="Olumide Bakare">Olumide Bakare (Court Litigation Counsel)</option>
                                        <option value="Fatima Bello">Fatima Bello (Direct Dialer Agent)</option>
                                      </select>
                                    </div>
                                    <div className="flex justify-end gap-2 text-xs">
                                      <button 
                                        onClick={() => setActiveCardAction(prev => ({ ...prev, [c.id]: null }))}
                                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (!cardSelectedAgent[c.id]) {
                                            alert("Please choose a recovery specialist first.");
                                            return;
                                          }
                                          handleInlineCaseAction(c.id, 'ASSIGN_AGENT', {
                                            note: cardSelectedAgent[c.id], // Backend expects note payload as assignee spelling
                                            agentName: currentUser.name
                                          });
                                        }}
                                        className="px-4 py-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded cursor-pointer"
                                      >
                                        Reassign Agent Now
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Option D: Escalate Protocol Level */}
                              {activeCardAction[c.id] === 'ESCALATE' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                                    <h4 className="font-extrabold text-slate-900 dark:text-white">Perform Stage Escalation</h4>
                                    <span className="text-[10px] text-rose-600 font-bold uppercase">Severe Action Protocol</span>
                                  </div>
                                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 rounded-lg text-slate-700 dark:text-slate-305 space-y-1 mb-2 font-mono text-[11px]">
                                    <p className="font-bold text-rose-800 dark:text-rose-450">Active Stage: {c.stage.replace('_', ' ')}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                      Escalation will trigger systemic flags. For example, moving to 'Legal Escalation' or 'Dunning Warning calls'. All updates are log audited.
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                      placeholder="Note reasons for priority escalation (unresponsive client, missed PTP maturity, broken callbacks...)"
                                      value={cardLogContent[c.id] || ''}
                                      onChange={(e) => setCardLogContent(prev => ({ ...prev, [c.id]: e.target.value }))}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => setActiveCardAction(prev => ({ ...prev, [c.id]: null }))}
                                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => {
                                          handleInlineCaseAction(c.id, 'ESCALATE', {
                                            note: cardLogContent[c.id] || 'Escalated collections queue protocol stage following prolonged latency.',
                                            agentName: currentUser.name
                                          });
                                        }}
                                        className="px-4 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded cursor-pointer"
                                      >
                                        Confirm Case Escalation
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Historical Timeline Audit Logs */}
                          <div className="border-t border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 px-5 py-4">
                            <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3">
                              Case Audit Log History Trail ({c.logs.length})
                            </h4>
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-3 scrollbar-xs">
                              {c.logs.map((log, index) => (
                                <div key={index} className="text-xs leading-relaxed flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-850/40 pb-2 last:border-0 last:pb-0">
                                  <div className="flex items-start gap-2 min-w-0">
                                    <span className="text-slate-400 font-mono text-[9.5px] mt-0.5 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <div>
                                      <span className="font-extrabold text-indigo-700 dark:text-indigo-400 mr-1 whitespace-nowrap">[{log.action}]</span>
                                      <span className="text-slate-650 dark:text-slate-300">{log.note}</span>
                                    </div>
                                  </div>
                                  <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[9px] font-mono shrink-0 font-bold">{log.agent}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
        );
      })()}

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

        {/* TAB 7: INTEGRATED SQL PLAYGROUND & VISUAL DATABASE MANAGER */}
        {activeTab === 'database' && (
          <div id="database-explorer-tab" className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
            {/* Header Description Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 dark:text-white">
                  <Database className="h-5 w-5 text-indigo-600 animate-pulse" />
                  Visual Database Management Console & SQL Playground
                </h2>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Securely interact with the in-memory master ledger. Clear arrays, inject custom schema attributes, trigger real-time artificial record synthesizers or query directly via SQLite terminals.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fetchDbTables()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${tablesLoading ? 'animate-spin' : ''}`} />
                  Sync Catalog
                </button>
              </div>
            </div>

            {/* SQL PLAYGROUND COMPILER */}
            <div className="bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl p-6 relative">
              <div className="absolute top-4 right-4 text-[10px] font-mono font-black text-rose-500 tracking-wider">
                SQLITE V3 SIMULATION COGNITIVE ENGINE
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">Simulated Executable SQL Terminal</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 tracking-tight leading-relaxed">
                Test custom projection strings directly matching the database models.
                Try copying or modifying: <code className="text-emerald-305 font-mono px-1 py-0.5 bg-slate-900 text-emerald-300 rounded select-all">SELECT * FROM borrowers WHERE kycStatus = 'Verified'</code> or <code className="text-emerald-310 font-mono px-1 py-0.5 bg-slate-900 text-emerald-300 rounded select-all">SELECT id, name, role FROM admin_users</code>.
              </p>

              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <textarea
                    rows={3}
                    className="w-full font-mono text-xs text-indigo-300 bg-slate-900 border border-slate-800 rounded-xl p-3 focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505 select-all leading-relaxed outline-none"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM table_name"
                  />
                </div>
                <div className="flex items-end lg:w-44 lg:flex-none">
                  <button
                    onClick={handleRunSQLQuery}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 shadow-indigo-500/10"
                  >
                    <Zap className="h-4 w-4 fill-current text-white" />
                    Run Query
                  </button>
                </div>
              </div>

              {/* SQL EXECUTOR RESULTS */}
              {sqlError && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-xl font-mono text-xs flex gap-2">
                  <span className="font-sans font-black">✕</span>
                  {sqlError}
                </div>
              )}

              {sqlResult && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 animate-slideDown overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800 pb-2">
                    <span>Query: <strong className="text-blue-300 font-normal">{sqlResult.query}</strong></span>
                    <span className="text-emerald-400 font-bold">{sqlResult.rowCount} rows processed</span>
                  </div>

                  {sqlResult.rows.length === 0 ? (
                    <div className="text-xs text-slate-500 font-mono py-4 text-center">
                      (No matching records retrieved successfully matching selection filter parameters)
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full text-left font-mono text-[11px] whitespace-nowrap text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-450 text-slate-400">
                            {Object.keys(sqlResult.rows[0] || {}).map((col) => (
                              <th key={col} className="p-2 font-bold select-all tracking-tight uppercase">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {sqlResult.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                              {Object.values(row).map((val: any, cIdx: number) => (
                                <td key={cIdx} className="p-2 select-all text-slate-300 max-w-[200px] truncate">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SPLIT SCHEMA PANELS */}
            {selectedDbTable ? (
              /* EXPLORE SPREADSHEET workspace */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 animate-scaleUp">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDbTable(null)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-1 rounded-md transition-all cursor-pointer mr-1"
                      >
                        ← Back to Index Matrix
                      </button>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                        {selectedDbTable.name}
                      </h3>
                      <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                        {tableRows.length} total rows
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 hover:underline">{selectedDbTable.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const temp: Record<string, string> = {};
                        selectedDbTable.schema.forEach((s: string) => { temp[s] = ""; });
                        setNewRecordData(temp);
                        setNewRecordModalOpen(true);
                      }}
                      className="bg-slate-905 text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Record
                    </button>
                    <button
                      onClick={() => handleResetTableState(selectedDbTable.id)}
                      className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      Empty Table
                    </button>
                  </div>
                </div>

                {/* ADVANCED ADMIN UTILITY TOOLS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  
                  {/* UTILITY 1: AI GEN-SYNTHESIZER */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-bounce" />
                      AI Cognitive Record Generator
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Generate 3 brand-new realistic operational objects for <code className="text-slate-900 font-bold font-mono text-[10px] bg-slate-200 dark:bg-slate-800 dark:text-slate-200 px-1 py-0.5 rounded">{selectedDbTable.id}</code> table utilizing structured LLM procedures automatically.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., active high-risk loans, pending kyc"
                        className="flex-1 p-2 text-xs border border-slate-300 dark:border-slate-705 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white dark:border-slate-750 focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505"
                        value={aiSynthesisPrompt}
                        onChange={(e) => setAiSynthesisPrompt(e.target.value)}
                      />
                      <button
                        onClick={handleAISynthesizeData}
                        disabled={synthesizing}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {synthesizing ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Synthesizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Synthesize Rows
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UTILITY 2: CUSTOM COLUMN INJECTOR */}
                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                      <Table className="h-3.5 w-3.5 text-emerald-500" />
                      Inject Custom DB Column / Property
                    </h4>
                    <p className="text-[11px] text-slate-505 dark:text-slate-400">
                      Alter schema definitions by injecting an administrative property (e.g., <code className="text-emerald-700 font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-1 py-0.5 rounded font-bold">risk_grade</code> or <code className="text-emerald-700 font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-1 py-0.5 rounded font-bold">agent_notes</code>) safely.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="column_name (no spaces e.g., credit_score)"
                        className="flex-1 p-2 text-xs border border-slate-300 dark:border-slate-705 bg-white dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white dark:border-slate-750 focus:ring-1 focus:ring-indigo-550"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                      />
                      <button
                        onClick={handleAddCustomColumn}
                        disabled={!newColumnName.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        + Create Column
                      </button>
                    </div>
                  </div>

                </div>

                {/* SPREADSHEET GRID FILTER HEADER */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Keyword filter rows..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-505"
                      value={searchRowQuery}
                      onChange={(e) => setSearchRowQuery(e.target.value)}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                    Double-click editable cells or use floating <strong className="font-semibold text-slate-700 dark:text-slate-300">Edit / Update</strong> actions on each line.
                  </div>
                </div>

                {/* MASTER SPREADSHEET TABLE IMPLEMENTATION */}
                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800 p-2 text-[10px]">
                          {selectedDbTable.schema.map((col: string) => (
                            <th key={col} className="p-3.5 font-bold tracking-tight uppercase select-all">
                              {col}
                            </th>
                          ))}
                          <th className="p-3.5 font-bold text-right uppercase">
                            Admin Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {tableRows
                          .filter(row => {
                            if (!searchRowQuery) return true;
                            const term = searchRowQuery.toLowerCase();
                            return Object.values(row).some(v => String(v).toLowerCase().includes(term));
                          })
                          .map((row: any) => {
                            const isRowEditing = editingRowId === String(row.id || row.ipAddress);
                            const keyId = String(row.id || row.ipAddress);

                            return (
                              <tr key={keyId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                                {selectedDbTable.schema.map((col: string) => {
                                  const cellVal = row[col] !== undefined ? row[col] : "";
                                  return (
                                    <td key={col} className="p-3 font-medium text-slate-900 max-w-[200px] truncate select-all dark:text-slate-300">
                                      {isRowEditing ? (
                                        <input
                                          type="text"
                                          className="w-full p-1 border border-indigo-300 dark:bg-slate-900 rounded text-xs select-all text-slate-900 dark:text-white font-mono"
                                          value={editingRowData[col] !== undefined ? editingRowData[col] : ""}
                                          onChange={(e) => setEditingRowData({ ...editingRowData, [col]: e.target.value })}
                                        />
                                      ) : (
                                        <span className={col === 'id' || col === 'ipAddress' ? 'font-mono text-[10px] text-zinc-500 font-bold bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded border dark:border-slate-750' : 'font-sans font-medium text-slate-900 dark:text-slate-100'}>
                                          {typeof cellVal === 'object' ? JSON.stringify(cellVal) : String(cellVal)}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}

                                <td className="p-3 text-right">
                                  {isRowEditing ? (
                                    <div className="flex gap-1 justify-end">
                                      <button
                                        onClick={() => handleUpdateRecord(keyId, editingRowData)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingRowId(null)}
                                        className="bg-slate-100 dark:bg-slate-800 text-slate-650 font-bold text-[10px] px-2 py-1 rounded cursor-pointer text-slate-750 text-slate-700 dark:text-slate-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1 justify-end">
                                      <button
                                        onClick={() => {
                                          setEditingRowId(keyId);
                                          setEditingRowData({ ...row });
                                        }}
                                        className="text-slate-500 hover:text-indigo-600 hover:bg-slate-102 dark:hover:bg-slate-800 p-1.5 rounded cursor-pointer"
                                        title="Modify Cell Attributes"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRecord(keyId)}
                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded cursor-pointer"
                                        title="Delete Log"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {tableRows.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs bg-slate-50/50 dark:bg-slate-900/10">
                      (Database table is currently empty of row definitions. Run AI generation procedures or insert records manually)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CATEGORY TABLE GRID INDEX */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-505 text-slate-500">Database Models Catalog ({dbTables.length} Tables Registered)</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-405 text-slate-450 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Total Storage Status: ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-scaleUp">
                  {dbTables.map((table: any) => (
                    <div
                      key={table.id}
                      onClick={() => exploreTable(table)}
                      className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 dark:hover:border-indigo-500 dark:hover:ring-indigo-950/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-44 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-955 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-colors">
                            <Table className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
                            {table.count} rows
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-950 dark:text-white font-mono group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pt-1 select-all">
                          {table.name}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                          {table.description}
                        </p>
                      </div>

                      <div className="text-[9px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-center group-hover:text-indigo-500">
                        <span>Schema Size: {table.schema.length} fields</span>
                        <span className="font-extrabold">Explore →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC RECORD CONSTRUCT FORM MODAL */}
            {newRecordModalOpen && selectedDbTable && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99991] p-4 animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp text-slate-900 dark:text-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-mono flex items-center gap-2">
                        <Plus className="h-5 w-5 text-indigo-600" />
                        INSERT RECORD: {selectedDbTable.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Fill in values matching that table's master schema securely below. Missing ID keys are generated dynamically.
                      </p>
                    </div>
                    <button
                      onClick={() => setNewRecordModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-black text-lg bg-slate-100 dark:bg-slate-800 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleCreateRecord} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                    {selectedDbTable.schema.map((col: string) => (
                      <div key={col} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-350 uppercase select-none block">
                          {col} {col === 'id' || col === 'ipAddress' ? '(Auto-Generated if empty)' : ''}
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 border border-slate-300 dark:bg-slate-950 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                          placeholder={`Value for ${col}...`}
                          value={newRecordData[col] || ''}
                          onChange={(e) => setNewRecordData({ ...newRecordData, [col]: e.target.value })}
                        />
                      </div>
                    ))}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setNewRecordModalOpen(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
                      >
                        Execute Insert
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
