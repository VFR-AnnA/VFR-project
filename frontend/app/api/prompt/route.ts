/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T09:26+02:00
 */

import { NextRequest, NextResponse } from 'next/server';

// -------------- Config ---------------------------------
const PROVIDERS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    key: process.env.OPENAI_API_KEY!,
    map: (prompt: string) => ({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    key: process.env.GEMINI_API_KEY!,
    map: (prompt: string) => ({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  },
  // Voeg hier extra providers toe...
} as const;
// --------------------------------------------------------

export async function POST(req: NextRequest) {
  const { prompt, engine = 'openai' } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

  const provider = PROVIDERS[engine as keyof typeof PROVIDERS] ?? PROVIDERS.openai;
  const body = JSON.stringify(provider.map(prompt));

  const res = await fetch(`${provider.url}?key=${provider.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.key}` },
    body,
    next: { revalidate: 0 }, // edge: no cache
  });

  if (!res.ok) {
    const msg = await res.text();
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const data = await res.json();
  // ↩️ Zorg voor uniforme response richting front-end:
  const text =
    engine === 'openai'
      ? data.choices?.[0]?.message?.content
      : data.candidates?.[0]?.content?.parts?.[0]?.text;

  return NextResponse.json({ text });
}