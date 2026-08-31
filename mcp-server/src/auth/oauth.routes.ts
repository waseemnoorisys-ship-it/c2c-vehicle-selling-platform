import { Router } from "express";

import {
  verifyPkce,
  createAccessToken,
} from "./oauth.token.service.js";

import {
  createAuthorizationCode,
  consumeAuthorizationCode,
  registerOAuthClient,
  getOAuthClient,
} from "./oauth.service.js";

const router = Router();


// ============================================================
// Dynamic Client Registration
//
// POST /oauth/register
// ============================================================

router.post("/register", (req, res) => {
  try {

    const {
      client_name,
      redirect_uris,
      grant_types,
      response_types,
      token_endpoint_auth_method,
      scope,
    } = req.body ?? {};


    // redirect_uris is required
    if (
      !Array.isArray(redirect_uris) ||
      redirect_uris.length === 0
    ) {
      return res.status(400).json({
        error: "invalid_client_metadata",

        error_description:
          "redirect_uris must be a non-empty array",
      });
    }


    // Only authorization-code flow
    if (
      grant_types &&
      !grant_types.includes(
        "authorization_code",
      )
    ) {
      return res.status(400).json({
        error: "invalid_client_metadata",

        error_description:
          "authorization_code grant type is required",
      });
    }


    // Register client
    const client =
      registerOAuthClient({
        clientName:
          typeof client_name === "string"
            ? client_name
            : undefined,

        redirectUris:
          redirect_uris,

        grantTypes:
          Array.isArray(grant_types)
            ? grant_types
            : ["authorization_code"],

        responseTypes:
          Array.isArray(response_types)
            ? response_types
            : ["code"],

        tokenEndpointAuthMethod:
          typeof token_endpoint_auth_method ===
          "string"
            ? token_endpoint_auth_method
            : "none",

        scope:
          typeof scope === "string"
            ? scope
            : "read",
      });


    return res.status(201).json({
      client_id:
        client.clientId,

      client_id_issued_at:
        Math.floor(
          client.createdAt / 1000,
        ),

      redirect_uris:
        client.redirectUris,

      grant_types:
        client.grantTypes,

      response_types:
        client.responseTypes,

      token_endpoint_auth_method:
        client.tokenEndpointAuthMethod,

      scope:
        client.scope,
    });

  } catch (error) {

    console.error(
      "Client registration error:",
      error,
    );

    return res.status(500).json({
      error: "server_error",

      error_description:
        "Client registration failed",
    });
  }
});


// ============================================================
// Token Endpoint
//
// POST /oauth/token
// ============================================================

