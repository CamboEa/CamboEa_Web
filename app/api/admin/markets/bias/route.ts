import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';

type Bias = 'bullish' | 'bearish' | 'neutral';

type MarketCategory = 'forex' | 'metals';

interface MarketBiasRow {
  symbol: string;
  category: MarketCategory;
  bias: Bias;
}

type MarketBiasDbRow = {
  symbol: string;
  category: string;
  bias: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseBias(value: unknown): Bias {
  return value === 'bullish' || value === 'bearish' || value === 'neutral' ? value : 'neutral';
}

function parseCategory(value: unknown): MarketCategory {
  return value === 'metals' ? 'metals' : 'forex';
}

function parseItems(body: unknown): MarketBiasRow[] {
  if (!isRecord(body)) return [];
  const rawItems = body.items;
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => {
      if (!isRecord(item)) return null;
      const symbol = typeof item.symbol === 'string' ? item.symbol.trim() : '';
      if (!symbol) return null;
      return {
        symbol,
        category: parseCategory(item.category),
        bias: parseBias(item.bias),
      } satisfies MarketBiasRow;
    })
    .filter((v): v is MarketBiasRow => v !== null);
}

// GET /api/admin/markets/bias — list all configured biases for forex & metals
export async function GET(request: NextRequest) {
  try {
    void request;
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('markets_bias')
      .select('symbol, category, bias')
      .in('category', ['forex', 'metals']);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to load market biases' }, { status: 500 });
    }

    const rows: MarketBiasRow[] = (data ?? []).map((row) => {
      const r = row as MarketBiasDbRow;
      return {
        symbol: String(r.symbol),
        category: parseCategory(r.category),
        bias: parseBias(r.bias),
      };
    });

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load market biases' }, { status: 500 });
  }
}

// POST /api/admin/markets/bias — upsert all biases for forex & metals
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const cleaned = parseItems(body);

    if (cleaned.length === 0) {
      return NextResponse.json({ error: 'No items to save' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.from('markets_bias').upsert(
      cleaned.map((item) => ({
        symbol: item.symbol,
        category: item.category,
        bias: item.bias,
      })),
      {
        // require a unique or PK constraint on (symbol, category)
        onConflict: 'symbol,category',
      }
    );

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to save market biases' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save market biases' }, { status: 500 });
  }
}

