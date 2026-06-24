import { useState, useEffect, useRef } from "react";
import { dixonColes, calcEdge, buildMarkets } from "../lib/dixonColes";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:    "#050d1a",
  navy2:   "#0a1628",
  navy3:   "#0f2040",
  blue:    "#1a56db",
  blueL:   "#3b82f6",
  blueG:   "linear-gradient(135deg, #1a56db, #0ea5e9)",
  gold:    "#f59e0b",
  green:   "#10b981",
  red:     "#ef4444",
  white:   "#f8fafc",
  gray1:   "#94a3b8",
  gray2:   "#334155",
  gray3:   "#1e2d45",
  border:  "#1e3a5f",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pct = (n) => (n * 100).toFixed(1) + "%";
const fmt = (n) => (n == null ? "—" : Number(n).toFixed(2));

function edgeColor(e) {
  if (e == null) return C.gray1;
  if (e >= 8)  return C.green;
  if (e >= 3)  return C.gold;
  if (e >= 0)  return C.gray1;
  return C.red;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ onLogin, onPlans }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(5,13,26,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", height: 60,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: C.blueG,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>⚽</div>
        <span style={{
          fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px", color: C.white,
        }}>PARZIVAL<span style={{ color: C.blueL }}>·</span>PICKS</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={onPlans} style={{
          background: "none", border: `1px solid ${C.border}`,
          color: C.gray1, borderRadius: 8, padding: "7px 16px",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>Precios</button>
        <button onClick={onLogin} style={{
          background: C.blueG, border: "none",
          color: "#fff", borderRadius: 8, padding: "7px 18px",
          cursor: "pointer", fontSize: 13, fontWeight: 700,
        }}>Iniciar sesión</button>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onCTA, onRecord }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "120px 32px 80px",
      background: `radial-gradient(ellipse 80% 60% at 50% 0%, #0f2040 0%, ${C.navy} 70%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid decorativo */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 680, position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#0f2040", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "5px 14px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.blueL, letterSpacing: 2, textTransform: "uppercase" }}>
            Mundial 2026 · Modelo Dixon-Coles
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900,
          lineHeight: 1.1, margin: "0 0 20px",
          color: C.white, letterSpacing: "-1.5px",
        }}>
          Si vas a jugar,{" "}
          <span style={{
            background: C.blueG,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>juega con cabeza.</span>
        </h1>

        <p style={{
          fontSize: 17, color: C.gray1, lineHeight: 1.7,
          maxWidth: 520, margin: "0 0 36px",
        }}>
          El mejor modelo de predicciones, respaldado con más de 20 años de
          estadísticas. El objetivo no es saber quién gana —
          sino encontrar los picks con más valor real.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={onCTA} style={{
            background: C.blueG, border: "none", color: "#fff",
            borderRadius: 10, padding: "13px 28px",
            cursor: "pointer", fontSize: 15, fontWeight: 700,
            boxShadow: "0 4px 24px #1a56db55",
          }}>Ver picks de hoy</button>
          <button onClick={onRecord} style={{
            background: "none", border: `1px solid ${C.border}`,
            color: C.white, borderRadius: 10, padding: "13px 28px",
            cursor: "pointer", fontSize: 15, fontWeight: 600,
          }}>Ver el récord completo</button>
        </div>
      </div>

      {/* Stats flotantes */}
      <div style={{
        display: "flex", gap: 16, marginTop: 64, flexWrap: "wrap",
      }}>
        {[
          { label: "Aciertos", value: "74%", color: C.green },
          { label: "Picks publicados", value: "85", color: C.blueL },
          { label: "Ganados · Perdidos", value: "63-22", color: C.gold },
        ].map(s => (
          <div key={s.label} style={{
            background: C.navy2, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "16px 24px",
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.gray1, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PICKS DEL DÍA ────────────────────────────────────────────────────────────
function FixtureCard({ fixture, selected, onSelect, isFree, isLocked }) {
  const kickoff = fixture.date
    ? new Date(fixture.date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div onClick={() => !isLocked && onSelect(fixture)} style={{
      background: selected ? C.navy3 : C.navy2,
      border: `1px solid ${selected ? C.blue : C.border}`,
      borderRadius: 12, padding: "14px 18px",
      cursor: isLocked ? "default" : "pointer",
      marginBottom: 8, transition: "all 0.2s",
      opacity: isLocked ? 0.5 : 1,
      position: "relative", overflow: "hidden",
    }}>
      {isLocked && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(5,13,26,0.7)", borderRadius: 12,
          fontSize: 20,
        }}>🔒</div>
      )}
      <div style={{ fontSize: 10, color: C.gray1, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
        {fixture.league?.name} · {kickoff}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{fixture.home?.name}</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.white, marginTop: 2 }}>{fixture.away?.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.blueL, fontWeight: 700 }}>
            xG {fmt(fixture.lambdaH)} – {fmt(fixture.lambdaA)}
          </div>
          {selected && <div style={{
            marginTop: 4, fontSize: 10, background: C.blue,
            color: "#fff", borderRadius: 4, padding: "2px 8px",
            display: "inline-block", fontWeight: 700,
          }}>ANALIZANDO ▼</div>}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({ fixture }) {
  const [odds, setOdds] = useState({ homeWin:"", draw:"", awayWin:"", over15:"", over25:"", over35:"", under25:"", btts:"", homeWinBtts:"", homeOver25:"" });
  const [tab, setTab] = useState("picks");

  const dc = dixonColes(fixture.lambdaH, fixture.lambdaA);
  const markets = buildMarkets(dc);
  const top5 = dc.topScorelines.slice(0, 5);

  return (
    <div style={{
      background: C.navy2, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden", marginTop: 16,
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy3}, ${C.navy2})`,
        padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 10, color: C.blueL, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
          {fixture.league?.name}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 14 }}>
          {fixture.home?.name} <span style={{ color: C.gray2, fontWeight: 300 }}>vs</span> {fixture.away?.name}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: `xG ${fixture.home?.abbr || "LOC"}`, value: fmt(fixture.lambdaH), color: C.green },
            { label: `xG ${fixture.away?.abbr || "VIS"}`, value: fmt(fixture.lambdaA), color: C.red },
            { label: "Local gana", value: pct(dc.pHome), color: C.gold },
          ].map(chip => (
            <div key={chip.label} style={{
              background: C.navy, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "8px 14px", textAlign: "center", flex: 1,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: chip.color }}>{chip.value}</div>
              <div style={{ fontSize: 9, color: C.gray1, textTransform: "uppercase", letterSpacing: 1 }}>{chip.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: C.navy, borderBottom: `1px solid ${C.border}` }}>
        {[["picks","Picks"],["marcadores","Marcadores"],["h2h","H2H"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none",
            color: tab === id ? C.blueL : C.gray1,
            borderBottom: tab === id ? `2px solid ${C.blueL}` : "2px solid transparent",
            padding: "10px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {/* PICKS */}
        {tab === "picks" && (
          <div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 12 }}>
              ✏️ Ingresa las cuotas de tu casa para calcular el edge
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[
                { key: "homeWin", label: "Local gana" },
                { key: "draw", label: "Empate" },
                { key: "awayWin", label: "Visitante" },
                { key: "over25", label: "Over 2.5" },
                { key: "under25", label: "Under 2.5" },
                { key: "btts", label: "Ambos anotan" },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 9, color: C.gray1, marginBottom: 3 }}>{f.label}</div>
                  <input
                    type="number" step="0.01" min="1" placeholder="ej. 1.85"
                    value={odds[f.key]}
                    onChange={e => setOdds(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: "100%", background: C.navy, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.white, padding: "5px 8px",
                      fontSize: 12, boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            {["resultado","goles","combinadas"].map(group => (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: C.gray2, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>
                  {group}
                </div>
                {markets.filter(m => m.group === group).map(m => {
                  const oddsVal = parseFloat(odds[m.key]);
                  const edgeVal = oddsVal > 1 ? calcEdge(m.prob, oddsVal) : null;
                  const isBet = edgeVal != null && edgeVal >= 5;
                  return (
                    <div key={m.key} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px",
                      background: isBet ? "#0a2a1a" : C.navy,
                      border: `1px solid ${isBet ? "#10b98133" : C.border}`,
                      borderRadius: 8, marginBottom: 4,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{m.label}</div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.blueL }}>{pct(m.prob)}</div>
                          <div style={{ fontSize: 9, color: C.gray1 }}>MODELO</div>
                        </div>
                        {edgeVal != null && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: edgeColor(edgeVal) }}>
                              {edgeVal >= 0 ? "+" : ""}{edgeVal.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 9, color: C.gray1 }}>EDGE</div>
                          </div>
                        )}
                        {isBet && (
                          <div style={{
                            background: C.green, color: "#000", borderRadius: 6,
                            padding: "3px 8px", fontSize: 10, fontWeight: 800,
                          }}>BET</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* MARCADORES */}
        {tab === "marcadores" && (
          <div>
            <div style={{ fontSize: 11, color: C.gray1, marginBottom: 12 }}>Top 5 marcadores más probables</div>
            {top5.map((s, i) => {
              const col = s.h > s.a ? C.green : s.h < s.a ? C.red : C.gold;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", background: C.navy,
                  border: `1px solid ${col}22`, borderRadius: 8, marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: col + "22", border: `1px solid ${col}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: col,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.white }}>{s.h} – {s.a}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.blueL }}>{pct(s.p)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* H2H */}
        {tab === "h2h" && (
          <div style={{ color: C.gray1, fontSize: 12, textAlign: "center", padding: "20px 0" }}>
            Sin historial disponible para este partido
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HISTORIAL ────────────────────────────────────────────────────────────────
const HISTORIAL = [
  { fecha: "22 JUN", partido: "Francia vs. Irak", pick: "Francia gana", resultado: "G" },
  { fecha: "22 JUN", partido: "Francia vs. Irak", pick: "Over 2.5", resultado: "G" },
  { fecha: "22 JUN", partido: "Argentina vs. Austria", pick: "Argentina gana", resultado: "G" },
  { fecha: "22 JUN", partido: "Noruega vs. Senegal", pick: "Noruega gana", resultado: "G" },
  { fecha: "22 JUN", partido: "Noruega vs. Senegal", pick: "Over 2.5", resultado: "G" },
  { fecha: "22 JUN", partido: "Portugal vs. Uzbekistán", pick: "Portugal gana", resultado: "G" },
  { fecha: "21 JUN", partido: "España vs. Togo", pick: "España gana", resultado: "G" },
  { fecha: "21 JUN", partido: "Brasil vs. Camerún", pick: "Brasil gana", resultado: "P" },
  { fecha: "21 JUN", partido: "Alemania vs. Chile", pick: "Over 2.5", resultado: "G" },
  { fecha: "21 JUN", partido: "México vs. Irlanda", pick: "México gana", resultado: "P" },
];

function Historial() {
  return (
    <section style={{ background: C.navy, padding: "80px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 2, background: C.blueL }} />
          <span style={{ fontSize: 11, color: C.blueL, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Historial</span>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: C.white, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Todos los picks, ganados y perdidos.
        </h2>
        <p style={{ color: C.gray1, marginBottom: 32, fontSize: 15 }}>
          Esto no se filtra. Cada pick que el modelo marcó aparece aquí con su resultado real.
        </p>

        <div style={{
          background: C.navy2, border: `1px solid ${C.border}`,
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px",
            padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
          }}>
            {["FECHA","PARTIDO","PICK","RESULTADO"].map(h => (
              <div key={h} style={{ fontSize: 10, color: C.gray1, fontWeight: 700, letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {HISTORIAL.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px",
              padding: "12px 20px", borderBottom: i < HISTORIAL.length - 1 ? `1px solid ${C.border}` : "none",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 12, color: C.gray1 }}>{row.fecha}</div>
              <div style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{row.partido}</div>
              <div style={{ fontSize: 13, color: C.gray1 }}>{row.pick}</div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: row.resultado === "G" ? "#10b98122" : "#ef444422",
                  color: row.resultado === "G" ? C.green : C.red,
                  border: `1px solid ${row.resultado === "G" ? "#10b98144" : "#ef444444"}`,
                  borderRadius: 6, padding: "3px 10px",
                }}>
                  {row.resultado === "G" ? "Ganado" : "Perdido"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: C.gray1, marginTop: 12 }}>
          Picks del modelo · 63 ganados · 22 perdidos · del 11 al 22 de junio
        </p>
      </div>
    </section>
  );
}

// ─── PRECIOS ──────────────────────────────────────────────────────────────────
function Precios({ onLogin }) {
  const planes = [
    {
      nombre: "Pick del día",
      precio: "$0",
      sub: "USD",
      desc: "Un partido completo, gratis, todos los días.",
      features: ["1 partido al día", "Análisis completo del modelo", "Sin tarjeta"],
      cta: "Ver pick gratis",
      highlight: false,
    },
    {
      nombre: "Partidos del día",
      precio: "$5.49",
      sub: "USD",
      desc: "Todos los partidos de hoy con herramienta completa.",
      features: ["Todos los partidos del día", "Herramienta completa con tus momios", "Acceso con tu cuenta"],
      cta: "Comprar acceso del día",
      highlight: false,
    },
    {
      nombre: "Torneo completo",
      precio: "$24.99",
      sub: "USD",
      tag: "Más vendido",
      desc: "Acceso a todos los picks de todos los partidos del Mundial.",
      features: ["Todos los partidos del torneo", "Todos los mercados", "Acceso con tu cuenta"],
      cta: "Acceso total",
      highlight: true,
    },
  ];

  return (
    <section id="precios" style={{ background: C.navy2, padding: "80px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 2, background: C.blueL }} />
          <span style={{ fontSize: 11, color: C.blueL, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Precios</span>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: C.white, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Elige cuánto del Mundial quieres cubrir.
        </h2>
        <p style={{ color: C.gray1, marginBottom: 40, fontSize: 15 }}>
          Un pick gratis cada día para que veas cómo funciona. Si quieres más, lo desbloqueas.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {planes.map(plan => (
            <div key={plan.nombre} style={{
              background: plan.highlight ? C.navy3 : C.navy,
              border: `1px solid ${plan.highlight ? C.blue : C.border}`,
              borderRadius: 16, padding: 28, position: "relative",
              boxShadow: plan.highlight ? `0 0 40px #1a56db22` : "none",
            }}>
              {plan.tag && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: C.blueG, color: "#fff", borderRadius: 20,
                  padding: "4px 14px", fontSize: 11, fontWeight: 700,
                }}>{plan.tag}</div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 12 }}>{plan.nombre}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? C.blueL : C.white }}>{plan.precio}</span>
                <span style={{ fontSize: 13, color: C.gray1 }}>{plan.sub}</span>
              </div>
              <p style={{ fontSize: 13, color: C.gray1, marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: C.green, fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 13, color: C.gray1 }}>{f}</span>
                </div>
              ))}
              <button onClick={onLogin} style={{
                width: "100%", marginTop: 24,
                background: plan.highlight ? C.blueG : "none",
                border: plan.highlight ? "none" : `1px solid ${C.border}`,
                color: plan.highlight ? "#fff" : C.white,
                borderRadius: 10, padding: "12px",
                cursor: "pointer", fontSize: 14, fontWeight: 700,
              }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(5,13,26,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.navy2, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 36, width: "100%", maxWidth: 400,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: C.white }}>
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.gray1, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.gray1, marginBottom: 5, fontWeight: 600 }}>CORREO</div>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            style={{
              width: "100%", background: C.navy, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.white, padding: "10px 14px",
              fontSize: 14, boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.gray1, marginBottom: 5, fontWeight: 600 }}>CONTRASEÑA</div>
          <input
            type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%", background: C.navy, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.white, padding: "10px 14px",
              fontSize: 14, boxSizing: "border-box",
            }}
          />
        </div>

        <button style={{
          width: "100%", background: C.blueG, border: "none",
          color: "#fff", borderRadius: 10, padding: "13px",
          cursor: "pointer", fontSize: 15, fontWeight: 700,
          boxShadow: "0 4px 20px #1a56db44",
        }}>
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.gray1 }}>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          {" "}
          <span
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{ color: C.blueL, cursor: "pointer", fontWeight: 700 }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SECCIÓN PICKS DEL DÍA ────────────────────────────────────────────────────
function PicksSection() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/fixtures");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setFixtures(data.fixtures || []);
      setLastUpdate(new Date().toLocaleTimeString("es-MX"));
      if (data.fixtures?.length > 0 && !selected) setSelected(data.fixtures[0]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 5 * 60 * 1000); return () => clearInterval(t); }, []);

  return (
    <section id="picks" style={{ background: C.navy, padding: "80px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 2, background: C.blueL }} />
            <span style={{ fontSize: 11, color: C.blueL, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              Picks del día
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lastUpdate && <span style={{ fontSize: 10, color: C.gray1 }}>Actualizado: {lastUpdate}</span>}
            <button onClick={load} style={{
              background: C.navy2, border: `1px solid ${C.border}`,
              color: C.gray1, borderRadius: 8, padding: "5px 12px",
              cursor: "pointer", fontSize: 11, fontWeight: 600,
            }}>🔄 Actualizar</button>
          </div>
        </div>

        <h2 style={{ fontSize: 32, fontWeight: 900, color: C.white, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        <p style={{ color: C.gray1, marginBottom: 28, fontSize: 14 }}>
          Selecciona un partido para ver el análisis completo
        </p>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: C.gray1 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
            <div>Cargando partidos...</div>
          </div>
        )}
        {error && !loading && (
          <div style={{
            background: "#2d1117", border: "1px solid #ef444433",
            borderRadius: 12, padding: 16, color: C.red, fontSize: 13, marginBottom: 16,
          }}>
            Error: {error}
            <button onClick={load} style={{ marginLeft: 12, background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 11 }}>Reintentar</button>
          </div>
        )}

        {!loading && fixtures.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 10, color: C.gray1, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
                {fixtures.length} partidos hoy
              </div>
              {fixtures.map((f, i) => (
                <FixtureCard
                  key={f.id} fixture={f}
                  selected={selected?.id === f.id}
                  onSelect={setSelected}
                  isFree={false}
                  isLocked={false}
                />
              ))}
            </div>
            <div>
              {selected && <AnalysisPanel fixture={selected} />}
            </div>
          </div>
        )}

        {!loading && !error && fixtures.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: C.gray1 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 6 }}>No hay partidos hoy</div>
            <div style={{ fontSize: 13 }}>Vuelve mañana</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: C.navy, borderTop: `1px solid ${C.border}`,
      padding: "40px 32px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.white, marginBottom: 4 }}>
            PARZIVAL<span style={{ color: C.blueL }}>·</span>PICKS
          </div>
          <div style={{ fontSize: 11, color: C.gray1 }}>Modelo Dixon-Coles · Mundial 2026</div>
        </div>
        <div style={{ fontSize: 11, color: C.gray1, textAlign: "right", lineHeight: 1.7 }}>
          Juega con responsabilidad · Solo mayores de edad<br />
          Los picks son análisis estadístico, no garantía de resultado<br />
          Apuesta solo lo que puedas permitirte perder
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const picksRef = useRef(null);
  const preciosRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: C.navy, minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: C.white }}>
      <Nav onLogin={() => setShowLogin(true)} onPlans={() => document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" })} />
      <Hero
        onCTA={() => document.getElementById("picks")?.scrollIntoView({ behavior: "smooth" })}
        onRecord={() => document.getElementById("historial")?.scrollIntoView({ behavior: "smooth" })}
      />
      <div id="picks"><PicksSection /></div>
      <div id="historial"><Historial /></div>
      <Precios onLogin={() => setShowLogin(true)} />
      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1a56db !important; }
        button:hover { opacity: 0.88; transition: opacity 0.15s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050d1a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
}
