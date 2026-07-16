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
  .sidebar-brand { font-weight: 800; letter-spacing: 2px; padding: 10px 8px 18px 8px; font-size: 15px; }
  .sidebar-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; background: none; border: none; width: 100%; text-align: left; }
  .sidebar-nav-item:hover { background: var(--hover-bg); }
  .sidebar-nav-item.active { background: var(--hover-bg); }
  .sidebar-section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 16px 10px 6px 10px; }
  .sidebar-history-item { padding: 8px 10px; border-radius: 8px; font-size: 13px; color: var(--text-muted); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-history-item:hover { background: var(--hover-bg); color: var(--text-primary); }
  .sidebar-footer { margin-top: auto; padding: 10px 8px; border-top: 1px solid var(--border-line); font-size: 12px; color: var(--text-muted); }

  .new-chat-btn { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border-line); border-radius: 8px; background: transparent; color: var(--text-primary); font-size: 14px; cursor: pointer; margin-bottom: 8px; }
  .new-chat-btn:hover { background: var(--hover-bg); }

  .chat-viewport { flex: 1; display: flex; flex-direction: column; background: var(--bg-dark); position: relative; min-width: 0; }
  .topbar { height: 56px; border-bottom: 1px solid var(--border-line); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; }
  .mobile-menu-btn { display: none; background: none; border: none; color: white; font-size: 20px; cursor: pointer; }

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

  .plus-menu { position: absolute; bottom: 52px; left: 8px; background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 10px; padding: 6px; width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 50; }
  .plus-menu-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; font-size: 13px; color: var(--text-primary); cursor: pointer; }
  .plus-menu-item:hover { background: var(--hover-bg); }
  .plus-menu-item.disabled { color: var(--text-muted); cursor: default; }

  .action-btn { padding: 10px 20px; background: var(--text-primary); color: black; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
  .action-btn:disabled { opacity: 0.25; cursor: not-allowed; }

  .wizard-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wizard-box { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 12px; width: 100%; max-width: 460px; padding: 32px; display: flex; flex-direction: column; gap: 18px; }
  .wizard-step-pill { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
  .step-pill-active { color: var(--accent-gold); font-weight: bold; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .form-group input { padding: 11px; background: #121212; border: 1px solid var(--border-line); color: white; border-radius: 6px; font-size: 14px; }
  .tier-selector { border: 2px solid var(--border-line); padding: 18px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .tier-selector.selected { border-color: var(--accent-gold); background: #161613; }

  @media (max-width: 768px) {
    .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .mobile-menu-btn { display: flex; }
    .msg-row { max-width: 100%; }
  }
`;

function PayPalSubscriptionEngine({ planTier, onPaymentSuccess, onPaymentError }) {
  const containerRef = useRef(null);
  const paypalButtonInstance = useRef(null);
  const clientID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const PLAN_IDS = {
    STANDARD: import.meta.env.VITE_PAYPAL_PLAN_STANDARD,
    PRO: import.meta.env.VITE_PAYPAL_PLAN_PRO
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.innerHTML = "";
    const initPayPalButtons = () => {
      if (!window.paypal) { onPaymentError("PayPal script dependency unavailable."); return; }
      paypalButtonInstance.current = window.paypal.Buttons({
        style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
        createSubscription: (data, actions) => actions.subscription.create({ plan_id: PLAN_IDS[planTier] }),
        onApprove: async (data) => onPaymentSuccess({ orderID: data.subscriptionID, planTier }),
        onError: (err) => onPaymentError(err.toString())
      });
      paypalButtonInstance.current.render(containerRef.current);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem("xasad_session") || "");
  const [userTier, setUserTier] = useState("STANDARD");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [appLanguage, setAppLanguage] = useState("English");

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
  const fileInputRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    if (sessionToken) setIsAuthenticated(true);
  }, [sessionToken]);

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
          passwordHash: regData.password,
          dob: regData.dob,
          age: regData.age
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment synchronization rejected.");
      localStorage.setItem("xasad_session", result.token);
      setSessionToken(result.token);
      setUserTier(result.tier);
      setIsAuthenticated(true);
      setShowWizard(false);
    } catch (err) {
      setWizardError(err.message);
    }
  };

  const executeChatMessageStreaming = async () => {
    if (!currentInput.trim() || isGenerating) return;
    if (!isAuthenticated) { setShowWizard(true); return; }

    const userMessage = { id: Date.now().toString(), role: "user", verified_body: currentInput };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsGenerating(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken}` },
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

  return (
    <>
      <style>{styles}</style>
      <div className="flex-container">
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
                  <div className="form-group"><label>Name</label><input type="text" onChange={e => setRegData({...regData, name: e.target.value})} /></div>
                  <div className="form-group"><label>Email</label><input type="email" onChange={e => setRegData({...regData, email: e.target.value})} /></div>
                  <div className="form-group"><label>Password</label><input type="password" onChange={e => setRegData({...regData, password: e.target.value})} /></div>
                  <div className="form-group"><label>Date of Birth</label><input type="date" onChange={e => setRegData({...regData, dob: e.target.value})} /></div>
                  <button className="action-btn" style={{background: "var(--accent-gold)"}} onClick={processWizardStep1}>Continue</button>
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

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">XASAD AI</div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <span>＋</span><span>New chat</span>
          </button>
          <button className="sidebar-nav-item"><span>💬</span><span>Chats</span></button>
          <button className="sidebar-nav-item"><span>📁</span><span>Projects</span></button>
          <button className="sidebar-nav-item"><span>🔍</span><span>Search chats</span></button>
          <div className="sidebar-section-label">Recent</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {messages.length > 0 && (
              <div className="sidebar-history-item">{messages[0]?.verified_body?.slice(0, 28) || "Current chat"}</div>
            )}
          </div>
          <div className="sidebar-footer">
            <button className="sidebar-nav-item"><span>⚙</span><span>Customize</span></button>
            {isAuthenticated ? `${userTier} plan — active` : "Not signed in"}
          </div>
        </aside>

        <main className="chat-viewport">
          <header className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <select value={appLanguage} onChange={e => setAppLanguage(e.target.value)} style={{ background: "black", color: "white", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-line)", fontSize: "13px" }}>
                {["English", "Spanish", "Swahili", "Hausa", "Arabic", "Somali"].map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            {!isAuthenticated && <button className="action-btn" style={{background: "var(--accent-gold)"}} onClick={() => { setWizardStep(1); setShowWizard(true); }}>Log In</button>}
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
                <div className="plus-menu">
                  <div className="plus-menu-item" onClick={() => { fileInputRef.current?.click(); setPlusMenuOpen(false); }}>📎 Add files or photos</div>
                  <div className="plus-menu-item disabled">📷 Take a screenshot</div>
                  <div className="plus-menu-item disabled">📁 Add to project</div>
                </div>
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
                <button className="send-btn" disabled={!currentInput.trim() || isGenerating} onClick={executeChatMessageStreaming}>➔</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
