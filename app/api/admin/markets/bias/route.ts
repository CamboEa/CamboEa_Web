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

// GET /api/admin/markets/bias — list all configured biases for forex & metals
export async function GET(_request: NextRequest) {
  try {
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

    const rows: MarketBiasRow[] = (data ?? []).map((row: any) => ({
      symbol: String(row.symbol),
      category: row.category === 'metals' ? 'metals' : 'forex',
      bias: (row.bias === 'bullish' || row.bias === 'bearish' ? row.bias : 'neutral') as Bias,
    }));

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load market biases' }, { status: 500 });
  }
}

interface PostBody {
  items?: MarketBiasRow[];
}

// POST /api/admin/markets/bias — upsert all biases for forex & metals
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as PostBody;
    const items = Array.isArray(body.items) ? body.items : [];

    const cleaned: MarketBiasRow[] = items
      .map((item) => {
        const symbol = String(item.symbol || '').trim();
        const category: MarketCategory = item.category === 'metals' ? 'metals' : 'forex';
        const bias: Bias =
          item.bias === 'bullish' || item.bias === 'bearish' || item.bias === 'neutral'
            ? item.bias
            : 'neutral';
        return { symbol, category, bias };
      })
      .filter((item) => !!item.symbol);

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

