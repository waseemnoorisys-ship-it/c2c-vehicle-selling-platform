import "dotenv/config";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { generateC2CUserToken } from "./c2c-auth.service.js";

const C2C_API_BASE_URL =
  process.env.C2C_API_BASE_URL ||
  "https://c2c-vehicle-selling-platform.onrender.com";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 10;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export interface C2CMultipartFetchOptions {
  method?: "POST" | "PUT" | "PATCH";
  body?: Record<string, string | number | boolean | undefined | null>;
  files?: Array<{
    fieldName: string;
    filename: string;
    mimeType: string;
    data: Buffer;
  }>;
  userId?: string;
  role?: "buyer" | "vendor" | "admin";
  requiresAuth?: boolean;
  allowedRoles?: Array<"buyer" | "vendor" | "admin">;
}

export interface C2CMultipartFetchResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string | Record<string, unknown>;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

async function assertSafeUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error(`Invalid image URL: ${urlString}`);
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new Error(`Unsupported image URL protocol: ${url.protocol}`);
  }

  if (url.username || url.password) {
    throw new Error("Image URLs must not contain credentials.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    throw new Error("Private/local image URLs are not allowed.");
  }

  const ipType = isIP(hostname);
  if (ipType === 4 && isPrivateIPv4(hostname)) {
    throw new Error("Private IPv4 addresses are not allowed.");
  }
  if (ipType === 6 && isPrivateIPv6(hostname)) {
    throw new Error("Private IPv6 addresses are not allowed.");
  }

  if (ipType === 0) {
    const addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });

    for (const address of addresses) {
      if (
        (address.family === 4 && isPrivateIPv4(address.address)) ||
        (address.family === 6 && isPrivateIPv6(address.address))
      ) {
        throw new Error(
          "Image URL resolves to a private/local network address.",
        );
      }
    }
  }

  return url;
}

function getFilenameFromUrl(url: URL, index: number): string {
  const pathname = decodeURIComponent(url.pathname);
  const lastSegment = pathname
    .split("/")
    .filter(Boolean)
    .pop();

  if (lastSegment && lastSegment.includes(".")) {
    return lastSegment.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  return `listing-photo-${index + 1}.jpg`;
}

function getMimeType(contentType: string | null): string {
  if (!contentType) {
    throw new Error("Image server did not provide a Content-Type.");
  }

  return contentType.split(";")[0].trim().toLowerCase();
}

export async function downloadImageForMcp(
  initialUrl: string,
  index: number,
): Promise<{
  data: Buffer;
  mimeType: string;
  filename: string;
}> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= 3; redirectCount++) {
    const safeUrl = await assertSafeUrl(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15_000);

    let response: Response;
    try {
      response = await fetch(safeUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "image/jpeg,image/png,image/webp",
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Image download timed out: ${initialUrl}`);
      }
      throw new Error(
        `Failed to download image: ${
          error instanceof Error ? error.message : "Unknown network error"
        }`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error(
          "Image server returned a redirect without a Location header.",
        );
      }

      currentUrl = new URL(location, safeUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `Image download failed with HTTP ${response.status}.`,
      );
    }

    const mimeType = getMimeType(response.headers.get("content-type"));
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(
        `Unsupported image type '${mimeType}'. Only JPEG, PNG and WebP are allowed.`,
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_FILE_SIZE) {
      throw new Error("Image exceeds the 5 MB maximum file size.");
    }

    if (!response.body) {
      throw new Error("Image response contains no body.");
    }

    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let totalSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = Buffer.from(value);
        totalSize += chunk.length;

        if (totalSize > MAX_FILE_SIZE) {
          await reader.cancel();
          throw new Error("Image exceeds the 5 MB maximum file size.");
        }

        chunks.push(chunk);
      }
    } finally {
      reader.releaseLock();
    }

    return {
      data: Buffer.concat(chunks),
      mimeType,
      filename: getFilenameFromUrl(safeUrl, index),
    };
  }

  throw new Error("Too many redirects while downloading image.");
}

export async function fetchC2CBackendMultipart(
  endpoint: string,
  options: C2CMultipartFetchOptions = {},
): Promise<C2CMultipartFetchResult> {
  const {
    method = "POST",
    body = {},
    files = [],
    userId,
    role = "buyer",
    requiresAuth = false,
    allowedRoles,
  } = options;

  if (!C2C_API_BASE_URL) {
    return {
      success: false,
      status: 500,
      error: "C2C_API_BASE_URL is not configured.",
    };
  }

  if (files.length > MAX_FILES) {
    return {
      success: false,
      status: 400,
      error: `Maximum ${MAX_FILES} files are allowed.`,
    };
  }

  const headers: Record<string, string> = {};

  // Do NOT set Content-Type manually.
  // fetch() must generate the multipart boundary.
  if (process.env.MCP_INTERNAL_SECRET) {
    headers["x-mcp-internal-secret"] = process.env.MCP_INTERNAL_SECRET;
  }

  if (requiresAuth) {
    if (!userId) {
      return {
        success: false,
        status: 401,
        error:
          "Authentication required: No authenticated C2C user found in MCP request context.",
      };
    }

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(role)
    ) {
      return {
        success: false,
        status: 403,
        error: `Permission denied: This action requires one of the following roles: [${allowedRoles.join(
          ", ",
        )}]. Current user role is '${role}'.`,
      };
    }

    try {
      const userToken = await generateC2CUserToken(userId, role);
      headers["Authorization"] = `Bearer ${userToken}`;
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: `Failed to sign C2C user token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  const formData = new FormData();

  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }

  for (const file of files) {
    const blob = new Blob([new Uint8Array(file.data)], {
      type: file.mimeType,
    });

    formData.append(file.fieldName, blob, file.filename);
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${C2C_API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      error: `C2C multipart API request failed: ${
        error instanceof Error ? error.message : "Network error"
      }`,
    };
  }
}
