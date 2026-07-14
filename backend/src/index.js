// backend/src/index.js
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/admin")) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.includes("asadenjune@proton.me")) {
        return new Response(JSON.stringify({ error: "Access Denied: Admin privileges required." }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
    }

    if (url.hostname === "www.xasad.com") {
      return Response.redirect(`https://xasad.com${url.pathname}${url.search}`, 301);
    }

    const securityHeaders = {
      "Access-Control-Allow-Origin": "https://xasad.com",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: securityHeaders, status: 204 });
    }

    try {
      if (url.pathname === "/api/auth/register-step1" && request.method === "POST") {
        const { name, email, password, dob, targetGroup } = await request.json();
        if (!name || !email || !password || !dob) {
          return new Response(JSON.stringify({ error: "Missing identity requirements." }), { status: 400, headers: securityHeaders });
        }
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age < 13) {
          return new Response(JSON.stringify({ error: "Access denied. Minimum registration age is 13." }), { status: 403, headers: securityHeaders });
        }
        return new Response(JSON.stringify({ success: true, age }), { status: 200, headers: securityHeaders });
      }

      if (url.pathname === "/api/chat" && request.method === "POST") {
        const { message } = await request.json();
        if (!message) {
          return new Response(JSON.stringify({ error: "Message is required." }), { status: 400, headers: securityHeaders });
        }
        try {
          const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages: [
              { role: "system", content: "You are XASAD Brain, a multilingual AI assistant fluent in Somali, Swahili, Arabic, and English. Be helpful, clear, and concise." },
              { role: "user", content: message }
            ]
          });
          return new Response(JSON.stringify({ success: true, reply: aiResponse.response }), { headers: securityHeaders, status: 200 });
        } catch (aiError) {
          return new Response(JSON.stringify({ error: "AI processing failed: " + aiError.message }), { status: 500, headers: securityHeaders });
        }
      }

      if (url.pathname === "/api/auth/verify-paypal" && request.method === "POST") {
        const { orderID, planTier, email, name, passwordHash, dob, age, targetGroup } = await request.json();
        const paypalEndpoint = `https://api-m.paypal.com/v1/billing/subscriptions/${orderID}`;
        const clientId = env.PAYPAL_CLIENT_ID;
        const clientSecret = env.PAYPAL_SECRET_KEY;
        const tokenAuth = btoa(`${clientId}:${clientSecret}`);
        const oauthRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: { "Authorization": `Basic ${tokenAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: "grant_type=client_credentials"
        });
        if (!oauthRes.ok) {
          return new Response(JSON.stringify({ error: "PayPal authentication handshake dropped." }), { status: 401, headers: securityHeaders });
        }
        const { access_token } = await oauthRes.json();
        const subscriptionVerify = await fetch(paypalEndpoint, {
          method: "GET",
          headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/json" }
        });
        if (!subscriptionVerify.ok) {
          return new Response(JSON.stringify({ error: "Subscription verification failed on secure gate." }), { status: 400, headers: securityHeaders });
        }
        const subData = await subscriptionVerify.json();
        if (subData.status !== "ACTIVE" && subData.status !== "APPROVED") {
          return new Response(JSON.stringify({ error: "Payment verification aborted. Subscription inactive." }), { status: 402, headers: securityHeaders });
        }
        const assignedRole = email.toLowerCase() === "asadenjune@proton.me" ? "admin" : "user";
        const userId = crypto.randomUUID();
        await env.XASAD_DB.prepare(
          "INSERT INTO users (id, name, email, password_hash, dob, age, target_group, subscription_status, role, paypal_subscription_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(userId, name, email, passwordHash, dob, age, targetGroup, subData.status, assignedRole, orderID).run();
        return new Response(JSON.stringify({ success: true, token: userId, role: assignedRole }), { status: 200, headers: securityHeaders });
      }

      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const { email, password } = await request.json();
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Missing email or password." }), { status: 400, headers: securityHeaders });
        }
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
        const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        const user = await env.XASAD_DB.prepare("SELECT * FROM users WHERE email = ? AND password_hash = ?").bind(email, passwordHash).first();
        if (!user) {
          return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401, headers: securityHeaders });
        }
        const isAdmin = user.email.toLowerCase() === "asadenjune@proton.me";
        const activeStates = ["ACTIVE", "APPROVED"];
        if (!isAdmin && !activeStates.includes(user.subscription_status)) {
          const payload = { userId: user.id, exp: Date.now() + 10 * 60 * 1000 };
          const data = btoa(JSON.stringify(payload));
          const key = await crypto.subtle.importKey("raw", encoder.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
          const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
          const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
          const reactivateToken = `${data}.${sigHex}`;
          return new Response(JSON.stringify({ error: "SUBSCRIPTION_INACTIVE", message: "Approve payment to activate your account", reactivateToken }), { status: 402, headers: securityHeaders });
        }
        return new Response(JSON.stringify({ success: true, token: user.id, name: user.name, role: user.role }), { status: 200, headers: securityHeaders });
      }

      if (url.pathname === "/api/auth/reactivate" && request.method === "POST") {
        const { reactivateToken } = await request.json();
        const [data, sigHex] = (reactivateToken || "").split(".");
        if (!data || !sigHex) {
          return new Response(JSON.stringify({ error: "Invalid token." }), { status: 401, headers: securityHeaders });
        }
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey("raw", encoder.encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
        const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, "0")).join("");
        if (expectedHex !== sigHex) {
          return new Response(JSON.stringify({ error: "Invalid token." }), { status: 401, headers: securityHeaders });
        }
        const payload = JSON.parse(atob(data));
        if (payload.exp && Date.now() > payload.exp) {
          return new Response(JSON.stringify({ error: "Token expired." }), { status: 401, headers: securityHeaders });
        }
        const user = await env.XASAD_DB.prepare("SELECT * FROM users WHERE id = ?").bind(payload.userId).first();
        if (!user) {
          return new Response(JSON.stringify({ error: "User not found." }), { status: 404, headers: securityHeaders });
        }
        return new Response(JSON.stringify({ action: "checkout_required", email: user.email, name: user.name }), { status: 200, headers: securityHeaders });
      }

      if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
        const event = await request.json();
        const eventType = event.event_type;
        const resource = event.resource;

        if (eventType === "BILLING.SUBSCRIPTION.CANCELLED" || eventType === "BILLING.SUBSCRIPTION.SUSPENDED" || eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
          const paypalSubId = resource.id;
          await env.XASAD_DB.prepare("UPDATE users SET subscription_status = 'INACTIVE' WHERE paypal_subscription_id = ?").bind(paypalSubId).run();
        }

        if (eventType === "PAYMENT.SALE.DENIED" || eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
          const paypalSubId = resource.billing_agreement_id || resource.id;
          if (paypalSubId) {
            await env.XASAD_DB.prepare("UPDATE users SET subscription_status = 'INACTIVE' WHERE paypal_subscription_id = ?").bind(paypalSubId).run();
          }
        }

        if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "PAYMENT.SALE.COMPLETED") {
          const paypalSubId = resource.billing_agreement_id || resource.id;
          if (paypalSubId) {
            await env.XASAD_DB.prepare("UPDATE users SET subscription_status = 'ACTIVE' WHERE paypal_subscription_id = ?").bind(paypalSubId).run();
          }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200, headers: securityHeaders });
      }

      return new Response(JSON.stringify({ error: "Endpoint trajectory unmatched." }), { status: 404, headers: securityHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: securityHeaders });
    }
  }
};
export { index_default as default };
