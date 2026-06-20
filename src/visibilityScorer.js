function mentionsName(text, name) {
  return text.toLowerCase().includes(name.toLowerCase());
}

function scoreSingleLLM({ answers, brand, competitors }) {
  const allBrands = [brand, ...competitors];
  const scores = Object.fromEntries(allBrands.map((b) => [b, 0]));
  const details = [];

  for (const { question, answer } of answers) {
    const mentions = {};
    for (const b of allBrands) {
      const found = answer ? mentionsName(answer, b) : false;
      if (found) scores[b] += 1;
      mentions[b] = found;
    }
    details.push({ question, answer, mentions });
  }

  const total = answers.length || 1;
  const percentages = Object.fromEntries(
    Object.entries(scores).map(([b, count]) => [b, Math.round((count / total) * 100)])
  );

  return { scores, percentages, details, total };
}

function scoreVisibility({ llmResults, brand, competitors }) {
  const allBrands = [brand, ...competitors];
  const perLLM = {};
  const aggregateScores = Object.fromEntries(allBrands.map((b) => [b, 0]));
  let totalQuestions = 0;

  for (const [llmName, answers] of Object.entries(llmResults)) {
    if (!answers || answers.length === 0) continue;
    const result = scoreSingleLLM({ answers, brand, competitors });
    perLLM[llmName] = result;
    totalQuestions += result.total;
    for (const b of allBrands) {
      aggregateScores[b] += result.scores[b] || 0;
    }
  }

  const aggregatePercentages = Object.fromEntries(
    Object.entries(aggregateScores).map(([b, count]) => [
      b,
      totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
    ])
  );

  const allDetails = Object.values(perLLM).flatMap((r) => r.details);
  const questionSet = [...new Set(allDetails.map((d) => d.question))];

  const gaps = questionSet
    .map((question) => {
      const brandMentionedAnywhere = Object.values(perLLM).some(
        (r) => r.details.find((d) => d.question === question)?.mentions[brand]
      );
      if (brandMentionedAnywhere) return null;
      const competitorsSeen = competitors.filter((c) =>
        Object.values(perLLM).some(
          (r) => r.details.find((d) => d.question === question)?.mentions[c]
        )
      );
      if (competitorsSeen.length === 0) return null;
      return { question, competitorsSeen };
    })
    .filter(Boolean)
    .slice(0, 3);

  return { perLLM, aggregateScores, aggregatePercentages, gaps, totalQuestions };
}

export { scoreVisibility };
