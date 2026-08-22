const BANNED_PHRASES = [
  "In today's fast-paced world",
  "It's important to note",
  'Leveraging',
  'In conclusion',
  'To summarize',
  'At the end of the day',
  'Game-changer',
  'Seamlessly',
  'Robust',
  'Cutting-edge',
  'This is where X comes in',
];

const MIN_WORD_COUNT = 900;
const MAX_WORD_COUNT = 2500;
const MAX_BRAND_MENTIONS = 8;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkArticleQuality({ markdown, outline, brand }) {
  const text = markdown || '';
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const wordCountOk = wordCount >= MIN_WORD_COUNT && wordCount <= MAX_WORD_COUNT;

  const lower = text.toLowerCase();
  const bannedFound = BANNED_PHRASES.filter((p) => lower.includes(p.toLowerCase()));

  // Supports both the current { title, description } outline shape and the legacy
  // { h2, h3s } shape still produced by the ad-hoc Growth Actions blog-topic flow.
  const missingHeadings = [];
  for (const section of outline || []) {
    const heading = section.h2 || section.title;
    if (heading && !text.includes(heading)) missingHeadings.push(heading);
    for (const h3 of section.h3s || []) {
      if (!text.includes(h3)) missingHeadings.push(h3);
    }
  }
  const outlineMatchOk = missingHeadings.length === 0;

  const ctaPresent = /^##\s*Ready to/im.test(text);

  let brandMentions = 0;
  if (brand) {
    const re = new RegExp(escapeRegExp(brand.toLowerCase()), 'g');
    brandMentions = (lower.match(re) || []).length;
  }
  const brandStuffingOk = brandMentions <= MAX_BRAND_MENTIONS;

  const passed = wordCountOk && bannedFound.length === 0 && outlineMatchOk && ctaPresent && brandStuffingOk;

  return {
    wordCount, wordCountOk,
    bannedFound, missingHeadings, outlineMatchOk,
    ctaPresent,
    brandMentions, brandStuffingOk,
    passed,
  };
}

export { BANNED_PHRASES, checkArticleQuality };
