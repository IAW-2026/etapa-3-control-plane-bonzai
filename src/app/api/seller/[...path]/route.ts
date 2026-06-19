export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SELLER_API_URL || "https://proyecto-c-seller-bonzai.vercel.app/";
const SERVICE_KEY = process.env.SELLER_SERVICE_KEY || "";

async function handleProxy(req: NextRequest, method: string, pathParams: string[]) {
  const actualPath = pathParams.join("/");
  const search = req.nextUrl.search;
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
  } catch (err) {
    console.error(`[Proxy Error] Failed request to Seller API (${method} ${actualPath}):`, err);
    return NextResponse.json(
      { error: "UPSTREAM_ERROR", message: "No se pudo conectar con el servicio externo." },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, "GET", path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, "POST", path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, "PATCH", path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, "PUT", path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, "DELETE", path);
}
