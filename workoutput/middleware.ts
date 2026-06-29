import { type NextRequest, NextResponse } from "next/server";

const REALM = "WorkOutput Preview";

function shouldRequirePassword() {
  if (process.env.PASSWORD_PROTECTION === "false") return false;
  return process.env.VERCEL === "1" || process.env.PASSWORD_PROTECTION === "true";
}

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function missingCredentials() {
  return new NextResponse("Password protection is enabled but credentials are not configured.", {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function hasValidPassword(req: NextRequest, username: string, password: string) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator === -1) return false;

    const providedUsername = decoded.slice(0, separator);
    const providedPassword = decoded.slice(separator + 1);

    return safeEqual(providedUsername, username) && safeEqual(providedPassword, password);
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  if (shouldRequirePassword()) {
    const username = process.env.PASSWORD_PROTECTION_USERNAME;
    const password = process.env.PASSWORD_PROTECTION_PASSWORD;

    if (!username || !password) return missingCredentials();
    if (!hasValidPassword(req, username, password)) return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
