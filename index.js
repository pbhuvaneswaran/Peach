import { parseInput } from './src/input.js';
import { auditPage } from './src/auditor.js';
import { getSearchResults, fetchTopCompetitors } from './src/search.js';
import { getRank } from './src/ranker.js';
import { analyzePage } from './src/analyser.js';
import { diagnosePage } from './src/diagnostics.js';
import { findContentGaps } from './src/gapfinder.js';
import { writeReport } from './src/reporter.js';
import { ensureOutputFolder } from './src/utils.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

async function runDiagnosis({ blogUrl, keyword, dummyMode = false }) {
  await ensureOutputFolder();

  const report = {
    mode: blogUrl && keyword ? 'MODE_C' : blogUrl ? 'MODE_A' : 'MODE_B',
    blogUrl: blogUrl || null,
    primaryKeyword: keyword || null,
    productCategory: null,
    inferredKeyword: null,
    audit: null,
    rank: null,
    competitors: [],
    analysis: null,
    diagnosis: null,
    gaps: null,
    generatedAt: new Date().toISOString(),
  };

  if (blogUrl) {
    const audit = await auditPage(blogUrl);
    report.audit = audit;
    report.inferredKeyword = audit.inferredKeyword;
    if (!keyword) {
      report.primaryKeyword = audit.inferredKeyword;
    }
  }

  const effectiveKeyword = keyword || report.inferredKeyword;
  if (!effectiveKeyword) {
    throw new Error('Keyword could not be determined.');
  }

  const topCompetitors = await fetchTopCompetitors(effectiveKeyword, blogUrl, dummyMode);
  report.competitors = topCompetitors;

  if (blogUrl) {
    report.rank = await getRank(effectiveKeyword, blogUrl, dummyMode);
  }

  const analysis = await analyzePage({
    keyword: effectiveKeyword,
    blogAudit: report.audit,
    competitorUrls: topCompetitors.map((item) => item.url),
    dummyMode,
  });
  report.analysis = analysis;

  if (blogUrl) {
    report.diagnosis = await diagnosePage({
      keyword: effectiveKeyword,
      blogAudit: report.audit,
      rank: report.rank,
      competitorAnalysis: analysis.competitorSummaries,
      dummyMode,
    });
  }

  report.gaps = await findContentGaps({
    keyword: effectiveKeyword,
    blogAudit: report.audit,
    competitorAnalysis: analysis.competitorSummaries,
    dummyMode,
  });

  await writeReport(report);
  return report;
}

async function runCLI() {
  const input = parseInput();
  if (input.dummyMode) {
    console.warn('Dummy mode enabled: using placeholder data.');
  }

  const report = await runDiagnosis({
    blogUrl: input.blogUrl,
    keyword: input.primaryKeyword,
    dummyMode: input.dummyMode,
  });

  console.log(`Report written to output/seo-rank-doctor-report.md and output/seo-rank-doctor-report.json`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runCLI().catch((error) => {
    console.error('ERROR:', error.message || error);
    process.exit(1);
  });
}

export { runDiagnosis };
