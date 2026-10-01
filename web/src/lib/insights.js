// Turns correlation stats into plain-language findings, so a chart's point is
// readable without decoding it. Missing data just yields fewer findings.
const pct = (n, total) => (total ? Math.round((n * 100) / total) : 0);

export function keyFindings(stats) {
  if (!stats?.available) return [];
  const [cat] = stats.categories?.filter((c) => c.name !== 'Other') ?? [];
  const [pair] = stats.pairs ?? [];
  const [adv] = stats.adversaries ?? [];
  const [country] = stats.countries ?? [];

  return [
    cat && { text: `${cat.name} appears in ${pct(cat.count, stats.pulses)}% of correlated pulses`, to: `/correlations?category=${encodeURIComponent(cat.name)}` },
    pair && { text: `${pair.name} co-occur in ${pair.count} pulses`, to: '/correlations' },
    adv && { text: `${adv.name} is the most active adversary (${adv.count} pulses)`, to: `/correlations?adversary=${encodeURIComponent(adv.name)}` },
    country && { text: `${country.name} is the most targeted country (${country.count} pulses)`, to: `/correlations?country=${encodeURIComponent(country.name)}` },
  ].filter(Boolean);
}
