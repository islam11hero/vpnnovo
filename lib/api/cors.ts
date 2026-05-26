import { NextResponse } from "next/server";

const DEFAULT_ORIGINS = [
  "http://localhost:1420",
  "http://127.0.0.1:1420",
  "tauri://localhost",
  "https://tauri.localhost",
];

function allowedOrigins(): string[] {
  const fromEnv = process.env.WINDOWS_APP_CORS_ORIGINS?.trim();
  const extra = fromEnv
    ? fromEnv.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  return [...DEFAULT_ORIGINS, ...extra];
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-Guest-Order-Id, X-Guest-Device-Hash, Accept",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = allowed[0];
  }

  return headers;
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const headers = corsHeaders(request);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsPreflight(request: Request): NextResponse {
  return withCors(request, new NextResponse(null, { status: 204 }));
}
