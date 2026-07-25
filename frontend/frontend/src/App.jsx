import React, { useState, useEffect, useRef } from "react";

const styles = `
  :root {
    --bg-dark: #0a0a0a; --card-dark: #171717; --sidebar-dark: #171717;
    --border-line: #2a2a2a; --text-primary: #f3f4f6; --text-muted: #9ca3af;
    --accent-gold: #eab308; --error-red: #ef4444; --success-green: #22c55e;
    --hover-bg: #232323;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  body { background: var(--bg-dark); color: var(--text-primary); overflow: hidden; }
  .flex-container { display: flex; height: 100vh; width: 100vw; }

  .sidebar { width: 260px; background: var(--sidebar-dark); border-right: 1px solid var(--border-line); display: flex; flex-direction: column; padding: 12px; transition: transform 0.2s ease; }
  .sidebar-top-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px 14px 8px; }
  .sidebar-brand { font-weight: 800; letter-spacing: 2px; font-size: 15px; display: flex; align-items: center; gap: 8px; }
  .sidebar-admin-pill { font-size: 10px; border: 1px solid var(--border-line); padding: 2px 8px; border-radius: 20px; color: var(--text-muted); font-weight: 600; }
  .sidebar-top-icons { display: flex; gap: 4px; }
  .sidebar-icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; position: relative; }
  .sidebar-icon-btn:hover { background: var(--hover-bg); color: white; }

  .sidebar-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; background: none; border: none; width: 100%; text-align: left; }
  .sidebar-nav-item:hover { background: var(--hover-bg); }
  .sidebar-nav-item.active { background: var(--hover-bg); }
  .sidebar-nav-item.disabled { color: var(--text-muted); cursor: default; }
  .sidebar-nav-item.disabled:hover { background: none; }
  .sidebar-nav-item.admin-item { color: var(--accent-gold); }
  .sidebar-nav-row { display: flex; align-items: center; justify-content: space-between; }
  .sidebar-upgrade-pill { font-size: 11px; background: var(--hover-bg); color: #93c5fd; padding: 3px 9px; border-radius: 20px; font-weight: 600; }
  .sidebar-count-pill { font-size: 11px; background: #3a2a05; color: var(--accent-gold); padding: 1px 8px; border-radius: 20px; font-weight: 700; }

  .sidebar-section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 16px 10px 6px 10px; }
  .sidebar-history-item { padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-history-item:hover { background: var(--hover-bg); color: var(--text-primary); }

  .sidebar-footer-links { display: flex; flex-direction: column; gap: 2px; padding: 6px 0; border-top: 1px solid var(--border-line); margin-top: 6px; }
  .sidebar-footer-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer; text-decoration: none; background: none; border: none; text-align: left; width: 100%; }
  .sidebar-footer-link:hover { background: var(--hover-bg); color: var(--text-primary); }

  .sidebar-footer { padding: 10px 8px; border-top: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .sidebar-footer-user { display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; background: none; border: none; text-align: left; }
  .sidebar-footer-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--accent-gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .sidebar-footer-text { display: flex; flex-direction: column; min-width: 0; }
  .sidebar-footer-name { font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-footer-plan { font-size: 11px; color: var(--text-muted); }

  .new-chat-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border-line); border-radius: 8px; background: transparent; color: var(--text-primary); font-size: 14px; cursor: pointer; margin-bottom: 8px; }
  .new-chat-btn:hover { background: var(--hover-bg); }

  .chat-viewport { flex: 1; display: flex; flex-direction: column; background: var(--bg-dark); position: relative; min-width: 0; }
  .topbar { height: 56px; border-bottom: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; }
  .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
  .share-btn { padding: 7px 16px; background: var(--hover-bg); color: var(--text-primary); border: 1px solid var(--border-line); border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
  .share-btn:hover { background: #2c2c2c; }
  .notif-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 6px; position: relative; font-size: 16px; }
  .notif-btn:hover { background: var(--hover-bg); color: white; }
  .notif-dot { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--error-red); border: 2px solid var(--bg-dark); }

  .scroll-frame { flex: 1; overflow-y: auto; padding: 30px 20px; }
  .msg-row { max-width: 720px; margin: 0 auto 28px auto; }
  .msg-role { font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.5px; }
  .msg-body { font-size: 15px; line-height: 1.7; color: #e5e7eb; white-space: pre-wrap; }

  .input-dock { padding: 16px 20px 24px 20px; }
  .input-shell { max-width: 720px; margin: 0 auto; border: 1px solid var(--border-line); border-radius: 16px; background: var(--card-dark); padding: 10px 12px; position: relative; }
  .text-input-field { width: 100%; background: transparent; border: none; color: white; resize: none; min-height: 24px; max-height: 160px; font-size: 15px; outline: none; padding: 6px 4px; }
  .input-toolbar { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
  .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .icon-btn:hover { background: var(--hover-bg); color: white; }
  .send-btn { background: white; color: black; border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .send-btn:disabled { opacity: 0.25; cursor: not-allowed; }

  .plus-menu-backdrop { position: fixed; inset: 0; z-index: 40; }
  .plus-menu { position: absolute; bottom: 52px; left: 8px; background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 10px; padding: 6px; width: 240px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 50; }
  .plus-menu-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 10px; border-radius: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; }
  .plus-menu-item:hover { background: var(--hover-bg); }
  .plus-menu-item.disabled { color: var(--text-muted); cursor: default; }
  .plus-menu-item.disabled:hover { background: none; }
  .plus-menu-item-left { display: flex; align-items: center; gap: 10px; }
  .plus-menu-shortcut { font-size: 11px; color: var(--text-muted); }
  .plus-menu-divider { height: 1px; background: var(--border-line); margin: 6px 4px; }
  .plus-menu-check { color: #60a5fa; font-size: 13px; }

  .action-btn { padding: 10px 20px; background: var(--text-primary); color: black; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
  .action-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .link-btn { background: none; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; text-decoration: underline; padding: 4px; }
  .link-btn:hover { color: white; }

  .wizard-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wizard-box { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 12px; width: 100%; max-width: 460px; padding: 32px; display: flex; flex-direction: column; gap: 18px; max-height: 90vh; overflow-y: auto; }
  .wizard-step-pill { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
  .step-pill-active { color: var(--accent-gold); font-weight: bold; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .form-group input { padding: 11px; background: #121212; border: 1px solid var(--border-line); color: white; border-radius: 6px; font-size: 14px; }
  .tier-selector { border: 2px solid var(--border-line); padding: 18px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .tier-selector.selected { border-color: var(--accent-gold); background: #161613; }

  .admin-overlay { position: fixed; inset: 0; background: var(--bg-dark); z-index: 900; display: flex; flex-direction: column; }
  .admin-header { height: 56px; border-bottom: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; flex-shrink: 0; }
  .admin-tabs { display: flex; gap: 4px; padding: 10px 18px; border-bottom: 1px solid var(--border-line); flex-shrink: 0; }
  .admin-tab { padding: 7px 14px; background: none; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; border-radius: 6px; }
  .admin-tab.active { background: var(--hover-bg); color: white; }
  .admin-body { flex: 1; overflow-y: auto; padding: 20px; }
  .admin-flag-row { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .admin-flag-sev { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
  .admin-flag-sev.HIGH { background: #3a0f0f; color: #f87171; }
  .admin-flag-sev.MED { background: #3a2a05; color: #fbbf24; }
  .admin-flag-sev.LOW { background: #0f2a1a; color: #4ade80; }
  .admin-log-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .admin-log-table th { text-align: left; color: var(--text-muted); font-weight: 500; padding: 8px; border-bottom: 1px solid var(--border-line); }
  .admin-log-table td { padding: 8px; border-bottom: 1px solid var(--border-line); }

  .settings-panel, .tos-panel { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 950; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .settings-box { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 12px; width: 100%; max-width: 440px; padding: 28px; display: flex; flex-direction: column; gap: 14px; max-height: 85vh; overflow-y: auto; }

  @media (max-width: 768px) {
    .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .mobile-menu-btn { display: flex; }
    .msg-row { max-width: 100%; }
    .admin-tabs { overflow-x: auto; }
  }
`;

