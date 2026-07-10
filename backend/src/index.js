export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
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
        const { name, email, password, dob } = await request.json();
        if (!name || !email || !password || !dob) {
          return new Response(JSON.stringify({ error: "Missing identity requirements." }), { status: 400, headers: securityHeaders });
        }
        
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        
        if (age < 13) {
          return new Response(JSON.stringify({ error: "Access denied. Minimum age registration limit is 13." }), { status: 400, headers: securityHeaders });
        }
        return new Response(JSON.stringify({ success: true, age }), { status: 200, headers: securityHeaders });
      }

      if (url.pathname === "/api/auth/verify-paypal" && request.method === "POST") {
        const { orderID, planTier, email, name, passwordHash, dob, age } = await request.json();

        const paypalEndpoint = `https://api-m.paypal.com/v1/billing/subscriptions/${orderID}`;
        
        // Pulled securely from runtime Environment bindings inside the Cloudflare infrastructure layer
        const clientID = env.PAYPAL_CLIENT_ID;
        const clientSecret = env.PAYPAL_SECRET_KEY;

        const tokenAuth = btoa(`${clientID}:${clientSecret}`);
        
        const oauthRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: { "Authorization": `Basic ${tokenAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: "grant_type=client_credentials"
        });

        if (!oauthRes.ok) {
          return new Response(JSON.stringify({ error: "PayPal authentication handshaking dropped." }), { status: 401, headers: securityHeaders });
        }
        const { access_token } = await oauthRes.json();

        const subscriptionVerify = await fetch(paypalEndpoint, {
          method: "GET",
          headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/json" }
        });

        if (!subscriptionVerify.ok) {
          return new Response(JSON.stringify({ error: "Subscription status verification failed on core gateway." }), { status: 402, headers: securityHeaders });
        }

        const subData = await subscriptionVerify.json();
        if (subData.status !== "ACTIVE" && subData.status !== "APPROVED") {
          return new Response(JSON.stringify({ error: "Payment verification aborted. Subscription status inactive." }), { status: 402, headers: securityHeaders });
        }

        const userId = crypto.randomUUID();
        await env.XASAD_D1.prepare(
          "INSERT INTO users (id, name, email, password_hash, dob, age, tier, subscription_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(userId, name, email, passwordHash, dob, age, planTier, orderID).run();

        const token = crypto.randomUUID();
        const expiresAt = Math.floor(Date.now() / 1000) + 2592000;
        
        await env.XASAD_D1.prepare(
          "INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
        ).bind(token, userId, expiresAt).run();

        return new Response(JSON.stringify({ success: true, token, tier: planTier }), { status: 201, headers: securityHeaders });
      }

      if (url.pathname === "/api/chat/stream" && request.method === "POST") {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "").trim();

        const session = await env.XASAD_D1.prepare(
          "SELECT s.*, u.tier FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"
        ).bind(token, Math.floor(Date.now() / 1000)).first();

        if (!session) {
          return new Response(JSON.stringify({ error: "Unauthorized access path. Token expired or invalid." }), { status: 401, headers: securityHeaders });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(encoder.encode(`[XASAD Reasoning] Verification engine loaded successfully for plan profile level: ${session.tier}.\n\n`));
            controller.enqueue(encoder.encode(`Synthesis processing complete. Endpoint functional on XASAD.COM database mappings.`));
            controller.close();
          }
        });

        return new Response(stream, { headers: { ...securityHeaders, "Content-Type": "text/event-stream" } });
      }

      return new Response(JSON.stringify({ error: "Endpoint trajectory unmatched." }), { status: 404, headers: securityHeaders });
    } catch (fault) {
      return new Response(JSON.stringify({ error: `Infrastructure Engine Fault: ${fault.message}` }), { status: 500, headers: securityHeaders });
    }
  }
};
