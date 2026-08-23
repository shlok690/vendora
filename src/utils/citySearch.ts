/**
 * Ranked matching for the location picker.
 *
 * A plain `includes` filter is no help when someone types "banglore", "puna", or
 * "Bombay" — so matches are scored, best first: exact, then prefix, then any word
 * start, then substring, then a short edit distance for typos, then a loose
 * subsequence. Queries are matched against the city name, its former/common name,
 * and the state, so "kerala" lists every Kerala city and "bangalore" still finds
 * Bengaluru.
 */

/** Names people still type for cities that have since been renamed. */
const ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  banaras: 'Varanasi',
  benaras: 'Varanasi',
  baroda: 'Vadodara',
  bombay: 'Mumbai',
  calcutta: 'Kolkata',
  calicut: 'Kozhikode',
  cochin: 'Kochi',
  gurgaon: 'Gurugram',
  hubballi: 'Hubli',
  madras: 'Chennai',
  mangalore: 'Mangaluru',
  mysore: 'Mysuru',
  'new delhi': 'Delhi',
  panjim: 'Panaji',
  pondicherry: 'Puducherry',
  poona: 'Pune',
  prayagraj: 'Allahabad',
  trichy: 'Tiruchirappalli',
  trivandrum: 'Thiruvananthapuram',
  vizag: 'Visakhapatnam',
};

const ALIASES_BY_CITY = Object.entries(ALIASES).reduce<Record<string, string[]>>((acc, [alias, canonical]) => {
  const key = canonical.toLowerCase();
  (acc[key] ||= []).push(alias);
  return acc;
}, {});

const cityPart = (entry: string) => entry.split(',')[0].trim().toLowerCase();

/** Levenshtein, bounded — the strings here are single city names. */
export const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
};

/** Are the characters of `query` present in `text`, in order? ("hyd" → "hyderabad") */
const isSubsequence = (query: string, text: string): boolean => {
  let i = 0;
  for (let j = 0; j < text.length && i < query.length; j++) {
    if (text[j] === query[i]) i++;
  }
  return i === query.length;
};

/** Lower is better; null when this handle doesn't match at all. */
const scoreHandle = (q: string, handle: string): number | null => {
  if (handle === q) return 0;
  if (handle.startsWith(q)) return 1;

  // Typo tolerance, tightened for short queries so "pun" doesn't fuzzily match
  // half the list.
  const allowance = q.length <= 4 ? 1 : 2;

  const distance = editDistance(q, handle);
  if (distance <= allowance) return 4 + distance;

  // Same, against the start of the name, so "bangalor" reaches "bangalore".
  const headDistance = editDistance(q, handle.slice(0, q.length));
  if (headDistance <= allowance) return 6 + headDistance;

  if (q.length >= 3 && isSubsequence(q, handle)) return 9;

  return null;
};

/** Lower score = better match. Returns null when the entry shouldn't be shown. */
export const scoreCity = (query: string, entry: string): number | null => {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const full = entry.toLowerCase();
  const name = cityPart(entry);

  const scores: number[] = [];

  const direct = scoreHandle(q, name);
  if (direct !== null) scores.push(direct);

  // A former name is a real match, just half a step behind the current one.
  for (const alias of ALIASES_BY_CITY[name] || []) {
    const aliasScore = scoreHandle(q, alias);
    if (aliasScore !== null) scores.push(aliasScore + 0.5);
  }

  // State / any other word in the entry ("kerala", "uttar").
  if (full.split(/[\s,]+/).some((word) => word.startsWith(q))) scores.push(2);
  if (full.includes(q)) scores.push(3);

  return scores.length ? Math.min(...scores) : null;
};

export const rankCities = (query: string, cities: string[], limit = 120): string[] => {
  // No query — the whole list, so it can simply be scrolled.
  if (!query.trim()) return cities.slice(0, Math.max(limit, cities.length));

  const scored: { entry: string; score: number }[] = [];
  for (const entry of cities) {
    const score = scoreCity(query, entry);
    if (score !== null) scored.push({ entry, score });
  }
  scored.sort((a, b) => a.score - b.score || a.entry.length - b.entry.length || a.entry.localeCompare(b.entry));
  return scored.slice(0, limit).map((s) => s.entry);
};
