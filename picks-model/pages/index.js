import { useState, useEffect } from "react";
import { dixonColes, calcEdge, buildMarkets } from "../lib/dixonColes";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const pct = (n) => (n * 100).toFixed(1) + "%";
const fmt = (n) => (n == null ? "—" : Number(n).toFixed(2));

function edgeColor(e) {
  if (e == null) return "#555";
  if (e >= 8) return "#00ff88";
  if (e >= 3) return "#ffd700";
  if (e >= 0) return "#aaaaaa";
  return "#ff6b6b";
}

function formDot(r) {
  const c = r === "W" ? "#00ff88" : r === "D" ? "#ffd700" : "#ff6b6b";
  return (
    <span
      key={r}
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: c,
        marginRight: 3,
      }}
    />
  );
}

// ─── FIXTURE CARD ─────────────────────────────────────────────────────────────
function FixtureCard({ fixture, selected, onSelect }) {
  const kickoff = new Date(fixture.date).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => onSelect(fixture)}
      style={{
        background: selected ? "#0d2a1e" : "#161b22",
        border: `1px solid ${selected ? "#00ff8866" : "#21262d"}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        marginBottom: 8,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#666",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {fixture.league.name} · {fixture.league.round} · {kickoff}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{fixture.home.name}</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>
            {fixture.away.name}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              color: "#00d4ff",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            xG {fmt(fixture.lambdaH)} – {fmt(fixture.lambdaA)}
          </div>
          {selected && (
            <span
              style={{
                fontSize: 10,
                background: "#00ff8822",
                color: "#00ff88",
                borderRadius: 4,
                padding: "2px 6px",
                border: "1px solid #00ff8844",
              }}
            >
              ANALIZANDO ▼
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYSIS PANEL ───────────────────────────────────────────────────────────
function AnalysisPanel({ fixture }) {
  const [odds, setOdds] = useState({
    homeWin: "",
    draw: "",
    awayWin: "",
    over15: "",
    over25: "",
    over35: "",
    under25: "",
    btts: "",
    homeWinBtts: "",
    homeOver25: "",
  });
  const [tab, setTab] = useState("picks");

  const dc = dixonColes(fixture.lambdaH, fixture.lambdaA);
  const markets = buildMarkets(dc);

  // Sort scorelines
  const top5 = dc.topScorelines.slice(0, 5);

  const tabs = [
    { id: "picks", label: "Picks" },
    { id: "marcadores", label: "Marcadores" },
    { id: "h2h", label: "H2H" },
  ];

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d1117, #161b22)",
          padding: "16px 16px 12px",
          borderBottom: "1px solid #21262d",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          {fixture.league.name}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          {fixture.home.name}{" "}
          <span style={{ color: "#444", fontWeight: 300 }}>vs</span>{" "}
          {fixture.away.name}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              label: `xG ${fixture.home.name.split(" ")[0]}`,
              value: fmt(fixture.lambdaH),
              color: "#00ff88",
            },
            {
              label: `xG ${fixture.away.name.split(" ")[0]}`,
              value: fmt(fixture.lambdaA),
              color: "#ff6b6b",
            },
            {
              label: "Prob. local gana",
              value: pct(dc.pHome),
              color: "#ffd700",
            },
          ].map((chip) => (
            <div
              key={chip.label}
              style={{
                background: "#0d1117",
                border: `1px solid ${chip.color}33`,
                borderRadius: 8,
                padding: "6px 12px",
                textAlign: "center",
                flex: 1,
              }}
            >
              <div
                style={{ fontSize: 16, fontWeight: 800, color: chip.color }}
              >
                {chip.value}
              </div>
              <div
                style={{ fontSize: 9, color: "#666", textTransform: "uppercase" }}
              >
                {chip.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #21262d",
          background: "#0d1117",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              color: tab === t.id ? "#00ff88" : "#666",
              borderBottom: tab === t.id ? "2px solid #00ff88" : "2px solid transparent",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {/* ── PICKS TAB ── */}
        {tab === "picks" && (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#ffd700",
                marginBottom: 12,
                fontWeight: 700,
              }}
            >
              ✏️ Ingresa las cuotas de tu casa para calcular el edge
            </div>

            {/* Odds inputs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {[
                { key: "homeWin", label: "Local gana" },
                { key: "draw", label: "Empate" },
                { key: "awayWin", label: "Visitante" },
                { key: "over25", label: "Over 2.5" },
                { key: "under25", label: "Under 2.5" },
                { key: "btts", label: "Ambos anotan" },
              ].map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 9, color: "#666", marginBottom: 3 }}>
                    {f.label}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="ej. 1.85"
                    value={odds[f.key]}
                    onChange={(e) =>
                      setOdds((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      background: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: 6,
                      color: "#e8e8e8",
                      padding: "5px 8px",
                      fontSize: 12,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Markets */}
            {["resultado", "goles", "combinadas"].map((group) => (
              <div key={group} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 6,
                    fontWeight: 700,
                  }}
                >
                  {group}
                </div>
                {markets
                  .filter((m) => m.group === group)
                  .map((m) => {
                    const oddsVal = parseFloat(odds[m.key]);
                    const edgeVal = oddsVal > 1 ? calcEdge(m.prob, oddsVal) : null;
                    const isBet = edgeVal != null && edgeVal >= 5;

                    return (
                      <div
                        key={m.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          background: isBet ? "#0d2a1e" : "#0d1117",
                          border: `1px solid ${isBet ? "#00ff8833" : "#21262d"}`,
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            {m.label}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div style={{ textAlign: "right" }}>
                            <div
                              style={{ fontSize: 13, fontWeight: 800, color: "#00d4ff" }}
                            >
                              {pct(m.prob)}
                            </div>
                            <div style={{ fontSize: 9, color: "#555" }}>MODELO</div>
                          </div>
                          {edgeVal != null && (
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: edgeColor(edgeVal),
                                }}
                              >
                                {edgeVal >= 0 ? "+" : ""}
                                {edgeVal.toFixed(1)}%
                              </div>
                              <div style={{ fontSize: 9, color: "#555" }}>EDGE</div>
                            </div>
                          )}
                          {isBet && (
                            <div
                              style={{
                                background: "#00ff88",
                                color: "#000",
                                borderRadius: 6,
                                padding: "3px 8px",
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              BET
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        )}

        {/* ── MARCADORES TAB ── */}
        {tab === "marcadores" && (
          <div>
            <div
              style={{ fontSize: 11, color: "#666", marginBottom: 12 }}
            >
              Top 5 marcadores más probables según el modelo
            </div>
            {top5.map((s, i) => {
              const result =
                s.h > s.a
                  ? "local"
                  : s.h < s.a
                  ? "visitante"
                  : "empate";
              const color =
                result === "local"
                  ? "#00ff88"
                  : result === "visitante"
                  ? "#ff6b6b"
                  : "#ffd700";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "#0d1117",
                    border: `1px solid ${color}33`,
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: color + "22",
                        border: `1px solid ${color}55`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>
                      {s.h} – {s.a}
                    </span>
                    <span style={{ fontSize: 10, color: "#555" }}>
                      {fixture.home.name.split(" ")[0]} –{" "}
                      {fixture.away.name.split(" ")[0]}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        height: 4,
                        width: `${(s.p / top5[0].p) * 60}px`,
                        background: color,
                        borderRadius: 2,
                      }}
                    />
                    <span
                      style={{ fontSize: 15, fontWeight: 800, color: "#00d4ff" }}
                    >
                      {pct(s.p)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Score matrix mini */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                Matriz de probabilidades (0-4)
              </div>
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    marginBottom: 3,
                    paddingLeft: 32,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((a) => (
                    <div
                      key={a}
                      style={{
                        width: 40,
                        textAlign: "center",
                        fontSize: 9,
                        color: "#ff6b6b",
                        fontWeight: 700,
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
                {[0, 1, 2, 3, 4].map((h) => (
                  <div
                    key={h}
                    style={{ display: "flex", gap: 3, marginBottom: 3 }}
                  >
                    <div
                      style={{
                        width: 28,
                        fontSize: 9,
                        color: "#00ff88",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {h}
                    </div>
                    {[0, 1, 2, 3, 4].map((a) => {
                      const p = dc.matrix[h] && dc.matrix[h][a] ? dc.matrix[h][a] : 0;
                      const maxVal = dc.matrix[2] && dc.matrix[2][0] ? dc.matrix[2][0] : 0.15;
                      const intensity = Math.min(p / (maxVal || 0.15), 1);
                      const col =
                        h > a
                          ? `rgba(0,255,136,${intensity * 0.8 + 0.05})`
                          : h < a
                          ? `rgba(255,107,107,${intensity * 0.8 + 0.05})`
                          : `rgba(255,215,0,${intensity * 0.8 + 0.05})`;
                      return (
                        <div
                          key={a}
                          style={{
                            width: 40,
                            height: 28,
                            background: col,
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            color: intensity > 0.5 ? "#fff" : "#aaa",
                          }}
                        >
                          {(p * 100).toFixed(1)}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 8,
                    fontSize: 9,
                  }}
                >
                  <span style={{ color: "#00ff88" }}>■ Local</span>
                  <span style={{ color: "#ff6b6b" }}>■ Visitante</span>
                  <span style={{ color: "#ffd700" }}>■ Empate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── H2H TAB ── */}
        {tab === "h2h" && (
          <div>
            {fixture.h2h && fixture.h2h.length > 0 ? (
              fixture.h2h.map((m, i) => {
                const homeWon = m.homeGoals > m.awayGoals;
                const draw = m.homeGoals === m.awayGoals;
                const color = homeWon
                  ? "#00ff88"
                  : draw
                  ? "#ffd700"
                  : "#ff6b6b";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom:
                        i < fixture.h2h.length - 1
                          ? "1px solid #21262d"
                          : "none",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#555" }}>
                      {new Date(m.date).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      {m.homeTeam.split(" ").slice(0, 2).join(" ")}{" "}
                      <span style={{ color }}>
                        {m.homeGoals} – {m.awayGoals}
                      </span>{" "}
                      {m.awayTeam.split(" ").slice(0, 2).join(" ")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "#555", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
                Sin historial de enfrentamientos disponible
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadFixtures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fixtures");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setFixtures(data.fixtures || []);
      setLastUpdate(new Date().toLocaleTimeString("es-MX"));
      if (data.fixtures?.length > 0 && !selected) {
        setSelected(data.fixtures[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadFixtures, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e8e8e8",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0d1117",
          borderBottom: "1px solid #21262d",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <div
            style={{
              background: "linear-gradient(90deg, #00ff88, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: -0.5,
            }}
          >
            ⚽ PICKS·MODEL
          </div>
          <div style={{ fontSize: 10, color: "#555" }}>
            Dixon-Coles · Análisis estadístico
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={loadFixtures}
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              color: "#e8e8e8",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            🔄 Actualizar
          </button>
          {lastUpdate && (
            <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>
              Actualizado: {lastUpdate}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {/* Date pill */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 16,
            fontSize: 12,
            color: "#666",
            background: "#161b22",
            border: "1px solid #21262d",
            borderRadius: 20,
            padding: "6px 16px",
            display: "inline-block",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          📅{" "}
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#555",
            }}
          >
            <div
              style={{
                fontSize: 32,
                marginBottom: 12,
                animation: "spin 1s linear infinite",
              }}
            >
              ⚽
            </div>
            <div>Cargando partidos del día...</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#2d1117",
              border: "1px solid #ff6b6b44",
              borderRadius: 10,
              padding: 16,
              color: "#ff6b6b",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <strong>Error al cargar fixtures:</strong> {error}
            <br />
            <button
              onClick={loadFixtures}
              style={{
                marginTop: 8,
                background: "#ff6b6b",
                color: "#000",
                border: "none",
                borderRadius: 6,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* No fixtures */}
        {!loading && !error && fixtures.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#555",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              No hay partidos hoy
            </div>
            <div style={{ fontSize: 12 }}>
              Vuelve mañana o prueba con otra fecha
            </div>
          </div>
        )}

        {/* Fixtures list */}
        {!loading && fixtures.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              {fixtures.length} partido{fixtures.length !== 1 ? "s" : ""} hoy
              — selecciona para analizar
            </div>
            {fixtures.map((f) => (
              <FixtureCard
                key={f.id}
                fixture={f}
                selected={selected?.id === f.id}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}

        {/* Analysis panel */}
        {selected && !loading && <AnalysisPanel fixture={selected} />}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 0 8px",
            fontSize: 9,
            color: "#333",
            lineHeight: 1.8,
          }}
        >
          Análisis estadístico · No constituye consejo financiero · +18 · Juega con
          responsabilidad
          <br />
          Modelo Dixon-Coles (1997) · Datos: API-Football via RapidAPI
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #00ff88 !important; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
