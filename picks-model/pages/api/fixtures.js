// pages/api/fixtures.js
// Usa la API: api-football186.p.rapidapi.com
// Endpoints: competition_matches_list, matches/{id}/info, matches/{id}/statsv2

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
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// GET /competition_matches_list?date=YYYY-MM-DD&timezone=America/Mexico_City
async function getMatchesByDate(date) {
  const url = `${BASE_URL}/competition_matches_list?date=${date}&timezone=America%2FMexico_City`;
  const data = await fetchJSON(url);
  // La respuesta viene en data.response.items o data.items
  return data?.response?.items || data?.items || [];
}

// GET /matches/{matchId}/info
async function getMatchInfo(matchId) {
  const url = `${BASE_URL}/matches/${matchId}/info`;
  const data = await fetchJSON(url);
  return data?.response?.items || data?.items || null;
}

// GET /matches/{matchId}/statsv2
async function getMatchStats(matchId) {
  const url = `${BASE_URL}/matches/${matchId}/statsv2`;
  const data = await fetchJSON(url);
  return data?.response?.items || data?.items || null;
}

// Calcular strengths desde statsv2
function calcStrengths(stats, isHome) {
  if (!stats) return { attack: 1.0, defence: 1.0 };
  try {
    const side = isHome ? stats.home : stats.away;
    const goals = parseFloat(side?.goals?.total) || 1.35;
    const conceded = parseFloat(side?.goals?.conceded) || 1.35;
    const BASE = 1.35;
    return {
      attack: Math.max(goals / BASE, 0.3),
      defence: Math.max(conceded / BASE, 0.3),
      avgScored: goals,
      avgConceded: conceded,
    };
  } catch {
    return { attack: 1.0, defence: 1.0 };
  }
}

function calcLambdas(homeStats, awayStats) {
  const BASE = 1.35;
  const lambdaH = homeStats.attack * awayStats.defence * BASE;
  const lambdaA = awayStats.attack * homeStats.defence * BASE;
  return {
    lambdaH: Math.max(lambdaH, 0.2),
    lambdaA: Math.max(lambdaA, 0.2),
  };
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
    // 1. Obtener lista de partidos del día
    const matches = await getMatchesByDate(dateStr);

    if (!matches || matches.length === 0) {
      return res.status(200).json({ date: dateStr, fixtures: [], count: 0 });
    }

    // 2. Enriquecer hasta 8 partidos con stats
    const enriched = await Promise.allSettled(
      matches.slice(0, 8).map(async (match) => {
        const matchId = match.id || match.match_id || match.pid;
        if (!matchId) throw new Error("No match ID");

        let stats = null;
        try {
          stats = await getMatchStats(matchId);
        } catch (_) {}

        const homeTeam = match.home_team || match.homeTeam || match.home || {};
        const awayTeam = match.away_team || match.awayTeam || match.away || {};

        const homeStats = calcStrengths(stats, true);
        const awayStats = calcStrengths(stats, false);
        const { lambdaH, lambdaA } = calcLambdas(homeStats, awayStats);

        return {
          id: matchId,
          date: match.date || match.match_date || dateStr,
          status: match.status || match.match_status || "scheduled",
          venue: match.venue || match.stadium || "",
          league: {
            name: match.competition?.name || match.league?.name || match.tournament || "Fútbol",
            round: match.round || match.stage || "",
          },
          home: {
            id: homeTeam.id || homeTeam.team_id || "",
            name: homeTeam.name || homeTeam.team_name || "Local",
            logo: homeTeam.logo || homeTeam.image || "",
            stats: homeStats,
          },
          away: {
            id: awayTeam.id || awayTeam.team_id || "",
            name: awayTeam.name || awayTeam.team_name || "Visitante",
            logo: awayTeam.logo || awayTeam.image || "",
            stats: awayStats,
          },
          score: {
            home: match.score?.home ?? match.home_score ?? null,
            away: match.score?.away ?? match.away_score ?? null,
          },
          lambdaH,
          lambdaA,
          h2h: [],
          rawMatch: match, // para debug
        };
      })
    );

    const fixtures = enriched
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

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
