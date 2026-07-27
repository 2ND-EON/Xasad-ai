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

  .sidebar { width: 260px; background: var(--sidebar-dark); border-right: 1px solid var(--border-line); display: flex; flex-direction: column; padding: 12px; transition: transform 0.2s ease; z-index: 30; }
  .sidebar-top-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px 14px 8px; }
  .sidebar-brand { font-weight: 800; letter-spacing: 2px; font-size: 15px; display: flex; align-items: center; gap: 8px; }
  .sidebar-admin-pill { font-size: 10px; border: 1px solid var(--border-line); padding: 2px 8px; border-radius: 20px; color: var(--text-muted); font-weight: 600; }
  .sidebar-top-icons { display: flex; gap: 4px; }
  .sidebar-icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; position: relative; }
  .sidebar-icon-btn:hover { background: var(--hover-bg); color: white; }

  .sidebar-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; background: none; border: none; width: 100%; text-align: left; }
  .sidebar-nav-item:hover { background: var(--hover-bg); }
  .sidebar-nav-item.active { background: var(--hover-bg); }
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

  .sidebar-footer { padding: 10px 8px; border-top: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative; }
  .sidebar-footer-user { display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; background: none; border: none; text-align: left; width: 100%; }
  .sidebar-footer-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--accent-gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .sidebar-footer-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .sidebar-footer-name { font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-footer-plan { font-size: 11px; color: var(--text-muted); }

  .new-chat-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border-line); border-radius: 8px; background: transparent; color: var(--text-primary); font-size: 14px; cursor: pointer; margin-bottom: 8px; width: 100%; }
  .new-chat-btn:hover { background: var(--hover-bg); }

  .chat-viewport { flex: 1; display: flex; flex-direction: column; background: var(--bg-dark); position: relative; min-width: 0; }
  .topbar { height: 56px; border-bottom: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; }
  .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .plan-upgrade-pill { font-size: 12px; background: var(--card-dark); border: 1px solid var(--border-line); padding: 5px 12px; border-radius: 20px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .plan-upgrade-pill:hover { background: var(--hover-bg); }
  
  .notif-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 6px; position: relative; font-size: 16px; display: flex; align-items: center; justify-content: center; }
  .notif-btn:hover { background: var(--hover-bg); color: white; }
  .notif-dot { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--error-red); border: 2px solid var(--bg-dark); }

  .scroll-frame { flex: 1; overflow-y: auto; padding: 30px 20px; display: flex; flex-direction: column; }
  .welcome-screen { margin: auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .welcome-title { font-size: 36px; font-weight: 500; font-family: serif; color: var(--text-primary); }

  .msg-row { max-width: 720px; width: 100%; margin: 0 auto 28px auto; }
  .msg-role { font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.5px; }
  .msg-body { font-size: 15px; line-height: 1.7; color: #e5e7eb; white-space: pre-wrap; }

  .input-dock { padding: 16px 20px 24px 20px; }
  .input-shell { max-width: 720px; margin: 0 auto; border: 1px solid var(--border-line); border-radius: 16px; background: var(--card-dark); padding: 10px 12px; position: relative; }
  .text-input-field { width: 100%; background: transparent; border: none; color: white; resize: none; min-height: 24px; max-height: 160px; font-size: 15px; outline: none; padding: 6px 4px; }
  .input-toolbar { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
  .input-toolbar-left { display: flex; align-items: center; gap: 6px; position: relative; }
  .input-toolbar-right { display: flex; align-items: center; gap: 8px; }
  
  .icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .icon-btn:hover { background: var(--hover-bg); color: white; }
  .send-btn { background: white; color: black; border: none; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; }
  .send-btn:disabled { opacity: 0.25; cursor: not-allowed; }

  .plus-menu { position: absolute; bottom: 45px; left: 0; background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 10px; padding: 6px; width: 240px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 50; }
  .plus-menu-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 10px; border-radius: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; }
  .plus-menu-item:hover { background: var(--hover-bg); }

  .user-popup-menu { position: absolute; bottom: 50px; left: 8px; background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 10px; padding: 6px; width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 50; display: flex; flex-direction: column; gap: 2px; }
  .user-popup-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; border-radius: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; background: none; border: none; text-align: left; width: 100%; }
  .user-popup-item:hover { background: var(--hover-bg); }

  .auth-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .auth-card { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 16px; width: 100%; max-width: 420px; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
  .auth-title { font-size: 22px; font-weight: 700; text-align: center; letter-spacing: 1px; }
  .auth-input { background: var(--bg-dark); border: 1px solid var(--border-line); border-radius: 8px; padding: 12px; color: white; font-size: 14px; outline: none; width: 100%; }
  .auth-input:focus { border-color: var(--accent-gold); }
  .auth-btn { background: white; color: black; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; font-size: 14px; width: 100%; text-align: center; }
  .auth-btn:hover { background: #e5e7eb; }
  .auth-switch { font-size: 13px; color: var(--text-muted); text-align: center; cursor: pointer; }
  .auth-switch span { color: var(--text-primary); text-decoration: underline; }
  .error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-red); color: var(--error-red); padding: 10px; border-radius: 8px; font-size: 13px; text-align: center; }

  .admin-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg-dark); overflow: hidden; }
  .admin-header { padding: 16px 24px; border-bottom: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; }
  .admin-tabs { display: flex; gap: 16px; padding: 0 24px; border-bottom: 1px solid var(--border-line); background: var(--card-dark); }
  .admin-tab { padding: 14px 4px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; }
  .admin-tab.active { color: var(--text-primary); border-bottom-color: var(--accent-gold); }
  .admin-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .admin-card { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
  .admin-card-title { font-size: 13px; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.5px; }
  .admin-card-body { font-size: 14px; line-height: 1.6; color: #d1d5db; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("xasad_token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authDob, setAuthDob] = useState("");
  const [authError, setAuthError] = useState("");

  const [view, setView] = useState("chat");
  const [adminTab, setAdminTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [adminChatMessages, setAdminChatMessages] = useState([]);
  const [adminInput, setAdminInput] = useState("");
  const [flags, setFlags] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ users: 0, flags: 0 });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser({ name: data.name, role: data.role, tier: data.tier, email: data.email });
          } else {
            localStorage.removeItem("xasad_token");
            setToken("");
          }
        })
        .catch(() => {
          localStorage.removeItem("xasad_token");
          setToken("");
        });
    }
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminChatMessages]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchFlags();
      fetchLogs();
      fetchStats();
    }
  }, [user]);

  const fetchFlags = async () => {
    try {
      const res = await fetch("/admin/flags", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFlags(data.flags);
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/admin/log", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setLogs(data.entries);
    } catch (e) {}
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats/users");
      const data = await res.json();
      if (data.success) setStats(prev => ({ ...prev, users: data.count }));
    } catch (e) {}
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("xasad_token", data.token);
        setToken(data.token);
        setUser({ name: data.name, role: data.role, tier: data.tier, email: authEmail });
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setAuthError("Network error during login.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const step1Res = await fetch("/api/auth/register-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authName, email: authEmail, password: authPassword, dob: authDob })
      });
      const step1Data = await step1Res.json();
      if (!step1Res.ok) {
        setAuthError(step1Data.error || "Registration validation failed.");
        return;
      }
      setUser({ name: authName, role: authEmail.toLowerCase() === "asadenjune@proton.me" ? "admin" : "user", tier: "STANDARD", email: authEmail });
    } catch (err) {
      setAuthError("Registration error.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const userMsg = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, languageMode: "English" })
      });
      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";
      
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1].content = assistantReply;
          return copy;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error communicating with XASAD AI Brain." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSendMessage = async () => {
    if (!adminInput.trim() || loading) return;
    const prompt = adminInput;
    setAdminInput("");
    setAdminChatMessages(prev => [...prev, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch("/admin/chat/stream", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error("Admin stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      
      setAdminChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        reply += chunk;
        setAdminChatMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1].content = reply;
          return copy;
        });
      }
    } catch (err) {
      setAdminChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to admin console brain." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="auth-title">XASAD AI</div>
            {authError && <div className="error-banner">{authError}</div>}
            {authMode === "login" ? (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input className="auth-input" type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                <input className="auth-input" type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                <button className="auth-btn" type="submit">Sign In</button>
                <div className="auth-switch" onClick={() => setAuthMode("register")}>Don't have an account? <span>Register</span></div>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input className="auth-input" type="text" placeholder="Full Name" value={authName} onChange={e => setAuthName(e.target.value)} required />
                <input className="auth-input" type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                <input className="auth-input" type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                <input className="auth-input" type="date" placeholder="Date of Birth" value={authDob} onChange={e => setAuthDob(e.target.value)} required />
                <button className="auth-btn" type="submit">Complete Registration</button>
                <div className="auth-switch" onClick={() => setAuthMode("login")}>Already have an account? <span>Sign In</span></div>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="flex-container">
        <div className="sidebar">
          <div className="sidebar-top-row">
            <div className="sidebar-brand">
              XASAD
              {user.role === "admin" && <span className="sidebar-admin-pill">Admin</span>}
            </div>
          </div>

          <button className="new-chat-btn" onClick={() => { setView("chat"); setMessages([]); }}>
            <span>➕</span> New chat
          </button>

          <button className={`sidebar-nav-item ${view === "chat" ? "active" : ""}`} onClick={() => setView("chat")}>
            <span>💬</span> Chats
          </button>
          <button className={`sidebar-nav-item ${view === "projects" ? "active" : ""}`} onClick={() => setView("projects")}>
            <span>📁</span> Projects
          </button>
          <button className={`sidebar-nav-item ${view === "artifacts" ? "active" : ""}`} onClick={() => setView("artifacts")}>
            <span>🎨</span> Artifacts
          </button>
          <button className={`sidebar-nav-item ${view === "code" ? "active" : ""}`} onClick={() => setView("code")}>
            <span>💻</span> Code <span className="sidebar-upgrade-pill">Upgrade</span>
          </button>
          <button className={`sidebar-nav-item ${view === "customize" ? "active" : ""}`} onClick={() => setView("customize")}>
            <span>⚙️</span> Customize
          </button>

          {user.role === "admin" && (
            <>
              <div className="sidebar-section-label">Management</div>
              <button className={`sidebar-nav-item admin-item ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>
                <div className="sidebar-nav-row" style={{ width: "100%" }}>
                  <span>🛡️ AI Brain Console</span>
                  <span className="sidebar-count-pill">{flags.length}</span>
                </div>
              </button>
            </>
          )}

          <div className="sidebar-section-label">Recents</div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div className="sidebar-history-item">XASAD AI Deep Architecture</div>
            <div className="sidebar-history-item">Cloudflare Worker Integration</div>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-footer-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="sidebar-footer-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
              <div className="sidebar-footer-text">
                <span className="sidebar-footer-name">{user.name}</span>
                <span className="sidebar-footer-plan">{user.role === "admin" ? "Admin Only" : user.tier}</span>
              </div>
            </button>

            {userMenuOpen && (
              <div className="user-popup-menu">
                <button className="user-popup-item" onClick={() => { localStorage.removeItem("xasad_token"); window.location.reload(); }}>
                  <span>Log out</span> <span>🚪</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {view === "admin" && user.role === "admin" ? (
          <div className="admin-panel">
            <div className="admin-header">
              <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--accent-gold)" }}>AI Brain Admin Terminal</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Registered Users: {stats.users}</div>
            </div>
            <div className="admin-tabs">
              <button className={`admin-tab ${adminTab === "chat" ? "active" : ""}`} onClick={() => setAdminTab("chat")}>Chat</button>
              <button className={`admin-tab ${adminTab === "flags" ? "active" : ""}`} onClick={() => setAdminTab("flags")}>Flags ({flags.length})</button>
              <button className={`admin-tab ${adminTab === "patch" ? "active" : ""}`} onClick={() => setAdminTab("patch")}>Patch</button>
              <button className={`admin-tab ${adminTab === "ads" ? "active" : ""}`} onClick={() => setAdminTab("ads")}>Ads</button>
              <button className={`admin-tab ${adminTab === "log" ? "active" : ""}`} onClick={() => setAdminTab("log")}>Log</button>
            </div>

            <div className="admin-content">
              {adminTab === "chat" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {adminChatMessages.map((m, i) => (
                      <div key={i} className="admin-card">
                        <div className="admin-card-title">{m.role === "user" ? "Admin Command" : "XASAD AI Brain"}</div>
                        <div className="admin-card-body">{m.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="input-shell" style={{ margin: 0, width: "100%" }}>
                    <textarea 
                      className="text-input-field" 
                      placeholder="Send instruction to AI Brain..." 
                      value={adminInput}
                      onChange={e => setAdminInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdminSendMessage(); } }}
                    />
                    <div className="input-toolbar">
                      <div></div>
                      <button className="send-btn" onClick={handleAdminSendMessage} disabled={loading}>➤</button>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === "log" && (
                logs.map((l, i) => (
                  <div key={i} className="admin-card">
                    <div className="admin-card-title">{l.name} ({l.email})</div>
                    <div className="admin-card-body">Tier: {l.plan_tier} | Status: {l.subscription_status} | Role: {l.role}</div>
                  </div>
                ))
              )}

              {adminTab !== "chat" && adminTab !== "flags" && adminTab !== "log" && (
                <div className="admin-card">
                  <div className="admin-card-title">Module Status</div>
                  <div className="admin-card-body">System operational and fully synchronized with Cloudflare database backend.</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-viewport">
            <div className="topbar">
              <button className="mobile-menu-btn">☰</button>
              <div></div>
              <div className="topbar-right">
                <button className="plan-upgrade-pill"><span>Free plan</span> · <span>Upgrade</span></button>
                <button className="notif-btn" title="Notifications">
                  🔔
                  <span className="notif-dot"></span>
                </button>
              </div>
            </div>

            <div className="scroll-frame">
              {messages.length === 0 ? (
                <div className="welcome-screen">
                  <div className="welcome-title">Hello, {user.name.split(" ")[0]}</div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className="msg-row">
                    <div className="msg-role">{m.role}</div>
                    <div className="msg-body">{m.content}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="input-dock">
              <div className="input-shell">
                <textarea 
                  className="text-input-field"
                  placeholder="How can I help you today?"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <div className="input-toolbar">
                  <div className="input-toolbar-left">
                    <button className="icon-btn" onClick={() => setPlusMenuOpen(!plusMenuOpen)}>➕</button>
                    {plusMenuOpen && (
                      <div className="plus-menu">
                        <div className="plus-menu-item"><span>Add files or photos</span><span>⌘U</span></div>
                        <div className="plus-menu-item"><span>Take a screenshot</span></div>
                        <div className="plus-menu-item"><span>Add to project</span><span>▶</span></div>
                      </div>
                    )}
                  </div>
                  <div className="input-toolbar-right">
                    <button className="icon-btn">🎙️</button>
                    <button className="send-btn" onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>➤</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
