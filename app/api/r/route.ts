// CamboEA - Data proxy (opaque path)

import { NextResponse } from 'next/server';

const SOURCE_URL = 'https://bhub.btechcambodia.com/api/retailer';

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Data error', status: res.status },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
