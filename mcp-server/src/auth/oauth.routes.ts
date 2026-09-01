import { Router } from "express";
import {
  verifyPkce,
  createAccessToken,
} from "./oauth.token.service.js";
import {
  createOAuthSession,
  getOAuthSession,
  authenticateOAuthSession,
  consumeAuthorizationCode,
  registerOAuthClient,
  getOAuthClient,
} from "./oauth.service.js";
import { verifyC2CUserToken } from "./c2c-auth.service.js";

const router = Router();

// ============================================================
// Dynamic Client Registration (RFC 7591)
// POST /oauth/register
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const {
      client_name,
      redirect_uris,
      grant_types,
      response_types,
      token_endpoint_auth_method,
      scope,
    } = req.body ?? {};

    // redirect_uris is required and must be an array
    if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({
        error: "invalid_client_metadata",
        error_description: "redirect_uris must be a non-empty array of valid URIs",
      });
    }

    // Only authorization_code flow is supported
    if (grant_types && !grant_types.includes("authorization_code")) {
      return res.status(400).json({
        error: "invalid_client_metadata",
        error_description: "authorization_code grant type is required",
      });
    }

    const client = await registerOAuthClient({
      clientName: typeof client_name === "string" ? client_name : undefined,
      redirectUris: redirect_uris,
      grantTypes: Array.isArray(grant_types) ? grant_types : ["authorization_code"],
      responseTypes: Array.isArray(response_types) ? response_types : ["code"],
      tokenEndpointAuthMethod:
        typeof token_endpoint_auth_method === "string"
          ? token_endpoint_auth_method
          : "none",
      scope: typeof scope === "string" ? scope : "read write",
    });

    return res.status(201).json({
      client_id: client.clientId,
      client_name: client.clientName,
      client_id_issued_at: Math.floor(new Date(client.createdAt).getTime() / 1000),
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      response_types: client.responseTypes,
      token_endpoint_auth_method: client.tokenEndpointAuthMethod,
      scope: client.scope,
    });
  } catch (error) {
    console.error("Client registration error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Client registration failed",
    });
  }
});

// ============================================================
// Authorization Endpoint
// GET /oauth/authorize
// ============================================================
router.get("/authorize", async (req, res) => {
  try {
    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      redirect_to_frontend,
    } = req.query;

    if (!client_id || !redirect_uri || !code_challenge) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required OAuth parameters (client_id, redirect_uri, code_challenge)",
      });
    }

    if (response_type && response_type !== "code") {
      return res.status(400).json({
        error: "unsupported_response_type",
        error_description: "Only 'code' response_type is supported",
      });
    }

    if (code_challenge_method !== "S256") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Only 'S256' code_challenge_method is supported",
      });
    }

    // Validate registered client and redirect_uri
    const client = await getOAuthClient(String(client_id));
    if (!client) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "OAuth client is not registered",
      });
    }

    if (!client.redirectUris.includes(String(redirect_uri))) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "redirect_uri is not registered for this client",
      });
    }

    // Create persistent OAuth session in MongoDB
    const session = await createOAuthSession({
      clientId: String(client_id),
      redirectUri: String(redirect_uri),
      scope: typeof scope === "string" ? scope : "read write",
      state: typeof state === "string" ? state : "",
      codeChallenge: String(code_challenge),
      codeChallengeMethod: "S256",
    });

    const publicBaseUrl =
      process.env.MCP_PUBLIC_URL || "https://myth-ceremony-avenging.ngrok-free.dev";
    const callbackUrl = `${publicBaseUrl}/oauth/authorize/callback`;

    // If explicit frontend redirect requested (e.g. for local frontend dev)
    if (redirect_to_frontend === "true" || redirect_to_frontend === "1") {
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:3000";
      const loginRedirectUrl = new URL(`${frontendUrl}/login`);
      loginRedirectUrl.searchParams.set("mcp_session", session.sessionId);
      loginRedirectUrl.searchParams.set("mcp_callback", callbackUrl);
      return res.redirect(loginRedirectUrl.toString());
    }

    // Direct seamless login UI on the MCP server
    return res.redirect(`/oauth/login?session=${encodeURIComponent(session.sessionId)}`);
  } catch (error) {
    console.error("OAuth authorize error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "OAuth authorization failed",
    });
  }
});

