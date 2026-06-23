export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const BUYER_API_URL = process.env.BUYER_API_URL || "https://proyecto-c-buyer-bonzai.vercel.app/";
const BUYER_SERVICE_KEY = process.env.BUYER_SERVICE_KEY || "";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handleProxy(req: NextRequest, method: string) {
  const authorizationError = await requireSuperAdmin();

  if (authorizationError) {
    return authorizationError;
  }

  if (!BUYER_SERVICE_KEY) {
    return NextResponse.json(
      { error: "BUYER_SERVICE_KEY_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const actualPath = buildAllowedAdminPath(req.nextUrl.pathname);

  if (!actualPath) {
    return NextResponse.json(
      { error: "BUYER_PROXY_PATH_NOT_ALLOWED" },
      { status: 404 },
    );
  }

  const upstreamUrl = `${BUYER_API_URL.replace(/\/$/, "")}/${actualPath}${req.nextUrl.search}`;
  const body = method === "GET" || method === "HEAD" ? undefined : await req.text();
  const contentType = req.headers.get("content-type") || "application/json";

  try {
    const response = await fetch(upstreamUrl, {
      method,
      headers: {
        "x-api-key": BUYER_SERVICE_KEY,
        "Content-Type": contentType,
        Accept: req.headers.get("accept") || "application/json",
      },
      body,
      cache: "no-store",
    });

    const responseText = await response.text();
    const responseContentType = response.headers.get("content-type") || "application/json";

    if (!responseText) {
      return new NextResponse(null, { status: response.status });
    }

    if (responseContentType.includes("application/json")) {
      return NextResponse.json(JSON.parse(responseText), { status: response.status });
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (error) {
    console.error(`[Buyer Proxy Error] ${method} ${actualPath}`, error);
    return NextResponse.json(
      { error: "BUYER_UPSTREAM_ERROR", message: "No se pudo conectar con el servicio buyer." },
      { status: 502 },
    );
  }
}

async function requireSuperAdmin() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await currentUser();
  const metadata = user?.publicMetadata as Record<string, unknown> | undefined;
  const roles = Array.isArray(metadata?.roles) ? metadata.roles : [];
  const isSuperAdmin = roles.includes("super_admin");

  if (!isSuperAdmin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  return null;
}

function buildAllowedAdminPath(pathname: string) {
  const proxyPrefix = "/api/buyer/";

  if (!pathname.startsWith(proxyPrefix)) {
    return null;
  }

  const rawPath = pathname.slice(proxyPrefix.length);
  const pathSegments = rawPath.split("/");

  if (pathSegments.length < 2 || pathSegments[0] !== "api" || pathSegments[1] !== "admin") {
    return null;
  }

  const safeSegments: string[] = [];

  for (const segment of pathSegments) {
    const decodedSegment = decodePathSegment(segment);

    if (!decodedSegment || isUnsafePathSegment(decodedSegment)) {
      return null;
    }

    safeSegments.push(encodeURIComponent(decodedSegment));
  }

  return safeSegments.join("/");
}

function decodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

function isUnsafePathSegment(segment: string) {
  return segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\");
}

export async function GET(req: NextRequest, context: RouteContext) {
  await context.params;
  return handleProxy(req, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  await context.params;
  return handleProxy(req, "POST");
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  await context.params;
  return handleProxy(req, "PATCH");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  await context.params;
  return handleProxy(req, "PUT");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  await context.params;
  return handleProxy(req, "DELETE");
}
