export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. STATS ROUTE
      if (path === "/api/stats/users" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT COUNT(*) as count FROM users").all();
        return Response.json({ success: true, count: results[0]?.count || 0 }, { headers: corsHeaders });
      }

      // 2. AUTH REGISTRATION STEP 1
      if (path === "/api/auth/register-step1" && method === "POST") {
        const { name, email, password, dob } = await request.json();
        if (!email || !password || !name) {
          return Response.json({ success: false, error: "Missing required registration details." }, { status: 400, headers: corsHeaders });
        }
        
        // Check if user exists
        const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).all();
        if (existing.results && existing.results.length > 0) {
          return Response.json({ success: false, error: "Email already registered." }, { status: 400, headers: corsHeaders });
        }

        const role = email.toLowerCase() === "asadenjune@proton.me" ? "admin" : "user";
        await env.DB.prepare(
          "INSERT INTO users (name, email, password, dob, role, plan_tier, subscription_status) VALUES (?, ?, ?, ?, ?, 'STANDARD', 'active')"
        ).bind(name, email, password, dob, role).run();

        return Response.json({ success: true, message: "Registration successful." }, { headers: corsHeaders });
      }

      // 3. AUTH LOGIN
      if (path === "/api/auth/login" && method === "POST") {
        const { email, password } = await request.json();
        const userQuery = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND password = ?").bind(email, password).all();
        
        if (!userQuery.results || userQuery.results.length === 0) {
          return Response.json({ success: false, error: "Invalid email or password." }, { status: 401, headers: corsHeaders });
        }

        const user = userQuery.results[0];
        const token = btoa(`${user.email}:${Date.now()}`); // Simple token scheme for deployment execution

        return Response.json({
          success: true,
          token,
          name: user.name,
          role: user.role,
          tier: user.plan_tier
        }, { headers: corsHeaders });
      }

      // 4. SESSION VALIDATION
      if (path === "/api/auth/session" && method === "GET") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return Response.json({ success: false }, { status: 401, headers: corsHeaders });
        
        // Extract basic identifier from mock token
        try {
          const decoded = atob(authHeader.replace("Bearer ", ""));
          const email = decoded.split(":")[0];
          const userQuery = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
          
          if (!userQuery.results || userQuery.results.length === 0) {
            return Response.json({ success: false }, { status: 401, headers: corsHeaders });
          }

          const user = userQuery.results[0];
          return Response.json({
            success: true,
            name: user.name,
            email: user.email,
            role: user.role,
            tier: user.plan_tier
          }, { headers: corsHeaders });
        } catch (e) {
          return Response.json({ success: false }, { status: 401, headers: corsHeaders });
        }
      }

      // 5. CHAT STREAMING ROUTE
      if (path === "/api/chat/stream" && method === "POST") {
        const { prompt } = await request.json();
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const replyText = `XASAD AI Brain received your instruction: "${prompt}". Cloudflare edge workers connection is fully active and processing.`;
            for (let i = 0; i < replyText.length; i += 5) {
              controller.enqueue(encoder.encode(replyText.slice(i, i + 5)));
              await new Promise(r => setTimeout(r, 15));
            }
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
        });
      }

      // 6. ADMIN ROUTES
      if (path.startsWith("/admin/")) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });

        if (path === "/admin/log") {
          const { results } = await env.DB.prepare("SELECT name, email, plan_tier, subscription_status, role FROM users").all();
          return Response.json({ success: true, entries: results }, { headers: corsHeaders });
        }

        if (path === "/admin/flags") {
          return Response.json({ success: true, flags: [] }, { headers: corsHeaders });
        }

        if (path === "/admin/chat/stream") {
          const { prompt } = await request.json();
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              const replyText = `[ADMIN BRAIN] Processed administrative command: "${prompt}". Core infrastructure nominal.`;
              controller.enqueue(encoder.encode(replyText));
              controller.close();
            }
          });
          return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }
      }

      return Response.json({ success: false, error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

    } catch (err) {
      return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
