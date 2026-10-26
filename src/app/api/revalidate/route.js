import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { postPath } from '../../utils/postUrl';

// The page that's actually served lives at the post's canonical URL (often its
// short code), so a conversation id alone doesn't name the right cache entry.
async function canonicalPathFor(conversationId) {
  try {
    const response = await fetch(
      `https://lb2-twitter-api.opensourceprojects.dev/threads/${encodeURIComponent(conversationId)}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const thread = await response.json();
    const rootPost = Array.isArray(thread) ? thread.find(post => !post.parent_id) || thread[0] : null;
    return rootPost ? postPath(rootPost) : null;
  } catch {
    return null;
  }
}

// POST /api/revalidate
// Body: { "path": "/post/<conversation_id>" } OR { "conversationId": "<id>" }
// Busts the ISR cache for the given post page so a regenerated article is
// visible immediately. Guarded by a shared secret so it can't be abused.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let path = body.path;
    if (!path && body.conversationId) {
      path = `/post/${body.conversationId}`;
    }
    if (!path || typeof path !== 'string' || !path.startsWith('/post/')) {
      return NextResponse.json({ success: false, detail: 'A valid `path` starting with /post/ or a `conversationId` is required' }, { status: 400 });
    }

    const token = request.headers.get('x-revalidate-token') || '';
    const expected = process.env.REVALIDATE_TOKEN;
    if (expected && token !== expected) {
      return NextResponse.json({ success: false, detail: 'Unauthorized' }, { status: 401 });
    }

    const paths = [path];
    if (body.conversationId) {
      const canonicalPath = await canonicalPathFor(body.conversationId);
      if (canonicalPath && canonicalPath !== path) paths.push(canonicalPath);
    }
    paths.forEach(p => revalidatePath(p));
    return NextResponse.json({ success: true, revalidated: paths.length === 1 ? path : paths });
  } catch (err) {
    console.error('Revalidate failed:', err);
    return NextResponse.json({ success: false, detail: String(err && err.message || err) }, { status: 500 });
  }
}