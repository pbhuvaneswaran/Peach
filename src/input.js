import dotenv from 'dotenv';

dotenv.config();

const USAGE = `Usage:
  node index.js --url "https://yourblog.com/article" --keyword "your primary keyword"
  node index.js --url "https://yourblog.com/article"
  node index.js --keyword "your primary keyword"
  node index.js --category "project management software"
  node index.js --keyword "your primary keyword" --dummy

Flags:
  --url        Your blog article URL
  --keyword    Primary keyword to evaluate
  --category   Product category or keyword category to research
  --dummy      Run in dummy mode with placeholder search and analysis
  --dry-run    Alias for --dummy
`;

function parseInput() {
  const argv = process.argv.slice(2);
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--url' || flag === '--keyword' || flag === '--category') {
      args[flag.substring(2)] = argv[i + 1];
      i += 1;
    } else if (flag === '--dummy' || flag === '--dry-run') {
      args[flag.substring(2)] = true;
    }
  }

  const blogUrl = args.url || process.env.YOUR_BLOG_URL || null;
  const primaryKeyword = args.keyword || process.env.PRIMARY_KEYWORD || null;
  const productCategory = args.category || process.env.PRODUCT_CATEGORY || null;

  const hasUrl = Boolean(blogUrl);
  const hasKeywordOrCategory = Boolean(primaryKeyword || productCategory);
  const dummyMode = Boolean(args.dummy || args['dry-run'] || process.env.DUMMY_MODE === '1');

  if (!hasUrl && !hasKeywordOrCategory) {
    console.log(USAGE);
    process.exit(1);
  }

  let mode;
  if (hasUrl && !hasKeywordOrCategory) {
    mode = 'MODE_A';
  } else if (!hasUrl && hasKeywordOrCategory) {
    mode = 'MODE_B';
  } else {
    mode = 'MODE_C';
  }

  return {
    mode,
    blogUrl,
    primaryKeyword,
    productCategory,
    dummyMode,
  };
}

export { parseInput };
