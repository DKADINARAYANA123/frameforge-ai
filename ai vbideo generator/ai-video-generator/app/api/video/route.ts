import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const API = 'https://api.replicate.com/v1';

function auth() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('Server setup incomplete: add REPLICATE_API_TOKEN in Vercel Project Settings → Environment Variables.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspect_ratio, prompt_optimizer } = await req.json();
    if (typeof prompt !== 'string' || prompt.trim().length < 8 || prompt.length > 1500) {
      return NextResponse.json({ error: 'Enter a prompt between 8 and 1500 characters.' }, { status: 400 });
    }
    const response = await fetch(`${API}/models/minimax/video-01/predictions`, {
      method: 'POST',
      headers: { ...auth(), Prefer: 'wait=1' },
      body: JSON.stringify({ input: { prompt: prompt.trim(), aspect_ratio: ['16:9','9:16','1:1'].includes(aspect_ratio) ? aspect_ratio : '16:9', prompt_optimizer: Boolean(prompt_optimizer) } }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.detail || data?.error || 'Video provider rejected the request. Check your API token and model access.' }, { status: response.status >= 500 ? 502 : response.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id || !/^[a-zA-Z0-9_-]{5,100}$/.test(id)) return NextResponse.json({ error: 'A valid prediction ID is required.' }, { status: 400 });
    const response = await fetch(`${API}/predictions/${encodeURIComponent(id)}`, { headers: auth(), cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.detail || 'Could not retrieve prediction.' }, { status: response.status >= 500 ? 502 : response.status });
    return NextResponse.json({ id: data.id, status: data.status, output: data.output, error: data.error });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, { status: 500 });
  }
}
