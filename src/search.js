import axios from 'axios';
import { dummySearchResults } from './dummy.js';

const SERPER_URL = 'https://google.serper.dev/search';

async function getSearchResults(query, dummyMode = false) {
  const apiKey = process.env.SERPER_API_KEY;
  if (dummyMode || !apiKey) {
    if (!apiKey && !dummyMode) {
      console.warn('SERPER_API_KEY is not set. Falling back to dummy search results.');
    }
    return dummySearchResults(query);
  }

  const response = await axios.get(SERPER_URL, {
    headers: {
      'X-API-KEY': apiKey,
    },
    params: {
      q: query,
      hl: 'en',
      gl: 'us',
      num: 15,
    },
    timeout: 20000,
  });

  return response.data;
}

function extractOrganicUrls(searchData) {
  const items = (searchData.organic || []).map((item) => ({
    title: item.title || '',
    snippet: item.snippet || item.description || '',
    url: item.link || item.url || '',
  }));
  return items.filter((item) => item.url).slice(0, 10);
}

async function fetchTopCompetitors(query, blogUrl = null, dummyMode = false) {
  const searchData = await getSearchResults(query, dummyMode);
  const urls = extractOrganicUrls(searchData);
  if (!blogUrl) {
    return urls;
  }

  return urls.filter((item) => {
    try {
      return new URL(item.url).href !== new URL(blogUrl).href;
    } catch (error) {
      return true;
    }
  }).slice(0, 10);
}

export { getSearchResults, fetchTopCompetitors, extractOrganicUrls };
