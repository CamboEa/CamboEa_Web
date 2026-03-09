import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'p', 'br', 'div', 'span',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img', 'hr', 'blockquote', 'pre', 'code',
];

const allowedAttributes: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'title'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  '*': ['class', 'style'],
};

export function sanitizeArticleContent(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  });
}

export function isHtmlContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.startsWith('<') && trimmed.includes('>');
}
