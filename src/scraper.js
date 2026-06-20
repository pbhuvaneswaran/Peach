import axios from 'axios';
import * as cheerio from 'cheerio';

function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

async function scrapePage(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'SEO Rank Doctor Bot/1.0 (+https://github.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(response.data);
  $('script,noscript,style,iframe,svg,meta,link,nav,footer,form').remove();

  const title = normalizeText($('title').first().text() || '');
  const description = normalizeText($('meta[name="description"]').attr('content') || '');
  const h1 = normalizeText($('h1').first().text() || '');

  const headings = [];
  $('h1, h2, h3').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    headings.push({ tag, text: normalizeText($(el).text() || '') });
  });

  const bodyText = normalizeText($('body').text() || '');
  const textSnippet = bodyText.slice(0, 4000);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  return {
    url,
    title,
    description,
    h1,
    headings,
    bodyText,
    textSnippet,
    wordCount,
  };
}

export { scrapePage, normalizeText };