// ============================================================
// Direct / Embedded C2C Login Page UI
// GET /oauth/login
// ============================================================
router.get("/login", async (req, res) => {
  const sessionId = req.query.session as string;
  if (!sessionId) {
    return res.status(400).send("Missing session parameter.");
  }

  const session = await getOAuthSession(sessionId);
  if (!session || session.status !== "pending") {
    return res.status(400).send("Invalid or expired OAuth session.");
  }

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:3000";
  const publicBaseUrl =
    process.env.MCP_PUBLIC_URL || "https://myth-ceremony-avenging.ngrok-free.dev";
  const webLoginUrl = `${frontendUrl}/login?mcp_session=${encodeURIComponent(
    session.sessionId,
  )}&mcp_callback=${encodeURIComponent(`${publicBaseUrl}/oauth/authorize/callback`)}`;

  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sign In - C2C Vehicle MCP</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f8fafc;
            padding: 20px;
          }
          .card {
            background: rgba(30, 41, 59, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 36px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          .logo {
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 6px;
            background: linear-gradient(135deg, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
          }
          .subtitle {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-bottom: 24px;
          }
          .form-group {
            margin-bottom: 18px;
          }
          label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 6px;
          }
          input {
            width: 100%;
            padding: 12px 14px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            color: #f8fafc;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
          }
          input:focus {
            border-color: #38bdf8;
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
          }
          .btn-primary {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: opacity 0.2s;
            margin-top: 6px;
          }
          .btn-primary:hover { opacity: 0.95; }
          .divider {
            display: flex;
            align-items: center;
            margin: 20px 0;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #334155;
          }
          .divider span { padding: 0 10px; }
          .btn-secondary {
            display: block;
            text-align: center;
            width: 100%;
            padding: 11px;
            background: transparent;
            border: 1px solid #475569;
            border-radius: 8px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .btn-secondary:hover {
            background: #334155;
            color: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="text-align: center;">
            <span class="badge">Model Context Protocol • OAuth 2.1</span>
          </div>
          <h1 class="logo">🚗 C2C Vehicle Platform</h1>
          <p class="subtitle">Log in with your existing C2C account to connect</p>

          <form method="POST" action="/oauth/authorize/direct-login">
            <input type="hidden" name="session_id" value="${sessionId}" />

            <div class="form-group">
              <label for="email">C2C Email Address</label>
              <input id="email" type="email" name="email" placeholder="name@c2c.com" required />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" type="password" name="password" placeholder="••••••••" required />
            </div>

            <button type="submit" class="btn-primary">Sign In & Authorize</button>
          </form>

          <div class="divider"><span>OR</span></div>

          <a href="${webLoginUrl}" class="btn-secondary">
            Sign In on Local Web App (Port 3000) →
          </a>
        </div>
      </body>
    </html>
  `);
});

// ============================================================
// Direct Login Submission
// POST /oauth/authorize/direct-login
// ============================================================
router.post("/authorize/direct-login", async (req, res) => {
  try {
    const { session_id, email, password } = req.body ?? {};

    if (!session_id || !email || !password) {
      return res.status(400).send("Missing required fields (session_id, email, password).");
    }

    const session = await getOAuthSession(session_id);
    if (!session || session.status !== "pending") {
      return res.status(400).send("Invalid or expired OAuth session.");
    }

    // Authenticate with C2C Backend Login API
    const backendUrl =
      process.env.C2C_API_BASE_URL ||
      "https://c2c-vehicle-selling-platform.onrender.com";

    const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json().catch(() => null);

    if (!loginResponse.ok || !loginData?.data?.user) {
      const errorMsg = loginData?.message || "Invalid C2C email or password.";
      return res.status(401).send(`
        <div style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="background: #1e293b; padding: 36px; border-radius: 12px; border: 1px solid #ef4444; max-width: 400px; width: 100%;">
            <h2 style="color: #f87171; margin-bottom: 12px;">Authentication Failed</h2>
            <p style="color: #94a3b8; margin-bottom: 24px; font-size: 14px;">${errorMsg}</p>
            <a href="/oauth/login?session=${encodeURIComponent(
              session_id,
            )}" style="display: inline-block; padding: 10px 20px; background: #38bdf8; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: 600;">← Try Again</a>
          </div>
        </div>
      `);
    }

    const user = loginData.data.user;

    // Associate C2C userId and role with session and issue authorization code
    const authResult = await authenticateOAuthSession({
      sessionId: session.sessionId,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role || "buyer",
    });

    if (!authResult) {
      return res.status(500).send("Failed to issue authorization code.");
    }

    // Redirect to client's redirect URI
    const redirectUrl = new URL(session.redirectUri);
    redirectUrl.searchParams.set("code", authResult.authorizationCode);
    if (session.state) {
      redirectUrl.searchParams.set("state", session.state);
    }

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Direct login error:", error);
    return res.status(500).send("Authentication failed due to internal error.");
  }
});

// ============================================================
// Authorization Continuation Callback
// GET /oauth/authorize/callback & GET /oauth/callback
// ============================================================
async function handleOAuthCallback(req: any, res: any) {
  try {
    const sessionId = (req.query.session || req.query.mcp_session) as string;
    const token = req.query.token as string;

    if (!sessionId || !token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing session or token parameter in authorization callback.",
      });
    }

    const session = await getOAuthSession(sessionId);
    if (!session) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "OAuth session not found or has expired.",
      });
    }

    if (session.status !== "pending") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: `OAuth session is already ${session.status}.`,
      });
    }

    // Verify the C2C JWT token from the C2C login API
    const userPayload = await verifyC2CUserToken(token);

    // Associate C2C userId & role with OAuth session and generate authorization code
    const authResult = await authenticateOAuthSession({
      sessionId: session.sessionId,
      userId: userPayload.userId,
      userRole: userPayload.role,
    });

    if (!authResult) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Failed to authenticate OAuth session.",
      });
    }

    // Redirect back to ChatGPT / client OAuth callback URL
    const callbackRedirectUrl = new URL(session.redirectUri);
    callbackRedirectUrl.searchParams.set("code", authResult.authorizationCode);

    if (session.state) {
      callbackRedirectUrl.searchParams.set("state", session.state);
    }

    return res.redirect(callbackRedirectUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: `Authentication callback failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}

router.get("/authorize/callback", handleOAuthCallback);
router.get("/callback", handleOAuthCallback);

// ============================================================
// Token Endpoint (RFC 6749 / RFC 7636 PKCE)
// POST /oauth/token
// ============================================================
router.post("/token", async (req, res) => {
  try {
    const {
      grant_type,
      code,
      client_id,
      redirect_uri,
      code_verifier,
    } = req.body ?? {};

    if (grant_type !== "authorization_code") {
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Only 'authorization_code' grant type is supported",
      });
    }

    if (!code || !client_id || !redirect_uri || !code_verifier) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required parameters (code, client_id, redirect_uri, code_verifier)",
      });
    }

    // Validate registered client
    const client = await getOAuthClient(String(client_id));
    if (!client) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "OAuth client is not registered",
      });
    }

    if (!client.redirectUris.includes(String(redirect_uri))) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Redirect URI is not registered for this client",
      });
    }

    // Consume single-use authorization code atomically
    const session = await consumeAuthorizationCode(String(code));
    if (!session) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code is invalid, expired, or has already been consumed",
      });
    }

    // Validate matching client and redirect URI
    if (
      session.clientId !== String(client_id) ||
      session.redirectUri !== String(redirect_uri)
    ) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Client ID or redirect URI does not match the authorization request",
      });
    }

    // Verify PKCE S256
    if (!verifyPkce(String(code_verifier), session.codeChallenge)) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "PKCE verification failed: code_verifier does not match code_challenge",
      });
    }

    if (!session.userId) {
      return res.status(500).json({
        error: "server_error",
        error_description: "Session is missing an associated C2C user ID",
      });
    }

    // Generate and persist MCP Bearer Access Token in MongoDB
    const { accessToken, expiresIn } = await createAccessToken({
      clientId: session.clientId,
      userId: session.userId.toString(),
      userEmail: session.userEmail || undefined,
      role: (session.userRole as "buyer" | "vendor" | "admin") || "buyer",
      scope: session.scope,
      expiresIn: 3600,
    });

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: session.scope,
    });
  } catch (error) {
    console.error("OAuth token endpoint error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Token generation failed",
    });
  }
});

export default router;