function PayPalSubscriptionEngine({ planTier, onPaymentSuccess, onPaymentError }) {
  const containerRef = useRef(null);
  const clientID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const PLAN_IDS = {
    STANDARD: import.meta.env.VITE_PAYPAL_PLAN_STANDARD,
    PRO: import.meta.env.VITE_PAYPAL_PLAN_PRO
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.innerHTML = "";
    const initPayPalButtons = () => {
      if (!window.paypal) { onPaymentError("PayPal script dependency unavailable."); return; }
      window.paypal.Buttons({
        style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
        createSubscription: (data, actions) => actions.subscription.create({ plan_id: PLAN_IDS[planTier] }),
        onApprove: async (data) => onPaymentSuccess({ orderID: data.subscriptionID, planTier }),
        onError: (err) => onPaymentError(err.toString())
      }).render(containerRef.current);
    };
    const scriptId = "xasad-paypal-sdk";
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientID}&vault=true&intent=subscription`;
      script.setAttribute("data-sdk-integration-source", "button-factory");
      script.async = true;
      script.onload = initPayPalButtons;
      document.head.appendChild(script);
    } else {
      initPayPalButtons();
    }
  }, [planTier, clientID]);

  return <div ref={containerRef} style={{ width: "100%", marginTop: "10px" }} />;
}

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem("xasad_session") || "");
  const [userTier, setUserTier] = useState(localStorage.getItem("xasad_tier") || "STANDARD");
  const [userName, setUserName] = useState(localStorage.getItem("xasad_name") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("xasad_role") || "user");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("xasad_email") || "");
  const [sessionChecked, setSessionChecked] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [appLanguage, setAppLanguage] = useState("English");

  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const [regData, setRegData] = useState({ name: "", email: "", password: "", dob: "", age: null, paypalPayload: null });
  const [selectedPlan, setSelectedPlan] = useState("STANDARD");
  const [checkboxA, setCheckboxA] = useState(false);
  const [checkboxB, setCheckboxB] = useState(false);
  const [wizardError, setWizardError] = useState("");

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const fileInputRef = useRef(null);

  const [showAdminBrain, setShowAdminBrain] = useState(false);
  const [adminTab, setAdminTab] = useState("chat");
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminInput, setAdminInput] = useState("");
  const [adminGenerating, setAdminGenerating] = useState(false);
  const [openFlagCount, setOpenFlagCount] = useState(0);
  const [flagsList, setFlagsList] = useState([]);
  const [logEntries, setLogEntries] = useState([]);

  const authHeaders = (token) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${token || sessionToken}` });

  const clearSession = () => {
    localStorage.removeItem("xasad_session");
    localStorage.removeItem("xasad_tier");
    localStorage.removeItem("xasad_name");
    localStorage.removeItem("xasad_role");
    localStorage.removeItem("xasad_email");
    setSessionToken("");
    setIsAuthenticated(false);
    setUserName(""); setUserTier("STANDARD"); setUserRole("user"); setUserEmail("");
  };

  const persistSession = ({ token, name, tier, role, email }) => {
    localStorage.setItem("xasad_session", token);
    localStorage.setItem("xasad_tier", tier || "STANDARD");
    localStorage.setItem("xasad_name", name || "");
    localStorage.setItem("xasad_role", role || "user");
    if (email) localStorage.setItem("xasad_email", email);
    setSessionToken(token);
    setUserTier(tier || "STANDARD");
    setUserName(name || "");
    setUserRole(role || "user");
    if (email) setUserEmail(email);
    setIsAuthenticated(true);
  };

  // Restore / validate session on load
  useEffect(() => {
    const verify = async () => {
      if (!sessionToken) { setSessionChecked(true); return; }
      setIsAuthenticated(true); // optimistic while we confirm
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/session`, { headers: authHeaders(sessionToken) });
        if (res.status === 401) { clearSession(); }
        else if (res.status === 402) { clearSession(); }
        else if (res.ok) {
          const data = await res.json();
          persistSession({ token: sessionToken, name: data.name, tier: data.tier, role: data.role, email: data.email });
        }
      } catch (e) {
        // Network hiccup — keep the optimistic local session rather than logging the user out
      } finally {
        setSessionChecked(true);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processWizardStep1 = async () => {
    setWizardError("");
    if (!regData.name || !regData.email || !regData.password || !regData.dob) {
      setWizardError("All setup parameters are required.");
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register-step1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profile calculation error.");
      setRegData(prev => ({ ...prev, age: result.age }));
      setWizardStep(2);
    } catch (err) {
      setWizardError(err.message);
    }
  };

  const commitFullWizardRegistration = async () => {
    if (!checkboxA || !checkboxB) return;
    setWizardError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-paypal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: regData.paypalPayload.orderID,
          planTier: selectedPlan,
          email: regData.email,
          name: regData.name,
          password: regData.password,
          dob: regData.dob,
          age: regData.age
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment synchronization rejected.");
      persistSession({ token: result.token, name: result.name || regData.name, tier: result.tier, role: result.role, email: regData.email });
      setShowWizard(false);
    } catch (err) {
      setWizardError(err.message);
    }
  };

  const submitLogin = async () => {
    setLoginError("");
    if (!loginEmail || !loginPassword) { setLoginError("Enter your email and password."); return; }
    setLoginBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const result = await res.json();
      if (res.status === 402) {
        // Subscription lapsed — walk them through reactivation checkout
        setLoginError("Your subscription is inactive. Redirecting to reactivate...");
        try {
          const reactRes = await fetch(`${apiBaseUrl}/api/auth/reactivate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reactivateToken: result.reactivateToken })
          });
          const reactData = await reactRes.json();
          if (reactRes.ok) {
            setRegData(prev => ({ ...prev, name: reactData.name, email: reactData.email }));
            setShowLogin(false);
            setWizardStep(2);
            setShowWizard(true);
          }
        } catch (e) {
          setLoginError("Could not start reactivation. Try again.");
        }
        return;
      }
      if (!res.ok) throw new Error(result.error || "Login failed.");
      persistSession({ token: result.token, name: result.name, tier: result.tier, role: result.role, email: loginEmail });
      setShowLogin(false);
      setLoginEmail(""); setLoginPassword("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginBusy(false);
    }
  };

  const executeChatMessageStreaming = async () => {
    if (!currentInput.trim() || isGenerating) return;
    if (!isAuthenticated) { setShowLogin(true); return; }

    const userMessage = { id: Date.now().toString(), role: "user", verified_body: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsGenerating(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat/stream`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ prompt: userMessage.verified_body, languageMode: appLanguage, useProBigBrain: userTier === "PRO" })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Stream disrupted.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { id: (Date.now() + 1).toString(), role: "assistant", verified_body: "" };
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiMessage.verified_body += chunk;
        setMessages(prev => prev.map(m => m.id === aiMessage.id ? { ...aiMessage } : m));
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", verified_body: `Error: ${err.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  // ---------------- ADMIN AI BRAIN ----------------
  const refreshFlagCount = async () => {
    if (userRole !== "admin" || !sessionToken) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/flags`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFlagsList(data.flags || []);
        setOpenFlagCount((data.flags || []).length);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (userRole !== "admin" || !sessionToken) return;
    refreshFlagCount();
    const interval = setInterval(refreshFlagCount, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, sessionToken]);

  const openAdminBrain = () => {
    setShowAdminBrain(true);
    setAdminTab("chat");
    refreshFlagCount();
  };

  const loadAdminLog = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/log`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLogEntries(data.entries || []);
      }
    } catch (e) {}
  };

  const resolveFlag = async (id) => {
    try {
      await fetch(`${apiBaseUrl}/admin/flags/resolve`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ id }) });
      refreshFlagCount();
    } catch (e) {}
  };

  const sendAdminMessage = async () => {
    if (!adminInput.trim() || adminGenerating) return;
    const userMsg = { id: Date.now().toString(), role: "user", body: adminInput };
    setAdminMessages(prev => [...prev, userMsg]);
    setAdminInput("");
    setAdminGenerating(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/chat/stream`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ prompt: userMsg.body })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "AI Brain stream disrupted.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMsg = { id: (Date.now() + 1).toString(), role: "assistant", body: "" };
      setAdminMessages(prev => [...prev, aiMsg]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiMsg.body += decoder.decode(value, { stream: true });
        setAdminMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...aiMsg } : m));
      }
    } catch (err) {
      setAdminMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", body: `Error: ${err.message}` }]);
    } finally {
      setAdminGenerating(false);
    }
  };

  const submitCancelSubscription = async () => {
    setCancelMsg("");
    setCancelBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/account/cancel`, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed.");
      setCancelMsg("Subscription cancelled. It will remain active until the end of the billing period.");
    } catch (err) {
      setCancelMsg(err.message);
    } finally {
      setCancelBusy(false);
    }
  };

  const userInitial = (userName || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div className="flex-container">

        {/* ---------------- REGISTRATION WIZARD ---------------- */}
        {showWizard && (
          <div className="wizard-overlay">
            <div className="wizard-box">
              <div className="wizard-step-pill">
                <span className={wizardStep === 1 ? "step-pill-active" : ""}>1. Profile</span>
                <span className={wizardStep === 2 ? "step-pill-active" : ""}>2. Tier</span>
                <span className={wizardStep === 3 ? "step-pill-active" : ""}>3. Pay</span>
                <span className={wizardStep === 4 ? "step-pill-active" : ""}>4. Affirm</span>
              </div>
              {wizardError && <div style={{ color: "var(--error-red)", fontSize: "13px", fontWeight: "500" }}>{wizardError}</div>}

              {wizardStep === 1 && (
                <>
                  <div className="form-group"><label>Name</label><input type="text" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} /></div>
                  <div className="form-group"><label>Password</label><input type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} /></div>
                  <div className="form-group"><label>Date of Birth</label><input type="date" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} /></div>
                  <button className="action-btn" style={{background: "var(--accent-gold)"}} onClick={processWizardStep1}>Continue</button>
                  <button className="link-btn" onClick={() => { setShowWizard(false); setShowLogin(true); }}>Already have an account? Sign in</button>
                </>
              )}

              {wizardStep === 2 && (
                <>
                  <div className={`tier-selector ${selectedPlan === "STANDARD" ? "selected" : ""}`} onClick={() => setSelectedPlan("STANDARD")}>
                    <div><h3>Standard</h3><p style={{color:"var(--text-muted)", fontSize:"12px"}}>Core Access</p></div>
                    <b style={{color: "var(--accent-gold)"}}>$10/mo</b>
                  </div>
                  <div className={`tier-selector ${selectedPlan === "PRO" ? "selected" : ""}`} onClick={() => setSelectedPlan("PRO")}>
                    <div><h3>Pro</h3><p style={{color:"var(--text-muted)", fontSize:"12px"}}>BigBrain Engine</p></div>
                    <b style={{color: "var(--accent-gold)"}}>$20/mo</b>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button className="action-btn" style={{ background: "#222", color: "white", flex: 1 }} onClick={() => setWizardStep(1)}>Back</button>
                    <button className="action-btn" style={{ flex: 2, background: "white" }} onClick={() => setWizardStep(3)}>Next</button>
                  </div>
                </>
              )}

              {wizardStep === 3 && (
                <>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Complete payment for your <b>{selectedPlan}</b> plan subscription:</p>
                  <PayPalSubscriptionEngine
                    planTier={selectedPlan}
                    onPaymentSuccess={(payload) => { setRegData(prev => ({ ...prev, paypalPayload: payload })); setWizardStep(4); }}
                    onPaymentError={(err) => setWizardError(`Checkout Blocked: ${err}`)}
                  />
                  <button className="action-btn" style={{ background: "#222", color: "white", marginTop: "5px" }} onClick={() => setWizardStep(2)}>Back</button>
                </>
              )}

              {wizardStep === 4 && (
                <>
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)" }}><input type="checkbox" checked={checkboxA} onChange={e => setCheckboxA(e.target.checked)} /> I certify my credentials and accept the terms of use.</label>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)" }}><input type="checkbox" checked={checkboxB} onChange={e => setCheckboxB(e.target.checked)} /> I authorize auto-renewing charges.</label>
                  </div>
                  <button className="action-btn" style={{background:"var(--success-green)", color:"white"}} disabled={!checkboxA || !checkboxB} onClick={commitFullWizardRegistration}>Activate Account</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------- LOGIN MODAL ---------------- */}
        {showLogin && (
          <div className="wizard-overlay">
            <div className="wizard-box">
              <h2 style={{ fontSize: "18px" }}>Sign in to XASAD AI</h2>
              {loginError && <div style={{ color: "var(--error-red)", fontSize: "13px", fontWeight: "500" }}>{loginError}</div>}
              <div className="form-group"><label>Email</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitLogin()} /></div>
              <div className="form-group"><label>Password</label><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submitLogin()} /></div>
              <button className="action-btn" style={{background: "var(--accent-gold)"}} disabled={loginBusy} onClick={submitLogin}>{loginBusy ? "Signing in..." : "Sign In"}</button>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="link-btn" onClick={() => { setShowLogin(false); setWizardStep(1); setShowWizard(true); }}>Create an account</button>
                <button className="link-btn" onClick={() => setShowLogin(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SETTINGS ---------------- */}
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-box">
              <h2 style={{ fontSize: "18px" }}>Settings</h2>
              <div className="form-group"><label>Name</label><div style={{ color: "var(--text-primary)" }}>{userName}</div></div>
              <div className="form-group"><label>Email</label><div style={{ color: "var(--text-primary)" }}>{userEmail}</div></div>
              <div className="form-group"><label>Plan</label><div style={{ color: "var(--text-primary)" }}>{userTier}</div></div>
              {cancelMsg && <div style={{ fontSize: "13px", color: cancelMsg.startsWith("Subscription cancelled") ? "var(--success-green)" : "var(--error-red)" }}>{cancelMsg}</div>}
              <button className="action-btn" style={{ background: "#3a0f0f", color: "#f87171" }} disabled={cancelBusy} onClick={submitCancelSubscription}>{cancelBusy ? "Processing..." : "Cancel Subscription"}</button>
              <button className="action-btn" style={{ background: "#222", color: "white" }} onClick={() => { clearSession(); setShowSettings(false); }}>Log Out</button>
              <button className="link-btn" onClick={() => setShowSettings(false)}>Close</button>
            </div>
          </div>
        )}

        {/* ---------------- TERMS OF SERVICE ---------------- */}
        {showTos && (
          <div className="tos-panel">
            <div className="settings-box">
              <h2 style={{ fontSize: "18px" }}>Terms of Service</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Placeholder — replace this with your actual reviewed Terms of Service copy before launch. This section is not real legal text.
              </p>
              <button className="link-btn" onClick={() => setShowTos(false)}>Close</button>
            </div>
          </div>
        )}

        {/* ---------------- ADMIN AI BRAIN ---------------- */}
        {showAdminBrain && userRole === "admin" && (
          <div className="admin-overlay">
            <div className="admin-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <b>XASAD AI Brain</b>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Admin only</span>
              </div>
              <button className="link-btn" onClick={() => setShowAdminBrain(false)}>Close</button>
            </div>
            <div className="admin-tabs">
              <button className={`admin-tab ${adminTab === "chat" ? "active" : ""}`} onClick={() => setAdminTab("chat")}>Chat</button>
              <button className={`admin-tab ${adminTab === "flags" ? "active" : ""}`} onClick={() => { setAdminTab("flags"); refreshFlagCount(); }}>Flags {openFlagCount > 0 && <span className="sidebar-count-pill">{openFlagCount}</span>}</button>
              <button className={`admin-tab ${adminTab === "log" ? "active" : ""}`} onClick={() => { setAdminTab("log"); loadAdminLog(); }}>Log</button>
            </div>
            <div className="admin-body">
              {adminTab === "chat" && (
                <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                  {adminMessages.map(m => (
                    <div key={m.id} className="msg-row">
                      <div className="msg-role">{m.role === "assistant" ? "AI Brain" : "Admin"}</div>
                      <div className="msg-body">{m.body}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <input
                      style={{ flex: 1, padding: "11px", background: "#121212", border: "1px solid var(--border-line)", color: "white", borderRadius: "8px" }}
                      placeholder="Send instruction to AI Brain..."
                      value={adminInput}
                      onChange={e => setAdminInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendAdminMessage()}
                    />
                    <button className="send-btn" style={{ width: "auto", padding: "0 16px" }} disabled={!adminInput.trim() || adminGenerating} onClick={sendAdminMessage}>Send</button>
                  </div>
                </div>
              )}
              {adminTab === "flags" && (
                <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                  {flagsList.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No open flags. This list auto-populates when the AI backend logs a real error.</p>}
                  {flagsList.map(f => (
                    <div key={f.id} className="admin-flag-row">
                      <div>
                        <span className={`admin-flag-sev ${f.severity}`}>{f.severity}</span>
                        <p style={{ marginTop: "6px", fontSize: "13px" }}>{f.message}</p>
                        <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>{new Date(f.created_at).toLocaleString()}</p>
                      </div>
                      <button className="link-btn" onClick={() => resolveFlag(f.id)}>Resolve</button>
                    </div>
                  ))}
                </div>
              )}
              {adminTab === "log" && (
                <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                  <table className="admin-log-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Role</th></tr></thead>
                    <tbody>
                      {logEntries.map((e, i) => (
                        <tr key={i}><td>{e.name}</td><td>{e.email}</td><td>{e.plan_tier}</td><td>{e.subscription_status}</td><td>{e.role}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- SIDEBAR ---------------- */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-top-row">
            <div className="sidebar-brand">XASAD AI {userRole === "admin" && <span className="sidebar-admin-pill">ADMIN</span>}</div>
            <div className="sidebar-top-icons">
              <button className="sidebar-icon-btn" title="Search chats">🔍</button>
              <button className="sidebar-icon-btn" title="Collapse sidebar" onClick={() => setSidebarOpen(false)}>▤</button>
            </div>
          </div>

          <button className="new-chat-btn" onClick={startNewChat}>
            <span>＋</span><span>New chat</span>
          </button>

          <button className="sidebar-nav-item"><span>💬</span><span>Chats</span></button>
          <button className="sidebar-nav-item disabled" title="Coming soon"><span>📁</span><span>Projects</span></button>
          <button className="sidebar-nav-item disabled" title="Coming soon"><span>🧠</span><span>Memory</span></button>
          <button className="sidebar-nav-item disabled" title="Coming soon"><span>🔎</span><span>Search Chats</span></button>
          <button className="sidebar-nav-item disabled" title="Coming soon"><span>🎬</span><span>Video / Image Studio</span></button>

          {userRole === "admin" && (
            <button className="sidebar-nav-item admin-item" onClick={openAdminBrain}>
              <span>🧠</span><span>AI Brain</span>
              {openFlagCount > 0 && <span className="sidebar-count-pill" style={{ marginLeft: "auto" }}>{openFlagCount}</span>}
            </button>
          )}

          <div className="sidebar-section-label">Recents</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {messages.length > 0 && (
              <div className="sidebar-history-item">{messages[0]?.verified_body?.slice(0, 28) || "Current chat"}</div>
            )}
          </div>

          <div className="sidebar-footer-links">
            <a className="sidebar-footer-link" href="/">🌐 Homepage</a>
            <button className="sidebar-footer-link" onClick={() => setShowTos(true)}>🛡 Terms of Service</button>
            <button className="sidebar-footer-link" onClick={() => isAuthenticated ? setShowSettings(true) : setShowLogin(true)}>⚙ Settings</button>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-footer-user" onClick={() => isAuthenticated ? setShowSettings(true) : setShowLogin(true)}>
              <div className="sidebar-footer-avatar">{userInitial}</div>
              <div className="sidebar-footer-text">
                <span className="sidebar-footer-name">{isAuthenticated ? (userName || "Account") : "Not signed in"}</span>
                <span className="sidebar-footer-plan">{isAuthenticated ? `${userTier} plan` : "Sign in / Create account"}</span>
              </div>
            </button>
            {isAuthenticated && <button className="sidebar-icon-btn" title="Log out" onClick={clearSession}>⏻</button>}
          </div>
        </aside>

        {/* ---------------- MAIN CHAT ---------------- */}
        <main className="chat-viewport">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <select value={appLanguage} onChange={e => setAppLanguage(e.target.value)} style={{ background: "black", color: "white", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-line)", fontSize: "13px" }}>
                {["English", "Spanish", "Swahili", "Hausa", "Arabic", "Somali"].map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {messages.length > 0 && <button className="share-btn">Share</button>}
              {userRole === "admin" && (
                <button className="notif-btn" title="AI Brain notifications" onClick={openAdminBrain}>
                  🔔{openFlagCount > 0 && <span className="notif-dot" />}
                </button>
              )}
              {!isAuthenticated && sessionChecked && (
                <>
                  <button className="link-btn" onClick={() => setShowLogin(true)}>Log In</button>
                  <button className="action-btn" style={{background: "var(--accent-gold)"}} onClick={() => { setWizardStep(1); setShowWizard(true); }}>Create Account</button>
                </>
              )}
            </div>
          </header>

          <div className="scroll-frame">
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "14%", color: "var(--text-muted)" }}>
                <h1 style={{ color: "white", fontSize: "28px", marginBottom: "10px" }}>How can I help you today?</h1>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="msg-row">
                  <div className="msg-role">{msg.role === "assistant" ? "XASAD AI" : "You"}</div>
                  <div className="msg-body">{msg.verified_body}</div>
                </div>
              ))
            )}
          </div>

          <div className="input-dock">
            <div className="input-shell">
              {plusMenuOpen && (
                <>
                  <div className="plus-menu-backdrop" onClick={() => setPlusMenuOpen(false)} />
                  <div className="plus-menu">
                    <div className="plus-menu-item" onClick={() => { fileInputRef.current?.click(); setPlusMenuOpen(false); }}>
                      <span className="plus-menu-item-left">📎 Add files or photos</span>
                      <span className="plus-menu-shortcut">⌘U</span>
                    </div>
                    <div className="plus-menu-item disabled" title="Coming soon">
                      <span className="plus-menu-item-left">📷 Take a screenshot</span>
                    </div>
                    <div className="plus-menu-item disabled" title="Coming soon">
                      <span className="plus-menu-item-left">📁 Add to project</span>
                      <span>›</span>
                    </div>
                    <div className="plus-menu-divider" />
                    <div className="plus-menu-item disabled" title="Coming soon">
                      <span className="plus-menu-item-left">🧠 Skills</span>
                      <span>›</span>
                    </div>
                    <div className="plus-menu-item disabled" title="Coming soon">
                      <span className="plus-menu-item-left">🔗 Add connector</span>
                      <span>›</span>
                    </div>
                    <div className="plus-menu-item disabled" title="Coming soon">
                      <span className="plus-menu-item-left">🧷 Add plugins...</span>
                    </div>
                    <div className="plus-menu-item" onClick={() => setWebSearchEnabled(!webSearchEnabled)}>
                      <span className="plus-menu-item-left">🌐 Web search</span>
                      {webSearchEnabled && <span className="plus-menu-check">✓</span>}
                    </div>
                  </div>
                </>
              )}
              <input type="file" ref={fileInputRef} style={{ display: "none" }} />
              <textarea
                className="text-input-field"
                rows={1}
                placeholder="Message XASAD AI..."
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); executeChatMessageStreaming(); } }}
              />
              <div className="input-toolbar">
                <button className="icon-btn" onClick={() => setPlusMenuOpen(!plusMenuOpen)}>＋</button>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button className="icon-btn" title="Voice input">🎙</button>
                  <button className="send-btn" disabled={!currentInput.trim() || isGenerating} onClick={executeChatMessageStreaming}>➔</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
