const BOT_TOKEN = process.env.TELEGRAM_BOT;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface SendNewsNotificationParams {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
  impact?: string;
}

interface SessionOpenNotificationParams {
  name: string;
  nameKm?: string;
  openUtc: number;
  closeUtc: number;
  flag: string;
}

export async function sendNewsToTelegram({
  title,
  excerpt,
  slug,
  image,
  impact,
}: SendNewsNotificationParams): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('Telegram bot token or channel ID not configured, skipping notification.');
    return false;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cambo-ea-web.vercel.app';
  const articleUrl = `${siteUrl}/news/${slug}`;

  const lines = [
    `📰 <b>${escapeHtml(title)}</b>`,
    '',
    escapeHtml(excerpt),
  ];

  if (impact) {
    lines.push('', `📊 ផលប៉ះពាល់: <b>${escapeHtml(impact)}</b>`);
  }

  lines.push(
    '',
    '💡 ចង់ដឹងពីការវិភាគទីផ្សារលម្អិត និងទិសដៅតម្លៃបន្ទាប់?',
    `👉 <a href="${articleUrl}">ចូលមើលការវិភាគពេញលេញនៅ CamboEA</a>`,
  );

  const text = lines.join('\n');

  const inlineKeyboard = {
    inline_keyboard: [[{ text: '📖 អានបន្ថែម', url: articleUrl }]],
  };

  try {
    if (image) {
      const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
      const res = await fetch(`${API}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          photo: imageUrl,
          caption: text,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      });
      if (res.ok) return true;
      console.warn('Telegram sendPhoto failed, falling back to sendMessage:', await res.text());
    }

    const res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: inlineKeyboard,
      }),
    });

    if (!res.ok) {
      console.error('Telegram sendMessage failed:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return false;
  }
}

export async function sendSessionOpenToTelegram({
  name,
  nameKm,
  openUtc,
  closeUtc,
  flag,
}: SessionOpenNotificationParams): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn('Telegram bot token or channel ID not configured, skipping notification.');
    return false;
  }

  const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const utcToIct = (h: number) => (h + 7) % 24;
  const openIct = utcToIct(openUtc);
  const closeIct = utcToIct(closeUtc);
  const overnight = closeUtc > openUtc ? closeIct < openIct : true;
  const ictRange = overnight
    ? `${fmtHour(openIct)} - ${fmtHour(closeIct)} (+1d)`
    : `${fmtHour(openIct)} - ${fmtHour(closeIct)}`;

  const title = nameKm ? `${nameKm} (${name})` : name;
  const text = [
    `🔔 <b>Session Open</b>`,
    '',
    `${flag} <b>${escapeHtml(title)}</b> បើកហើយ`,
    `🕒 ICT: <b>${escapeHtml(ictRange)}</b>`,
    '',
    'គ្រប់គ្រងហានិភ័យ (SL/TP និង position size) មុនចូល order។',
  ].join('\n');

  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      console.error('Telegram session notification failed:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram session notification error:', err);
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
