const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const GRAPH_BASE = 'https://graph.facebook.com/v25.0';

interface SendNewsToFacebookParams {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  impact?: string;
}

function buildArticleUrl(slug: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cambo-ea-web.vercel.app';
  return `${siteUrl}/news/${slug}`;
}

function buildMessage({ title, excerpt, impact }: {
  title: string;
  excerpt: string;
  impact?: string;
}): string {
  const parts = [
    `${title}`,
    '',
    excerpt,
  ];

  if (impact) {
    parts.push('', `ផលប៉ះពាល់: ${impact}`);
  }

  parts.push('', 'អានបន្ថែមនៅ CamboEA 👇');
  return parts.join('\n');
}

export async function sendNewsToFacebook({
  title,
  excerpt,
  slug,
  image,
  impact,
}: SendNewsToFacebookParams): Promise<boolean> {
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
    console.warn('Facebook page credentials are not configured, skipping post.');
    return false;
  }

  const articleUrl = buildArticleUrl(slug);
  const message = buildMessage({ title, excerpt, impact });

  try {
    // Prefer /feed link posts so Facebook renders the large link preview card.
    const feedParams = new URLSearchParams({
      message,
      link: articleUrl,
      access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    });
    const feedRes = await fetch(`${GRAPH_BASE}/${FACEBOOK_PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: feedParams.toString(),
    });

    if (feedRes.ok) {
      return true;
    }

    // Fallback to photo post only if feed+link fails.
    if (image) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cambo-ea-web.vercel.app';
      const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      const photoParams = new URLSearchParams({
        url: imageUrl,
        caption: `${message}\n${articleUrl}`,
        access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
      });
      const photoRes = await fetch(`${GRAPH_BASE}/${FACEBOOK_PAGE_ID}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: photoParams.toString(),
      });
      if (photoRes.ok) return true;
      console.error('Facebook feed and photo fallback both failed:', await photoRes.text());
      return false;
    }

    console.error('Facebook feed post failed:', await feedRes.text());
    return false;
  } catch (err) {
    console.error('Facebook post error:', err);
    return false;
  }
}
