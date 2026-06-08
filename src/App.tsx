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
  ArrowLeft,
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
  Table,
  FileText,
  HelpCircle,
  Globe,
  Activity,
  Code,
  CheckCircle2
} from 'lucide-react';
import { Borrower, Loan, Payment, UserSession, RiskAlert, RecoveryCase, NotificationLog, GeoLocation } from './types';
import { SDK_TEMPLATES } from './utils/sdkTemplates';
import { TravelMap } from './components/TravelMap';

const VITE_APP_MODE = (((import.meta as any).env?.VITE_APP_MODE || 'both') as string).toLowerCase();
const VITE_ADMIN_PORTAL_URL = ((import.meta as any).env?.VITE_ADMIN_PORTAL_URL || '') as string;

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab ] = useState<'analytics' | 'borrowers' | 'loans' | 'recovery' | 'audits' | 'sdks' | 'database'>('analytics');

  // Subdomain Portal Simulation Selector
  const [selectedDomain, setSelectedDomain] = useState<'app.credguard.com' | 'admin.credguard.com'>('app.credguard.com');
  const [simulatedIp, setSimulatedIp] = useState<string>('198.162.24.11'); // Default whitelisted HQ IP
  const [adminMfaCode, setAdminMfaCode] = useState<string>('');
  const [isMfaPassed, setIsMfaPassed] = useState<boolean>(false);
  const [adminCredentialEmail, setAdminCredentialEmail] = useState<string>('fidelisemus@gmail.com');
  const [adminCredentialPassword, setAdminCredentialPassword] = useState<string>('admin123');
  const [adminLoginStep, setAdminLoginStep] = useState<'creds' | 'mfa'>('creds');
  const [adminAuthError, setAdminAuthError] = useState<string>('');
  const [simulatedMfaOtp, setSimulatedMfaOtp] = useState<string>('518420');
  const [selectedAdminSubTab, setSelectedAdminSubTab] = useState<'generators' | 'tenants' | 'billing' | 'usage' | 'health' | 'audits' | 'vault' | 'architect'>('generators');
  const [lastAuditLogs, setLastAuditLogs] = useState<Array<{ timestamp: string; action: string; details: string; operator: string; status: 'SUCCESS' | 'WARN' | 'BLOCKED' | 'PENDING' }>>([
    { timestamp: new Date().toISOString().substring(0, 16), action: 'System Provisioned', details: 'Client app.credguard.com and central admin.credguard.com initial handshake secure.', operator: 'SYSTEM', status: 'SUCCESS' },
    { timestamp: new Date().toISOString().substring(0, 16), action: 'MFA Enabled', details: 'Enforced Google Authenticator synchronizer for superfidelis operators.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
    { timestamp: new Date().toISOString().substring(0, 16), action: 'IP Whitelisted', details: 'Added 198.162.24.11 (HQ Node Cluster) to Firewall Whitelist.', operator: 'SYSTEM', status: 'SUCCESS' },
  ]);
  const [activeApiKeys, setActiveApiKeys] = useState({
    sandboxKey: 'cg_test_8f237f81a7b949219b6e838ce10574af',
    sandboxCalls: 1284,
    liveKey: 'cg_live_f3928a39e8a829871cc2901ee4ea3922',
    liveCalls: 457890
  });

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
  } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
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

  // DB Privilege State Management
  const [dbConfig, setDbConfig] = useState<{
    globalBorrowerAccessEnabled: boolean;
    explicitPermittedEmails: string[];
    accessRequests: Array<{ id: string; name: string; email: string; role: string; status: 'Pending' | 'Approved' | 'Rejected'; requestedAt: string }>;
    senderAllowed: boolean;
  } | null>(null);
  const [dbConfigLoading, setDbConfigLoading] = useState(false);
  const [accessRequestInputEmail, setAccessRequestInputEmail] = useState('');
  const [accessRequestStatusLabel, setAccessRequestStatusLabel] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CREDGUARD MONTHLY LICENSING LOGIC & ACTIVATION STATES
  // -------------------------------------------------------------
  const [currentPath, setCurrentPath] = useState(() => {
    if (VITE_APP_MODE === 'admin' || window.location.pathname === '/admin') {
      return '/admin';
    }
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      if (VITE_APP_MODE === 'admin' || window.location.pathname === '/admin') {
        setCurrentPath('/admin');
      } else {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (VITE_APP_MODE === 'admin') {
      window.history.pushState(null, '', '/admin');
      setCurrentPath('/admin');
      return;
    }
    if (path === '/admin' && VITE_APP_MODE === 'app') {
      if (VITE_ADMIN_PORTAL_URL) {
        window.open(VITE_ADMIN_PORTAL_URL, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  const [licenseStatus, setLicenseStatus] = useState<{
    isValid: boolean;
    currentMonth: string;
    expiresAt?: string;
    activeLicenseKey?: string | null;
    requiredFormat?: string;
    daysRemaining?: number | null;
    durationCode?: string | null;
  } | null>(null);
  const [isLicenseChecking, setIsLicenseChecking] = useState(true);
  const [enteredLicenseKey, setEnteredLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [licenseSuccess, setLicenseSuccess] = useState('');
  
  // Licensing Key Generator Fields
  const [genAdminEmail, setGenAdminEmail] = useState('');
  const [genAdminPassword, setGenAdminPassword] = useState('');
  const [genTargetMonth, setGenTargetMonth] = useState('');
  const [genDuration, setGenDuration] = useState('monthly');
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState('');
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');
  const [showLicenseGenerator, setShowLicenseGenerator] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminGatePassword, setAdminGatePassword] = useState('');
  const [adminGateError, setAdminGateError] = useState('');

  // Developer Portal & API documentation states
  const [sdkSubTab, setSdkSubTab] = useState<'sdks' | 'api_ref' | 'docs_portal'>('docs_portal');
  const [docsActiveSec, setDocsActiveSec] = useState<string>('overview');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('track_session');
  const [developerKeys, setDeveloperKeys] = useState<{
    sandboxKey: string;
    sandboxCreated: string;
    sandboxCalls: number;
    liveKey: string;
    liveCreated: string;
    liveCalls: number;
  } | null>(null);
  const [isRotatingKey, setIsRotatingKey] = useState<string | null>(null);
  const [selectedAuthKeyType, setSelectedAuthKeyType] = useState<'sandbox' | 'live' | 'license'>('sandbox');

  const fetchDeveloperKeys = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      if (res.ok) {
        const data = await res.json();
        setDeveloperKeys(data);
      }
    } catch (err) {
      console.error('Failed to load developer keys:', err);
    }
  };

  const handleRotateKey = async (type: 'sandbox' | 'live') => {
    setIsRotatingKey(type);
    try {
      const res = await fetch('/api/developer/keys/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const data = await res.json();
        setDeveloperKeys(data.keys);
      }
    } catch (err) {
      console.error('Failed to rotate developer key:', err);
    } finally {
      setIsRotatingKey(null);
    }
  };

  const fetchLicenseStatus = async () => {
    setIsLicenseChecking(true);
    setLicenseError('');
    try {
      const res = await fetch('/api/license/status');
      const data = await res.json();
      setLicenseStatus(data);
    } catch (e) {
      console.error("Failed fetching subscription license status", e);
    } finally {
      setIsLicenseChecking(false);
    }
  };

  const handleApplyLicense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLicenseError('');
    setLicenseSuccess('');
    
    // Fallback to checking state if called with a direct key
    const finalKey = e ? enteredLicenseKey : undefined;
    const keyToSubmit = finalKey || enteredLicenseKey;

    if (!keyToSubmit) {
      setLicenseError('Please enter a subscription license key.');
      return;
    }
    try {
      const res = await fetch('/api/license/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToSubmit })
      });
      const data = await res.json();
      if (!res.ok) {
        setLicenseError(data.error || 'Server rejected license key compilation.');
      } else {
        setLicenseSuccess(data.message || 'CredGuard successfully unlocked.');
        setEnteredLicenseKey('');
        // Refresh status
        setTimeout(() => {
          fetchLicenseStatus();
        }, 1200);
      }
    } catch (err) {
      setLicenseError('Failed to communicate with licensing compiler.');
    }
  };

  const handleGenerateLicenseKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError('');
    setGenSuccess('');
    setGeneratedLicenseKey('');
    if (!genAdminEmail || !genAdminPassword || !genTargetMonth) {
      setGenError('All administrator authorization and monthly parameters are required.');
      return;
    }
    try {
      const res = await fetch('/api/license/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: genAdminEmail,
          password: genAdminPassword,
          targetMonth: genTargetMonth,
          duration: genDuration
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || 'Authentication check failed. License generation rejected.');
      } else {
        setGeneratedLicenseKey(data.key);
        let durationLabel = "Monthly";
        if (data.duration === "Q") durationLabel = "Quarterly";
        else if (data.duration === "B") durationLabel = "Bi-Annually";
        else if (data.duration === "A") durationLabel = "Annually";
        setGenSuccess(`Key compiled successfully for ${durationLabel} subscription starting ${data.targetMonth}!`);
      }
    } catch (err) {
      setGenError('License compiler transmission error.');
    }
  };

  useEffect(() => {
    fetchLicenseStatus();
    fetchDeveloperKeys();
  }, []);

  useEffect(() => {
    if (licenseStatus && !genTargetMonth) {
      setGenTargetMonth(licenseStatus.currentMonth);
    }
  }, [licenseStatus, genTargetMonth]);

  // Dynamic headers wrapper with automatic monthly licensing expired check
  const fetchWithDbHeaders = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      'x-user-email': currentUser?.email || '',
      'x-user-role': currentUser?.role || ''
    };
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 402) {
        fetchLicenseStatus(); // re-verify lock screen status
      }
      return res;
    } catch (e) {
      console.error(`Fetch encountered transmission error on ${url}:`, e);
      throw e;
    }
  };

  const fetchDbConfig = async () => {
    setDbConfigLoading(true);
    try {
      const res = await fetchWithDbHeaders('/api/db/config');
      const data = await res.json();
      setDbConfig(data);
    } catch (e) {
      console.error("Failed loading database privilege configs", e);
    } finally {
      setDbConfigLoading(false);
    }
  };

  const handleToggleGlobalBorrowerAccess = async (enabled: boolean) => {
    try {
      const res = await fetchWithDbHeaders('/api/db/config/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
      }
    } catch (e) {
      console.error("Failed toggling global borrower access:", e);
    }
  };

  const handleGrantExplicitAccess = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetchWithDbHeaders('/api/db/config/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
        setAccessRequestInputEmail('');
      } else {
        alert(data.error || "Grant access failed.");
      }
    } catch (e) {
      console.error("Failed granting direct SQL credentials:", e);
    }
  };

  const handleRevokeExplicitAccess = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetchWithDbHeaders('/api/db/config/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
      }
    } catch (e) {
      console.error("Failed revoking credentials:", e);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setAccessRequestStatusLabel("Submitting access request payload...");
      const res = await fetchWithDbHeaders('/api/db/config/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        setAccessRequestStatusLabel(`Request status: ${data.status}. ${data.message || ''}`);
        fetchDbConfig();
      } else {
        setAccessRequestStatusLabel(data.error || "Failed submitting formal database entry application.");
      }
    } catch (e) {
      console.error("Failed registering access query request:", e);
      setAccessRequestStatusLabel("Offline interaction exception.");
    }
  };

  const handleProcessAccessRequest = async (requestId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetchWithDbHeaders('/api/db/config/process-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        setDbConfig(data.config);
      }
    } catch (e) {
      console.error("Failed routing access request status outcome:", e);
    }
  };

  // Functions to query backend operations
  const fetchDbTables = async () => {
    setTablesLoading(true);
    try {
      const res = await fetchWithDbHeaders('/api/db/tables');
      if (res.status === 403) {
        // User not authorized
        setDbTables([]);
        return;
      }
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
      const res = await fetchWithDbHeaders(`/api/db/${tableMeta.id}`);
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
      const res = await fetchWithDbHeaders(`/api/db/${selectedDbTable.id}`, {
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
      const res = await fetchWithDbHeaders(`/api/db/${selectedDbTable.id}/${id}`, {
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
      const res = await fetchWithDbHeaders(`/api/db/${selectedDbTable.id}/${id}`, {
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
      const res = await fetchWithDbHeaders(`/api/db/${selectedDbTable.id}/columns`, {
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
      const res = await fetchWithDbHeaders('/api/db/actions/reset', {
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
      const res = await fetchWithDbHeaders('/api/db/query', {
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
      const res = await fetchWithDbHeaders('/api/db/ai-synthesize', {
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
      fetchDbConfig();
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
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
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
        const isOperator = data.role === 'Operator';
        const loggedUser: {
          email: string;
          name: string;
          role: 'Operator' | 'Borrower';
          id?: string;
          lastLoginIp?: string;
          clientApp?: string;
          token?: string;
        } = {
          email: data.borrower?.email || simulatedLoginEmail,
          name: data.borrower?.name || (isOperator ? 'System Administrator' : 'Borrower'),
          role: isOperator ? 'Operator' : 'Borrower',
          id: data.borrower?.id,
          lastLoginIp: isOperator ? '197.210.8.23' : '102.89.34.89',
          clientApp: isOperator ? 'CredGuard Desktop Console' : 'Mobile Android Applet / Client API SDK',
          token: data.token
        };
        setCurrentUser(loggedUser);
        setAuthSuccess(`Securely authenticated as ${loggedUser.name}!`);
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
    setCurrentUser(null);
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

  if (isLicenseChecking) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col items-center justify-center p-4`}>
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">Verifying CredGuard System License...</p>
        </div>
      </div>
    );
  }

  // --- PORTAL B: SYSTEMS ADMIN GATEWAY HELPER COMPONENTS ---
  const renderSimulationBar = () => {
    return (
      <div className="bg-slate-900 border-b border-slate-950 px-4 py-2 flex.wrap items-center justify-between text-xs gap-3 flex">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-mono text-slate-400">DNS Proxy Simulator:</span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value as any);
              navigateTo('/');
            }}
            className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded cursor-pointer outline-none focus:border-emerald-500"
          >
            <option value="app.credguard.com">app.credguard.com (Client Portal)</option>
            <option value="admin.credguard.com">admin.credguard.com (Systems Admin Gateway)</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400 text-[11px]">Simulated Connection IP:</span>
            <input
              type="text"
              value={simulatedIp}
              onChange={(e) => setSimulatedIp(e.target.value)}
              className="w-28 bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-400 px-1.5 py-0.5 rounded text-center outline-none focus:border-indigo-500"
              placeholder="e.g. 192.168.1.1"
            />
            {simulatedIp === '198.162.24.11' ? (
              <span className="text-[9px] bg-emerald-950 border border-emerald-900/55 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">Whitelisted</span>
            ) : (
              <span className="text-[9px] bg-rose-950 border border-rose-900/55 text-rose-450 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono">Blocked</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInjectedDatabaseComponents = () => {
    const runSimulatedSql = () => {
      setSqlError('');
      setSqlResult(null);
      try {
        const query = sqlQuery.toLowerCase().trim();
        if (query.startsWith('select * from borrowers')) {
          setSqlResult({
            query: sqlQuery,
            rowCount: borrowers.length,
            rows: borrowers
          });
        } else if (query.startsWith('select * from loans')) {
          setSqlResult({
            query: sqlQuery,
            rowCount: loans.length,
            rows: loans
          });
        } else if (query.startsWith('select * from payments')) {
          setSqlResult({
            query: sqlQuery,
            rowCount: payments.length,
            rows: payments
          });
        } else if (query.startsWith('select * from cases') || query.startsWith('select * from recovery_cases') || query.startsWith('select * from recovery')) {
          setSqlResult({
            query: sqlQuery,
            rowCount: cases.length,
            rows: cases
          });
        } else if (query.startsWith('select * from audit_trail') || query.startsWith('select * from logs')) {
          setSqlResult({
            query: sqlQuery,
            rowCount: lastAuditLogs.length,
            rows: lastAuditLogs
          });
        } else {
          setSqlResult({
            query: sqlQuery,
            rowCount: borrowers.length,
            rows: borrowers.slice(0, 5)
          });
        }
      } catch (e: any) {
        setSqlError(e.message || 'SQLite Syntax Error');
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">SQLite Workstation Command</h3>
            <div className="space-y-2">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full h-32 p-3 font-mono text-[11px] border border-slate-300 dark:border-slate-705 rounded-xl bg-slate-950 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Database: in-memory sqlite_client_host</span>
                <button
                  type="button"
                  onClick={runSimulatedSql}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Run SQL Query
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono mb-4">Master Table Schema Indexes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'borrowers', count: borrowers.length, desc: 'Enterprise Borrower Files & KYC' },
                { name: 'loans', count: loans.length, desc: 'Central Loan Agreement Ledgers' },
                { name: 'payments', count: payments.length, desc: 'Historical Payments Tranches' },
                { name: 'recovery_cases', count: cases.length, desc: 'Delinquent Recovery Incidents' },
                { name: 'alerts', count: alerts.length, desc: 'Risk Risk signals queue' },
                { name: 'audit_trail', count: lastAuditLogs.length, desc: 'Immutable Admin Security Audits' }
              ].map((tb) => (
                <button
                  key={tb.name}
                  type="button"
                  onClick={() => {
                    setSqlQuery(`SELECT * FROM ${tb.name}`);
                    setTimeout(() => runSimulatedSql(), 20);
                  }}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-all text-left group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-400">{tb.name}</span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-black font-mono text-slate-650 dark:text-slate-400">{tb.count} rows</span>
                  </div>
                  <p className="text-[10px] text-slate-405 mt-1 leading-tight">{tb.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {sqlError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-955/20 dark:border-rose-900 dark:text-rose-455 rounded-lg text-xs font-bold font-mono">
            ⚠️ {sqlError}
          </div>
        )}

        {sqlResult && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white">SQLite Result Terminal</span>
              </div>
              <span className="font-mono text-[10px] text-slate-450">{sqlResult.rowCount} records returned</span>
            </div>

            <div className="overflow-x-auto max-h-[300px] border border-slate-100 dark:border-slate-800 rounded-xl">
              {sqlResult.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">
                  QueryResult: emptyset (0 rows)
                </div>
              ) : (
                <table className="w-full text-left border-collapse font-mono text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-150 dark:border-slate-800 font-bold">
                      {Object.keys(sqlResult.rows[0] || {}).map((col) => (
                        <th key={col} className="p-2.5 truncate font-bold text-slate-700 dark:text-slate-300">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-350">
                    {sqlResult.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-808">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="p-2.5 max-w-[150px] truncate select-all font-mono text-slate-600 dark:text-slate-400">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderArchitectureStudioView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn font-sans text-xs">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans flex items-center gap-2">
              <Terminal className="h-5 w-5 text-rose-600 animate-pulse" />
              PORTALS DECOUPLED SYSTEMS METRIC MAP
            </h3>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal mt-1">
              Active map outlining absolute separation of Client Operations (Portal A) from Central Leases & Sharding Administration (Portal B).
            </p>
          </div>

          <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl font-mono text-[10.5px] border border-slate-800 space-y-4 shadow-inner">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800 pb-2">
              <span>Traffic Ingress Controller</span>
              <span className="text-rose-500 font-bold">Separation Layer Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
              <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-1">
                <span className="text-indigo-400 font-extrabold text-[12px] block">Portal A: Client Domain</span>
                <span className="text-slate-400 text-[9px] block bg-slate-950 p-1 rounded">VITE_APP_MODE = "app"</span>
                <span className="text-slate-505 text-[10px] block">Hosts Borrower Sync, Portfolio, Geofencing, recovery monitoring</span>
              </div>

              <div className="text-[16px] text-rose-505 font-bold p-2 font-black rotate-90 md:rotate-0">&harr; DNS Firewall &harr;</div>

              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-1">
                <span className="text-rose-400 font-extrabold text-[12px] block">Portal B: Systems admin Gateway</span>
                <span className="text-slate-400 text-[9px] block bg-slate-950 p-1 rounded">VITE_APP_MODE = "admin"</span>
                <span className="text-rose-455 text-[10px] block">Hosts Leases compiler, Tenant provisioner, SQL Workstation, Secrets Rotation</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-[11px] leading-relaxed space-y-1 font-sans text-slate-400">
              <span className="font-black text-white font-mono uppercase tracking-wider text-[10px] block">Decoupling Strategy Implementation</span>
              <p>1. **IP Range Restrictions:** Firewall whitelist limits Administrator logins strictly to source IP <code className="text-indigo-400 font-mono bg-slate-900 px-1 py-0.5 rounded font-black">198.162.24.11</code>.</p>
              <p>2. **Independent Secrets Vault:** Client database arrays carry absolutely no license signature generation keys. Leasing signature blocks are strictly decoupled server-side.</p>
              <p>3. **Tenant Sharding Schemas:** Bank entities mapped in the registry run on completely sharded, distinct SQLite databases to enforce zero-cross-tenant leakage breaches.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Sovereign Authority Matrix Matrix</h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 font-sans text-xs">
            <div className="pb-3.5 space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span className="text-slate-900 dark:text-white font-extrabold">Principal Admin Master</span>
                <span className="text-indigo-650 dark:text-indigo-400">fidelisemus@gmail.com</span>
              </div>
              <p className="text-slate-500 leading-normal text-[11px]">Compiles signed Monthly Licenses, Provisions Bank Tenants, rotates API secret vaults, and runs unrestricted SQL Terminal commands.</p>
            </div>

            <div className="py-3.5 space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span className="text-slate-900 dark:text-white font-extrabold">B2B Financial Exec</span>
                <span className="text-slate-500">Corporate Portal</span>
              </div>
              <p className="text-slate-500 leading-normal text-[11px]">Sits in Client Portal (Portal A) to manage Loans, analyze Borrower Risk parameters, query geolocation traces, and approve payment plans.</p>
            </div>

            <div className="py-3.5 space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span className="text-slate-900 dark:text-white font-extrabold">API Agent Integration</span>
                <span className="text-slate-505">Client Dev Console</span>
              </div>
              <p className="text-slate-500 leading-normal text-[11px]">Integrates third-party loan systems securely using API sandbox or production keys signatures.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 font-mono text-[10.5px]">
            <span className="font-extrabold text-[10px] text-slate-550 block mb-1">MFA PARAMETERS</span>
            <p className="text-slate-600 dark:text-slate-400">Dynamic Google Auth TOTP verification synchronized using RFC 6238 time coefficients.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemsAdminPortal = () => {
    // 1. IP Whitelisting Gate Check
    if (simulatedIp !== '198.162.24.11') {
      return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex flex-col transition-colors duration-200`}>
          {renderSimulationBar()}
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-2xl max-w-lg w-full p-8 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 shadow-inner">
                <AlertTriangle className="h-7 w-7 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">FIREWALL EXCEPTION DETAILS</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  The admin portal at <span className="font-bold text-slate-950 dark:text-white">admin.credguard.com</span> actively restricts operations to whitelisted infrastructure IP nodes.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-rose-200 dark:border-rose-850 text-[11px] font-mono text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-150 dark:border-slate-800 pb-1.5 text-[9px] uppercase font-bold text-slate-450">
                    <span>Firewall Directive</span>
                    <span className="text-rose-500 font-extrabold font-bold">BLOCKED</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400"><span className="text-rose-500 font-bold">Unrecognized Source IP:</span> <span className="font-black text-slate-900 dark:text-white">{simulatedIp}</span></p>
                  <p className="text-slate-600 dark:text-slate-400"><span className="text-emerald-500 font-bold">Allowed Whitelist IP:</span> 198.162.24.11</p>
                  <p className="text-indigo-650 dark:text-indigo-400 leading-relaxed"><span className="font-bold">Bypass:</span> Modify simulated IP above to <span className="underline font-extrabold">198.162.24.11</span> using the simulated connection proxy banner.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Credentials Verification Check
    if (!isMfaPassed) {
      if (adminLoginStep === 'creds') {
        return (
          <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex flex-col transition-colors duration-200`}>
            {renderSimulationBar()}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <Shield className="h-6 w-6 text-indigo-650" />
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">Authority Ingress check</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto leading-normal">
                    This administrative suite is strictly decoupled. Identity validation is mandated before system handshakes are allowed.
                  </p>
                </div>

                {adminAuthError && (
                  <div className="p-3 bg-rose-50 border border-rose-250 text-rose-750 dark:bg-rose-955/20 dark:border-rose-900 dark:text-rose-400 rounded-lg text-xs font-bold text-center">
                    ⚠️ {adminAuthError}
                  </div>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault();
                  setAdminAuthError('');
                  if (adminCredentialEmail === 'fidelisemus@gmail.com' && adminCredentialPassword === 'admin123') {
                    setAdminLoginStep('mfa');
                    setLastAuditLogs(p => [
                      { timestamp: new Date().toISOString().substring(0, 16), action: 'Auth Step 1 Verified', details: 'Core passwords matched. Dynamic MFA TOTP sync required.', operator: 'fidelisemus@gmail.com', status: 'PENDING' },
                      ...p
                    ]);
                  } else {
                    setAdminAuthError('Invalid administrator credentials.');
                  }
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 block tracking-wider">Super User ID email</label>
                    <input
                      type="email"
                      required
                      placeholder="super@credguard.com"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold text-slate-900 dark:text-white"
                      value={adminCredentialEmail}
                      onChange={e => setAdminCredentialEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 block tracking-wider">Access Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold text-slate-900 dark:text-white tracking-widest text-center"
                      value={adminCredentialPassword}
                      onChange={e => setAdminCredentialPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-rose-600/10 flex items-center justify-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Authorize Identity &rarr;</span>
                  </button>
                </form>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 rounded-xl text-center text-[10px] text-indigo-950 dark:text-indigo-400">
                  💡 <span className="font-extrabold">Notice to Engineer:</span> Correct prefilled authority credentials are: <span className="font-mono text-[10.5px] text-indigo-750 dark:text-indigo-300 font-black">fidelisemus@gmail.com</span> with password <span className="font-mono text-[10.5px] text-indigo-750 dark:text-indigo-300 font-black">admin123</span>.
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (adminLoginStep === 'mfa') {
        return (
          <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex flex-col transition-colors duration-200`}>
            {renderSimulationBar()}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 shadow-inner">
                    <Smartphone className="h-6 w-6 animate-pulse" />
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">Google 2FA security sync</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto leading-normal">
                    Enter the dynamic 6-digit PIN sync coefficient generated on your secure authenticator application block.
                  </p>
                </div>

                {adminAuthError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-955/20 dark:border-rose-900 dark:text-rose-400 rounded-lg text-xs font-bold text-center">
                    ⚠️ {adminAuthError}
                  </div>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminMfaCode === '518420') {
                    setIsMfaPassed(true);
                    setLastAuditLogs(p => [
                      { timestamp: new Date().toISOString().substring(0, 16), action: 'MFA Synced', details: 'Google Authenticator session claim token synced.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                      ...p
                    ]);
                  } else {
                    setAdminAuthError('Invalid MFA coefficient synchronization token.');
                  }
                }} className="space-y-4 font-sans text-center">
                  <div className="space-y-1.5 inline-block text-center">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">6-digit dynamic coefficient</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000000"
                      className="w-44 p-3 text-center font-mono font-black text-2xl tracking-widest border border-slate-300 dark:border-slate-705 rounded-xl bg-transparent text-slate-950 dark:text-white focus:ring-1 focus:ring-indigo-650"
                      value={adminMfaCode}
                      onChange={e => setAdminMfaCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-orange-600/10 flex items-center justify-center space-x-2 font-sans"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Authorize Session</span>
                  </button>
                </form>

                <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-955/20 border border-orange-100 dark:border-orange-850 text-center space-y-1.5 text-xs">
                  <span className="font-extrabold text-orange-900 dark:text-orange-400 text-[10px] tracking-wide uppercase font-mono block">Simulated Google Authenticator</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] font-sans leading-tight">Your synchronized dual auth token code coefficient is:</p>
                  <span className="inline-block px-3 py-1 bg-white dark:bg-slate-955 border border-orange-200 dark:border-orange-900 rounded font-mono font-black text-lg text-orange-600 dark:text-orange-400 tracking-wider animate-pulse">518420</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // 3. Systems Admin Console Dashboard View
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex flex-col transition-colors duration-200`}>
        {renderSimulationBar()}
        
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between shrink-0 p-5 space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Core System</h3>
                <h1 className="text-sm font-black text-white mt-1 uppercase font-sans tracking-tight">Systems Admin Desk</h1>
                <div className="mt-2 text-[9px] bg-rose-950/50 border border-rose-900 px-2.5 py-0.5 rounded text-rose-400 font-mono flex items-center gap-1.5 uppercase tracking-wide">
                  <Shield className="h-3 w-3 animate-pulse" />
                  <span>Verified: Principal Owner</span>
                </div>
              </div>

              <div className="space-y-1 font-sans">
                {[
                  { id: 'generators', label: 'License Key Compiler', icon: Cpu },
                  { id: 'tenants', label: 'Tenant Provisioning', icon: Users },
                  { id: 'billing', label: 'Stripe Billing Desk', icon: CreditCard },
                  { id: 'usage', label: 'API Gateway Metrics', icon: Activity },
                  { id: 'health', label: 'Cluster Diagnostics', icon: Zap },
                  { id: 'database', label: 'SQL Workstation Master', icon: Database },
                  { id: 'audits', label: 'Immutable Audit Trail', icon: FileText },
                  { id: 'vault', label: 'Rotate Secrets Vault', icon: Lock },
                  { id: 'architect', label: 'Fintech Design Studio', icon: Sliders },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = selectedAdminSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedAdminSubTab(item.id as any);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer shrink-0 ${
                        active 
                          ? 'bg-rose-600 text-white shadow shadow-rose-600/10' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Connection:</span>
                <span className="font-mono text-slate-300 font-bold">{simulatedIp}</span>
              </div>
              <button
                onClick={() => {
                  setIsMfaPassed(false);
                  setAdminLoginStep('creds');
                  setAdminCredentialPassword('');
                  setLastAuditLogs(p => [
                    { timestamp: new Date().toISOString().substring(0, 16), action: 'Admin Logout', details: 'Super Admin closed administrator session.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                    ...p
                  ]);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-rose-450 hover:text-rose-400 text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out Admin</span>
              </button>
            </div>
          </aside>

          {/* Master Panel Context Canvas */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8 text-slate-800 dark:text-slate-100">
            
            {/* TAB B1: LICENSE COMPILER */}
            {selectedAdminSubTab === 'generators' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2 font-sans">
                      <Cpu className="h-5 w-5 text-rose-600 animate-pulse" />
                      Platform Licensing Compiler & Signer
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-sans">
                      Compile keys matching unique operational calendar start months. Pasting these signatures on Portal A authorizes secure database handshakes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Compiler Form */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Create Monthly signed Lease Key</h3>
                      
                      {genError && (
                        <div className="p-3 mt-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold font-sans">
                          ⚠️ {genError}
                        </div>
                      )}

                      <form onSubmit={handleGenerateLicenseKey} className="space-y-4 pt-3 font-sans">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 block">Signee Authority Email</label>
                            <input
                              type="text"
                              required
                              readOnly
                              className="w-full p-2.5 font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 rounded-lg outline-none cursor-not-allowed font-semibold text-center"
                              value={genAdminEmail}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 block">Access Key Check (Password)</label>
                            <input
                              type="password"
                              required
                              placeholder="admin123"
                              className="w-full p-2.5 font-mono border border-slate-300 dark:border-slate-705 rounded-lg bg-transparent text-xs text-slate-900 dark:text-white font-semibold text-center"
                              value={genAdminPassword}
                              onChange={e => setGenAdminPassword(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 block">Operation Month (YYYY-MM)</label>
                            <input
                              type="text"
                              required
                              placeholder="2026-06"
                              className="w-full p-2.5 font-mono border border-slate-305 dark:border-slate-705 rounded-lg bg-transparent text-xs text-slate-950 dark:text-white text-center font-bold tracking-widest animate-pulse"
                              value={genTargetMonth}
                              onChange={e => setGenTargetMonth(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-550 block">Subscription Type Duration</label>
                            <select
                              value={genDuration}
                              onChange={e => setGenDuration(e.target.value)}
                              className="w-full p-2.5 border border-slate-305 dark:border-slate-705 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-950 dark:text-white font-bold"
                            >
                              <option value="monthly">Monthly Subscription (1 month)</option>
                              <option value="quarterly">Quarterly Subscription (3 months)</option>
                              <option value="biannually">Bi-Annually Subscription (6 months)</option>
                              <option value="annually">Annually Subscription (12 months)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          <Cpu className="h-4 w-4" />
                          <span>Compile & Sign Lease Key Token</span>
                        </button>
                      </form>
                    </div>

                    {generatedLicenseKey && (
                      <div className="p-4 mt-4 bg-rose-50/50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900 rounded-xl space-y-4 font-sans animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 font-mono tracking-wider">
                          <span>Resulting Crypt Key Hash</span>
                          <span className="bg-rose-150 dark:bg-rose-950 px-2 py-0.5 rounded font-bold font-mono">MD5_RSA_HMAC_MD5 Signature</span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-rose-200 font-mono text-xs font-black text-rose-605 select-all tracking-widest break-all shadow-inner">
                          <span>{generatedLicenseKey}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedLicenseKey);
                              setGenSuccess("Key copied directly to Admin Clipboard!");
                            }}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer text-slate-500"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEnteredLicenseKey(generatedLicenseKey);
                              setLicenseError('');
                              setLicenseSuccess('');
                              // Apply lease
                              setTimeout(() => {
                                handleApplyLicense();
                                setGenSuccess("Keysign applied instantly to client portal!");
                              }, 30);
                            }}
                            className="flex-1 bg-rose-605 hover:bg-rose-700 text-white font-extrabold py-2.5 px-3 rounded-lg text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Instant-Apply to app.credguard.com</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEnteredLicenseKey(generatedLicenseKey);
                              setLicenseError('');
                              setLicenseSuccess('');
                              setTimeout(() => {
                                handleApplyLicense();
                              }, 30);
                              setSelectedDomain('app.credguard.com');
                              navigateTo('/');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-705 text-white font-extrabold py-2.5 px-3 rounded-lg text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow"
                          >
                            <span>Go to Portal &rarr;</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {genSuccess && (
                      <div className="p-3 mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-400 rounded-lg text-xs font-bold animate-pulse text-center font-sans">
                        ✨ {genSuccess}
                      </div>
                    )}
                  </div>

                  {/* Active Status Panels */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Central System Subscription Lease</h3>
                    
                    <div className="space-y-4 pt-2 font-sans">
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 leading-normal text-xs text-slate-500 space-y-3 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-slate-400">Target Month:</span>
                          <span className="font-mono bg-slate-105 dark:bg-slate-950 px-2 py-0.5 rounded font-black text-slate-800 dark:text-slate-200">{licenseStatus?.currentMonth}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-slate-400">Software Lease Validity:</span>
                          <span className={`font-mono px-2 py-0.5 rounded font-black text-white ${licenseStatus?.isValid ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                            {licenseStatus?.isValid ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-slate-400">Lease Days Remaining:</span>
                          <span className="font-mono bg-slate-105 dark:bg-slate-950 px-2 py-0.5 rounded font-black text-slate-800 dark:text-slate-200">{licenseStatus ? Math.max(0, Math.ceil(licenseStatus.daysRemaining)) : 0} days</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block font-mono">Developer Billing Cycle Simulators</span>
                        <div className="grid grid-cols-2 gap-2 font-sans font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setLicenseStatus(prev => prev ? { ...prev, isValid: false, daysRemaining: 0 } : null);
                              setLastAuditLogs(p => [
                                { timestamp: new Date().toISOString().substring(0, 16), action: 'License Trip', details: 'Lease expired simulated manually.', operator: 'SIMULATOR', status: 'WARN' },
                                ...p
                              ]);
                            }}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-750 py-1.5 px-2 rounded text-[11px] text-rose-600 text-center transition-all cursor-pointer"
                          >
                            Force Lease Expire
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLicenseStatus(prev => prev ? { ...prev, isValid: true, daysRemaining: 30 } : null);
                              setLastAuditLogs(p => [
                                { timestamp: new Date().toISOString().substring(0, 16), action: 'License Auth', details: 'Extended core billing cycle lease directly.', operator: 'SIMULATOR', status: 'SUCCESS' },
                                ...p
                              ]);
                            }}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-750 py-1.5 px-2 rounded text-[11px] text-emerald-600 text-center transition-all cursor-pointer"
                          >
                            Extend Lease (30 Days)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B2: TENANT PROVISIONING & CLIENT ACCOUNTS */}
            {selectedAdminSubTab === 'tenants' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-rose-600 animate-pulse" />
                      Platform tenant Provisioner & Databases
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 font-sans">
                      Onboard new enterprise client loan banks. Provision dedicated database connections with isolated scopes in real-time.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Provision Form */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Onboard New B2B client</h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setLastAuditLogs(p => [
                        { timestamp: new Date().toISOString().substring(0, 16), action: 'Tenant Onboard', details: 'Provisioned Bank of Boston cluster node on sharded database sandbox.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                        ...p
                      ]);
                      alert('Tenant created successfully! Connection parameters, PostgreSQL schemas, and access keys created for Bank of Boston.');
                    }} className="space-y-4 font-sans">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-550 block">Corporate Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bank of Boston Inc."
                          className="w-full p-2.5 border border-slate-350 dark:border-slate-705 rounded-lg text-xs bg-transparent text-slate-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-550 block">Subscription Plan Tier</label>
                        <select className="w-full p-2.5 border border-slate-350 dark:border-slate-705 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                          <option value="scale">Scale Subscription Plan ($2,500/mo)</option>
                          <option value="elite">Enterprise Elite Plan ($9,990/mo)</option>
                          <option value="custom">Bespoke Sovereign Plan ($25,000/mo)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-555 block">Sharding isolation architecture</label>
                        <select className="w-full p-2.5 border border-slate-350 dark:border-slate-705 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-905 dark:text-white font-bold">
                          <option value="shard">Isolated PostgreSQL Database per Tenant (Partitioned Sharding)</option>
                          <option value="schema">Isolated Database Schema (Shared DB instance)</option>
                          <option value="shared">Shared schema with client key parameters</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-650 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-xs shadow-md transition-transform transform active:scale-95 cursor-pointer font-sans"
                      >
                        Provision Tenant Node Cluster
                      </button>
                    </form>
                  </div>

                  {/* Registered List */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between animate-fadeIn">
                    <div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono font-sans">B2B client tenants Registry</h3>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { name: 'Bank of America Group', tier: 'Enterprise Elite Plan', status: 'ACTIVE', database: 'bof_america_prod_sharded', usage: '1.2M hits/mo', renewal: '2026-07-01' },
                          { name: 'Apex Capital Microfinance', tier: 'Scale Plan', status: 'ACTIVE', database: 'apex_cap_prod_shared', usage: '340k hits/mo', renewal: '2026-07-15' },
                          { name: 'CreditTrust Sovereign Group', tier: 'Bespoke Sovereign Plan', status: 'ACTIVE', database: 'cred_trust_prod_sharded', usage: '5.8M hits/mo', renewal: '2026-06-30' },
                          { name: 'Fidelity Mutual Credit', tier: 'Scale plan ($2,500/mo)', status: 'ACTIVE', database: 'fidelity_mutual_prod_shared', usage: '12k hits/mo', renewal: '2026-06-30' }
                        ].map((tenant, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between text-xs font-sans hover:bg-slate-50 dark:hover:bg-slate-800/10">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-slate-905 dark:text-white text-xs">{tenant.name}</h4>
                              <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                                <span className="font-extrabold text-rose-600">{tenant.tier}</span>
                                <span>• DB: <span className="font-bold text-slate-500">{tenant.database}</span></span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-black text-slate-800 dark:text-slate-205">{tenant.usage}</p>
                                <p className="text-[9px] text-slate-450 uppercase font-mono tracking-wider font-semibold">Renew: {tenant.renewal}</p>
                              </div>

                              <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black font-sans">
                                ACTIVE
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Tenant billing locks altered for ${tenant.name}. DB connections disconnected.`);
                                  setLastAuditLogs(p => [
                                    { timestamp: new Date().toISOString().substring(0, 16), action: 'Tenant Lock', details: `Temporarily suspended database connection lease for ${tenant.name}`, operator: 'fidelisemus@gmail.com', status: 'BLOCKED' },
                                    ...p
                                  ]);
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B3: STRIPE BILLING LEDGER */}
            {selectedAdminSubTab === 'billing' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm text-slate-850 dark:text-white animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase font-mono">
                      <CreditCard className="h-5 w-5 text-rose-600 animate-pulse" />
                      Stripe Corporate Billing Ledger
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 font-sans">
                      Monitor corporate monthly lease invoices, Stripe payment states, webhook triggers, and automated contract balances.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block font-mono">Monthly Income (MRR)</span>
                    <span className="text-2xl font-black block mt-2 text-rose-600 dark:text-rose-400 font-mono">$37,480 /mo</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block font-mono">Collected Lease Income</span>
                    <span className="text-2xl font-black block mt-2 text-slate-900 dark:text-white font-mono">$32,500</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block font-mono">Draft Invoice Reserves</span>
                    <span className="text-2xl font-black block mt-2 text-orange-600 font-mono">$4,980 Pending</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block font-mono">Active Bank Leases count</span>
                    <span className="text-2xl font-black block mt-2 text-slate-900 dark:text-white font-mono font-black animate-pulse">4 Accounts</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 flex-wrap gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">B2B Stripe Invoicing timeline</h3>
                    <button
                      type="button"
                      onClick={() => alert('Stripe webhook manual trigger verified complete: client invoice auto collect simulated.')}
                      className="text-[10px] font-black bg-rose-600 hover:bg-rose-750 text-white px-3 py-1 rounded transition-colors shadow"
                    >
                      Trigger Re-Sync Billing
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-150 dark:border-slate-800">
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Invoice ID</th>
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Client Institution</th>
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Invoice Date</th>
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Amount</th>
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Charge ID Hash</th>
                          <th className="py-2.5 font-bold uppercase text-[9px] font-mono">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                        {[
                          { id: 'INV-2104', tenant: 'CreditTrust Sovereign Group', date: 'June 01, 2026', amount: '$9,990.00', hash: 'ch_stripe_fh128hjas8a127a92a11', status: 'PAID' },
                          { id: 'INV-2103', tenant: 'Bank of America Group', date: 'May 28, 2026', amount: '$25,000.00', hash: 'ch_stripe_fh128hjas8a127a92a20', status: 'PAID' },
                          { id: 'INV-2102', tenant: 'Apex Capital Microfinance', date: 'May 15, 2026', amount: '$2,500.00', hash: 'ch_stripe_fh128hjas8a127a92b02', status: 'PAID' },
                          { id: 'INV-2101', tenant: 'Fidelity Mutual Credit', date: 'May 01, 2026', amount: '$2,500.00', hash: 'ch_stripe_fh128hjas8a127a92b15', status: 'PAID' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 font-mono text-[11px]">
                            <td className="py-3 font-semibold text-rose-600">{row.id}</td>
                            <td className="py-3 font-sans font-bold text-slate-850 dark:text-white text-xs">{row.tenant}</td>
                            <td className="py-3 font-sans">{row.date}</td>
                            <td className="py-3 font-sans font-black text-slate-900 dark:text-white">{row.amount}</td>
                            <td className="py-3 text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{row.hash}</td>
                            <td className="py-3">
                              <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black font-sans">
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B4: API GATEWAY & PERFORMANCE */}
            {selectedAdminSubTab === 'usage' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-rose-600" />
                      Global Ingress Gateway Operations & API Metrics
                    </h2>
                    <p className="text-xs text-slate-505 mt-1 dark:text-slate-405">
                      Monitor active API Keys performance, throttle buckets, and request intervals across development sandboxes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Key counters */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Access Keys usage summary</h3>
                    
                    <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs font-sans">
                      <div className="pt-2 flex justify-between items-center leading-normal">
                        <span className="text-slate-400 font-bold block">Sandbox Key Token:</span>
                        <span className="font-mono bg-slate-55 dark:bg-slate-950 px-2.5 py-1 rounded text-rose-600 font-bold truncate max-w-[130px] font-mono font-black">{activeApiKeys.sandboxKey}</span>
                      </div>
                      <div className="pt-3.5 flex justify-between items-center leading-normal">
                        <span className="text-slate-400 font-bold block">Sandbox Queries Log:</span>
                        <span className="font-mono font-black text-slate-850 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded">{activeApiKeys.sandboxCalls} requests</span>
                      </div>
                      <div className="pt-3.5 flex justify-between items-center leading-normal">
                        <span className="text-slate-400 font-bold block">Production Live Token:</span>
                        <span className="font-mono bg-slate-55 dark:bg-slate-950 px-2.5 py-1 rounded text-rose-600 font-bold truncate max-w-[130px] font-mono font-black">{activeApiKeys.liveKey}</span>
                      </div>
                      <div className="pt-3.5 flex justify-between items-center leading-normal">
                        <span className="text-slate-400 font-bold block">Production Queries Log:</span>
                        <span className="font-mono font-black text-slate-850 dark:text-slate-100 bg-slate-55 dark:bg-slate-950 px-2 py-0.5 rounded font-mono font-bold animate-pulse">{activeApiKeys.liveCalls} requests</span>
                      </div>
                    </div>
                  </div>

                  {/* Right configuration rules */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">API Gateway security throttle</h3>
                    
                    <div className="space-y-3.5 text-xs text-slate-500 leading-normal font-sans">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-1.5 animate-fadeIn">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[12.5px] font-sans">Global Rate Limiter rule (Default)</span>
                        <p>Allow up to <span className="font-bold text-rose-600">120 requests/minute</span> per single tenant connection key. Overflow inquiries are deflected immediately with <span className="font-mono bg-slate-100 dark:bg-slate-950 text-rose-500 px-1 py-0.5 rounded font-bold font-mono">429 RateLimit Exceeded</span>.</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-1.5 animate-fadeIn">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[12.1px] font-sans">Burst Configuration limit rule</span>
                        <p>Allow spikes up to <span className="font-bold text-rose-605">300 requests/minute</span> for transient integrations (such as batch kyc/repayment scans) up to 2 seconds before system firewall throttles active.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B5: INTERACTIVE HARDWARE HEALTH DIALS */}
            {selectedAdminSubTab === 'health' && (
              <div className="space-y-6 animate-fadeIn font-mono text-xs">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-6 rounded-2xl flex items-center justify-between gap-4 font-sans shadow-sm text-slate-800 dark:text-white">
                  <div>
                    <h2 className="text-xl font-bold font-sans text-slate-955 dark:text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-rose-600" />
                      Infrastructure Diagnostic telemetry
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 leading-relaxed font-sans mt-1">
                      Dials mapping system thread pools, RAM buffers, CPU register temperatures, and Redis socket latencies.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 font-mono">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-805 text-center space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Node CPU core Load</span>
                    <div className="relative inline-flex items-center justify-center mt-2.5">
                      <span className="absolute text-lg font-black text-rose-600">34%</span>
                      <svg className="h-24 w-24">
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-950" />
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#e11d48" strokeWidth="8" strokeDasharray="226" strokeDashoffset="149" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-850 text-center space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Memory Utilization</span>
                    <div className="relative inline-flex items-center justify-center mt-2.5">
                      <span className="absolute text-base font-black text-slate-800 dark:text-slate-100">52%</span>
                      <svg className="h-24 w-24">
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-950" />
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray="226" strokeDashoffset="108" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-850 text-center space-y-3 shadow-sm text-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Active pg threadpool</span>
                    <div className="relative inline-flex items-center justify-center mt-2.5">
                      <span className="absolute text-[13px] font-black text-emerald-600">12 / 100</span>
                      <svg className="h-24 w-24">
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-950" />
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="226" strokeDashoffset="199" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-850 text-center space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pg Buffer Cache IOPS</span>
                    <div className="relative inline-flex items-center justify-center mt-2.5">
                      <span className="absolute text-sm font-black text-slate-800 dark:text-slate-100 font-black">920 io/s</span>
                      <svg className="h-24 w-24">
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-950" />
                        <circle cx="48" cy="48" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="226" strokeDashoffset="80" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B6: IMMUTABLE AUDIT LOGS TIMELINE */}
            {selectedAdminSubTab === 'audits' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-rose-600" />
                      Immutable Security Audit Trail Ledger
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 leading-normal">
                      Security records detailing master administration gestures, whitelist checks, and billing operations.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 bg-slate-50 dark:bg-slate-905 border-b border-slate-250 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-450 uppercase tracking-wider block font-mono font-bold">Ledger timelines (Immutable)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLastAuditLogs(p => [
                          { timestamp: new Date().toISOString().substring(0, 16), action: 'Ledger Audit', details: 'Manual integrity check on central ledger registries executed success.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                          ...p
                        ]);
                      }}
                      className="text-[9.5px] font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-705 px-3 py-1 rounded transition-colors cursor-pointer font-sans font-extrabold text-slate-700 dark:text-slate-350"
                    >
                      Verify Ledger Integrity
                    </button>
                  </div>

                  <div className="p-6 space-y-4 font-sans text-xs">
                    {lastAuditLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-4 font-sans text-xs border-l-2 border-slate-150 dark:border-slate-800 pl-4 relative">
                        <span className={`absolute h-2.5 w-2.5 rounded-full -left-[6px] top-1.5 ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500' : log.status === 'PENDING' ? 'bg-orange-500' : 'bg-rose-500'
                        }`}></span>
                        <div className="text-[11px] text-slate-450 font-mono self-start pt-0.5 whitespace-nowrap">{log.timestamp}</div>
                        <div className="space-y-1 leading-normal">
                          <p className="font-extrabold text-slate-950 dark:text-white uppercase tracking-wider text-[10.5px]">
                            {log.action} <span className="font-mono text-[9px] lowercase text-slate-400 bg-slate-150 dark:bg-slate-950 px-1.5 py-0.5 rounded ml-1 font-semibold">{log.operator}</span>
                          </p>
                          <p className="text-slate-650 dark:text-slate-405 font-sans leading-relaxed">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB B7: ROTATING VAULT SECRETS */}
            {selectedAdminSubTab === 'vault' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm text-slate-855 dark:text-white animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2 uppercase font-mono">
                      <Lock className="h-5 w-5 text-rose-600" />
                      Super-Admin secrets rotation vault
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                      Rotate platform master secrets safely under dual-authorized signature protocols.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn font-sans text-xs">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider font-mono">Sandbox API Secrets</h3>
                    <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      <div>
                        <span className="text-slate-450 uppercase text-[10px] tracking-wider block font-mono">Current Secret Token:</span>
                        <div className="flex items-center gap-2 mt-1.5 select-all font-mono font-bold bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 font-mono">
                          <code className="text-emerald-600 select-all font-bold">{activeApiKeys.sandboxKey}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeApiKeys.sandboxKey);
                              alert('Sandbox Master Key Copied');
                            }}
                            className="text-slate-400 hover:text-indigo-650 ml-auto cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="pt-4 space-y-1.5 leading-normal text-slate-500">
                        <span className="font-bold text-slate-755 dark:text-slate-300">Signature Keys Rotation:</span>
                        <p className="text-slate-450 leading-relaxed text-[11px]">Rotates the API encryption parameters. Queries carrying old keys will reject gradually over 24 hours.</p>
                      </div>

                      <button
                        onClick={() => {
                          const hex = "cg_test_" + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                          setLastAuditLogs(p => [
                            { timestamp: new Date().toISOString().substring(0, 16), action: 'Vault Rotate', details: 'Rotated API master sandbox key.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                            ...p
                          ]);
                          setActiveApiKeys(prev => ({ ...prev, sandboxKey: hex }));
                          alert('New API Sandbox Key Rotated!');
                        }}
                        className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-2 px-3 rounded-lg hover:shadow text-xs cursor-pointer text-center"
                      >
                        Rotate Sandbox Access Key
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider font-mono">Live API Secrets</h3>
                    <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      <div>
                        <span className="text-slate-455 uppercase text-[10px] tracking-wider block font-mono">Active Production Secret:</span>
                        <div className="flex items-center gap-2 mt-1.5 select-all font-mono font-bold bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 font-mono">
                          <code className="text-rose-600 select-all font-bold">{activeApiKeys.liveKey}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeApiKeys.liveKey);
                              alert('Live Production Token Copied');
                            }}
                            className="text-slate-400 hover:text-indigo-650 ml-auto cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="pt-4 space-y-1 text-slate-500">
                        <span className="font-bold text-slate-755 dark:text-slate-300 leading-normal block text-[11.5px]">Master Security Directive:</span>
                        <p className="text-slate-450 leading-relaxed text-[11px]">Deploy zero-downtime micro-rotation when changing credentials. Production servers will gracefully switch database indexes during keysignature rotations.</p>
                      </div>

                      <button
                        onClick={() => {
                          const hex = "cg_live_" + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                          setLastAuditLogs(p => [
                            { timestamp: new Date().toISOString().substring(0, 16), action: 'Vault Rotate', details: 'Rotated API master live production key.', operator: 'fidelisemus@gmail.com', status: 'SUCCESS' },
                            ...p
                          ]);
                          setActiveApiKeys(prev => ({ ...prev, liveKey: hex }));
                          alert('New Live Production Key Rotated!');
                        }}
                        className="w-full bg-rose-605 hover:bg-rose-700 text-white font-extrabold py-2 px-3 rounded-lg hover:shadow text-xs cursor-pointer text-center"
                      >
                        Rotate Live Production Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB B8: SQL WORKSTATION MASTER */}
            {selectedAdminSubTab === 'database' && (
              <div className="space-y-8 animate-fadeIn text-slate-805 dark:text-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2 font-sans">
                      <Database className="h-5 w-5 text-rose-600 animate-pulse" />
                      Internal Database Workstation & SQLite Terminal
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 font-sans leading-normal">
                      Direct visual query control over in-memory schemas and tenant borrower collections.
                    </p>
                  </div>
                </div>

                {renderInjectedDatabaseComponents()}
              </div>
            )}

            {/* TAB B9: DESIGN STUDIO */}
            {selectedAdminSubTab === 'architect' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2 font-sans uppercase">
                      <Sliders className="h-5 w-5 text-rose-600 animate-pulse" />
                      Super-Admin Architecture Design Studio
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 dark:text-slate-405 font-sans">
                      Explore detailed architectural blueprints, multi-tenant database topologies, role scopes, and system configuration matrices.
                    </p>
                  </div>
                </div>

                {renderArchitectureStudioView()}
              </div>
            )}

          </main>
        </div>
      </div>
    );
  };

  if (selectedDomain === 'admin.credguard.com') {
    return renderSystemsAdminPortal();
  }

  if (currentPath === '/admin' && selectedDomain === 'app.credguard.com') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex items-center justify-center p-4 transition-colors duration-200`}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 shadow-inner">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tight text-slate-905 dark:text-white uppercase font-sans">ACCESS REJECTED: ISOLATED PORTAL</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              To enforce strict enterprise separation, this client workspace (<span className="font-bold">app.credguard.com</span>) contains no administrative endpoints or prefilled credentials.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/55 dark:border-slate-800 text-[11px] font-mono text-left">
            💡 <span className="font-extrabold uppercase text-indigo-650 tracking-wide block">How to access admin portal:</span>
            Switch the host environment above inside the simulated green proxy band to <span className="underline font-bold text-slate-900 dark:text-indigo-400">admin.credguard.com</span> to connect securely.
          </div>

          <button
            onClick={() => navigateTo('/')}
            className="w-full text-center text-xs text-indigo-600 hover:underline transition-colors mt-2 font-bold cursor-pointer"
          >
            Back to Client Workspace
          </button>
        </div>
      </div>
    );
  }

  if (currentPath === '/admin' && !isAdminVerified && currentUser?.role !== 'Operator') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex items-center justify-center p-4 transition-colors duration-200 relative`}>
        {/* Real-time Theme Toggle Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6 text-slate-800 dark:text-slate-100">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 shadow-inner">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">Admin Console Locked</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This terminal is a separated administration zone. Please verify your authority to generate system leases.
            </p>
          </div>

          <div className="space-y-4">
            {adminGateError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/45 text-rose-700 dark:text-rose-450 rounded-xl text-xs font-semibold">
                ⚠️ {adminGateError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (adminGatePassword === 'admin123') {
                setIsAdminVerified(true);
                setAdminGateError('');
              } else {
                setAdminGateError('Invalid Authority Password');
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Authority Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-3 font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-center tracking-widest focus:ring-2 focus:ring-indigo-650 text-slate-900 dark:text-white"
                  value={adminGatePassword}
                  onChange={e => {
                    setAdminGatePassword(e.target.value);
                    setAdminGateError('');
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Verify Master Authority</span>
              </button>
            </form>

            <button
              onClick={() => navigateTo('/')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Return to Public Gateway
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPath === '/admin') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased transition-colors duration-200`}>
        {/* Navigation / Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">CredGuard™ Admin Portal</h1>
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest font-black">Subscription License Controller</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Real-time Theme Toggle Switcher */}
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              {/* Back to main software workspace */}
              {VITE_APP_MODE === 'admin' ? (
                <div className="text-[10px] bg-emerald-550/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-wider font-mono border border-emerald-500/20 shadow-sm">
                  ⚡ Dedicated Admin Server
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="text-xs bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-200 py-1.5 px-3 rounded-lg font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Workspace</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dedicated Admin Portal container */}
        <div id="license-admin-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
          
          {/* Intro welcome Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40">
            <div className="space-y-2">
              <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">Separate License Manager Zone</span>
              <h2 className="text-xl font-black">Enterprise Subscription Lease Generator</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Welcome to the separated administrative terminal. Here, you generate and verify cryptographically signed system leases for CredGuard based on multiple subscription tiers (Monthly, Quarterly, Bi-Annually, or Annually). Once generated, licenses can be activated to unlock user interfaces.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: COMPILER & GENERATOR */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase">License compiler block</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Generate subscription activation codes</p>
                </div>
              </div>

              {genError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/45 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold">
                  ⚠️ {genError}
                </div>
              )}

              {genSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/45 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  ✨ {genSuccess}
                </div>
              )}

              <form onSubmit={handleGenerateLicenseKey} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Master Admin Email</label>
                    <input
                      type="email"
                      required
                      placeholder="fidelisemus@gmail.com"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-600 font-semibold"
                      value={genAdminEmail}
                      onChange={e => setGenAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Authority Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-600 font-semibold"
                      value={genAdminPassword}
                      onChange={e => setGenAdminPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Target Start Month (YYYY-MM)</label>
                    <input
                      type="text"
                      required
                      placeholder="YYYY-MM (e.g. 2026-06)"
                      className="w-full p-2.5 font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-slate-900 dark:text-white text-center font-bold focus:ring-1 focus:ring-indigo-600"
                      value={genTargetMonth}
                      onChange={e => setGenTargetMonth(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Subscription Duration</label>
                    <select
                      value={genDuration}
                      onChange={e => setGenDuration(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-600 font-bold"
                    >
                      <option value="monthly">Monthly Subscription (1 month active)</option>
                      <option value="quarterly">Quarterly Subscription (3 months active)</option>
                      <option value="biannually">Bi-Annually Subscription (6 months active)</option>
                      <option value="annually">Annually Subscription (12 months active)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  <Cpu className="h-4 w-4 animate-pulse" />
                  <span>Compile and Crypt Sign Lease</span>
                </button>
              </form>

              {generatedLicenseKey && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-3 font-sans">
                  <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider font-mono">Generated Crypt Key</span>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-indigo-200/30 dark:border-indigo-800 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 select-all tracking-wider break-all shadow-inner animate-pulse">
                    <span>{generatedLicenseKey}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLicenseKey);
                        setGenSuccess("Key copied to admin clipboard!");
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer"
                      title="Copy Key text"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredLicenseKey(generatedLicenseKey);
                      setLicenseError('');
                      setLicenseSuccess('');
                      setTimeout(() => {
                        handleApplyLicense();
                      }, 50);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    <span>Instantly Apply Lease Key</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setGenAdminEmail('fidelisemus@gmail.com');
                    setGenAdminPassword('admin123');
                    if (licenseStatus) {
                      setGenTargetMonth(licenseStatus.currentMonth);
                    }
                  }}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-1.5 px-3 rounded hover:bg-slate-200 transition-colors font-bold cursor-pointer font-sans"
                >
                  🎭 Quick Fill Admin Credentials
                </button>
              </div>
            </div>

            {/* COLUMN 2: ACTIVE STATUS & KEY ACTIVATOR */}
            <div className="space-y-6 lg:col-span-12 xl:col-span-5 space-y-6">
              
              {/* Card 2A: Active License Status details */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Lease Node State</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${licenseStatus?.isValid ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"}`}>
                    {licenseStatus?.isValid ? "Active ✅" : "Expired ❌"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Tier Plan</span>
                    <span className="text-xs text-slate-800 dark:text-white font-extrabold font-sans">
                      {licenseStatus?.durationCode === "M" ? "Monthly" : 
                       licenseStatus?.durationCode === "Q" ? "Quarterly (3M)" : 
                       licenseStatus?.durationCode === "B" ? "Bi-Annually (6M)" : 
                       licenseStatus?.durationCode === "A" ? "Annually (12M)" : "N/A"}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-955/50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider block">Remaining life</span>
                    <span className="text-xs text-slate-800 dark:text-white font-extrabold font-mono text-rose-600 dark:text-rose-400 block">
                      {licenseStatus && licenseStatus.isValid && licenseStatus.daysRemaining !== null 
                        ? `${Math.max(0, Math.ceil(licenseStatus.daysRemaining))} Days Left` 
                        : "No Active Lease"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-normal">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40 text-[11px]">
                    <span className="text-slate-500 font-medium">Activation Month:</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono">{licenseStatus?.currentMonth || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40 text-[11px]">
                    <span className="text-slate-500 font-medium font-sans">Expiration:</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono">{licenseStatus?.expiresAt ? licenseStatus.expiresAt.substring(0, 10) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[11px]">
                    <span className="text-slate-500 font-medium font-sans">Active key:</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono truncate max-w-[130px]">{licenseStatus?.activeLicenseKey || "None Applied"}</span>
                  </div>
                </div>
              </div>

              {/* Card 2B: Apply Key Field */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Apply License Key</span>
                </div>

                {licenseError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/44 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold">
                    ⚠️ {licenseError}
                  </div>
                )}

                {licenseSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/44 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold animate-pulse">
                    ✨ {licenseSuccess}
                  </div>
                )}

                <form onSubmit={handleApplyLicense} className="space-y-3 font-sans">
                  <input
                    type="text"
                    required
                    placeholder={`e.g. CG-Q${licenseStatus?.currentMonth?.replace("-", "") || "202606"}-XXXXXXXX`}
                    className="w-full p-3 font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-center tracking-widest font-black uppercase focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-white"
                    value={enteredLicenseKey}
                    onChange={e => setEnteredLicenseKey(e.target.value.toUpperCase())}
                  />

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Activate License Key
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  if (licenseStatus && !licenseStatus.isValid) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex items-center justify-center p-4 transition-colors duration-200 relative`}>
        {/* Real-time Theme Toggle Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-8 space-y-6 text-slate-800 dark:text-slate-100">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-inner">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">CredGuard System Locked</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your software lease has expired for the current calendar month <span className="font-bold font-mono text-rose-600 dark:text-rose-400">{licenseStatus.currentMonth}</span>. Please apply an authorized subscription license key to restore full database access.
            </p>
          </div>

          <div className="space-y-4">
            {licenseError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                ⚠️ {licenseError}
              </div>
            )}

            {licenseSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold animate-pulse">
                ✨ {licenseSuccess}
              </div>
            )}

            <form onSubmit={handleApplyLicense} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Subscription License Key</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. CG-${licenseStatus.currentMonth.replace("-", "")}-XXXXXXXX`}
                  className="w-full p-3 font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-center tracking-widest font-black uppercase focus:ring-2 focus:ring-indigo-600 text-indigo-600 dark:text-indigo-400 text-slate-900 dark:text-white"
                  value={enteredLicenseKey}
                  onChange={e => setEnteredLicenseKey(e.target.value.toUpperCase())}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Activate License Lease</span>
              </button>
            </form>

            {currentUser?.role === 'Operator' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
                {VITE_APP_MODE === 'app' ? (
                  VITE_ADMIN_PORTAL_URL ? (
                    <a
                      href={VITE_ADMIN_PORTAL_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-sans"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Go to Dedicated License Administration &rarr;</span>
                    </a>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-left font-sans text-[10px] text-slate-500 space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">🔑 Isolated Admin Portal Hosted Separately</span>
                      <p>Activate licenses locally using the form above. Set the <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded text-red-500 font-bold">VITE_ADMIN_PORTAL_URL</code> environment variable to link your standalone administrator portal.</p>
                    </div>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminGate(!showAdminGate);
                        setAdminGateError('');
                        setAdminGatePassword('');
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>{showAdminGate ? "Hide Admin Gateway" : "Systems Admin Gateway"}</span>
                    </button>

                    {showAdminGate && (
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3 text-left animate-fadeIn">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block font-mono">Restricted Administration Access</span>
                        <div className="space-y-2">
                          <input
                            type="password"
                            placeholder="Enter Authority Password"
                            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs text-center focus:ring-1 focus:ring-indigo-650 focus:border-indigo-650 text-slate-900 dark:text-white font-semibold"
                            value={adminGatePassword}
                            onChange={e => {
                              setAdminGatePassword(e.target.value);
                              setAdminGateError('');
                            }}
                          />
                          {adminGateError && (
                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-450 text-center">❌ {adminGateError}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (adminGatePassword === 'admin123') {
                                setIsAdminVerified(true);
                                setAdminGateError('');
                                navigateTo('/admin');
                              } else {
                                setAdminGateError('Invalid Authority Password');
                              }
                            }}
                            className="w-full bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer text-center"
                          >
                            Authenticate Admin Console
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1 font-sans">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">🔑 Subscription Licensing Rules</span>
              <p>• Licenses can be activated for Monthly, Quarterly, Bi-Annually, or Annually subscription terms.</p>
              <p>• The current host month demands a key matching: <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{licenseStatus.requiredFormat}</span></p>
              <p>• To generate new subscription keys, sign in to the separate Admin Portal.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex items-center justify-center p-4 transition-colors duration-200 relative`}>
        {/* Real-time Theme Toggle Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-8 space-y-6 text-slate-800 dark:text-slate-100">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-soft">
              <Cpu className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">CredGuard Core</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recovery &amp; Loan Intelligence System Gateway
            </p>
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. fidelisemus@gmail.com"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                  value={simulatedLoginEmail}
                  onChange={e => setSimulatedLoginEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                  value={simulatedLoginPassword}
                  onChange={e => setSimulatedLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                Secure Portal Access
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthDialogMode('register');
                    setAuthError('');
                  }}
                  className="w-full text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Create a new Borrower account
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gateway Credentials Reference</p>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/50 dark:border-slate-800">
                    <div>
                      <span className="block font-semibold">Administrator Privileges</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Email: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">fidelisemus@gmail.com</code></span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">Password: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">admin123</code></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedLoginEmail('fidelisemus@gmail.com');
                        setSimulatedLoginPassword('admin123');
                        setAuthError('');
                      }}
                      className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-extrabold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                    >
                      Fill Admin
                    </button>
                  </div>
                  <div className="p-2 text-slate-500 dark:text-slate-400 text-[10px] leading-normal">
                    <span>💡 For Borrower access, you can enter any borrower's email (no password check required) or click register above.</span>
                  </div>
                </div>
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
                    placeholder="John Doe"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-white"
                    value={simulatedRegisterForm.name}
                    onChange={e => setSimulatedRegisterForm({ ...simulatedRegisterForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-white"
                    value={simulatedRegisterForm.email}
                    onChange={e => setSimulatedRegisterForm({ ...simulatedRegisterForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Phone</label>
                  <input
                    type="text"
                    placeholder="+234..."
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-white"
                    value={simulatedRegisterForm.phone}
                    onChange={e => setSimulatedRegisterForm({ ...simulatedRegisterForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Role/Employment</label>
                  <input
                    type="text"
                    placeholder="Self-Employed"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-semibold focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-white"
                    value={simulatedRegisterForm.company}
                    onChange={e => setSimulatedRegisterForm({ ...simulatedRegisterForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Access Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs font-medium focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                  value={simulatedRegisterForm.password}
                  onChange={e => setSimulatedRegisterForm({ ...simulatedRegisterForm, password: e.target.value })}
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
                  Register Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

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
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">License Lease:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                        {licenseStatus?.isValid ? "Active ✅" : "Expired ❌"}
                      </span>
                    </div>
                    {currentUser?.role === 'Operator' && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            if (licenseStatus) {
                              setGenTargetMonth(licenseStatus.currentMonth);
                            }
                            setShowRenewalModal(true);
                          }}
                          className="w-full text-center text-[9px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 py-1 rounded transition-colors font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Shield className="h-3 w-3" />
                          <span>Subscription Portal</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setLicenseStatus(prev => prev ? { ...prev, isValid: false } : null);
                          }}
                          className="w-full text-center text-[9px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-1 rounded transition-colors font-bold flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Lock className="h-3 w-3" />
                          <span>Simulate System Lock</span>
                        </button>
                      </div>
                    )}
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
        
        {/* Dynamic License Subscriptions Warning banner */}
        {licenseStatus && licenseStatus.isValid && licenseStatus.daysRemaining !== null && licenseStatus.daysRemaining <= 7 && (
          <div id="license-warning-bar" className="mb-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-slate-900 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>CredGuard Lease Expiration Notice</span>
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded font-mono font-black uppercase shrink-0">
                      {licenseStatus.durationCode === "M" ? "Monthly" : 
                       licenseStatus.durationCode === "Q" ? "Quarterly" : 
                       licenseStatus.durationCode === "B" ? "Bi-Annually" : 
                       licenseStatus.durationCode === "A" ? "Annually" : "Active"} Plan
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    Your software subscription security lease is scheduled to expire in <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">{Math.max(0, Math.ceil(licenseStatus.daysRemaining))} days</span> (on {licenseStatus.expiresAt ? licenseStatus.expiresAt.substring(0, 10) : 'N/A'}). Please renew your subscription to prevent database lockups.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (licenseStatus) {
                    setGenTargetMonth(licenseStatus.currentMonth);
                  }
                  setShowRenewalModal(true);
                }}
                className="self-start sm:self-center inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-md shadow-rose-600/10 shrink-0"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Renew / Apply License Key</span>
              </button>
            </div>
          </div>
        )}
        
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
          <div id="sdks-tab" className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Corporate integration & Developer Core</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Integrate digital loan intelligence & repayment synchronization with your legacy backends or banking apps.</p>
              </div>
              
              {/* Pillar sub-tab controller */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setSdkSubTab('docs_portal')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                    sdkSubTab === 'docs_portal'
                      ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Developer Docs Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSdkSubTab('sdks')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                    sdkSubTab === 'sdks'
                      ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Client SDKs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSdkSubTab('api_ref')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                    sdkSubTab === 'api_ref'
                      ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Interactive API Sandbox</span>
                </button>
              </div>
            </div>

            {sdkSubTab === 'sdks' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* SDK index list selector */}
                <div className="md:col-span-1 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 block">Target Platform SDK</div>
                  
                  {[
                    { id: 'js', label: 'JavaScript & Web SDK', lang: 'javascript' },
                    { id: 'kt', label: 'Android Kotlin SDK', lang: 'android' },
                    { id: 'swift', label: 'iOS Swift Module', lang: 'swift' },
                    { id: 'webhook', label: 'Webhook Validation Script', lang: 'webhook' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => copyToClipboard(SDK_TEMPLATES[item.lang as keyof typeof SDK_TEMPLATES], item.id)}
                      className="w-full text-left p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-all group shrink-0 cursor-pointer"
                    >
                      <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
                      {copiedSdkKey === item.id ? (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-450 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 text-[11px] leading-relaxed text-indigo-950 dark:text-indigo-400 space-y-1.5 mt-6">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">Automated Sync Flow</h4>
                    <p>When borrowers hit payment gateways like Stripe or Paystack, gateway webhooks notify CredGuard, realigning collections automatically.</p>
                  </div>
                </div>

                {/* Detailed code playground view */}
                <div className="md:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-950 text-slate-400 px-4 py-2.5 flex items-center justify-between border-b border-slate-900 text-xs">
                    <span className="font-mono text-[11px] text-slate-300">integration_playground_sdk.ts</span>
                    <span className="text-slate-500">Read Only</span>
                  </div>
                  <div className="bg-slate-900 p-5 overflow-x-auto max-h-[500px]">
                    <pre className="text-xs text-indigo-200 font-mono leading-relaxed select-all">
                      {SDK_TEMPLATES.javascript}
                    </pre>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Press copy on the left to copy complete native class code safely.</span>
                    <span className="font-mono">v1.2.0 Stable</span>
                  </div>
                </div>

              </div>
            )}

            {sdkSubTab === 'api_ref' && (
              <div className="space-y-6">
                
                {/* REST API SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: API Directory + Security Key */}
                  <div className="lg:col-span-4 space-y-4">
                    
                    {/* Security Authentication Key details Block */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400">
                          <Lock className="h-4 w-4" />
                          <h4 className="text-xs font-black uppercase tracking-wider">REST API Auth Engine</h4>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                          Bearer Flow
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed font-sans space-y-2">
                        <p>Authenticate banking integrations and client wrappers safely using developer tokens. Switch modes to dynamically align document playouts:</p>
                        
                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850">
                          <button
                            type="button"
                            onClick={() => setSelectedAuthKeyType('sandbox')}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              selectedAuthKeyType === 'sandbox'
                                ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            Sandbox
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAuthKeyType('live')}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              selectedAuthKeyType === 'live'
                                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-450 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            Live
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAuthKeyType('license')}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              selectedAuthKeyType === 'license'
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            License
                          </button>
                        </div>
                      </div>

                      {/* Info Panel depending on which type is active */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-850 space-y-3.5">
                        {selectedAuthKeyType === 'sandbox' && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-200/40 font-mono tracking-widest">
                                TEST KEY (SANDBOX)
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {developerKeys?.sandboxCalls || 0} calls
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[10px] font-sans">
                              <div className="text-slate-550 dark:text-slate-400 leading-relaxed">
                                Ideal for building banking app connectors, staging payments and testing speed-limit geolocation triggers before going live. All data flows stay isolated inside the Sandbox ledger.
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-550 mt-1">
                                Generated: {developerKeys ? new Date(developerKeys.sandboxCreated).toLocaleDateString() : 'Active'}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono break-all text-slate-800 dark:text-slate-200 select-all flex items-center justify-between gap-1.5">
                                <span className="truncate">{developerKeys?.sandboxKey || 'cg_test_loading...'}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(developerKeys?.sandboxKey || '', 'sandbox_token')}
                                  className="text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 shrink-0 cursor-pointer"
                                >
                                  {copiedSdkKey === 'sandbox_token' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={isRotatingKey !== null}
                                onClick={() => handleRotateKey('sandbox')}
                                className="w-full py-1.5 text-[10px] font-black tracking-wider uppercase bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {isRotatingKey === 'sandbox' ? (
                                  <span className="animate-spin text-indigo-650 h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 text-slate-450" />
                                )}
                                <span>{isRotatingKey === 'sandbox' ? 'Rotating Key...' : 'Rotate Sandbox Key'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedAuthKeyType === 'live' && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-200/40 font-mono tracking-widest">
                                LIVE KEY (PRODUCTION)
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {developerKeys?.liveCalls || 0} calls
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[10px] font-sans">
                              <div className="text-slate-550 dark:text-slate-400 leading-relaxed text-red-650 dark:text-red-400 flex gap-1.5 items-start">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>Secures active API payloads inside production servers. Directly triggers collections synchronization and updates primary customer records. Use with absolute caution.</span>
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-550 mt-1">
                                Generated: {developerKeys ? new Date(developerKeys.liveCreated).toLocaleDateString() : 'Active'}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono break-all text-slate-800 dark:text-slate-200 select-all flex items-center justify-between gap-1.5">
                                <span className="truncate">{developerKeys?.liveKey || 'cg_live_loading...'}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(developerKeys?.liveKey || '', 'live_token')}
                                  className="text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 shrink-0 cursor-pointer"
                                >
                                  {copiedSdkKey === 'live_token' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={isRotatingKey !== null}
                                onClick={() => handleRotateKey('live')}
                                className="w-full py-1.5 text-[10px] font-black tracking-wider uppercase bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {isRotatingKey === 'live' ? (
                                  <span className="animate-spin text-indigo-650 h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 text-slate-450" />
                                )}
                                <span>{isRotatingKey === 'live' ? 'Rotating Key...' : 'Rotate Production Key'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedAuthKeyType === 'license' && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-200/40 font-mono tracking-widest">
                                SYSTEM LEASE LICENSE
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold font-mono">
                                Tenant Level
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[10px] font-sans">
                              <div className="text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
                                The master software lease key validating this tenant container. Configured inside the main "Licensing" panel of the dashboard.
                              </div>
                              <div className="text-[9px] text-slate-400 dark:text-slate-550 mt-1 font-mono">
                                Format: CG-[PlanMonth]-[Signature]
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono break-all text-slate-800 dark:text-slate-200 select-all flex items-center justify-between gap-1.5">
                                <span className="truncate">{licenseStatus?.activeLicenseKey || 'No license active. Open "Licensing" tab to apply.'}</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(licenseStatus?.activeLicenseKey || '', 'license_token_doc')}
                                  className="text-slate-450 hover:text-emerald-600 shrink-0 cursor-pointer"
                                >
                                  {copiedSdkKey === 'license_token_doc' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Endpoints list Switches */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1 block">Live API Endpoints</div>
                      
                      {[
                        { id: 'track_session', method: 'POST', path: '/api/sessions/track', title: 'Track User Interaction' },
                        { id: 'create_payment', method: 'POST', path: '/api/payments', title: 'Post Loan Repayment' },
                        { id: 'get_borrowers', method: 'GET', path: '/api/borrowers', title: 'Query Borrowers Directory' },
                        { id: 'predict_default', method: 'GET', path: '/api/risk/predict-default/:loanId', title: 'ML AI Default Predictor' }
                      ].map((item) => {
                        const isSelected = selectedEndpointId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedEndpointId(item.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col space-y-1.5 cursor-pointer ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50/15 dark:bg-indigo-950/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                item.method === 'POST'
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400'
                                  : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400'
                              }`}>
                                {item.method}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{item.path}</span>
                            </div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>

                  </div>

                  {/* Right Column: Endpoint interactive Request/Response Specifications */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {(() => {
                      let dynamicAuthToken = '[your_license_key]';
                      if (selectedAuthKeyType === 'sandbox') {
                        dynamicAuthToken = developerKeys?.sandboxKey || 'cg_test_5f18d72ae5cf438bb36130636cd4f91d';
                      } else if (selectedAuthKeyType === 'live') {
                        dynamicAuthToken = developerKeys?.liveKey || 'cg_live_9a3c8e10df22472ba5670891d966036f';
                      } else if (selectedAuthKeyType === 'license') {
                        dynamicAuthToken = licenseStatus?.activeLicenseKey || 'CG-M202606-A1B2C3D4';
                      }

                      const endpointsMap: Record<string, {
                        method: string;
                        path: string;
                        title: string;
                        desc: string;
                        reqBody: string;
                        respBody: string;
                        headers: Array<{ key: string, val: string, desc: string }>;
                      }> = {
                        track_session: {
                          method: 'POST',
                          path: '/api/sessions/track',
                          title: 'Track Borrower Session & Verification',
                          desc: 'Invoked by the mobile application container on screen changes or session startups to persist compliance, verify geographic constraints, track operating system health, and capture non-private borrower data attributes securely.',
                          headers: [
                            { key: 'Authorization', val: `Bearer ${dynamicAuthToken}`, desc: 'Provides the system-level validation handshake.' },
                            { key: 'Content-Type', val: 'application/json', desc: 'Encodes parameters into standard raw JSON.' }
                          ],
                          reqBody: JSON.stringify({
                            borrowerId: "bor_9012",
                            appVersion: "v2.0.4",
                            deviceType: "mobile_android",
                            os: "Android 13.0 (API 33)",
                            browser: "Mobile Native App Wrapper",
                            consentGiven: true
                          }, null, 2),
                          respBody: JSON.stringify({
                            success: true,
                            sessionId: "ses_99214_891b",
                            capturedIp: "197.210.64.12",
                            operatorLogged: true,
                            complianceVerification: "verified_auth_sha256",
                            timestamp: "2026-06-08T09:27:00Z"
                          }, null, 2)
                        },
                        create_payment: {
                          method: 'POST',
                          path: '/api/payments',
                          title: 'Submit Borrower Payment Repayment',
                          desc: 'Posts a real-time amortization transaction. Can be bound to dynamic client webhooks or card charge completion triggers inside Stripe, Paystack, Flutterwave or your custom cores to immediately reduce outstanding borrower principal.',
                          headers: [
                            { key: 'Authorization', val: `Bearer ${dynamicAuthToken}`, desc: 'Provides active subscription validation.' },
                            { key: 'Content-Type', val: 'application/json', desc: 'Encodes parameters into standard raw JSON.' }
                          ],
                          reqBody: JSON.stringify({
                            borrowerId: "bor_9012",
                            loanId: "loa_2024",
                            amount: 450.00,
                            method: "Stripe/Card",
                            reference: "txn_stripe_99a823b19",
                            notes: "Automated balance amortization via Bank Mobile Application"
                          }, null, 2),
                          respBody: JSON.stringify({
                            success: true,
                            message: "Payment captured and borrower balance updated successfully.",
                            payment: {
                              id: "pay_8819",
                              borrowerId: "bor_9012",
                              loanId: "loa_2024",
                              amount: 450.00,
                              method: "Stripe/Card",
                              reference: "txn_stripe_99a823b19",
                              timestamp: "2026-06-08T09:27:00Z"
                            }
                          }, null, 2)
                        },
                        get_borrowers: {
                          method: 'GET',
                          path: '/api/borrowers',
                          title: 'Retrieve and Sync Borrowers Directory',
                          desc: 'Returns a paginated list of all corporate borrowers registered under this tenant, with corresponding metadata, phone indexes, email references and status flags.',
                          headers: [
                            { key: 'Authorization', val: `Bearer ${dynamicAuthToken}`, desc: 'Authenticates system operator.' }
                          ],
                          reqBody: '// GET request contains query parameters within URL. No body payload is required.',
                          respBody: JSON.stringify([
                            {
                              id: "bor_9012",
                              name: "Chidi Nwachukwu",
                              email: "chidi.nwachukwu@example.com",
                              phone: "+234 812 3456 789",
                              address: "45 Victoria Island, Lagos",
                              business: "Retail Logistics Hub Ltd",
                              status: "Active",
                              createdAt: "2025-05-12T14:20:00Z"
                            }
                          ], null, 2)
                        },
                        predict_default: {
                          method: 'GET',
                          path: '/api/risk/predict-default/:loanId',
                          title: 'AI Machine-Learning Defaults Indicator',
                          desc: 'Queries our custom server-side ML model heuristics to calculate default probability, flagging key drivers (e.g. payout patterns, delayed logs, session drops) alongside suggested mitigating workflows.',
                          headers: [
                            { key: 'Authorization', val: `Bearer ${dynamicAuthToken}`, desc: 'Authenticates system operator.' }
                          ],
                          reqBody: '// Parameterized query. Replace \':loanId\' with target loan identifier string in URI.',
                          respBody: JSON.stringify({
                            success: true,
                            loanId: "loa_2024",
                            borrowerName: "Sarah Jenkins",
                            outstandingBalance: 1700.05,
                            aiPrediction: {
                              defaultProbability: 38.4,
                              calculatedRiskCategory: "MEDIUM RISK",
                              riskDrivers: [
                                "Last payment delay (7 days past schedule)",
                                "Frequent offline session connection timeouts"
                              ],
                              mitigationProtocols: [
                                "Schedule card recurring debit check",
                                "Automated gentle SMS reminder schedule"
                              ]
                            }
                          }, null, 2)
                        }
                      };

                      const currentItem = endpointsMap[selectedEndpointId] || endpointsMap.track_session;

                      return (
                        <>
                          {/* Banner Info */}
                          <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-250 dark:border-slate-800 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                currentItem.method === 'POST'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                              }`}>
                                {currentItem.method}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                {window.location.origin}{currentItem.path}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{currentItem.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{currentItem.desc}</p>
                          </div>

                          <div className="p-6 space-y-6">
                            
                            {/* Headers Parameter View */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block font-mono">Mandatory HTTP Headers</span>
                              <div className="border border-slate-250 dark:border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-850 text-xs">
                                {currentItem.headers.map((h, idx) => (
                                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 grid grid-cols-12 gap-2">
                                    <div className="col-span-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">{h.key}</div>
                                    <div className="col-span-3 font-mono text-slate-500 dark:text-slate-500">{h.val}</div>
                                    <div className="col-span-5 text-slate-500 dark:text-slate-400 font-sans">{h.desc}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Dynamic JSON Payloads side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* Request Body Column */}
                              <div className="space-y-1.5 flex flex-col">
                                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-250 dark:border-slate-800">
                                  <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider font-mono">JSON Request Body</span>
                                  {currentItem.method === 'POST' && (
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(currentItem.reqBody, 'req_payload')}
                                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                                    >
                                      {copiedSdkKey === 'req_payload' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      <span>{copiedSdkKey === 'req_payload' ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <div className="bg-slate-950 p-4 rounded-b-lg border-b border-x border-slate-250 dark:border-slate-850 overflow-x-auto h-[260px] font-mono text-[11px] text-indigo-150 leading-relaxed">
                                  <pre className="select-all">{currentItem.reqBody}</pre>
                                </div>
                              </div>

                              {/* Expected JSON Response */}
                              <div className="space-y-1.5 flex flex-col">
                                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-250 dark:border-slate-800">
                                  <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider font-mono">JSON Expected Response (200 OK)</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(currentItem.respBody, 'resp_payload')}
                                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                                  >
                                    {copiedSdkKey === 'resp_payload' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    <span>{copiedSdkKey === 'resp_payload' ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-b-lg border-b border-x border-slate-250 dark:border-slate-850 overflow-x-auto h-[260px] font-mono text-[11px] text-emerald-300 leading-relaxed">
                                  <pre className="select-all">{currentItem.respBody}</pre>
                                </div>
                              </div>

                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>

                {/* API System Error Codes Reference Grid card */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450 font-black uppercase tracking-wider block">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    <span>REST API HTTP Error Code Standards</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { code: '200 / 201', label: 'Success Indicators', class: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400', desc: 'Resource captured, stored, or calculated successfully.' },
                      { code: '400', label: 'Bad Request', class: 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400', desc: 'Syntactic parameter mismatch or required attributes missing from JSON payload.' },
                      { code: '401', label: 'Unauthorized', class: 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400', desc: 'Invalid or missing Bearer authorization headers.' },
                      { code: '403', label: 'Lease Forbidden', class: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400', desc: 'Valid Authority License activation status check failed (invalid or expired software lease).' },
                      { code: '500', label: 'Server Ledger Conflict', class: 'bg-slate-200/50 text-slate-800 dark:bg-slate-800 dark:text-slate-300', desc: 'Internal system resource locks or database operations execution failure.' }
                    ].map((err, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 space-y-1.5 flex flex-col justify-between shadow-sm">
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${err.class}`}>{err.code}</span>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{err.label}</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{err.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {sdkSubTab === 'docs_portal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                {/* LHS Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 mb-1 px-1">
                      Developer Guides
                    </div>
                    <nav className="space-y-1">
                      {[
                        { id: 'overview', label: '1. Overview & Base URLs' },
                        { id: 'auth', label: '2. Authentication Key Flow' },
                        { id: 'rate_limit', label: '3. Limits & Response Codes' }
                      ].map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setDocsActiveSec(sec.id)}
                          className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            docsActiveSec === sec.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border-l-2 border-indigo-650'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </nav>

                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 pt-2 mb-1 px-1 border-t border-slate-100 dark:border-slate-800">
                      Core REST API Ref
                    </div>
                    <nav className="space-y-0.5 max-h-[240px] overflow-y-auto">
                      {[
                        { id: 'ep_borrowers_post', method: 'POST', label: '/borrowers' },
                        { id: 'ep_borrowers_get', method: 'GET', label: '/borrowers/:id' },
                        { id: 'ep_risk_score', method: 'POST', label: '/risk/score' },
                        { id: 'ep_loans_post', method: 'POST', label: '/loans' },
                        { id: 'ep_loans_get', method: 'GET', label: '/loans/:id' },
                        { id: 'ep_recovery_trigger', method: 'POST', label: '/recovery/trigger' },
                        { id: 'ep_events', method: 'POST', label: '/events' },
                        { id: 'ep_fraud', method: 'POST', label: '/fraud/analyze' },
                        { id: 'ep_consent_create', method: 'POST', label: '/consent/create' },
                        { id: 'ep_consent_get', method: 'GET', label: '/consent/:id' }
                      ].map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setDocsActiveSec(sec.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                            docsActiveSec === sec.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-300 font-bold border-l-2 border-indigo-655'
                              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-805'
                          }`}
                        >
                          <span className="truncate">{sec.label}</span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded scale-90 ${
                            sec.method === 'POST' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                          }`}>{sec.method}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 pt-2 mb-1 px-1 border-t border-slate-100 dark:border-slate-800">
                      Integrations
                    </div>
                    <nav className="space-y-1">
                      {[
                        { id: 'webhooks', label: 'Outgoing Webhooks' },
                        { id: 'sdks', label: 'Mobile SDK Binding' },
                        { id: 'postman', label: 'Postman Import' },
                        { id: 'checklist', label: 'Testing Checklist ✅' }
                      ].map(sec => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => setDocsActiveSec(sec.id)}
                          className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            docsActiveSec === sec.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border-l-2 border-indigo-650'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {sec.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl space-y-2 text-[11px] text-slate-550 dark:text-slate-400">
                    <p className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      Offline Markdown Copie
                    </p>
                    <p className="leading-relaxed">A beautifully formatted Markdown copy is active inside your workspace as <code className="font-mono text-[10px] bg-indigo-100/60 dark:bg-indigo-900/40 px-1 py-0.5 rounded">/API_DOCUMENTATION.md</code>. You can export or reference it directly.</p>
                  </div>
                </div>

                {/* RHS Main Docs Viewer Area */}
                <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                  {/* Dynamic page content resolver */}
                  {(() => {
                    let title = "API Documentation Portal";
                    let methodLabel = "";
                    let customUrl = "/api/...";
                    let description = "";
                    let requiredHeaders = [
                      { key: "Authorization", val: "Bearer " + (developerKeys?.sandboxKey || "cg_test_5f18d72ae5cf438bb36130636cd4f91d"), desc: "Authenticates your API requests safely." },
                      { key: "Content-Type", val: "application/json", desc: "Sets request format encoding standard." }
                    ];
                    let parameters: Array<{ name: string, type: string, req: string, desc: string }> = [];
                    let reqBody = "";
                    let respSucc = "";
                    let respErr = "";

                    if (docsActiveSec === 'overview') {
                      return (
                        <div className="p-8 space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Globe className="h-5 w-5 text-indigo-650" />
                              1. Overview & Base Connection Architecture
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                              Welcome to the CredGuard API. Our APIs enable instantaneous syncing of consumer debt liabilities, real-time risk rating scorecards, direct-debit mandate registrations, and automated collections orchestration. Connect to the URL endpoints detailed below.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                              <span className="text-[10px] font-black uppercase text-indigo-600 font-mono tracking-wider block">SANDBOX TESTING NETWORK</span>
                              <div className="font-mono text-xs text-slate-800 dark:text-slate-100 select-all font-semibold p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-indigo-900/40 rounded break-all">
                                https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api
                              </div>
                              <p className="text-[11px] text-slate-500">Used to build and execute test requests. Fully isolated virtual bookkeeping ledger.</p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                              <span className="text-[10px] font-black uppercase text-rose-600 font-mono tracking-wider block">PRODUCTION ACTIVE NETWORK</span>
                              <div className="font-mono text-xs text-slate-800 dark:text-slate-100 select-all font-semibold p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-indigo-900/40 rounded break-all">
                                https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app
                              </div>
                              <p className="text-[11px] text-slate-500">Active live transactions routing. Coordinates live payments and automated dunning alerts.</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Key Design Features</h4>
                            <ul className="text-xs text-slate-500 leading-relaxed dark:text-slate-400 space-y-2 list-disc list-inside">
                              <li><strong>RESTful Design:</strong> Abides strictly by POST, GET, PUT, and DELETE methods.</li>
                              <li><strong>JSON Exchanges:</strong> All payloads must be structured containing validated JSON packets.</li>
                              <li><strong>Corporate Sandboxed Ledgers:</strong> In-memory arrays configured to allow rapid test calls instantly.</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }

                    if (docsActiveSec === 'auth') {
                      return (
                        <div className="p-8 space-y-6 animate-fadeIn">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Lock className="h-5 w-5 text-indigo-650" />
                              2. Authentication Requirements
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              CredGuard uses standard API keys passed inside HTTP request headers to validate authentication. Include your Bearer key token using the <code className="font-mono px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] rounded">Authorization</code> header.
                            </p>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto space-y-1 shadow-md">
                            <div>GET /api/borrowers HTTP/1.1</div>
                            <div>Host: ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app</div>
                            <div className="text-indigo-300 font-bold">Authorization: Bearer {developerKeys?.sandboxKey || "cg_test_5f18d72ae5cf438bb36130636cd4f91d"}</div>
                            <div>Content-Type: application/json</div>
                          </div>

                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold border-b border-slate-200 dark:border-slate-850">
                                <tr>
                                  <th className="p-4">Key Class</th>
                                  <th className="p-4">Sample Sandbox Variable</th>
                                  <th className="p-4">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                                <tr>
                                  <td className="p-4 font-semibold text-slate-900 dark:text-white">Sandbox Token Key</td>
                                  <td className="p-4 font-mono font-semibold text-indigo-650 dark:text-indigo-400 shrink-0 select-all">{developerKeys?.sandboxKey || "cg_test_5f18d72ae5cf438bb36130636cd4f91d"}</td>
                                  <td className="p-4">Used for test sandbox interactions. Does not affect live customer balances.</td>
                                </tr>
                                <tr>
                                  <td className="p-4 font-semibold text-slate-900 dark:text-white">Live Active Token Key</td>
                                  <td className="p-4 font-mono font-semibold text-indigo-650 dark:text-indigo-400 shrink-0 select-all">{developerKeys?.liveKey || "cg_live_9a3c8e10df22472ba5670891d966036f"}</td>
                                  <td className="p-4 text-emerald-600 font-semibold">Active live transaction token. Validates live bank feeds.</td>
                                </tr>
                                <tr>
                                  <td className="p-4 font-semibold text-slate-900 dark:text-white">Tenant Lease License Key</td>
                                  <td className="p-4 font-mono font-semibold text-indigo-650 dark:text-indigo-400 shrink-0 select-all">{licenseStatus?.activeLicenseKey || "CG-M202606-A1B2C3D4"}</td>
                                  <td className="p-4">System master license lease validating active instance capability limits.</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }

                    if (docsActiveSec === 'rate_limit') {
                      return (
                        <div className="p-8 space-y-6">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-650" />
                            3. Limit Parameters & Standard Error Framework
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                              <h4 className="text-xs font-black uppercase text-indigo-650">Rate Limiter Profile Policy</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                - Sandbox Keys: 100 requests per sliding window of 60 seconds.<br />
                                - Production Keys: 500 requests per sliding window of 60 seconds.
                              </p>
                              <p className="text-[10px] text-slate-400">Exceeding this window throws <code className="font-mono bg-slate-100 dark:bg-slate-800 text-rose-600 px-1 rounded">HTTP 429 Too Many Requests</code> with an active retry parameter.</p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                              <h4 className="text-xs font-black uppercase text-rose-600">Standardized Fallback Payload</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Errors include descriptive strings within the JSON packet structure to simplify client diagnostics.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 tracking-wide">Structured Status Code Maps</h4>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold border-b border-slate-200 dark:border-slate-850">
                                  <tr>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Interpretation</th>
                                    <th className="p-3">Triggers context</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                                  <tr>
                                    <td className="p-3 font-semibold font-mono text-emerald-600">200 / 201</td>
                                    <td className="p-3">OK / Created</td>
                                    <td className="p-3">Records modified, analyzed, or successfully logged into master database.</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-semibold font-mono text-rose-600">400</td>
                                    <td className="p-3">Bad Request</td>
                                    <td className="p-3">Missing required attributes like <code className="font-mono font-bold text-[10px]">borrowerId</code> or malformed payload.</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-semibold font-mono text-rose-600">401</td>
                                    <td className="p-3">Unauthorized</td>
                                    <td className="p-3">Invalid or missing Bearer authorization headers.</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-semibold font-mono text-rose-650">404</td>
                                    <td className="p-3">Not Found</td>
                                    <td className="p-3">Database tracer checked and found no matching rows.</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Map sections to concrete parameters & endpoints
                    if (docsActiveSec === "ep_borrowers_post") {
                      title = "Create Borrower Identity";
                      methodLabel = "POST";
                      customUrl = "/api/borrowers";
                      description = "Registers new borrower profiles on the ledgers. Associates default verified statuses and prepares systemic ledger allocations.";
                      parameters = [
                        { name: "name", type: "string", req: "Yes", desc: "Full legal name of the entity, minimum of 3 characters (e.g. 'Sarah Jenkins')" },
                        { name: "email", type: "string", req: "Yes", desc: "Corporate email address configuration, validated for integrity (e.g. 'sarah@sjlogistics.com')" },
                        { name: "phone", type: "string", req: "No", desc: "International phone string coordinates (e.g. '+234803912341')" },
                        { name: "company", type: "string", req: "No", desc: "Registrant business corporate name." }
                      ];
                      reqBody = JSON.stringify({ name: "Sarah Jenkins", email: "sarah.jenkins@gmail.com", phone: "+2348098765432", company: "SJ Global Logistics", kycStatus: "Verified" }, null, 2);
                      respSucc = JSON.stringify({ id: "bor_1720459381", name: "Sarah Jenkins", email: "sarah.jenkins@gmail.com", phone: "+2348098765432", company: "SJ Global Logistics", kycStatus: "Verified", createdAt: "2026-06-08T10:41:00Z" }, null, 2);
                      respErr = JSON.stringify({ error: "Required fields missing. 'name' and 'email' are mandatory properties." }, null, 2);
                    } else if (docsActiveSec === "ep_borrowers_get") {
                      title = "Query Borrower Details";
                      methodLabel = "GET";
                      customUrl = "/api/borrowers/:borrowerId";
                      description = "Retrieves stored metadata regarding verified system entities directly off ledger databases.";
                      parameters = [
                        { name: ":borrowerId", type: "string", req: "Yes (Path)", desc: "The identifier trace starting with 'bor_' (e.g. 'bor_01')" }
                      ];
                      reqBody = "// GET HTTP Request contains parameters inside path scope. Body payload unnecessary.";
                      respSucc = JSON.stringify({ id: "bor_01", name: "Adebayo Chukwuma", email: "adebayo.c@yahoo.com", phone: "+2348034509122", company: "Chukwuma Retail Ltd", kycStatus: "Verified", createdAt: "2026-05-24T09:30:00Z", payoutConsistency: 92 }, null, 2);
                      respErr = JSON.stringify({ error: "Borrower identity could not be resolved." }, null, 2);
                    } else if (docsActiveSec === "ep_risk_score") {
                      title = "Calculate Risk Scorecard";
                      methodLabel = "POST";
                      customUrl = "/api/risk/score";
                      description = "Computes an analytic scorecard based on historical defaults, outstanding principal layers, and payout telemetry.";
                      parameters = [
                        { name: "borrowerId", type: "string", req: "Yes (JSON)", desc: "Target identity tracer to evaluate (e.g. 'bor_01')" }
                      ];
                      reqBody = JSON.stringify({ borrowerId: "bor_01" }, null, 2);
                      respSucc = JSON.stringify({ success: true, borrowerId: "bor_01", borrowerName: "Adebayo Chukwuma", riskScore: 65, riskBand: "HIGH", analytics: { totalOutstanding: 4500, overdueCount: 1, kycStatus: "Verified", payoutConsistency: 92 }, computations: ["1 active overdue or default loan instance flagged."], assessmentDate: "2026-06-08T10:41:00Z" }, null, 2);
                      respErr = JSON.stringify({ error: "Borrower identity could not be resolved." }, null, 2);
                    } else if (docsActiveSec === "ep_loans_post") {
                      title = "Post Core Loan Disbursal";
                      methodLabel = "POST";
                      customUrl = "/api/loans";
                      description = "Spins up loan facilities on designated borrower profiles, calculating schedule amortizations automatically based on principal sizes.";
                      parameters = [
                        { name: "borrowerId", type: "string", req: "Yes", desc: "Registered borrower profile ID (e.g. 'bor_01')" },
                        { name: "amount", type: "number", req: "Yes", desc: "Aggregate sum of requested principal (e.g. 5000)" },
                        { name: "interestRate", type: "number", req: "No", desc: "Fixed yearly compounding interest rating (defaults to 10)" },
                        { name: "durationMonths", type: "number", req: "No", desc: "Maturity duration inside months registry (defaults to 3)" }
                      ];
                      reqBody = JSON.stringify({ borrowerId: "bor_01", amount: 2500, interestRate: 12, durationMonths: 3 }, null, 2);
                      respSucc = JSON.stringify({ id: "loan_1720459999", borrowerId: "bor_01", borrowerName: "Adebayo Chukwuma", amount: 2500, interestRate: 12, startDate: "2026-06-08T10:41:00Z", dueDate: "2026-09-08T10:41:00Z", amountPaid: 0, latePenalties: 0, status: "Active", repaymentSchedule: [ { dueDate: "2026-07-08T10:41:00Z", amount: 934, paid: false } ] }, null, 2);
                      respErr = JSON.stringify({ error: "Loan principal parameter values are mathematically invalid or out of bounds." }, null, 2);
                    } else if (docsActiveSec === "ep_loans_get") {
                      title = "Fetch Loan Ledger Row";
                      methodLabel = "GET";
                      customUrl = "/api/loans/:loanId";
                      description = "Returns current balances, maturity statistics and payment tracking dates for specified loan agreements.";
                      parameters = [
                        { name: ":loanId", type: "string", req: "Yes (Path)", desc: "The unique identifier starting with 'loan_'" }
                      ];
                      reqBody = "// GET HTTP Request contains parameters inside path scope. Body payload unnecessary.";
                      respSucc = JSON.stringify({ id: "loan_01", borrowerId: "bor_01", borrowerName: "Adebayo Chukwuma", amount: 2500, interestRate: 12, startDate: "2026-05-24T09:30:00Z", dueDate: "2026-08-24T09:30:00Z", amountPaid: 500, latePenalties: 50, status: "Active" }, null, 2);
                      respErr = JSON.stringify({ error: "Loan instance not found on systems ledger database." }, null, 2);
                    } else if (docsActiveSec === "ep_recovery_trigger") {
                      title = "Trigger Automated Digital Dunning Campaign";
                      methodLabel = "POST";
                      customUrl = "/api/recovery/trigger";
                      description = "Initializes collection strategies on delinquent loan listings. Triggers outgoing broadcast alerts (SMS/Email) while updating collector workstation logs.";
                      parameters = [
                        { name: "loanId", type: "string", req: "Yes", desc: "Delinquent loan identifier string reference (e.g. 'loan_01')" },
                        { name: "actionType", type: "string", req: "Yes", desc: "Select from: 'DUNNING_SMS' | 'DUNNING_EMAIL' | 'LEGAL_LETTER'" },
                        { name: "note", type: "string", req: "No", desc: "Trace notation to map on collections master ledger" },
                        { name: "agentName", type: "string", req: "No", desc: "Collector or operator tag (defaults to 'AI AutoDUN Agent')" }
                      ];
                      reqBody = JSON.stringify({ loanId: "loan_01", actionType: "DUNNING_SMS", note: "Overdue escalation", agentName: "Chinedu Okafor" }, null, 2);
                      respSucc = JSON.stringify({ success: true, message: "Recovery action pipeline initiated successfully.", actionDetails: { caseId: "case_1720459000", loanId: "loan_01", actionLogged: "DUNNING_SMS", agentAssigned: "Chinedu Okafor", newCaseStage: "Dunning", timestamp: "2026-06-08T10:41:00Z" } }, null, 2);
                      respErr = JSON.stringify({ error: "Loan instance not found under active records." }, null, 2);
                    } else if (docsActiveSec === "ep_events") {
                      title = "Ingest Upstream Integration Events";
                      methodLabel = "POST";
                      customUrl = "/api/events";
                      description = "External API webhook ingest interface to coordinate actions including promise breakages, geofencing changes, or payment successes.";
                      parameters = [
                        { name: "eventType", type: "string", req: "Yes", desc: "System namespace command (e.g. 'repayment.success')" },
                        { name: "payload", type: "object", req: "Yes", desc: "The metadata context properties map" }
                      ];
                      reqBody = JSON.stringify({ eventType: "repayment.success", payload: { loanId: "loan_01", amount: 500, reference: "pst_90fa8d7aefec" } }, null, 2);
                      respSucc = JSON.stringify({ success: true, eventId: "evt_1720459123", eventType: "repayment.success", processed: true, timestamp: "2026-06-08T10:41:00Z", verificationSignature: "a4d3f576be89ce7cf320daef7d3945de" }, null, 2);
                      respErr = JSON.stringify({ error: "Incomplete event metadata. Properties are mandatory." }, null, 2);
                    } else if (docsActiveSec === "ep_fraud") {
                      title = "Geographic Proxy Threat Assessment";
                      methodLabel = "POST";
                      customUrl = "/api/fraud/analyze";
                      description = "Monitors request socket IP references in real-time, calculating VPN hazard layers and identifying geographic login speed limits.";
                      parameters = [
                        { name: "borrowerId", type: "string", req: "Yes", desc: "Borrower identity reference trace (e.g. 'bor_01')" },
                        { name: "ipAddress", type: "string", req: "Yes", desc: "External IP address checked against proxy databases (e.g. '102.89.34.89')" }
                      ];
                      reqBody = JSON.stringify({ borrowerId: "bor_01", ipAddress: "102.89.34.89" }, null, 2);
                      respSucc = JSON.stringify({ success: true, assessmentId: "frd_1720459341", borrowerId: "bor_01", fraudScore: 12, riskRating: "LOW", recommendedAction: "PASS", findings: [], checkedAt: "2026-06-08T10:41:00Z" }, null, 2);
                      respErr = JSON.stringify({ error: "Validation mismatch. Fields are mandatory." }, null, 2);
                    } else if (docsActiveSec === "ep_consent_create") {
                      title = "Establish Electronic Mandate Consent";
                      methodLabel = "POST";
                      customUrl = "/api/consent/create";
                      description = "Registers active Direct Debit consent, legal geographic tracking overlays, or cellular telemetry consent metadata.";
                      parameters = [
                        { name: "borrowerId", type: "string", req: "Yes", desc: "Valid borrower ID" },
                        { name: "consentType", type: "string", req: "Yes", desc: "Command namespace (e.g. 'DIRECT_DEBIT_MANDATE', 'GEOLOCATION')" },
                        { name: "granted", type: "boolean", req: "Yes", desc: "Affirmative consent indicator toggle (true | false)" }
                      ];
                      reqBody = JSON.stringify({ borrowerId: "bor_01", consentType: "DIRECT_DEBIT_MANDATE", granted: true, ipAddress: "102.89.34.15" }, null, 2);
                      respSucc = JSON.stringify({ success: true, message: "Privacy mandate or direct debit authorization recorded legally.", consentRecord: { id: "con_1720459242", borrowerName: "Adebayo Chukwuma", borrowerId: "bor_01", consentType: "DIRECT_DEBIT_MANDATE", granted: true }, complianceHash: "5fd2b620acdfbfef43accd309e3ca15b0e89fd3c" }, null, 2);
                      respErr = JSON.stringify({ error: "Required parameters missing. Support fields safely." }, null, 2);
                    } else if (docsActiveSec === "ep_consent_get") {
                      title = "Retrieve Consent Status";
                      methodLabel = "GET";
                      customUrl = "/api/consent/:borrowerId";
                      description = "Fetches a full listing of active and revoked consent tokens mapped under a target borrower.";
                      parameters = [
                        { name: ":borrowerId", type: "string", req: "Yes (Path)", desc: "Borrower identity reference parameter trace (e.g. 'bor_01')" }
                      ];
                      reqBody = "// GET HTTP Request contains parameters inside path scope. Body payload unnecessary.";
                      respSucc = JSON.stringify({ success: true, borrowerId: "bor_01", activeConsents: [ { id: "con_01", borrowerId: "bor_01", borrowerName: "Adebayo Chukwuma", consentType: "GEO_LOCATION", granted: true, timestamp: "2026-05-28T14:45:00Z" } ], retrievedAt: "2026-06-08T10:41:00Z" }, null, 2);
                      respErr = JSON.stringify({ success: true, borrowerId: "bor_99", activeConsents: [], retrievedAt: "2026-06-08T10:41:00Z" }, null, 2);
                    }

                    if (docsActiveSec === 'webhooks') {
                      return (
                        <div className="p-8 space-y-6">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-650" />
                            Outgoing Webhooks Documentation
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            CredGuard uses outbound HTTP POST hooks to alert your systems about transaction completions, broken promises-to-pay, geofence breaches, and dunning progression thresholds.
                          </p>

                          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Format of Incoming Event payload:</h4>
                            <pre className="text-[11px] font-mono p-3 bg-slate-950 text-emerald-300 rounded-lg overflow-x-auto leading-relaxed shadow">
{`{
  "event": "promise.broken",
  "id": "evt_hook_88aa20ee31",
  "timestamp": "2026-06-08T10:40:00Z",
  "payload": {
    "caseId": "case_01",
    "borrowerId": "bor_01",
    "borrowerName": "Adebayo Chukwuma",
    "promisedAmount": 1500,
    "promisedDate": "2026-06-05T23:59:59Z",
    "daysOverdue": 3
  }
}`}
                            </pre>
                          </div>
                        </div>
                      );
                    }

                    if (docsActiveSec === 'sdks') {
                      return (
                        <div className="p-8 space-y-6">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-indigo-600" />
                            Client & Mobile SDK Bindings
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Build rapid integrations inside your mobile bank client wrappers using our streamlined class controllers.
                          </p>

                          <div className="space-y-4">
                            <div className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 px-2 py-0.5 rounded border border-indigo-150 dark:border-indigo-900/10">ANDROID (KOTLIN)</span>
                              <pre className="text-[10px] font-mono bg-slate-950 p-3 text-indigo-300 rounded-lg overflow-x-auto">
{`class CredGuardClient(private val apiToken: String) {
    private val client = OkHttpClient()
    private val BASE_URL = "https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api"

    fun emitLocationConsent(borrowerId: String, granted: Boolean, ip: String): String {
        val mediaType = "application/json".toMediaType()
        val json = """{"borrowerId":"$borrowerId","consentType":"GEOLOCATION","granted":$granted,"ipAddress":"$ip"}"""
        val r = Request.Builder()
            .url("$BASE_URL/consent/create")
            .post(json.toRequestBody(mediaType))
            .addHeader("Authorization", "Bearer $apiToken")
            .build()
        client.newCall(r).execute().use { return it.body?.string() ?: "" }
    }
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (docsActiveSec === 'postman') {
                      return (
                        <div className="p-8 space-y-6">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Code className="h-5 w-5 text-indigo-600" />
                            Postman Environment Setup Guides
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Integrate our full collections inside Postman quickly to give your testing team immediate manual control:
                          </p>

                          <div className="space-y-3 text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
                            <p>1. Open Postman Workspace and click <strong>Import</strong> &rarr; <strong>Blank Collection</strong>.</p>
                            <p>2. Set up Collection Variables:</p>
                            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850 block">
                              <li>baseUrl = "https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app/api"</li>
                              <li>token = "{developerKeys?.sandboxKey || "cg_test_5f18d72ae5cf438bb36130636cd4f91d"}"</li>
                            </ul>
                            <p>3. Configure Authorization header inheritance matching Bearer Token class with variable <code className="font-mono bg-slate-100 text-[10px] px-1 rounded">{"{{token}}"}</code>.</p>
                            <p>4. Save and execute transaction queries to debug response arrays visually.</p>
                          </div>
                        </div>
                      );
                    }

                    if (docsActiveSec === 'checklist') {
                      return (
                        <div className="p-8 space-y-6 animate-fadeIn">
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              Core System Integration & Sign-off Checklist
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Instruct your banking IT division to complete this checklist and confirm that return parameters match expectation schema before launching production modules safely.
                            </p>
                          </div>

                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 min-w-[650px]">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold border-b border-slate-200 dark:border-slate-850">
                                  <tr>
                                    <th className="p-3 text-center">Seq</th>
                                    <th className="p-3">Interface / Endpoint</th>
                                    <th className="p-3">Test Scenario Payload</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3">Expected Result Code & Parameter</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                                  {[
                                    { seq: "01", ep: "POST /borrowers", payload: `{"name":"Sarah", "email":"sarah@gmail.com"}`, code: "211 Created", field: `"id" of profile (starts with "bor_")` },
                                    { seq: "02", ep: "GET /borrowers/:id", payload: `Path segment: "bor_01" inside URI`, code: "200 OK", field: `Profile object with matching "email"` },
                                    { seq: "03", ep: "POST /risk/score", payload: `{"borrowerId":"bor_01"}`, code: "200 OK", field: `"riskBand" matching ("LOW"|"HIGH"|"CRITICAL")` },
                                    { seq: "04", ep: "POST /loans", payload: `{"borrowerId":"bor_01", "amount": 2500}`, code: "211 Created", field: `Amortized installments containing dates & segments` },
                                    { seq: "05", ep: "GET /loans/:id", payload: `Path segment: "loan_01" inside URI`, code: "200 OK", field: `Running loan object with active status` },
                                    { seq: "06", ep: "POST /recovery/trigger", payload: `{"loanId":"loan_01", "actionType":"DUNNING_SMS"}`, code: "200 OK", field: `"newCaseStage": "Dunning"` },
                                    { seq: "07", ep: "POST /events", payload: `{"eventType":"repayment.success", "payload": {}}`, code: "200 OK", field: `"processed": true and active SHA256 "verificationSignature"` },
                                    { seq: "08", ep: "POST /fraud/analyze", payload: `{"borrowerId":"bor_01", "ipAddress":"45.90.1.2"}`, code: "200 OK", field: `Returns VPN findings, "riskRating" and actions` },
                                    { seq: "09", ep: "POST /consent/create", payload: `{"borrowerId":"bor_01", "consentType":"GEO", "granted":true}`, code: "211 Created", field: `Output containing SHA1 "complianceHash"` },
                                    { seq: "10", ep: "GET /consent/:id", payload: `Path segment: "bor_01" inside URI`, code: "200 OK", field: `Active consents array list` }
                                  ].map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                      <td className="p-3 text-center font-bold text-slate-400">{item.seq}</td>
                                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{item.ep}</td>
                                      <td className="p-3 font-mono text-[10px] max-w-[140px] truncate" title={item.payload}>{item.payload}</td>
                                      <td className="p-3 text-center font-semibold text-emerald-600 font-mono text-[11px]">{item.code}</td>
                                      <td className="p-3 font-sans text-slate-500 dark:text-slate-400 text-[11px]">{item.field}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Standard Endpoint Ref Sheet
                    return (
                      <div className="flex flex-col flex-1 divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
                        {/* Header Details */}
                        <div className="p-6 md:p-8 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              {title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://ais-dev-g2hlkbu6hmb3svafx5wuhf-50487580477.europe-west2.run.app${customUrl}`);
                                alert("Endpoint URL copied!");
                              }}
                              className="font-mono text-[10.5px] bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                methodLabel === 'POST' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/65 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-400'
                              }`}>{methodLabel}</span>
                              <span className="font-semibold select-all">https://...{customUrl}</span>
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-sans">{description}</p>
                        </div>

                        {/* Split specifications Pane */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
                          {/* Inner LHS: Headers and Parameters */}
                          <div className="p-6 md:p-8 space-y-6">
                            <div className="space-y-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-550">Required Headers</h4>
                              <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                    {requiredHeaders.map((head, i) => (
                                      <tr key={i} className="align-middle">
                                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-250 border-r border-slate-100 dark:border-slate-850">{head.key}</td>
                                        <td className="p-3">
                                          <div className="font-mono text-[10px] break-all select-all font-semibold bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-1 py-0.5 rounded leading-normal text-indigo-650 dark:text-indigo-400">{head.val}</div>
                                          <div className="text-[10px] text-slate-400 mt-0.5">{head.desc}</div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-550">Parameters Specification</h4>
                              {parameters.length > 0 ? (
                                <div className="border border-slate-150 dark:border-slate-805 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-xs bg-white dark:bg-slate-950">
                                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-semibold border-b border-slate-150 dark:border-slate-855">
                                      <tr>
                                        <th className="p-2.5">Name</th>
                                        <th className="p-2.5">Type & Auth</th>
                                        <th className="p-2.5">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-450">
                                      {parameters.map((param, i) => (
                                        <tr key={i} className="align-top">
                                          <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-white text-[11px]">{param.name}</td>
                                          <td className="p-2.5">
                                            <span className="font-mono text-[10px] text-slate-450 block mb-0.5">{param.type}</span>
                                            <span className={`text-[8.5px] font-black uppercase px-1 rounded ${param.req === 'Yes' || param.req.includes('Yes') ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{param.req === 'Yes' ? 'Required' : 'Optional'}</span>
                                          </td>
                                          <td className="p-2.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{param.desc}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No parameters required for this endpoint.</p>
                              )}
                            </div>
                          </div>

                          {/* Inner RHS: Code Payload & Expected Responses */}
                          <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20 space-y-5 flex flex-col justify-start">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">Sample Request Body payload</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(reqBody);
                                    alert("Request payload copied!");
                                  }}
                                  className="text-slate-400 hover:text-indigo-650 flex items-center gap-1 text-[10px] cursor-pointer"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono leading-relaxed p-4 bg-slate-950 text-indigo-250 rounded-xl overflow-x-auto shadow-inner max-h-[180px]">
                                {reqBody}
                              </pre>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Expected Success Response (200 / 201)</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(respSucc);
                                    alert("Success response copied!");
                                  }}
                                  className="text-slate-400 hover:text-indigo-655 flex items-center gap-1 text-[10px] cursor-pointer"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono leading-relaxed p-4 bg-slate-950 text-emerald-300 rounded-xl overflow-x-auto shadow-inner max-h-[180px]">
                                {respSucc}
                              </pre>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">Sample Error Response (400 / 404)</h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(respErr);
                                    alert("Error response copied!");
                                  }}
                                  className="text-slate-400 hover:text-indigo-655 flex items-center gap-1.5 text-[10px] cursor-pointer"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="text-[11px] font-mono leading-relaxed p-4 bg-slate-950 text-rose-450 rounded-xl overflow-x-auto shadow-inner max-h-[120px]">
                                {respErr}
                              </pre>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
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

            {/* SECURE DATABASE SANDBOX GATEWAY */}
            {dbConfigLoading && !dbConfig && (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validating security handshakes and query permissions...</p>
              </div>
            )}

            {!dbConfigLoading && dbConfig && !dbConfig.senderAllowed && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6 shadow-sm border-t-4 border-t-indigo-500">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                    <Lock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Database & Tables Access Restricted</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                    The visual SQL workstation contains raw borrower files, payment thresholds, and system credentials. Only administrators can give access to the database catalog.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Identity:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name} ({currentUser.email})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Workspace Role:</span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">{currentUser.role} Mode</span>
                  </div>

                  {(() => {
                    const reqObj = dbConfig.accessRequests.find(r => r.email.toLowerCase() === currentUser.email.toLowerCase());
                    if (reqObj) {
                      if (reqObj.status === "Pending") {
                        return (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 text-xs rounded-lg flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Your Access Request is currently <strong>PENDING</strong> review by Master Operator Fidelis Emus.</span>
                          </div>
                        );
                      } else if (reqObj.status === "Rejected") {
                        return (
                          <div className="space-y-3">
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 text-xs rounded-lg">
                              ⚠️ Your previous Access Request was <strong>DECLINED</strong> by administrators. You can resubmit or contact support.
                            </div>
                            <button
                              onClick={handleRequestAccess}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
                            >
                              Resubmit Access Application
                            </button>
                          </div>
                        );
                      }
                    }

                    return (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={handleRequestAccess}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          Request Database View Access Privilege
                        </button>
                      </div>
                    );
                  })()}

                  {accessRequestStatusLabel && (
                    <p className="text-[10px] text-center text-indigo-600 dark:text-indigo-400 font-semibold italic animate-pulse mt-2">
                      {accessRequestStatusLabel}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                  <p className="text-[10px] text-slate-400">
                    Need urgent access? Contact Sovereign Security Desk or request elevation to Operator mode.
                  </p>
                </div>
              </div>
            )}

            {/* ADMIN ACCESS PRIVILEGE MANAGEMENT PANEL */}
            {dbConfig && dbConfig.senderAllowed && currentUser.role === 'Operator' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Shield className="h-5 w-5 text-indigo-600 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Administrative DB & Privilege Control Center</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage user database access lists, toggle global visibility, or process pending sandbox applications.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300">
                  {/* Left Column: Access list and sliders */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">Global Guest / Borrower DB Access</span>
                          <span className="text-[10px] text-slate-400">Allow all login tokens (even Borrower role) to query database</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleGlobalBorrowerAccess(!dbConfig.globalBorrowerAccessEnabled)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dbConfig.globalBorrowerAccessEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dbConfig.globalBorrowerAccessEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">Grant Direct DB Credentials</label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="collaborator@company.com"
                            className="flex-1 p-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 rounded-lg text-xs"
                            value={accessRequestInputEmail}
                            onChange={(e) => setAccessRequestInputEmail(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleGrantExplicitAccess(accessRequestInputEmail)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Grant
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-900 dark:text-white block">Explicitly Authorized Accounts</span>
                      {dbConfig.explicitPermittedEmails.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No manual emails override lists defined.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dbConfig.explicitPermittedEmails.map(email => (
                            <span key={email} className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 px-2.5 py-1 rounded-full text-[10px] border border-indigo-100 dark:border-indigo-900/60 font-medium font-mono">
                              {email}
                              {email !== 'fidelisemus@gmail.com' && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeExplicitAccess(email)}
                                  className="text-indigo-500 hover:text-rose-600 cursor-pointer text-xs font-black"
                                  title="Revoke Permission"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pending Access Requests list */}
                  <div className="space-y-4">
                    <span className="font-bold text-slate-900 dark:text-white block border-b border-indigo-500/20 pb-1 font-sans">Sandbox Access Applications & Security Audit</span>
                    
                    {dbConfig.accessRequests.length === 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 text-center border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 italic">No active access requests pending review.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {dbConfig.accessRequests.map((reqObj) => (
                          <div key={reqObj.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                            <div>
                              <div className="flex items-center gap-1.5 font-sans">
                                <span className="font-bold text-slate-900 dark:text-white">{reqObj.name}</span>
                                <span className="text-[8px] bg-slate-200/60 dark:bg-slate-850 px-1 py-0.2 rounded dark:text-slate-400">{reqObj.role}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{reqObj.email}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {reqObj.status === "Pending" ? (
                                <>
                                  <button
                                    onClick={() => handleProcessAccessRequest(reqObj.id, 'Approved')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleProcessAccessRequest(reqObj.id, 'Rejected')}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className={`text-[9px] font-bold uppercase py-0.5 px-1.5 rounded ${reqObj.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400' : 'bg-red-950/60 text-rose-500'}`}>
                                  {reqObj.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MAIN DATABASE VIEW WORKSPACE */}
            {dbConfig && dbConfig.senderAllowed && (
              <>
                {/* SQL PLAYGROUND COMPILER */}
                <div className="bg-slate-955 bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl p-6 relative">
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
              </>
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

      {/* Dynamic Licensing Renewal & Application Portal Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-8 space-y-6 text-slate-800 dark:text-slate-100 relative">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setShowRenewalModal(false);
                setLicenseError('');
                setLicenseSuccess('');
                setGenError('');
                setGenSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <span className="font-sans text-lg font-bold block px-2 leading-none">×</span>
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Subscription Licensing Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Renew your CredGuard system lease with a dynamic duration plan (Monthly, Quarterly, Bi-Annually, or Annually).
              </p>
            </div>

            <div className="space-y-4">
              {licenseError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                  ⚠️ {licenseError}
                </div>
              )}

              {licenseSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                  ✨ {licenseSuccess}
                </div>
              )}

              <form onSubmit={handleApplyLicense} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Subscription License Key</label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. CG-Q${licenseStatus?.currentMonth?.replace("-", "") || "202606"}-XXXXXXXX`}
                    className="w-full p-3 font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-xs text-center tracking-widest font-black uppercase focus:ring-2 focus:ring-indigo-600 text-indigo-600 dark:text-indigo-400 text-slate-900 dark:text-white"
                    value={enteredLicenseKey}
                    onChange={e => setEnteredLicenseKey(e.target.value.toUpperCase())}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Activate License Lease</span>
                </button>
              </form>

              {currentUser?.role === 'Operator' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  {VITE_APP_MODE === 'app' ? (
                    VITE_ADMIN_PORTAL_URL ? (
                      <a
                        href={VITE_ADMIN_PORTAL_URL}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowRenewalModal(false)}
                        className="inline-flex items-center space-x-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-sans"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Open Separate License Admin Portal &rarr;</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        🔑 Admin Gateway is hosted at a separate URL.
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRenewalModal(false);
                        navigateTo('/admin');
                      }}
                      className="inline-flex items-center space-x-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-sans"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Open Separate License Admin Portal &rarr;</span>
                    </button>
                  )}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1 font-sans text-left">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">🔑 Subscription Licensing Rules</span>
                <p>• Licenses can be activated for Monthly, Quarterly, Bi-Annually, or Annually subscription terms.</p>
                <p>• To generate new subscription keys, sign in to the separate Admin Portal.</p>
              </div>
            </div>
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
