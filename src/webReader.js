import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchWithFallback(url) {
  const options = {
    timeout: 12000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEOBot/1.0)' },
    maxContentLength: 2 * 1024 * 1024,
    maxRedirects: 5,
  };
  try {
    return await axios.get(url, options);
  } catch (err) {
    // If www. version fails, try without www.
    if (err.code === 'ENOTFOUND' && url.includes('://www.')) {
      const withoutWww = url.replace('://www.', '://');
      return await axios.get(withoutWww, options);
    }
    // If https fails, try http
    if ((err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') && url.startsWith('https://')) {
      return await axios.get(url.replace('https://', 'http://'), options);
    }
    if (err.code === 'ENOTFOUND') {
      throw new Error(`Could not reach "${url}" — check the URL is correct and the site is live`);
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      throw new Error(`The website took too long to respond — try again`);
    }
    throw err;
  }
}

async function readWebPage(url) {
  const response = await fetchWithFallback(url);

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
