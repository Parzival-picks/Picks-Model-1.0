// pages/api/fixtures.js
// API: api-football186.p.rapidapi.com
// Estructura confirmada: response.items[] = competiciones, cada una con matches[]
// Cada match tiene: mid, teams.home/away.tname/logo, result.home/away, datestart, status

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
  "Content-Type": "application/json",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function getMatchesByDate(date) {
  const url = `${BASE_URL}/competition_matches_list?date=${date}&per_page=200&paged=1`;
  const data = await fetchJSON(url);
  const competitions = data?.response?.items || [];

  const allMatches = [];
  for (const comp of competitions) {
    for (const match of (comp.matches || [])) {
      allMatches.push({
        ...match,
        competition: {
          id: comp.cid,
          name: comp.cname,
          logo: comp.logo,
        },
      });
    }
  }
  return allMatches;
}

function calcLambdas(homeAbbr, awayAbbr) {
  const BASE = 1.35;
  return {
    lambdaH: parseFloat((BASE * 1.10).toFixed(3)),
    lambdaA: parseFloat((BASE * 0.90).toFixed(3)),
  };
}

function parseStatus(status) {
  if (status === "2") return "FT";
  if (status === "1") return "LIVE";
  return "NS";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const dateStr = today();

  try {
    const rawMatches = await getMatchesByDate(dateStr);

    if (!rawMatches || rawMatches.length === 0) {
      return res.status(200).json({ date: dateStr, fixtures: [], count: 0 });
    }

    const fixtures = rawMatches.slice(0, 15).map((match) => {
      const home = match.teams?.home || {};
      const away = match.teams?.away || {};
      const { lambdaH, lambdaA } = calcLambdas(home.abbr, away.abbr);

      return {
        id: match.mid,
        date: match.datestart,
        status: parseStatus(match.status),
        venue: "",
        league: {
          name: match.competition?.name || "Fútbol",
          logo: match.competition?.logo || "",
          round: match.round || "",
        },
        home: {
          id: home.tid || "",
          name: home.tname || home.fullname || "Local",
          abbr: home.abbr || "",
          logo: home.logo || "",
          stats: { attack: 1.1, defence: 1.0 },
        },
        away: {
          id: away.tid || "",
          name: away.tname || away.fullname || "Visitante",
          abbr: away.abbr || "",
          logo: away.logo || "",
          stats: { attack: 0.9, defence: 1.1 },
        },
        score: {
          home: match.result?.home ?? null,
          away: match.result?.away ?? null,
          p1: match.periods?.p1 || null,
          p2: match.periods?.p2 || null,
        },
        lambdaH,
        lambdaA,
        h2h: [],
      };
    });

    return res.status(200).json({
      date: dateStr,
      fixtures,
      count: fixtures.length,
    });

  } catch (err) {
    console.error("Fixtures error:", err);
    return res.status(500).json({ error: err.message });
  }
}
