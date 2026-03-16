import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        { error: 'គ្មានឯកសារ ឬឯកសារទទេ' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'ឯកសារធំពេក (អតិបរមា 10 MB)' },
        { status: 400 }
      );
    }

    const name = (file.name || '').toLowerCase();
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx = name.endsWith('.docx') || name.endsWith('.doc') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: 'ឯកសារត្រូវតែជា PDF ឬ DOC/DOCX' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (isPdf) {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy?.();
      const text = (result?.text ?? '').trim();
      return NextResponse.json({ content: text || '' });
    }

    if (isDocx) {
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ buffer });
      const html = (result?.value ?? '').trim();
      return NextResponse.json({ content: html || '' });
    }

    return NextResponse.json({ content: '' });
  } catch (e) {
    console.error('extract-content error:', e);
    return NextResponse.json(
      { error: 'អានឯកសារមិនបាន សូមពិនិត្យទម្រង់ឯកសារ' },
      { status: 500 }
    );
  }
}
