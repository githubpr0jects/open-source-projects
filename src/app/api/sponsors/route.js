import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://lb2-twitter-api.opensourceprojects.dev';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    if (searchParams.get('active') !== null) params.set('active', searchParams.get('active'));
    if (searchParams.get('shuffle')) params.set('shuffle', 'true');
    if (searchParams.get('random')) params.set('random', 'true');

    const res = await fetch(`${BACKEND_URL}/api/active-sponsors?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend sponsors fetch failed:', res.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sponsors from backend', details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying sponsors GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('id');

    if (!sponsorId) {
      return NextResponse.json(
        { success: false, error: 'Sponsor ID is required' },
        { status: 400 }
      );
    }

    // Increment views on the sponsored_links tracking entry (in-house analytics).
    // The sponsorId is the slug used as the sponsored_links key.
    // Forward the viewer's context so the sponsor analytics page can break
    // impressions down by device, country and the page the card was shown on.
    const placement = searchParams.get('placement') || '';
    const viewerHeaders = {};
    const userAgent = request.headers.get('user-agent');
    const clientIp = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim();
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
    if (userAgent) viewerHeaders['x-osp-user-agent'] = userAgent;
    if (clientIp) viewerHeaders['x-osp-client-ip'] = clientIp;
    if (country) viewerHeaders['x-osp-country'] = country;
    const res = await fetch(`${BACKEND_URL}/api/sponsored-links/${encodeURIComponent(sponsorId)}/view?placement=${encodeURIComponent(placement)}`, {
      method: 'PUT',
      headers: viewerHeaders,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend sponsored-links view increment failed:', res.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to record view', details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying sponsors PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record view', details: error.message },
      { status: 500 }
    );
  }
}