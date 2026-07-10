import React, { useState, useEffect, useRef } from "react";

// --- PRODUCTION DESIGN MATRIX & CSS WRAPPER ---
const styles = `
  :root {
    --bg-dark: #060606; --card-dark: #0d0d0d; --border-line: #1a1a1a;
    --text-primary: #f3f4f6; --text-muted: #9ca3af; --accent-gold: #eab308;
    --error-red: #ef4444; --success-green: #22c55e;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  body { background: var(--bg-dark); color: var(--text-primary); overflow: hidden; }
  .flex-container { display: flex; height: 100vh; width: 100vw; }
  .sidebar { width: 260px; background: var(--card-dark); border-right: 1px solid var(--border-line); display: flex; flex-direction: column; padding: 20px; justify-content: space-between; }
  .chat-viewport { flex: 1; display: flex; flex-direction: column; background: var(--bg-dark); position: relative; }
  .scroll-frame { flex: 1; overflow-y: auto; padding: 40px; }
  .interactive-input-row { padding: 20px; border-top: 1px solid var(--border-line); background: var(--card-dark); display: flex; gap: 12px; align-items: center; }
  .text-input-field { flex: 1; padding: 14px; background: #121212; border: 1px solid var(--border-line); color: white; border-radius: 8px; resize: none; min-height: 48px; }
  .action-btn { padding: 12px 24px; background: var(--text-primary); color: black; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
  .action-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .wizard-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .wizard-box { background: var(--card-dark); border: 1px solid var(--border-line); border-radius: 12px; width: 100%; max-width: 500px; padding: 35px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
  .wizard-step-pill { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
  .step-pill-active { color: var(--accent-gold); font-weight: bold; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .form-group input { padding: 12px; background: #121212; border: 1px solid var(--border-line); color: white; border-radius: 6px; font-size: 14px; }
  .tier-selector { border: 2px solid var(--border-line); padding: 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center; }
  .tier-selector.selected { border-color: var(--accent-gold); background: #161613; }
  .mobile-navigation-bar { display: none; background: var(--card-dark); border-top: 1px solid var(--border-line); height: 65px; justify-content: space-around; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90; }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-navigation-bar { display: flex; }
    .chat-viewport { padding-bottom: 65px; }
  }
`;

