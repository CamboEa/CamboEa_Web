// CamboEA - Proxy for retailer sentiment data (bhub.btechcambodia.com)

import { NextResponse } from 'next/server';

const RETAILER_URL = 'https://bhub.btechcambodia.com/api/retailer';

export async function GET() {
  try {
    const res = await fetch(RETAILER_URL, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Retailer API error', status: res.status },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch retailer data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
