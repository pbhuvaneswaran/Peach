function dummyVisibilityResult({ brand = 'Acme', competitors = ['Competitor A', 'Competitor B'], category = 'your category' } = {}) {
  const allBrands = [brand, ...competitors];
  const baseScores = [4, 7, 9];
  const total = 10;

  const scores = Object.fromEntries(allBrands.map((b, i) => [b, baseScores[i] ?? 3]));
  const percentages = Object.fromEntries(allBrands.map((b, i) => [b, [40, 70, 90][i] ?? 30]));

  const questions = [
    `What is the best ${category} for small teams?`,
    `Which ${category} has the best Gmail integration?`,
    `Top ${category} tools compared`,
    `Best ${category} for agencies`,
    `Which ${category} offers shared inbox features?`,
    `${category} alternatives to Zendesk`,
    `How to choose the right ${category}`,
    `What ${category} do B2B SaaS companies use?`,
    `Best free ${category} options`,
    `${category} with the best reporting features`,
  ];

  const gaps = [
    {
      question: `Which ${category} has the best Gmail integration?`,
      competitorsSeen: competitors.slice(0, 2),
    },
    {
      question: `Best ${category} for agencies`,
      competitorsSeen: competitors.slice(0, 1),
    },
    {
      question: `${category} with the best reporting features`,
      competitorsSeen: competitors,
    },
  ];

  const details = questions.map((question, i) => {
    const mentions = Object.fromEntries(allBrands.map((b, bi) => [b, Math.random() > (bi === 0 ? 0.6 : 0.3)]));
    return { question, answer: `Demo answer for: ${question}`, mentions };
  });

  const gapRecommendations = [
    {
      question: gaps[0].question,
      recommendation: `Publish a dedicated landing page that directly answers this question with screenshots, a comparison table, and customer proof — this is the format AI engines pull from.`,
    },
    {
      question: gaps[1].question,
      recommendation: `Create a case study featuring an agency customer — metrics, workflow, time saved. Agencies trust peer evidence over feature lists.`,
    },
    {
      question: gaps[2].question,
      recommendation: `Add a "Reporting & Analytics" section to your features page with screenshots of real dashboards. LLMs pull from pages with specific, visual evidence.`,
    },
  ];

  return {
    brand,
    competitors,
    category,
    questions,
    isDemo: true,
    visibility: { scores, percentages, details, gaps, total },
    gapRecommendations,
  };
}

export { dummyVisibilityResult };
