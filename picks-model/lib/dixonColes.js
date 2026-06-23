// ─── DIXON-COLES ENGINE ───────────────────────────────────────────────────────
// Dixon & Coles (1997) — Modelling Association Football Scores
// Poisson + low-score correction factor τ (tau)

function tau(x, y, lambda, mu, rho) {
  if (x === 0 && y === 0) return 1 - lambda * mu * rho;
  if (x === 0 && y === 1) return 1 + lambda * rho;
  if (x === 1 && y === 0) return 1 + mu * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

function poisson(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 1; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

export function dixonColes(lambdaH, lambdaA, rho = -0.13, maxGoals = 8) {
  const matrix = [];
  let pHome = 0, pAway = 0, pDraw = 0;
  let pOver25 = 0, pUnder25 = 0, pBtts = 0;
  let pOver15 = 0, pOver35 = 0;

  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      const p =
        tau(h, a, lambdaH, lambdaA, rho) *
        poisson(h, lambdaH) *
        poisson(a, lambdaA);
      matrix[h][a] = Math.max(p, 0);

      if (h > a) pHome += p;
      else if (h < a) pAway += p;
      else pDraw += p;

      if (h + a > 2.5) pOver25 += p;
      else pUnder25 += p;
      if (h + a > 1.5) pOver15 += p;
      if (h + a > 3.5) pOver35 += p;
      if (h > 0 && a > 0) pBtts += p;
    }
  }

  // Top scorelines sorted by probability
  const scorelines = [];
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      scorelines.push({ h, a, p: matrix[h][a] });
    }
  }
  scorelines.sort((a, b) => b.p - a.p);

  return {
    pHome,
    pAway,
    pDraw,
    pOver25,
    pUnder25,
    pOver15,
    pOver35,
    pBtts,
    matrix,
    topScorelines: scorelines.slice(0, 10),
    lambdaH,
    lambdaA,
  };
}

// Convert decimal odds to implied probability
export function impliedProb(odds) {
  if (!odds || odds <= 1) return 0;
  return 1 / odds;
}

// Edge: model probability minus implied probability (percentage points)
export function calcEdge(modelProb, odds) {
  if (!odds || odds <= 1) return null;
  return (modelProb - impliedProb(odds)) * 100;
}

// Build markets from Dixon-Coles output
export function buildMarkets(dc) {
  return [
    {
      key: "homeWin",
      label: "Victoria Local",
      prob: dc.pHome,
      group: "resultado",
    },
    {
      key: "draw",
      label: "Empate",
      prob: dc.pDraw,
      group: "resultado",
    },
    {
      key: "awayWin",
      label: "Victoria Visitante",
      prob: dc.pAway,
      group: "resultado",
    },
    {
      key: "over15",
      label: "Over 1.5 goles",
      prob: dc.pOver15,
      group: "goles",
    },
    {
      key: "over25",
      label: "Over 2.5 goles",
      prob: dc.pOver25,
      group: "goles",
    },
    {
      key: "over35",
      label: "Over 3.5 goles",
      prob: dc.pOver35,
      group: "goles",
    },
    {
      key: "under25",
      label: "Under 2.5 goles",
      prob: dc.pUnder25,
      group: "goles",
    },
    {
      key: "btts",
      label: "Ambos Anotan",
      prob: dc.pBtts,
      group: "goles",
    },
    {
      key: "homeWinBtts",
      label: "Local gana + Ambos Anotan",
      prob: dc.pHome * dc.pBtts * 1.2,
      group: "combinadas",
    },
    {
      key: "homeOver25",
      label: "Local gana + Over 2.5",
      prob: dc.pHome * dc.pOver25 * 1.15,
      group: "combinadas",
    },
  ];
}
