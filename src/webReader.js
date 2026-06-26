import axios from 'axios';
import * as cheerio from 'cheerio';

async function readWebPage(url) {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEOBot/1.0)' },
    maxContentLength: 2 * 1024 * 1024,
  });

  const $ = cheerio.load(response.data);

  $('script, style, nav, header, footer, iframe, noscript, .nav, .header, .footer, .sidebar, .menu, .cookie, .popup').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';

  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push({ tag: el.tagName.toLowerCase(), text });
  });

  const paragraphs = [];
  $('p, li').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40) paragraphs.push(text);
  });

  const fullText = paragraphs.join('\n\n');
  const truncated = fullText.length > 12000 ? fullText.slice(0, 12000) + '...[truncated]' : fullText;

  return { url, title, metaDesc, headings, content: truncated, wordCount: paragraphs.join(' ').split(/\s+/).length };
}

export { readWebPage };
