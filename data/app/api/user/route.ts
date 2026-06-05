/**
 * User data CRUD:
 * GET  /api/user?userId=xxx  → returns user_{userId}.json
 * POST /api/user             → { userId, data: UserProfile } → saves user_{userId}.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Store user files in /data/users/ directory at project root
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore error if running in an environment where fs is restricted,
    // we'll rely on KV if available.
  }
}

function getUserFilePath(userId: string): string {
  // Sanitize userId to prevent path traversal
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `user_${safe}.json`);
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  let profile = null;

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Use Vercel KV (Redis)
      const res = await fetch(`${process.env.KV_REST_API_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(['GET', `user_${safe}`]),
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.result) {
        profile = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      }
    } else {
      // Use local filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      const raw = await fs.readFile(filePath, 'utf8');
      profile = JSON.parse(raw);
    }
  } catch (err) {
    // Ignore errors here (e.g. file doesn't exist yet)
  }

  if (profile) {
    return NextResponse.json(profile);
  }

  // Return empty profile if not found
  const defaultProfile = {
    userId,
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    completedResources: [],
    schedule: {
      selectedPhase: 'phase-1',
      startDate: null,
      completedDays: {},
      skippedDays: {},
    },
  };
  return NextResponse.json(defaultProfile);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, data } = body as { userId: string; data: unknown };

  if (!userId || !data) {
    return NextResponse.json({ error: 'Missing userId or data' }, { status: 400 });
  }

  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  const profile = { ...(data as Record<string, unknown>), lastSeen: new Date().toISOString() };

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Use Vercel KV (Redis)
      await fetch(`${process.env.KV_REST_API_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(['SET', `user_${safe}`, JSON.stringify(profile)]),
      });
    } else {
      // Use local filesystem
      await ensureDir();
      const filePath = getUserFilePath(userId);
      await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error saving user data:', err);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
