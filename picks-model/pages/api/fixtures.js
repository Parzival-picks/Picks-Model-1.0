// pages/api/fixtures.js
// Fetches today's fixtures and team stats from API-Football (RapidAPI)
// Called by the frontend — keeps the API key server-side only

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
  "Content-Type": "application/json",
};

// World Cup 2026 league ID in API-Football
// We also include friendly competitions as fallback
const WC_LEAGUE_ID = 1; // FIFA World Cup
const SEASON = 2026;

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// Get today's date in YYYY-MM-DD
function today() {
  return new Date().toISOString().split("T")[0];
}

// Fetch today's fixtures for a given league
async function getTodayFixtures(leagueId) {
  const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${SEASON}&date=${today()}`;
  const data = await fetchJSON(url);
  return data.response || [];
}

// Fetch team statistics for current season
async function getTeamStats(teamId, leagueId) {
  const url = `${BASE_URL}/teams/statistics?league=${leagueId}&season=${SEASON}&team=${teamId}`;
  const data = await fetchJSON(url);
  return data.response || null;
}

// Fetch head-to-head between two teams (last 10 meetings)
async function getH2H(homeId, awayId) {
  const url = `${BASE_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`;
  const data = await fetchJSON(url);
  return data.response || [];
}

// Calculate attack/defence strength from team stats
function calcStrengths(stats) {
  if (!stats || !stats.goals) {
    return { attack: 1.0, defence: 1.0, xG: 1.35 };
  }

  const played = stats.fixtures?.played?.total || 1;
  const scored = stats.goals?.for?.total?.total || played;
  const conceded = stats.goals?.against?.total?.total || played;

  const BASE_AVG = 1.35;
  const attack = (scored / played) / BASE_AVG;
  const defence = (conceded / played) / BASE_AVG;

  return {
    attack: Math.max(attack, 0.3),
    defence: Math.max(defence, 0.3),
    avgScored: scored / played,
    avgConceded: conceded / played,
    played,
  };
}

// Calculate expected goals for both teams using Dixon-Coles inputs
function calcExpectedGoals(homeStats, awayStats) {
  const BASE_AVG = 1.35;

  const homeAttack = homeStats.attack;
  const homeDefence = homeStats.defence;
  const awayAttack = awayStats.attack;
  const awayDefence = awayStats.defence;

  // lambdaH = home attack × away defence × base avg
  // lambdaA = away attack × home defence × base avg
  // No home advantage for World Cup (neutral ground)
  const lambdaH = homeAttack * awayDefence * BASE_AVG;
  const lambdaA = awayAttack * homeDefence * BASE_AVG;

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

  try {
    // Try World Cup first, then fallback leagues
    let fixtures = await getTodayFixtures(WC_LEAGUE_ID);

    // If no WC fixtures today, try major leagues
    if (fixtures.length === 0) {
      const fallbackLeagues = [2, 3, 39, 140, 135, 78, 61]; // Nations, Int friendlies, PL, LaLiga...
      for (const lid of fallbackLeagues) {
        const fb = await getTodayFixtures(lid);
        fixtures = fixtures.concat(fb);
        if (fixtures.length >= 5) break;
      }
    }

    // Enrich each fixture with team stats + xG
    const enriched = await Promise.allSettled(
      fixtures.slice(0, 8).map(async (fixture) => {
        const homeId = fixture.teams.home.id;
        const awayId = fixture.teams.away.id;
        const leagueId = fixture.league.id;

        try {
          const [homeStats, awayStats, h2h] = await Promise.allSettled([
            getTeamStats(homeId, leagueId),
            getTeamStats(awayId, leagueId),
            getH2H(homeId, awayId),
          ]);

          const hStats = calcStrengths(homeStats.value);
          const aStats = calcStrengths(awayStats.value);
          const { lambdaH, lambdaA } = calcExpectedGoals(hStats, aStats);

          return {
            id: fixture.fixture.id,
            date: fixture.fixture.date,
            status: fixture.fixture.status,
            venue: fixture.fixture.venue?.name,
            league: {
              id: leagueId,
              name: fixture.league.name,
              logo: fixture.league.logo,
              round: fixture.league.round,
            },
            home: {
              id: homeId,
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
              stats: hStats,
            },
            away: {
              id: awayId,
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
              stats: aStats,
            },
            score: fixture.goals,
            lambdaH,
            lambdaA,
            h2h: (h2h.value || []).slice(0, 5).map((m) => ({
              date: m.fixture.date,
              homeTeam: m.teams.home.name,
              awayTeam: m.teams.away.name,
              homeGoals: m.goals.home,
              awayGoals: m.goals.away,
            })),
          };
        } catch (err) {
          // Return fixture without enrichment if stats fail
          return {
            id: fixture.fixture.id,
            date: fixture.fixture.date,
            status: fixture.fixture.status,
            league: { name: fixture.league.name, round: fixture.league.round },
            home: { id: homeId, name: fixture.teams.home.name, logo: fixture.teams.home.logo, stats: { attack: 1.0, defence: 1.0 } },
            away: { id: awayId, name: fixture.teams.away.name, logo: fixture.teams.away.logo, stats: { attack: 1.0, defence: 1.0 } },
            score: fixture.goals,
            lambdaH: 1.35,
            lambdaA: 1.0,
            h2h: [],
          };
        }
      })
    );

    const results = enriched
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    return res.status(200).json({
      date: today(),
      fixtures: results,
      count: results.length,
    });
  } catch (err) {
    console.error("Fixtures API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
