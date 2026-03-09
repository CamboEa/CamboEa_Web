// CamboEA - News persistence (JSON file)
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { NewsArticle } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');

export async function readNewsFromFile(): Promise<NewsArticle[] | null> {
  try {
    const raw = await readFile(NEWS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function writeNewsToFile(articles: NewsArticle[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(NEWS_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}