router.post("/token", (req, res) => {

  try {

    const {
      grant_type,
      code,
      client_id,
      redirect_uri,
      code_verifier,
    } = req.body ?? {};


    if (
      grant_type !==
      "authorization_code"
    ) {

      return res.status(400).json({
        error:
          "unsupported_grant_type",

        error_description:
          "Only 'authorization_code' is supported",
      });
    }


    if (
      !code ||
      !client_id ||
      !redirect_uri ||
      !code_verifier
    ) {

      return res.status(400).json({
        error:
          "invalid_request",

        error_description:
          "Missing required parameters",
      });
    }


    // --------------------------------------------------------
    // Validate registered client
    // --------------------------------------------------------

    const client =
      getOAuthClient(client_id);


    if (!client) {

      return res.status(400).json({
        error:
          "invalid_client",

        error_description:
          "OAuth client is not registered",
      });
    }


    // Verify redirect URI belongs to client
    if (
      !client.redirectUris.includes(
        redirect_uri,
      )
    ) {

      return res.status(400).json({
        error:
          "invalid_grant",

        error_description:
          "Redirect URI is not registered for this client",
      });
    }


    // --------------------------------------------------------
    // Consume authorization code
    // --------------------------------------------------------

    const authCode =
      consumeAuthorizationCode(code);


    if (!authCode) {

      return res.status(400).json({
        error:
          "invalid_grant",

        error_description:
          "Authorization code is invalid or expired",
      });
    }


    // --------------------------------------------------------
    // Validate authorization code
    // --------------------------------------------------------

    if (
      authCode.clientId !==
        client_id ||

      authCode.redirectUri !==
        redirect_uri
    ) {

      return res.status(400).json({
        error:
          "invalid_grant",

        error_description:
          "Client ID or redirect URI does not match",
      });
    }


    // --------------------------------------------------------
    // PKCE verification
    // --------------------------------------------------------

    if (
      !verifyPkce(
        code_verifier,
        authCode.codeChallenge,
      )
    ) {

      return res.status(400).json({
        error:
          "invalid_grant",

        error_description:
          "PKCE verification failed",
      });
    }


    // --------------------------------------------------------
    // Generate access token
    // --------------------------------------------------------

    const {
      accessToken,
      expiresIn,
    } =
      createAccessToken({
        userId:
          authCode.userId,

        scope:
          authCode.scope,

        expiresIn:
          3600,
      });


    return res.status(200).json({

      access_token:
        accessToken,

      token_type:
        "Bearer",

      expires_in:
        expiresIn,

      scope:
        authCode.scope,

    });

  } catch (error) {

    console.error(
      "Token error:",
      error,
    );

    return res.status(500).json({
      error:
        "server_error",

      error_description:
        "Token generation failed",
    });
  }
});


// ============================================================
// Authorization Endpoint
//
// GET /oauth/authorize
// ============================================================

router.get("/authorize", (req, res) => {

  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method,
  } = req.query;


  // ----------------------------------------------------------
  // Validate basic OAuth parameters
  // ----------------------------------------------------------

  if (
    !client_id ||
    !redirect_uri ||
    !code_challenge
  ) {

    return res.status(400).json({
      error:
        "invalid_request",
    });
  }


  // ----------------------------------------------------------
  // Validate client
  // ----------------------------------------------------------

  const client =
    getOAuthClient(
      String(client_id),
    );


  if (!client) {

    return res.status(400).json({
      error:
        "invalid_client",

      error_description:
        "OAuth client is not registered",
    });
  }


  // ----------------------------------------------------------
  // Validate redirect URI
  // ----------------------------------------------------------

  if (
    !client.redirectUris.includes(
      String(redirect_uri),
    )
  ) {

    return res.status(400).json({
      error:
        "invalid_request",

      error_description:
        "redirect_uri is not registered for this client",
    });
  }


  // ----------------------------------------------------------
  // Validate PKCE method
  // ----------------------------------------------------------

  if (
    code_challenge_method !==
    "S256"
  ) {

    return res.status(400).json({
      error:
        "invalid_request",

      error_description:
        "Only S256 PKCE is supported",
    });
  }


  const requestedScope =
    typeof scope === "string"
      ? scope
      : "read";


  // ----------------------------------------------------------
  // Encode OAuth parameters
  // ----------------------------------------------------------

  const encodedParams =
    Buffer.from(
      JSON.stringify({

        clientId:
          client_id,

        redirectUri:
          redirect_uri,

        scope:
          requestedScope,

        state:
          typeof state === "string"
            ? state
            : "",

        codeChallenge:
          code_challenge,

      }),
    ).toString("base64url");


  // ----------------------------------------------------------
  // Login page
  // ----------------------------------------------------------

  return res.send(`

    <!DOCTYPE html>

    <html>

      <head>

        <title>
          C2C Vehicle MCP Login
        </title>

        <style>

          body {

            font-family:
              system-ui,
              -apple-system,
              sans-serif;

            background:
              linear-gradient(
                135deg,
                #667eea 0%,
                #764ba2 100%
              );

            min-height:
              100vh;

            display:
              flex;

            align-items:
              center;

            justify-content:
              center;

            margin:
              0;
          }


          .container {

            background:
              white;

            padding:
              40px;

            border-radius:
              8px;

            box-shadow:
              0 10px 40px
              rgba(0, 0, 0, 0.2);

            width:
              100%;

            max-width:
              400px;
          }


          h2 {

            color:
              #333;

            margin-bottom:
              10px;
          }


          .subtitle {

            color:
              #666;

            margin-bottom:
              30px;

            font-size:
              14px;
          }


          .form-group {

            margin-bottom:
              20px;
          }


          label {

            display:
              block;

            margin-bottom:
              8px;

            color:
              #333;

            font-weight:
              500;
          }


          input {

            width:
              100%;

            padding:
              10px;

            border:
              1px solid #ddd;

            border-radius:
              4px;

            font-size:
              14px;
          }


          input:focus {

            outline:
              none;

            border-color:
              #667eea;
          }


          button {

            width:
              100%;

            padding:
              12px;

            background:
              linear-gradient(
                135deg,
                #667eea 0%,
                #764ba2 100%
              );

            color:
              white;

            border:
              none;

            border-radius:
              4px;

            font-size:
              16px;

            font-weight:
              600;

            cursor:
              pointer;
          }


          button:hover {

            opacity:
              0.9;
          }

        </style>

      </head>


      <body>

        <div class="container">

          <h2>
            🚗 C2C Vehicle MCP
          </h2>

          <p class="subtitle">
            Authorize access to your vehicle data
          </p>


          <form
            method="POST"
            action="/oauth/authorize/login"
          >

            <input
              type="hidden"
              name="oauth"
              value="${encodedParams}"
            />


            <div class="form-group">

              <label
                for="email"
              >
                Email
              </label>


              <input
                id="email"
                type="email"
                name="email"
                required
              />

            </div>


            <div class="form-group">

              <label
                for="password"
              >
                Password
              </label>


              <input
                id="password"
                type="password"
                name="password"
                required
              />

            </div>


            <button
              type="submit"
            >
              Sign In & Authorize
            </button>

          </form>

        </div>

      </body>

    </html>

  `);
});


