import axios from 'axios';
import * as cheerio from 'cheerio';

const FETCH_OPTS = {
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEOBot/1.0)' },
  maxContentLength: 3 * 1024 * 1024,
  maxRedirects: 5,
};

const SITEMAP_PATHS = ['/sitemap.xml', '/sitemap_index.xml', '/post-sitemap.xml', '/blog-sitemap.xml'];
const BLOG_INDEX_PATHS = ['/blog', '/resources', '/articles', '/news'];
const MIN_DATED_POSTS = 3;
const MONTHS_WINDOW = 6;

function monthsAgo(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function extractDatesFromSitemapXml(xml) {
  const dates = [];
  const re = /<lastmod>([^<]+)<\/lastmod>/g;
  let match;
  while ((match = re.exec(xml))) {
    const d = new Date(match[1]);
    if (!isNaN(d)) dates.push(d);
  }
  return dates;
}

async function tryFetch(url) {
  try {
    const res = await axios.get(url, FETCH_OPTS);
    return res.data;
  } catch {
    return null;
  }
}

async function analyzeCadenceViaSitemap(baseUrl) {
  for (const path of SITEMAP_PATHS) {
    const xml = await tryFetch(new URL(path, baseUrl).toString());
    if (!xml || typeof xml !== 'string') continue;
    const dates = extractDatesFromSitemapXml(xml);
    if (dates.length >= MIN_DATED_POSTS) return dates;
  }
  return null;
}

function extractDatesFromBlogIndex(html) {
  const $ = cheerio.load(html);
  const dates = [];

  $('time[datetime]').each((_, el) => {
    const d = new Date($(el).attr('datetime'));
    if (!isNaN(d)) dates.push(d);
  });

  if (dates.length < MIN_DATED_POSTS) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const m = href.match(/\/(\d{4})[\/-](\d{1,2})[\/-]/);
      if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
        if (!isNaN(d)) dates.push(d);
      }
    });
  }

  return dates;
}

async function analyzeCadenceViaBlogIndex(baseUrl) {
  for (const path of BLOG_INDEX_PATHS) {
    const html = await tryFetch(new URL(path, baseUrl).toString());
    if (!html || typeof html !== 'string') continue;
    const dates = extractDatesFromBlogIndex(html);
    if (dates.length >= MIN_DATED_POSTS) return dates;
  }
  return null;
}

async function analyzeCadence(url) {
  let baseUrl;
  try {
    baseUrl = new URL(url).origin;
  } catch {
    return { available: false };
  }

  const dates = (await analyzeCadenceViaSitemap(baseUrl)) || (await analyzeCadenceViaBlogIndex(baseUrl));
  if (!dates || dates.length < MIN_DATED_POSTS) return { available: false };

  const cutoff = monthsAgo(new Date(), MONTHS_WINDOW);
  const postsLast6Months = dates.filter((d) => d >= cutoff).length;

  if (postsLast6Months < MIN_DATED_POSTS) return { available: false };

  const avgPerMonth = postsLast6Months / MONTHS_WINDOW;
  return { available: true, postsLast6Months, avgPerMonth: Math.round(avgPerMonth * 10) / 10 };
}

function recommendPace(cadence, planLimit) {
  if (!cadence || !cadence.available) {
    return Math.max(1, Math.ceil(planLimit * 0.5));
  }
  const ramped = Math.ceil(cadence.avgPerMonth * 1.5);
  return Math.min(planLimit, Math.max(ramped, Math.ceil(cadence.avgPerMonth)));
}

export { analyzeCadence, recommendPace };