// --- PAYPAL ENVIRONMENT-BASED ENGINE ---
function PayPalSubscriptionEngine({ planTier, onPaymentSuccess, onPaymentError }) {
  const containerRef = useRef(null);
  const paypalButtonInstance = useRef(null);

  // Injected safely from your Cloudflare Pages/Vite environment setup
  const clientID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const PLAN_IDS = {
    STANDARD: import.meta.env.VITE_PAYPAL_PLAN_STANDARD,
    PRO: import.meta.env.VITE_PAYPAL_PLAN_PRO
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.innerHTML = "";

    const initPayPalButtons = () => {
      if (!window.paypal) {
        onPaymentError("PayPal script dependency unavailable.");
        return;
      }

      paypalButtonInstance.current = window.paypal.Buttons({
        style: { shape: "rect", color: "gold", layout: "vertical", label: "subscribe" },
        createSubscription: (data, actions) => {
          return actions.subscription.create({ plan_id: PLAN_IDS[planTier] });
        },
        onApprove: async (data) => {
          onPaymentSuccess({ orderID: data.subscriptionID, planTier });
        },
        onError: (err) => {
          onPaymentError(err.toString());
        }
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

// --- MAIN APPLICATION CONTEXT ---
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
  const [activePanel, setActivePanel] = useState(null);

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
    
    if (!isAuthenticated) {
      setShowWizard(true);
      return;
    }

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
      let aiMessage = { id: (Date.now() + 1).toString(), role: "assistant", reasoning_body: "", verified_body: "" };
      
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.includes("[XASAD Reasoning]")) {
          aiMessage.reasoning_body += chunk;
        } else {
          aiMessage.verified_body += chunk;
        }
        setMessages(prev => prev.map(m => m.id === aiMessage.id ? { ...aiMessage } : m));
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", verified_body: `✕ System Check: ${err.message}` }]);
    } finally {
      setIsGenerating(false);
    }
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
                    <div><h3>Standard</h3><p style={{color:"var(--text-muted)", fontSize:"12px"}}>Core Analytics</p></div>
                    <b style={{color: "var(--accent-gold)"}}>$10/mo</b>
                  </div>
                  <div className={`tier-selector ${selectedPlan === "PRO" ? "selected" : ""}`} onClick={() => setSelectedPlan("PRO")}>
                    <div><h3>Pro</h3><p style={{color:"var(--text-muted)", fontSize:"12px"}}>BigBrain Engine + Somali/Swahili</p></div>
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
                    onPaymentSuccess={(payload) => {
                      setRegData(prev => ({ ...prev, paypalPayload: payload }));
                      setWizardStep(4);
                    }}
                    onPaymentError={(err) => setWizardError(`Checkout Blocked: ${err}`)}
                  />
                  <button className="action-btn" style={{ background: "#222", color: "white", marginTop: "5px" }} onClick={() => setWizardStep(2)}>Back</button>
                </>
              )}

              {wizardStep === 4 && (
                <>
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)" }}><input type="checkbox" checked={checkboxA} onChange={e => setCheckboxA(e.target.checked)} /> I certify my credentials and accept my system use guidelines.</label>
                    <label style={{ fontSize: "13px", color: "var(--text-muted)" }}><input type="checkbox" checked={checkboxB} onChange={e => setCheckboxB(e.target.checked)} /> I authorize auto-renewing charges with explicit no-refund metrics.</label>
                  </div>
                  <button className="action-btn" style={{background:"var(--success-green)", color:"white"}} disabled={!checkboxA || !checkboxB} onClick={commitFullWizardRegistration}>Activate XASAD Instance</button>
                </>
              )}
            </div>
          </div>
        )}

        <aside className="sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <h2 style={{ letterSpacing: "3px", fontWeight: "800", color: "white" }}>XASAD</h2>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="action-btn" style={{ textAlign: "left", background: "#111", color: "white", border: "1px solid #222" }} onClick={() => setMessages([])}>+ Reset Workspace</button>
              <div style={{ color: "var(--text-muted)", fontSize: "13px", display: "flex", flexDirection: "column", gap: "12px", padding: "10px 5px" }}>
                <span style={{ cursor: "pointer" }} onClick={() => setActivePanel("projects")}>📁 Projects Panel</span>
                <span style={{ cursor: "pointer" }} onClick={() => setActivePanel("ecosystem")}>📦 Workspace Ecosystem</span>
              </div>
            </nav>
          </div>
          <div style={{ fontSize: "12px", borderTop: "1px solid var(--border-line)", paddingTop: "15px" }}>
            <span style={{color: "var(--text-muted)"}}>System Access:</span>
            <p style={{ fontWeight: "bold", color: "var(--accent-gold)" }}>{isAuthenticated ? `${userTier} SUBSCRIPTION` : "GUEST INTERFACE"}</p>
          </div>
        </aside>

        <main className="chat-viewport">
          <header style={{ height: "65px", borderBottom: "1px solid var(--border-line)", display: "flex", alignItems: "center", padding: "0 25px", justifyContent: "space-between", background: "var(--card-dark)" }}>
            <div>
              <select value={appLanguage} onChange={e => setAppLanguage(e.target.value)} style={{ background: "black", color: "white", padding: "6px 12px", borderRadius: "4px", border: "1px solid var(--border-line)", fontSize: "13px" }}>
                {["English", "Spanish", "Swahili", "Hausa", "Arabic", "Somali"].map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            {!isAuthenticated && <button className="action-btn" style={{background: "var(--accent-gold)"}} onClick={() => { setWizardStep(1); setShowWizard(true); }}>Unlock Full Access</button>}
          </header>

          {activePanel && (
            <div style={{ background: "#0b0b0b", borderBottom: "1px solid var(--border-line)", padding: "20px", fontSize: "13px" }}>
              <span style={{ fontWeight: "bold" }}>Workspace Integration Matrix: {activePanel.toUpperCase()}</span>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>System operational. Safe connection state active at xasad.com node maps.</p>
            </div>
          )}

          <div className="scroll-frame">
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "12%", color: "var(--text-muted)" }}>
                <h1 style={{ color: "white", fontSize: "32px", marginBottom: "10px" }}>XASAD AI Core</h1>
                <p>Enterprise contextual synthesis processing is active on your node pipeline.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: "30px", borderLeft: msg.role === "assistant" ? "3px solid var(--accent-gold)" : "3px solid #fff", paddingLeft: "20px" }}>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "1px" }}>{msg.role}</div>
                  {msg.reasoning_body && <div style={{ fontSize: "13px", color: "var(--accent-gold)", background: "#12120f", padding: "12px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #2e2611" }}>{msg.reasoning_body}</div>}
                  <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#e5e7eb" }}>{msg.verified_body}</div>
                </div>
              ))
            )}
          </div>

          <footer className="interactive-input-row">
            <textarea 
              className="text-input-field" 
              rows={1}
              placeholder="Query XASAD intelligence engine..." 
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); executeChatMessageStreaming(); } }}
            />
            <button className="action-btn" style={{background: "white"}} disabled={!currentInput.trim() || isGenerating} onClick={executeChatMessageStreaming}>➔</button>
          </footer>
        </main>

        <nav className="mobile-navigation-bar">
          <button style={{ background: "none", border: "none", color: "white", fontSize: "12px" }} onClick={() => setMessages([])}>💬 Workspace</button>
          <button style={{ background: "none", border: "none", color: "white", fontSize: "12px" }} onClick={() => { if(!isAuthenticated) { setWizardStep(1); setShowWizard(true); } }}>👑 Premium</button>
        </nav>
      </div>
    </>
  );
}