// ============================================================
// OAuth Login
//
// POST /oauth/authorize/login
// ============================================================

router.post(
  "/authorize/login",
  (req, res) => {

    try {

      const {
        email,
        password,
        oauth,
      } = req.body ?? {};


      if (
        !email ||
        !password ||
        !oauth
      ) {

        return res.status(400).send(
          "Missing required fields",
        );
      }


      const oauthData =
        JSON.parse(
          Buffer.from(
            oauth,
            "base64url",
          ).toString("utf8"),
        );


      const {
        clientId,
        redirectUri,
        scope,
        state,
        codeChallenge,
      } =
        oauthData;


      // ------------------------------------------------------
      // Validate client again
      // ------------------------------------------------------

      const client =
        getOAuthClient(
          clientId,
        );


      if (!client) {

        return res.status(400).send(
          "OAuth client is not registered",
        );
      }


      if (
        !client.redirectUris.includes(
          redirectUri,
        )
      ) {

        return res.status(400).send(
          "Invalid redirect URI",
        );
      }


      // ------------------------------------------------------
      // Create authorization code
      // ------------------------------------------------------

      const code =
        createAuthorizationCode({

          clientId,

          redirectUri,

          userId:
            email,

          scope,

          codeChallenge,

        });


      // ------------------------------------------------------
      // Redirect to OAuth client
      // ------------------------------------------------------

      const callbackUrl =
        new URL(
          redirectUri,
        );


      callbackUrl.searchParams.set(
        "code",
        code,
      );


      if (state) {

        callbackUrl.searchParams.set(
          "state",
          state,
        );
      }


      return res.redirect(
        callbackUrl.toString(),
      );

    } catch (error) {

      console.error(
        "Login error:",
        error,
      );

      return res.status(500).send(
        "Authorization failed",
      );
    }
  },
);


export default router;