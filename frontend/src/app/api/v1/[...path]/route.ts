import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_URL}/v1/${targetPath}${url.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((val, key) => {
    // Avoid host header mismatch
    if (key !== 'host' && key !== 'content-length') {
      headers[key] = val;
    }
  });

  try {
    let body: ArrayBuffer | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
    }

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await backendRes.arrayBuffer();
    const resHeaders: Record<string, string> = {};
    backendRes.headers.forEach((val, key) => {
      resHeaders[key] = val;
    });

    return new NextResponse(data, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    console.error('[API PROXY ERROR]', err);
    return NextResponse.json(
      { detail: `Backend unreachable at ${BACKEND_URL}: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
