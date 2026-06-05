/**
 * POST /api/auth
 * Body: { userId: string, password: string }
 * Validates against env vars: USER_{USERID}_PASSWORD
 * Returns: { ok: true, userId } or { ok: false, error }
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, password } = body as { userId: string; password: string };

  if (!userId || !password) {
    return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
  }

  // Env var format: USER_SAMBHOG_PASSWORD=secret
  const envKey = `USER_${userId.toUpperCase()}_PASSWORD`;
  const envPassword = process.env[envKey];

  if (!envPassword) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 401 });
  }

  if (envPassword !== password) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  // Create simple session token (userId:timestamp base64)
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

  const response = NextResponse.json({ ok: true, userId });
  response.cookies.set('ai-tracker-session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  response.cookies.set('ai-tracker-user', userId, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('ai-tracker-session');
  response.cookies.delete('ai-tracker-user');
  return response;
}
