export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SELLER_API_URL || "https://proyecto-c-seller-bonzai.vercel.app/";
const SERVICE_KEY = process.env.SELLER_SERVICE_KEY || "";

async function handleProxy(req: NextRequest, method: string, pathParams: string[]) {
  const actualPath = Array.isArray(pathParams) ? pathParams.join("/") : "";
  const search = req.nextUrl.search || "";
  const upstreamUrl = `${API_URL.replace(/\/$/, "")}/${actualPath}${search}`;

  let body: any = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.text();
    } catch (err) {
      // Empty or invalid body
    }
  }

  try {
    const res = await fetch(upstreamUrl, {
      method,
      headers: {
        "x-service-key": SERVICE_KEY,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { error: "UPSTREAM_ERROR" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`[Proxy Error] Failed request to Seller API (${method} ${actualPath}):`, err);
    return NextResponse.json(
      { error: "UPSTREAM_ERROR", message: err.message || "No se pudo conectar con el servicio externo." },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const path = params?.path || [];
    return await handleProxy(req, "GET", path);
  } catch (err: any) {
    console.error("Error in GET handler:", err);
    return NextResponse.json(
      { error: "GET_HANDLER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const path = params?.path || [];
    return await handleProxy(req, "POST", path);
  } catch (err: any) {
    console.error("Error in POST handler:", err);
    return NextResponse.json(
      { error: "POST_HANDLER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const path = params?.path || [];
    return await handleProxy(req, "PATCH", path);
  } catch (err: any) {
    console.error("Error in PATCH handler:", err);
    return NextResponse.json(
      { error: "PATCH_HANDLER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const path = params?.path || [];
    return await handleProxy(req, "PUT", path);
  } catch (err: any) {
    console.error("Error in PUT handler:", err);
    return NextResponse.json(
      { error: "PUT_HANDLER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const path = params?.path || [];
    return await handleProxy(req, "DELETE", path);
  } catch (err: any) {
    console.error("Error in DELETE handler:", err);
    return NextResponse.json(
      { error: "DELETE_HANDLER_ERROR", message: err.message },
      { status: 500 }
    );
  }
}
