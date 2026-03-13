import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizeArticleContent } from '@/lib/sanitize-article-html';

const BUCKET = 'news_docs';

/**
 * Fetch DOCX from URL (public or via Supabase admin), convert to HTML with mammoth, return sanitized HTML.
 */
export async function getDocxAsHtml(docUrl: string): Promise<string | null> {
  let buffer: Buffer;
  try {
    const res = await fetch(docUrl, { cache: 'no-store' });
    if (!res.ok) {
      if (docUrl.includes('supabase.co') && docUrl.includes(BUCKET)) {
        buffer = await downloadFromSupabaseStorage(docUrl);
      } else {
        return null;
      }
    } else {
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    }
  } catch {
    if (docUrl.includes('supabase.co') && docUrl.includes(BUCKET)) {
      buffer = await downloadFromSupabaseStorage(docUrl);
    } else {
      return null;
    }
  }
  if (!buffer || buffer.length === 0) return null;
  // DOCX files are ZIP archives; guard against non-DOCX/HTML error pages being passed to mammoth.
  // ZIP files start with the magic bytes "PK\x03\x04" (0x50 0x4b 0x03 0x04).
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    console.error('getDocxAsHtml: downloaded file is not a valid DOCX/ZIP, skipping conversion.', {
      url: docUrl,
      firstBytes: Array.from(buffer.subarray(0, 4)),
    });
    return null;
  }
  const mammoth = await import('mammoth');
  const result = await mammoth.convertToHtml({ buffer });
  const html = (result?.value ?? '').trim();
  return html ? sanitizeArticleContent(html) : null;
}

function getStoragePathFromPublicUrl(url: string): string | null {
  const match = url.match(new RegExp(`${BUCKET}/(.+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function downloadFromSupabaseStorage(publicUrl: string): Promise<Buffer> {
  const path = getStoragePathFromPublicUrl(publicUrl);
  if (!path) throw new Error('Invalid Supabase storage URL');
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) throw new Error(error?.message ?? 'Download failed');
  return Buffer.from(await data.arrayBuffer());
}
