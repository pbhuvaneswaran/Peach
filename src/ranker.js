import { getSearchResults } from './search.js';

function normalizeUrl(urlString) {
  try {
    const url = new URL(urlString);
    url.hash = '';
    url.search = '';
    return url.href.replace(/\/$/, '');
  } catch (error) {
    return urlString;
  }
}

async function getRank(keyword, blogUrl, dummyMode = false) {
  if (!keyword || !blogUrl) {
    return null;
  }

  const searchData = await getSearchResults(keyword, dummyMode);
  const organic = searchData.organic || [];
  const normalizedTarget = normalizeUrl(blogUrl);

  for (let index = 0; index < organic.length; index += 1) {
    const resultUrl = normalizeUrl(organic[index].link || organic[index].url || '');
    if (resultUrl && resultUrl === normalizedTarget) {
      return index + 1;
    }
  }

  return null;
}

export { getRank };
