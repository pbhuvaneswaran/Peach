import { writeFile } from 'fs/promises';
import { OUTPUT_DIR } from './utils.js';

function renderMarkdown(report) {
  const lines = [];
  lines.push(`# SEO Rank Drop Diagnosis + Content Gap Report`);
  lines.push(`
Generated: ${report.generatedAt}
`);
  lines.push(`## Input Summary`);
  lines.push(`- Mode: ${report.mode}`);
  lines.push(`- Blog URL: ${report.blogUrl || 'None'}`);
  lines.push(`- Primary Keyword: ${report.primaryKeyword || 'None'}`);
  if (report.productCategory) {
    lines.push(`- Product Category: ${report.productCategory}`);
  }
  if (report.inferredKeyword && report.inferredKeyword !== report.primaryKeyword) {
    lines.push(`- Inferred Keyword: ${report.inferredKeyword}`);
  }

  if (report.audit) {
    lines.push(`
## Page Audit`);
    lines.push(`- Title: ${report.audit.title}`);
    lines.push(`- H1: ${report.audit.h1}`);
    lines.push(`- Description: ${report.audit.description}`);
    lines.push(`- Word count: ${report.audit.wordCount}`);
    lines.push(`- Detected intent: ${report.audit.intent}`);
    lines.push(`- Topic: ${report.audit.topic}`);
    lines.push(`- Inferred keyword: ${report.audit.inferredKeyword}`);
  }

  if (report.rank) {
    lines.push(`
## Rank Check`);
    lines.push(`- Current rank for "${report.primaryKeyword}": ${report.rank}`);
  } else if (report.blogUrl) {
    lines.push(`
## Rank Check`);
    lines.push(`- Current rank for "${report.primaryKeyword}": not in the top SERP results`);
  }

  if (report.competitors?.length) {
    lines.push(`
## Top Competitors`);
    report.competitors.forEach((competitor, index) => {
      lines.push(`${index + 1}. [${competitor.title || competitor.url}](${competitor.url})`);
    });
  }

  if (report.analysis) {
    lines.push(`
## Competitor Analysis`);
    report.analysis.competitorSummaries?.forEach((summary, index) => {
      lines.push(`### Competitor ${index + 1}`);
      lines.push(`- URL: ${summary.url}`);
      lines.push(`- Intent: ${summary.intent || 'unknown'}`);
      lines.push(`- Alignment: ${summary.alignment || 'unknown'}`);
      lines.push(`- Top topics: ${(summary.topTopics || []).join(', ')}`);
      if (summary.uniqueElements?.length) {
        lines.push(`- Unique elements: ${(summary.uniqueElements || []).join('; ')}`);
      }
      if (summary.wordCountEstimate) {
        lines.push(`- Word count estimate: ${summary.wordCountEstimate}`);
      }
      lines.push('');
    });
  }

  if (report.diagnosis) {
    lines.push(`
## Rank Drop Diagnosis`);
    if (report.diagnosis.issues) {
      report.diagnosis.issues.forEach((issue, index) => {
        lines.push(`### Issue ${index + 1}: ${issue.title}`);
        lines.push(`- Reason: ${issue.reason}`);
        lines.push(`- Impact: ${issue.impact}`);
        lines.push('');
      });
    }
    if (report.diagnosis.fixPlan) {
      lines.push(`### Fix Plan`);
      report.diagnosis.fixPlan.forEach((item, index) => {
        lines.push(`${index + 1}. ${item}`);
      });
    }
  }

  if (report.gaps) {
    lines.push(`
## Content Gaps`);
    if (report.gaps.gaps) {
      report.gaps.gaps.forEach((gap, index) => {
        lines.push(`### Gap ${index + 1}: ${gap.gap}`);
        lines.push(`- Score: ${gap.score}`);
        lines.push(`- Why it matters: ${gap.whyItMatters}`);
        lines.push(`- Recommendation: ${gap.recommendation}`);
        lines.push('');
      });
    }
    if (report.gaps.priorityBrief) {
      lines.push(`### Priority Brief`);
      report.gaps.priorityBrief.forEach((item, index) => {
        lines.push(`${index + 1}. ${item}`);
      });
    }
  }

  return lines.join('\n');
}

async function writeReport(report) {
  const markdown = renderMarkdown(report);
  const json = JSON.stringify(report, null, 2);
  await writeFile(`${OUTPUT_DIR}/seo-rank-doctor-report.md`, markdown, 'utf8');
  await writeFile(`${OUTPUT_DIR}/seo-rank-doctor-report.json`, json, 'utf8');
}

export { writeReport };
