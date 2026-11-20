// Public-Facing Visual Plumbing Manual ("For Dummies" Definitive Edition)
// Zero code, zero binaries, simple English, proper buildable names, multi-angle labeled SVG diagrams.

import { renderTopPipeXRaySandbox, enhanceLessonWithInteractivity } from "./pipe_interactive.js?v=20261119e";

export const VISUAL_MANUAL_CHAPTERS = [
  { id: "ALL", label: "📘 All 20 Visual Lessons" },
  { id: "ch1_basics", label: "1. Pipe Basics (1–5)" },
  { id: "ch2_parts", label: "2. Pumps, Valves & Buffers (6–9)" },
  { id: "ch3_setups", label: "3. Real Factory Setups (10–14)" },
  { id: "ch4_circuits", label: "4. Special Pipe Circuits (15–18)" },
  { id: "ch5_tricks_faq", label: "5. Tricks & Troubleshooting (19–20)" },
];

function svgArrowDefs(uid) {
  return `
    <defs>
      <marker id="arr-blue-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8"/>
      </marker>
      <marker id="arr-amber-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b"/>
      </marker>
      <marker id="arr-green-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981"/>
      </marker>
      <marker id="arr-red-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#f87171"/>
      </marker>
      <marker id="arr-purple-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#a78bfa"/>
      </marker>
      <marker id="arr-gray-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8"/>
      </marker>
      <pattern id="grid-top-${uid}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
      </pattern>
    </defs>
  `;
}

function wrapSvg(uid, w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="pm-svg" role="img">${svgArrowDefs(uid)}${body}</svg>`;
}

// Background helpers so the viewer ALWAYS knows Side View vs Top-Down View!
function sideFloor(w, floorY, marks = ["0m", "2m", "4m", "6m"], gravity = true) {
  const step = 30;
  const ticks = marks.map((lbl, idx) => {
    const y = floorY - idx * step;
    return `
      <line x1="38" y1="${y}" x2="${w - 14}" y2="${y}" stroke="#1e293b" stroke-width="1" ${idx > 0 ? 'stroke-dasharray="4,4"' : ""}/>
      <text x="34" y="${y + 4}" text-anchor="end" fill="#64748b" font-size="9.5" font-weight="700">${lbl}</text>
    `;
  }).join("");
  const gravBadge = gravity
    ? `<rect x="${w - 86}" y="8" width="74" height="20" rx="4" fill="#172554" stroke="#38bdf8" stroke-width="1"/>
       <text x="${w - 49}" y="21" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="800">⬇ GRAVITY</text>`
    : "";
  return `
    ${ticks}
    <rect x="38" y="${floorY}" width="${w - 52}" height="16" rx="2" fill="#334155" stroke="#475569" stroke-width="1.2"/>
    <text x="${w / 2}" y="${floorY + 12}" text-anchor="middle" fill="#cbd5e1" font-size="9.5" font-weight="700">CONCRETE FOUNDATION FLOOR (0m Ground Level)</text>
    ${gravBadge}
  `;
}

function topGrid(uid, w, h, label = "8m × 8m Foundation Grid (Flat on Floor)") {
  return `
    <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="8" fill="url(#grid-top-${uid})" stroke="#334155" stroke-width="1.5"/>
    <rect x="${w - 244}" y="14" width="228" height="19" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <text x="${w - 130}" y="27" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-weight="700">${label}</text>
  `;
}

function svgJunction(cx, cy, s = 14, label = "") {
  return `
    <polygon points="${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="3.2" fill="#38bdf8"/>
    ${label ? `<text x="${cx}" y="${cy + s + 13}" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="700">${label}</text>` : ""}
  `;
}

function svgPump(x, y, dir = "right", powered = true, label = "Pump") {
  const fill = powered ? "#1e3a5f" : "#3f1d22";
  const stroke = powered ? "#38bdf8" : "#f87171";
  const stripe = powered ? "#f59e0b" : "#94a3b8";
  const sx = dir === "right" ? x + 44 : x;
  const arr = dir === "right"
    ? `<path d="M ${x + 12} ${y + 12} L ${x + 34} ${y + 12} M ${x + 28} ${y + 7} L ${x + 35} ${y + 12} L ${x + 28} ${y + 17}" stroke="#f8fafc" stroke-width="2" fill="none"/>`
    : `<path d="M ${x + 40} ${y + 12} L ${x + 18} ${y + 12} M ${x + 24} ${y + 7} L ${x + 17} ${y + 12} L ${x + 24} ${y + 17}" stroke="#f8fafc" stroke-width="2" fill="none"/>`;
  return `
    <rect x="${x}" y="${y}" width="52" height="24" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <rect x="${sx}" y="${y + 1}" width="7" height="22" rx="1" fill="${stripe}"/>
    ${arr}
    ${label ? `<text x="${x + 26}" y="${y - 5}" text-anchor="middle" fill="${powered ? "#7dd3fc" : "#fca5a5"}" font-size="10" font-weight="700">${label}</text>` : ""}
  `;
}

function svgValve(cx, cy, label = "Valve", closed = false, labelPos = "top") {
  const stroke = closed ? "#f87171" : "#10b981";
  const fill = closed ? "#3b181d" : "#113328";
  const ly = labelPos === "bottom" ? cy + 25 : cy - 17;
  return `
    <rect x="${cx - 17}" y="${cy - 12}" width="34" height="24" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="7.5" fill="none" stroke="${stroke}" stroke-width="1.8"/>
    <path d="M ${cx - 4} ${cy} L ${cx + 4} ${cy} M ${cx + 1} ${cy - 3} L ${cx + 4} ${cy} L ${cx + 1} ${cy + 3}" stroke="#f8fafc" stroke-width="1.8" fill="none"/>
    ${label ? `<text x="${cx}" y="${ly}" text-anchor="middle" fill="${closed ? "#fca5a5" : "#6ee7b7"}" font-size="10" font-weight="700">${label}</text>` : ""}
  `;
}

function svgBuffer(x, y, w, h, fillPct, label = "Buffer", sub = "") {
  const fillH = Math.max(0, Math.min(1, fillPct)) * (h - 14);
  const fy = y + h - 4 - fillH;
  return `
    <rect x="${x}" y="${y + 10}" width="${w}" height="${h - 10}" rx="4" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
    <path d="M ${x} ${y + 14} Q ${x + w / 2} ${y - 6} ${x + w} ${y + 14}" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
    ${fillH > 1 ? `<rect x="${x + 2}" y="${fy}" width="${w - 4}" height="${fillH}" rx="2" fill="rgba(56,189,248,0.45)"/>` : ""}
    ${fillH > 1 ? `<line x1="${x + 2}" y1="${fy}" x2="${x + w - 2}" y2="${fy}" stroke="#38bdf8" stroke-width="2"/>` : ""}
    <text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="700">${label}</text>
    ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 17}" text-anchor="middle" fill="#7dd3fc" font-size="9.5">${sub}</text>` : ""}
  `;
}

function svgMachine(x, y, w, h, title, sub = "", stroke = "#64748b") {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#1e293b" stroke="${stroke}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + h / 2 - (sub ? 3 : -4)}" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="700">${title}</text>
    ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle" fill="#94a3b8" font-size="9.5">${sub}</text>` : ""}
  `;
}

const LESSONS = [
  // =========================================================================
  // CHAPTER 1: PIPE BASICS (1-5)
  // =========================================================================
  {
    id: "pm-01",
    num: 1,
    chapter: "ch1_basics",
    chapterTitle: "1. Pipe Basics",
    title: "How Pipes Move Liquid (Two-Way Flow, Gravity & “Full Pipes Are Happy Pipes”)",
    summary: "Pipes have no built-in direction arrows, always fall downhill first, and move liquid faster the fuller they are.",
    whyUseIt: "Every single liquid factory (Coal Power, Refineries, Fuel Generators, Nuclear Reactors) relies on keeping pipes full. Understanding the Pipe Inspector window lets you spot why a machine is starving in 5 seconds.",
    painPoint: "If you expect pipes to behave like conveyor belts, half-full pipes throttle to half speed, fluid sloshes backward away from machines, and your power grid flickers.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Cutaway Pipe Window & Pipe Fullness vs. Speed (On Concrete Floor)",
        caption: "Diagram 1: Reading the Pipe Inspector & Why 50% Full Pipes Move Half as Fast",
        svg: wrapSvg("pm01", 760, 248, `
          ${sideFloor(760, 224, ["0m", "1m", "2m", "3m", "4m"], false)}
          <!-- Left: Pipe Inspector UI -->
          <rect x="48" y="16" width="318" height="196" rx="10" fill="#111827" stroke="#334155" stroke-width="1.8"/>
          <text x="207" y="37" text-anchor="middle" fill="#f8fafc" font-size="12.5" font-weight="700">Inside Any Pipe Inspector Window</text>

          <circle cx="122" cy="96" r="40" fill="#0f172a" stroke="#64748b" stroke-width="2.5"/>
          <path d="M 94 114 A 34 34 0 1 1 150 114" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
          <path d="M 94 114 A 34 34 0 0 1 142 68" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
          <line x1="122" y1="96" x2="142" y2="75" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
          <circle cx="122" cy="96" r="4.5" fill="#f59e0b"/>
          <text x="122" y="152" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="700">Flow Rate Dial</text>
          <text x="122" y="167" text-anchor="middle" fill="#94a3b8" font-size="9.5">Smooths over ~2 seconds</text>
          <text x="122" y="180" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Wait 5s for true reading)</text>

          <circle cx="282" cy="96" r="40" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
          <clipPath id="bub-pm01"><circle cx="282" cy="96" r="37"/></clipPath>
          <rect x="242" y="68" width="80" height="70" fill="rgba(56,189,248,0.52)" clip-path="url(#bub-pm01)"/>
          <line x1="244" y1="68" x2="320" y2="68" stroke="#7dd3fc" stroke-width="2" clip-path="url(#bub-pm01)"/>
          <text x="282" y="100" text-anchor="middle" fill="#f8fafc" font-size="11.5" font-weight="800">100% Full</text>
          <text x="282" y="152" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="700">The Blue Bubble Icon</text>
          <text x="282" y="167" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="700">Keep this bubble full!</text>
          <text x="282" y="180" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Empty top = throttled flow)</text>

          <!-- Right: Side-View Cutaway Pipes -->
          <rect x="380" y="16" width="360" height="196" rx="10" fill="#111827" stroke="#334155" stroke-width="1.8"/>
          <text x="560" y="37" text-anchor="middle" fill="#f8fafc" font-size="12.5" font-weight="700">Pipe Cross-Section (Fullness = Speed)</text>

          <text x="398" y="62" fill="#6ee7b7" font-size="11" font-weight="700">100% Full Pipe → Full 300 m³/min (Mk.2: 600 m³/min)</text>
          <rect x="398" y="70" width="245" height="28" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
          <rect x="400" y="72" width="241" height="24" rx="2" fill="rgba(56,189,248,0.58)"/>
          <line x1="654" y1="84" x2="718" y2="84" stroke="#10b981" stroke-width="3" marker-end="url(#arr-green-pm01)"/>

          <text x="398" y="124" fill="#fbbf24" font-size="11" font-weight="700">50% Full Pipe → Half Speed (150 m³/min on Mk.1)</text>
          <rect x="398" y="132" width="245" height="28" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
          <rect x="400" y="146" width="241" height="12" rx="1" fill="rgba(56,189,248,0.45)"/>
          <line x1="400" y1="146" x2="641" y2="146" stroke="#38bdf8" stroke-width="2"/>
          <line x1="654" y1="146" x2="700" y2="146" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-amber-pm01)"/>

          <text x="560" y="182" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Pipe Width = 1.3 m | Even tiny pipes hold at least 5 m³</text>
          <text x="560" y="198" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">T-Junction = 7.5 m³ | Junction Cross = 10 m³</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Two-Way Balancing & Minimum Pipe Volumes on Foundation Grid",
        caption: "Diagram 1B (Top-Down View): Fluid Always Equalizes Toward Emptier Pipes (Even Tiny Stubs Hold 5 m³)",
        svg: wrapSvg("pm01b", 760, 145, `
          ${topGrid("pm01b", 760, 145, "8m × 8m Foundation Grid (Flat on Floor)")}
          <rect x="28" y="42" width="190" height="44" rx="5" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>
          <text x="123" y="62" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="700">Pipe #1 (100% Full)</text>
          <text x="123" y="77" text-anchor="middle" fill="#7dd3fc" font-size="9.5">Min Volume = 5.0 m³</text>

          <line x1="218" y1="64" x2="274" y2="64" stroke="#38bdf8" stroke-width="4" marker-end="url(#arr-blue-pm01b)"/>
          <rect x="278" y="42" width="190" height="44" rx="5" fill="#172554" stroke="#38bdf8" stroke-width="2"/>
          <text x="373" y="62" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="700">Pipe #2 (50% Full)</text>
          <text x="373" y="77" text-anchor="middle" fill="#fbbf24" font-size="9.5">Moves at 50% Speed!</text>

          <line x1="468" y1="64" x2="524" y2="64" stroke="#38bdf8" stroke-width="4" marker-end="url(#arr-blue-pm01b)"/>
          <rect x="528" y="42" width="196" height="44" rx="5" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
          <text x="626" y="62" text-anchor="middle" fill="#cbd5e1" font-size="10.5" font-weight="700">Pipe #3 (0% Empty)</text>
          <text x="626" y="77" text-anchor="middle" fill="#94a3b8" font-size="9.5">Pulls from both sides!</text>

          <text x="380" y="116" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Because pipes have NO direction arrows, liquid automatically flows from fuller → emptier in BOTH directions!</text>
        `),
      },
    ],
    bullets: [
      "**Two-Way Flow (No Built-In Direction):** Fluid moves from whichever side has **more pressure/water** toward whichever side has **less**.",
      "**Fullness Controls Speed:** A Pipeline Mk.1 (`300 m³/min`) or Mk.2 (`600 m³/min`) can ONLY move at `100%` speed when its **Bubble Icon** is `100%` full (`50%` full = `50%` max speed).",
      "**Minimum Buffer Size:** Even a `1 m` stub pipe, Valve, or Pump holds `5 m³` of liquid. A 3-way **Pipeline T-Junction** holds `7.5 m³` and a 4-way **Pipeline Junction Cross** holds `10 m³`.",
      "**Wait 5 Seconds Before Reading:** The Pipe Inspector Flow Dial averages flow over roughly `2 seconds` — watch it for `5–15 seconds` instead of reacting to one frame.",
    ],
    buildSteps: [
      "1. Build your pipes, then turn on your **Water Extractors / Oil Extractors** BEFORE turning on your Generators or Refineries.",
      "2. Watch the **Blue Bubble Icon** in the last pipe of your row: once it hits `100%` full, turn on your machines.",
    ],
    boxes: [
      { type: "blue", title: "Golden Rule: Full Pipes Are Happy Pipes", text: "Pre-filling your pipe network until every Bubble Icon reads 100% stops 90% of early factory sloshing." },
    ],
  },

  {
    id: "pm-02",
    num: 2,
    chapter: "ch1_basics",
    chapterTitle: "1. Pipe Basics",
    title: "Staircase Gravity Order, Pulsing Machines & Missing Flow Rings (< 5.5 m)",
    summary: "Liquid always fills the lowest pipes before climbing up, machines empty in fast bursts, and short pipes hide their pulsing rings.",
    whyUseIt: "Explains two things that confuse every new player: why the Flow Rate needle swings wildly up and down from a Water Extractor, and why short pipes between machines look blank with no glowing ring.",
    painPoint: "Players often tear down working Water Extractors because the gauge bounces between 0 and 300 m³/min, or think a short pipe under 5.5 m is broken because its Flow Indicator ring didn't spawn.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Stepped Elevation Pipes & Water Extractor Burst Graph (Concrete Floor = 0m)",
        caption: "Diagram 2A: Gravity Staircase Puzzle (A -> B -> C) & Why Machines Pulse",
        svg: wrapSvg("pm02a", 760, 235, `
          ${sideFloor(760, 212, ["0m", "2m", "4m", "6m"], true)}
          <!-- Left: Staircase -->
          ${svgMachine(48, 152, 68, 60, "Water", "Extractor", "#38bdf8")}
          <polyline points="116,192 186,192 186,142 262,142 262,88 352,88" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linejoin="round"/>
          <line x1="342" y1="88" x2="366" y2="88" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-blue-pm02a)"/>
          <rect x="132" y="166" width="24" height="19" rx="4" fill="#1d4ed8"/><text x="144" y="180" text-anchor="middle" fill="#fff" font-size="11.5" font-weight="800">A</text>
          <rect x="208" y="116" width="24" height="19" rx="4" fill="#1d4ed8"/><text x="220" y="130" text-anchor="middle" fill="#fff" font-size="11.5" font-weight="800">B</text>
          <rect x="292" y="62" width="24" height="19" rx="4" fill="#1d4ed8"/><text x="304" y="76" text-anchor="middle" fill="#fff" font-size="11.5" font-weight="800">C</text>
          <text x="215" y="42" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">Gravity Fills Lowest Pipe First (A → B → C)</text>

          <!-- Right: Pulsing Machine -->
          <line x1="386" y1="18" x2="386" y2="206" stroke="#334155" stroke-width="1.5"/>
          <text x="568" y="38" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="700">Why a 120 m³/min Extractor Shows 300 or 600</text>
          ${svgMachine(406, 98, 86, 56, "Extractor", "120 m³/min", "#f59e0b")}
          <line x1="492" y1="126" x2="552" y2="126" stroke="#38bdf8" stroke-width="6" marker-end="url(#arr-amber-pm02a)"/>
          <rect x="558" y="54" width="174" height="92" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
          <polyline points="568,132 576,70 598,70 606,132 630,132 638,70 660,70 668,132 692,132 700,70 722,70" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
          <line x1="566" y1="108" x2="726" y2="108" stroke="#10b981" stroke-width="2" stroke-dasharray="4,3"/>
          <text x="645" y="164" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Dumps fast at 600, pauses → Averages 120!</text>
          <text x="568" y="184" text-anchor="middle" fill="#94a3b8" font-size="10">Every machine empties in bursts at pipe max speed</text>
        `),
      },
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Why Short Pipes (&lt; 5.5 m) Hide Their Flow Indicator Ring",
        caption: "Diagram 2B: Minimum Pipe Length for Flow Indicator Rings (5.5 Meters / ~3/4 Foundation)",
        svg: wrapSvg("pm02b", 760, 145, `
          ${sideFloor(760, 122, ["0m", "2m"], false)}
          <text x="200" y="34" text-anchor="middle" fill="#fca5a5" font-size="12" font-weight="700">Short Pipe (&lt; 5.5 m): NO Indicator Ring Spawns!</text>
          <rect x="76" y="64" width="20" height="58" fill="#475569"/><rect x="244" y="64" width="20" height="58" fill="#475569"/>
          <line x1="86" y1="68" x2="254" y2="68" stroke="#38bdf8" stroke-width="9"/>
          <text x="170" y="54" text-anchor="middle" fill="#94a3b8" font-size="10.5">Too short (&lt; 5.5 m) → Smooth blank pipe!</text>

          <line x1="378" y1="18" x2="378" y2="116" stroke="#334155" stroke-width="1.5"/>
          <text x="568" y="34" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">Pipe &gt;= 5.5 m (with 3 m straight center): Ring Spawns!</text>
          <rect x="412" y="64" width="20" height="58" fill="#475569"/><rect x="698" y="64" width="20" height="58" fill="#475569"/>
          <line x1="422" y1="68" x2="708" y2="68" stroke="#38bdf8" stroke-width="9"/>
          <rect x="545" y="57" width="40" height="22" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <line x1="553" y1="68" x2="577" y2="68" stroke="#6ee7b7" stroke-width="4"/>
          <text x="565" y="96" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Pulsing Flow Ring Visible! (Still inspectable anytime)</text>
        `),
      }
    ],
    bullets: [
      "**Lowest Pipe Fills First:** Liquid never lifts into a higher pipe until every lower connected pipe is `100%` full.",
      "**Machine Output Pulses Are Normal:** A Water Extractor produces `2 m³` every second (`120 m³/min`) and shoots it out at `300` or `600 m³/min`, then rests until the next craft finishes.",
      "**No Flow Ring Under `5.5 m`:** Any pipe shorter than `5.5 meters` (about `3/4` of one Foundation) or tightly curved in the middle skips spawning the glowing Flow Indicator ring — **it still carries full fluid**, and you can still press `E` on it to inspect it!",
    ],
    buildSteps: [
      "1. Leave at least `6 meters` (`3/4` foundation) of straight pipe whenever you want a pulsing **Flow Indicator Ring** to watch at a glance.",
      "2. Wait `10–15 seconds` while looking at a machine's output pipe so you see its true average flow rather than a single burst spike.",
    ],
    quiz: {
      question: "Look at Diagram 2A: In what order do pipes A, B, and C fill up — and why does a short 4-meter pipe between two Refineries have no glowing Flow Indicator ring?",
      answer: "Pipes fill A, then B, then C because gravity fills lower pipes completely before pushing upward. And pipes shorter than 5.5 meters (or tightly bent at the midpoint) are too short for the game to place a Flow Indicator ring — the pipe still works at 100% normal speed!",
    },
  },

  {
    id: "pm-03",
    num: 3,
    chapter: "ch1_basics",
    chapterTitle: "1. Pipe Basics",
    title: "Head Lift Made Simple (Water-Level Ceiling, Free Valley Dips & True Limits)",
    summary: "Head Lift only counts vertical altitude above your Pump or Machine — horizontal pipes and downward valley dips cost zero Head Lift.",
    whyUseIt: "Stop wasting power and building Pumps on flat ground or across valleys! You only need a Pump when your pipes climb higher than your current altitude ceiling.",
    painPoint: "If a pipe climbs even 1–2 meters above your Pump's max height, flow completely stops (0 m³/min) at the top — even if the pipe looks full right below the bump.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Vertical Head Lift Limits & Free Valley Siphon (Foundation Floor = 0m)",
        caption: "Diagram 3: Exact Head Lift Height Chart & Why Canyon Dips Need Zero Extra Pumps",
        svg: wrapSvg("pm03", 760, 265, `
          ${sideFloor(760, 242, ["0m", "10m", "20m", "30m", "40m", "50m"], true)}
          <!-- Left: Height Bars -->
          <text x="165" y="30" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">Safe Rating (vs Max Cutoff)</text>
          <rect x="48" y="210" width="38" height="32" rx="3" fill="#64748b"/>
          <text x="67" y="204" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="700">8/12m</text>
          <text x="67" y="232" text-anchor="middle" fill="#fff" font-size="9">Buffers</text>

          <rect x="98" y="200" width="42" height="42" rx="3" fill="#38bdf8"/>
          <text x="119" y="194" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">10m (12)</text>
          <text x="119" y="232" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="700">Machine</text>

          <rect x="152" y="168" width="46" height="74" rx="3" fill="#10b981"/>
          <text x="175" y="162" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">20m (22)</text>
          <text x="175" y="232" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="700">Pump 1</text>

          <rect x="210" y="72" width="48" height="170" rx="3" fill="#f59e0b"/>
          <text x="234" y="66" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">50m (55)</text>
          <text x="234" y="232" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="700">Pump 2</text>

          <!-- Right: Valley Siphon -->
          <line x1="278" y1="18" x2="278" y2="236" stroke="#334155" stroke-width="1.5"/>
          <text x="514" y="30" text-anchor="middle" fill="#6ee7b7" font-size="12.5" font-weight="700">Free Valley Siphon: Dipping Down &amp; Climbing Back Up = 0 Extra Pumps</text>
          <line x1="292" y1="112" x2="736" y2="112" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="6,4"/>
          <text x="514" y="102" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="700">+20m Water-Level Ceiling (Horizontal distance is 100% FREE!)</text>

          ${svgPump(296, 168, "right", true, "Pump Mk.1 @ +4m")}
          <polyline points="348,180 390,180 390,122 440,122 440,228 602,228 602,122 712,122" fill="none" stroke="#38bdf8" stroke-width="7" stroke-linejoin="round"/>
          <line x1="696" y1="122" x2="732" y2="122" stroke="#10b981" stroke-width="3" marker-end="url(#arr-green-pm03)"/>
          <text x="520" y="216" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Canyon Dip (-30m) → Gravity pushes water back up to +20m!</text>
        `),
      }
    ],
    bullets: [
      "**Machines (`10 m` safe / `12 m` max):** Water Extractors, Oil Extractors, Refineries, Blenders, Packagers, and Fluid Freight Platforms push liquid **`10 meters`** upward on their own.",
      "**Pipeline Pump Mk.1 (`20 m` safe / `22 m` max) & Mk.2 (`50 m` safe / `55 m` max):** Build within the safe `10 / 20 / 50 m` rating so flow never slows near the top.",
      "**Horizontal Distance Is Free:** A pump at altitude `100 m` can send water `5 kilometers` horizontally across the map with zero extra pumps.",
      "**Valley Dips Are Free:** If a pipe drops `50 m` down a cliff and climbs back up `50 m` to its starting height, gravity pushes the water right back up.",
    ],
    buildSteps: [
      "1. Note the height of your source machine (`10 m` natural lift = `2.5` standard `4m` walls high).",
      "2. Only snap a **Pipeline Pump** when your pipe rises past `10 m` above your extractor/machine.",
    ],
    boxes: [
      { type: "blue", title: "Remember: 1 Standard Foundation Wall = 4 Meters", text: "A machine pushes 2.5 walls high (10m). A Pump Mk.1 pushes 5 walls high (20m). A Pump Mk.2 pushes 12.5 walls high (50m)!" },
    ],
  },

  {
    id: "pm-04",
    num: 4,
    chapter: "ch1_basics",
    chapterTitle: "1. Pipe Basics",
    title: "Liquids vs. Gases (0-Pump Gas Sky-Towers & Why Buffers Work on Gas)",
    summary: "Gases (Nitrogen Gas, Rocket Fuel, Ionized Fuel, Dark Matter Residue) ignore gravity completely — zero Pumps needed at any height!",
    whyUseIt: "When piping Nitrogen Gas from distant resource wells up to high factories, or routing Rocket Fuel / Ionized Fuel to skyscraper Fuel Generator towers, deleting unnecessary Pumps saves megawatts of power.",
    painPoint: "Putting Pipeline Pumps on Gas pipes wastes 4–8 MW of power per Pump for zero Head Lift gain (though they still work as one-way doors). Even worse, trusting outdated 2022 guides makes players avoid Fluid Buffers on Gas lines!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — 200m Skyscraper Pipe Comparison: Liquid (Needs Pumps) vs. Gas (Zero Pumps!)",
        caption: "Diagram 4: Liquid Gravity vs. Gas Weightless Pressure (Includes Working Gas Buffers)",
        svg: wrapSvg("pm04", 760, 245, `
          ${sideFloor(760, 222, ["0m", "50m", "100m", "150m", "200m"], false)}
          <!-- Left: Liquid Tower -->
          <rect x="46" y="14" width="332" height="200" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="212" y="34" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">LIQUIDS (Water, Crude Oil, Fuel, Acid)</text>
          ${svgMachine(66, 166, 90, 42, "Water/Oil", "10m Lift", "#38bdf8")}
          <polyline points="156,188 214,188 214,50 310,50" fill="none" stroke="#38bdf8" stroke-width="6" marker-end="url(#arr-blue-pm04)"/>
          ${svgPump(188, 134, "right", true, "Pump #1 (50m)")}
          ${svgPump(188, 72, "right", true, "Pump #2 (100m)")}
          <text x="288" y="110" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">Must place Pumps</text>
          <text x="288" y="124" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">every 20m / 50m!</text>

          <!-- Right: Gas Tower -->
          <rect x="394" y="14" width="348" height="200" rx="8" fill="#111827" stroke="#a78bfa" stroke-width="1.8"/>
          <text x="568" y="34" text-anchor="middle" fill="#d8b4fe" font-size="12" font-weight="700">GASES (Nitrogen, Rocket/Ionized Fuel)</text>
          ${svgMachine(412, 166, 94, 42, "Gas Source", "Blender / Well", "#a78bfa")}
          <polyline points="506,188 552,188 552,54 676,54" fill="none" stroke="#a78bfa" stroke-width="6" stroke-dasharray="10,3" marker-end="url(#arr-purple-pm04)"/>
          ${svgBuffer(596, 128, 74, 62, 0.7, "Gas Buffer", "400 / 2400 m³")}
          <line x1="552" y1="164" x2="596" y2="164" stroke="#a78bfa" stroke-width="4"/>
          <text x="640" y="88" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">0 Pumps Needed</text>
          <text x="640" y="102" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">at ANY Height!</text>
          <text x="633" y="204" text-anchor="middle" fill="#d8b4fe" font-size="10" font-weight="700">Fluid Buffers &amp; Valves WORK on Gas!</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Real Gas Setup: Rocket Fuel Blenders → Gas Buffer → 1-Way Valve → Generators",
        caption: "Diagram 4B (Top-Down View): How Buffers and Valves Protect Gas Lines on Your Factory Floor",
        svg: wrapSvg("pm04b", 760, 145, `
          ${topGrid("pm04b", 760, 145, "8m × 8m Foundation Grid (Flat Gas Setup)")}
          ${svgMachine(24, 52, 130, 46, "Rocket Fuel Blenders", "Outputs Gas (600/min)", "#a78bfa")}
          <line x1="154" y1="75" x2="282" y2="75" stroke="#a78bfa" stroke-width="5.5" stroke-dasharray="10,3" marker-end="url(#arr-purple-pm04b)"/>
          ${svgJunction(218, 75, 11)}
          <line x1="218" y1="75" x2="218" y2="112" stroke="#a78bfa" stroke-width="4"/>
          <text x="218" y="128" text-anchor="middle" fill="#d8b4fe" font-size="9.5" font-weight="700">Side Tee → Gas Buffer (400/2400m³ Works!)</text>
          ${svgValve(326, 75, "1-Way Valve", false)}
          <line x1="344" y1="75" x2="490" y2="75" stroke="#a78bfa" stroke-width="5.5" stroke-dasharray="10,3" marker-end="url(#arr-purple-pm04b)"/>
          ${svgMachine(496, 52, 224, 46, "Fuel Generator Skyscraper", "Climb 500m Up With ZERO Pumps!", "#10b981")}
        `),
      }
    ],
    bullets: [
      "**5 Game Gases:** **Nitrogen Gas**, **Rocket Fuel**, **Ionized Fuel**, **Dark Matter Residue**, and **Excited Photonic Matter** are weightless Gases.",
      "**Zero Pumps Needed Forever:** Gases equalize strictly by `%` fullness from pipe to pipe — they climb straight up `2,000 m` vertical cliffs at full `600 m³/min` with zero Pumps.",
      "**Fluid Buffers & Valves DO Work on Gas:** Contrary to old 2022 manuals, you can freely use **Fluid Buffers** (`400` or `2,400 m³`) to store Rocket Fuel or Nitrogen Gas, and **Valves** still enforce 1-way flow & speed limits on Gas!",
    ],
    buildSteps: [
      "1. Run Nitrogen Gas or Rocket Fuel vertical risers straight up cliffs or factory walls with **zero Pipeline Pumps**.",
      "2. Use a **Valve** (0 MW) if you want one-way flow control or rate-limiting on a Gas pipe.",
    ],
    boxes: [
      { type: "blue", title: "2022 Guide Correction: Buffers Work Great on Gas!", text: "Older guides claimed Fluid Buffers couldn't output Gas without Head Lift. In reality, Gas ignores Head Lift everywhere — including inside Fluid Buffers!" },
    ],
  },

  {
    id: "pm-05",
    num: 5,
    chapter: "ch1_basics",
    chapterTitle: "1. Pipe Basics",
    title: "Splitting & Merging With Junctions (And the Classic 3 : 8 Coal Generator Setup)",
    summary: "Pipeline Junction Crosses have no flow limit of their own — and feeding a Mk.1 manifold from BOTH ends handles 360 m³/min cleanly!",
    whyUseIt: "The #1 beginner power setup is 3 Water Extractors (360 m³/min) feeding 8 Coal Generators (45 m³/min each = 360 m³/min). Since a Mk.1 pipe only carries 300 m³/min, beginners clog it by merging all 3 extractors into one end!",
    painPoint: "If you merge 3 Water Extractors (360 m³/min) into one single Mk.1 pipe before reaching your 8 Coal Generators, the pipe caps at 300 m³/min and Coal Generators #7 and #8 starve and shut down.",
    diagrams: [
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Bird's-Eye View on Concrete Foundation Grid (All Pipes Flat at 0m)",
        caption: "Diagram 5A: Junctions Have No Speed Limit (450 m³/min Through One Cross) & Classic 3 : 8 Coal Setup",
        svg: wrapSvg("pm05a", 760, 275, `
          ${topGrid("pm05a", 760, 275, "8m × 8m Foundation Grid (Looking Down)")}
          <!-- Top Row: 450 through center junction -->
          <rect x="24" y="38" width="712" height="94" rx="8" fill="rgba(17,24,39,0.9)" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="380" y="57" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">Junction Cross Has NO Flow Limit (450 m³/min passes cleanly because NO pipe exceeds 300!)</text>
          <line x1="120" y1="98" x2="640" y2="98" stroke="#38bdf8" stroke-width="5.5"/>
          ${[180, 320, 460, 600].map((x, i) => `
            <line x1="${x}" y1="98" x2="${x}" y2="66" stroke="#38bdf8" stroke-width="3.5" marker-end="url(#arr-blue-pm05a)"/>
            ${svgJunction(x, 98, 11)}
            <text x="${x + 28}" y="76" fill="#cbd5e1" font-size="10" font-weight="700">150 Out</text>
          `).join("")}
          <text x="250" y="90" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">300 →</text>
          <text x="390" y="90" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">← 150</text>
          <text x="320" y="123" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">In: 450 / Out: 450</text>
          <text x="460" y="123" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">300 In ↑</text>
          <text x="600" y="123" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">300 In ↑</text>
          <text x="148" y="123" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">300 In ↑</text>

          <!-- Bottom Row: 3:8 Coal Gen Top-Down -->
          <rect x="24" y="144" width="712" height="114" rx="8" fill="rgba(17,24,39,0.92)" stroke="#10b981" stroke-width="1.8"/>
          <text x="380" y="164" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">Classic 3 Water Extractors (360 m³/min) → 8 Coal Generators (45 m³/min each) on Mk.1 Pipes</text>
          <line x1="126" y1="218" x2="634" y2="218" stroke="#38bdf8" stroke-width="5.5"/>
          ${svgMachine(32, 198, 88, 38, "2 Extractors", "240 m³/min →", "#38bdf8")}
          ${svgMachine(640, 198, 88, 38, "1 Extractor", "← 120 m³/min", "#38bdf8")}
          ${[156, 220, 284, 348, 412, 476, 540, 604].map((x, idx) => {
            const pipeRates = ["240", "195", "150", "105", "60", "15↔30", "75", "120"];
            return `
              <line x1="${x}" y1="218" x2="${x}" y2="180" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-blue-pm05a)"/>
              ${svgJunction(x, 218, 9.5)}
              <text x="${x}" y="176" text-anchor="middle" fill="#e2e8f0" font-size="9" font-weight="700">Coal #${idx + 1}</text>
              <text x="${x}" y="246" text-anchor="middle" fill="#7dd3fc" font-size="9.5">${pipeRates[idx]}</text>
            `;
          }).join("")}
        `),
      },
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — 3 Water Extractors Feeding 8 Coal Generators (Zero Pumps Needed on Flat Banks!)",
        caption: "Diagram 5B (Side View): Why Water Extractors (10m Natural Lift) Easily Reach Ground-Floor Coal Generators (+2m)",
        svg: wrapSvg("pm05b", 760, 170, `
          ${sideFloor(760, 148, ["0m", "2m", "4m", "6m", "8m"], true)}
          ${svgMachine(46, 98, 128, 50, "Water Extractors", "10m Natural Lift!", "#38bdf8")}
          <polyline points="174,126 248,126 248,98 690,98" fill="none" stroke="#38bdf8" stroke-width="5.5"/>
          <line x1="248" y1="98" x2="690" y2="98" stroke="#38bdf8" stroke-width="5.5"/>
          ${[310, 410, 510, 610].map((x, idx) => `
            <line x1="${x}" y1="98" x2="${x}" y2="118" stroke="#10b981" stroke-width="3.5" marker-end="url(#arr-green-pm05b)"/>
            ${svgJunction(x, 98, 9)}
            ${svgMachine(x - 36, 120, 72, 28, `Coal #${idx * 2 + 1}-${idx * 2 + 2}`, "", "#10b981")}
          `).join("")}
          <text x="480" y="42" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">10m Natural Lift easily clears +2m Coal Generator inputs (ZERO Pumps needed!)</text>
          <text x="480" y="60" text-anchor="middle" fill="#94a3b8" font-size="10">Only add a Mk.1 Pump if your Coal Generators sit &gt; 8 meters (2+ walls) higher than the lake!</text>
        `),
      }
    ],
    bullets: [
      "**Junctions Don't Cap Total Flow:** Only each individual **Pipeline Mk.1 (`300`)** or **Mk.2 (`600`)** segment has a speed limit.",
      "**Equal Splitting Automatically:** Connecting `1` input (`300`) to `3` equal outputs automatically balances to `100` each once full.",
      "**How 3 : 8 Coal Power Works on Mk.1 Pipes:** Put `2 Water Extractors (240 m³/min)` on the **left** end of the manifold, and `1 Water Extractor (120 m³/min)` on the **right** end. Every pipe carries `<= 240 m³/min`!",
    ],
    buildSteps: [
      "1. Line up **8 Coal Generators** side-by-side on foundations.",
      "2. Place a **Pipeline Junction Cross** in front of each Generator (use **Pipeline T-Junctions** for `25%` less internal buffer slosh) and link them into one long Mk.1 pipe row.",
      "3. Connect **2 Water Extractors (`240 m³/min`)** to the left end and **1 Water Extractor (`120 m³/min`)** to the right end (or middle!).",
    ],
    boxes: [
      { type: "blue", title: "Tip: Use T-Junctions Instead of Crosses When You Only Need 3 Connections", text: "A 3-way Pipeline T-Junction holds 7.5 m³ of fluid instead of 10 m³, helping straight lines saturate faster." },
    ],
  },

  // =========================================================================
  // CHAPTER 2: PUMPS, VALVES & FLUID BUFFERS (6-9)
  // =========================================================================
  {
    id: "pm-06",
    num: 6,
    chapter: "ch2_parts",
    chapterTitle: "2. Pumps, Valves & Buffers",
    title: "Pipeline Pumps (Orange Striped Collar, 100m Blue Snap Ring & Two-Bump Puzzle)",
    summary: "Pumps push liquid uphill from their exact height, snap to the Blue Hologram Ring, and never stack side-by-side.",
    whyUseIt: "Whenever you extract Water down at sea level or Crude Oil in a basin and pump it up to a cliffside factory or sky-platform, proper vertical Pump spacing saves hundreds of MW and stops dead pipes.",
    painPoint: "Clustering 3 Pumps together at the bottom of a hill wastes 24 MW for zero extra lift — and snapping a Pump backward stops 100% of flow!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Flat Non-Stacking Trap vs. Blue Snap Ring Climb & Two-Bump Puzzle",
        caption: "Diagram 6: Why Side-by-Side Pumps Fail & How Pump Lift Stacks With Gravity",
        svg: wrapSvg("pm06", 760, 275, `
          ${sideFloor(760, 252, ["0m", "5m", "10m", "15m", "20m", "25m"], true)}
          <!-- Left: Flat Stacking Myth + Blue Ring -->
          <rect x="44" y="14" width="326" height="92" rx="8" fill="#111827" stroke="#f87171" stroke-width="1.6"/>
          <text x="207" y="34" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">BAD: Side-by-Side Pumps Do NOT Stack!</text>
          <line x1="56" y1="74" x2="356" y2="74" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(68, 62, "right", true, "Mk.2")}
          ${svgPump(138, 62, "right", true, "Mk.2")}
          ${svgPump(208, 62, "right", true, "Mk.2")}
          <text x="314" y="64" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="800">= Still 50m!</text>
          <text x="314" y="88" text-anchor="middle" fill="#94a3b8" font-size="9.5">(NOT 150m!)</text>

          <rect x="44" y="114" width="326" height="126" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.6"/>
          <text x="207" y="134" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">GOOD: Place Next Pump on Blue Snap Ring</text>
          <polyline points="58,218 148,218 148,154 316,154" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linejoin="round"/>
          ${svgPump(72, 206, "right", true, "Striped = OUT")}
          <ellipse cx="148" cy="166" rx="14" ry="5" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="252" y="176" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">Blue Ring = Exact 20m / 50m Top</text>
          <text x="252" y="192" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Scans 100m along pipes + junctions)</text>

          <!-- Right: Two-Bump Puzzle -->
          <rect x="384" y="14" width="360" height="226" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.6"/>
          <text x="564" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">Knowledge Quiz 2: 18m &amp; 22m Bumps With Pump @ +9m</text>
          <polyline points="404,228 450,228 450,118 526,118 526,228 594,228 594,88 674,88 674,228 726,228" fill="none" stroke="#38bdf8" stroke-width="5.5" stroke-linejoin="round"/>
          <rect x="438" y="156" width="24" height="32" rx="4" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>
          <rect x="439" y="156" width="22" height="5" fill="#f59e0b"/>
          <line x1="450" y1="172" x2="684" y2="172" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="4,3"/>
          <text x="415" y="176" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">+9m</text>
          <text x="488" y="108" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">18m Peak</text>
          <text x="634" y="78" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">22m Peak</text>
          <text x="560" y="218" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">9m Gravity Dip</text>
          <text x="698" y="152" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Only needs</text>
          <text x="698" y="166" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">13m lift!</text>
        `),
      }
    ],
    bullets: [
      "**Output Direction Matters:** The **orange/black striped collar** is ALWAYS the **output side**. Putting a Pump backward locks the pipe completely.",
      "**Zero Flow Speed Limit:** Both **Pipeline Pump Mk.1 (`4 MW`, `20 m`)** and **Mk.2 (`8 MW`, `50 m`)** pass full `600 m³/min` through Mk.2 pipes.",
      "**Blue Snap Ring (`100 m` Limit):** When holding a Pump hologram along a climbing pipe, wait for the glowing blue ring — it shows where the upstream machine/pump's `10 / 20 / 50 m` height ends (stops scanning after `100 m` of diagonal pipe length).",
    ],
    buildSteps: [
      "1. Place your first Pump within `10 m` (2.5 walls) of your Extractor or Machine output, striped collar pointing toward the climb.",
      "2. Hold the next Pump hologram further up the pipe until it **snaps onto the Blue Ring** — click to build!",
    ],
    quiz: {
      question: "Look at Diagram 6 (Right): A Mk.1 Pump (20 m Head Lift) sits 9 m high on the first pipe. Can it push water over BOTH an 18 m peak AND a 22 m peak after dipping back down to 0 m?",
      answer: "YES! Head Lift is measured upward from the Pump itself (+9 m). The 22 m peak is only 13 m higher than the Pump (22 m - 9 m = 13 m), well inside the Mk.1 Pump's 20 m rating. The dip back to 0 m regains the first 9 m automatically through gravity!",
    },
  },

  {
    id: "pm-07",
    num: 7,
    chapter: "ch2_parts",
    chapterTitle: "2. Pumps, Valves & Buffers",
    title: "The Unpowered Pump Trap vs. Closed Valves (0 m Reset vs. 98% Pass-Through)",
    summary: "An unpowered Pump resets Head Lift to 0 m (stopping climbs), while a closed 0 m³/min Valve blocks liquid flow yet still passes 98% Head Lift!",
    whyUseIt: "Two huge gotchas + one magic trick: knowing why an unpowered Pump ruins an uphill pipe stops frantic troubleshooting, while knowing that closed Valves pass Head Lift lets you build 0-MW Water Towers (Lesson 17).",
    painPoint: "Leaving an unpowered Pump on a climbing or horizontal pipe (e.g., forgetting a power wire!) lets fluid seep past horizontally, then mysteriously die at the very first 1-meter step uphill.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Unpowered Pump (Kills Climb) vs. Closed Valve (Blocks Flow, Passes Pressure!)",
        caption: "Diagram 7: Why Unpowered Pumps Starve Hills & How Closed Valves Act as Pressure Diodes",
        svg: wrapSvg("pm07", 760, 235, `
          ${sideFloor(760, 212, ["0m", "5m", "10m", "15m", "20m"], true)}
          <!-- Left: Unpowered Pump -->
          <rect x="44" y="14" width="336" height="190" rx="8" fill="#111827" stroke="#f87171" stroke-width="1.8"/>
          <text x="212" y="34" text-anchor="middle" fill="#fca5a5" font-size="12" font-weight="700">TRAP: Unpowered Pump Resets Head Lift to 0 m</text>
          <text x="212" y="50" text-anchor="middle" fill="#94a3b8" font-size="10">50m Pressure Coming In → 0m Pressure Leaving!</text>
          <polyline points="56,176 260,176 260,96 346,96" fill="none" stroke="#334155" stroke-width="6"/>
          <line x1="56" y1="176" x2="260" y2="176" stroke="#38bdf8" stroke-width="6"/>
          ${svgPump(132, 164, "right", false, "NO POWER")}
          <text x="308" y="84" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="700">Empty! (0m Lift)</text>
          <text x="160" y="196" text-anchor="middle" fill="#fbbf24" font-size="10">Fluid still passes flat/downhill</text>

          <!-- Right: Closed Valve -->
          <rect x="394" y="14" width="350" height="190" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.8"/>
          <text x="569" y="34" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">SECRET: Closed 0 m³/min Valve Passes 98% Lift!</text>
          <text x="569" y="50" text-anchor="middle" fill="#94a3b8" font-size="10">Blocks 100% of water from draining, transmits Head Lift!</text>
          <polyline points="428,68 428,176 588,176 588,78 708,78" fill="none" stroke="#38bdf8" stroke-width="6" marker-end="url(#arr-green-pm07)"/>
          ${svgValve(488, 176, "Set 0 m³/min!", true, "bottom")}
          ${svgJunction(428, 176, 10)}
          <text x="454" y="96" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">Sky Pipe</text>
          <text x="652" y="66" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Climbs 98% high @ 0 MW!</text>
        `),
      }
    ],
    bullets: [
      "**Unpowered Pump (`0 m` Ceiling):** Does **not** block liquid on flat or downhill pipes, so it looks okay at first — **but resets all Head Lift to `0 m`** at its exit!",
      "**Open or Closed Valve (`98%` Head Lift):** Valves NEVER reduce Head Lift except for a tiny `2%` friction drop (`e.g., 50 m -> 49 m`). Even a Valve dialed down to **`0 m³/min`** still transmits `98%` of upstream height!",
    ],
    buildSteps: [
      "1. Whenever a Pump fails to push uphill, press `E` on it and verify it has a green light and a power wire connected.",
      "2. Never use an unpowered Pump as a 1-way check valve on a liquid climb — use a **Valve** (`0 MW`) instead!",
    ],
    boxes: [
      { type: "red", title: "Why Unpowered Pumps Are Sneaky", text: "Unlike Conveyor Belts (which stop dead without power), an unpowered Pump still lets water dribble through flat pipes — tricking you into thinking it isn't the problem until the pipe hits a hill!" },
    ],
  },

  {
    id: "pm-08",
    num: 8,
    chapter: "ch2_parts",
    chapterTitle: "2. Pumps, Valves & Buffers",
    title: "Fluid Buffers (Tank Heights, Bottom 1.5 m Ramp & Why Inline Buffers Kill Lift)",
    summary: "Small Buffers hold 400 m³ (8m) and Industrial Buffers hold 2,400 m³ (12m) — and placing one inline under 100% wipes out upstream Pump Head Lift.",
    whyUseIt: "Fluid Buffers are essential beside Fluid Train Platforms (Lesson 14), for saving reserve fuel against power trips, and for catching surging outputs — IF you place them in parallel or BEFORE your Pumps.",
    painPoint: "Sticking a Fluid Buffer in the middle of an uphill pipe (like old 2022 'Flow Equalizers') forces your whole uphill line to rely on the Buffer's 0–8 m fill height instead of your 50 m Pump!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW (Left: Tank Cutaways) + 🗺️ TOP-DOWN FLOOR VIEW (Right: Serial vs Parallel)",
        caption: "Diagram 8: Buffer Head Lift, Bottom 1.5 m Smooth Ramp & Inline Head-Lift Trap",
        svg: wrapSvg("pm08", 760, 265, `
          <!-- Left: Side View Cutaway -->
          <rect x="14" y="14" width="356" height="238" rx="8" fill="#111827" stroke="#334155" stroke-width="1.6"/>
          <text x="192" y="34" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">📐 SIDE VIEW: Buffer Height = Head Lift</text>
          <rect x="24" y="216" width="336" height="14" rx="2" fill="#334155"/>
          <text x="192" y="226" text-anchor="middle" fill="#cbd5e1" font-size="9" font-weight="700">0m Foundation Floor</text>
          ${svgBuffer(42, 102, 82, 114, 0.5, "400 m³", "8m Tall")}
          <text x="83" y="88" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">50% = 4m Lift</text>
          <rect x="44" y="196" width="78" height="18" fill="rgba(245,158,11,0.35)"/>
          <text x="83" y="209" text-anchor="middle" fill="#fde68a" font-size="9" font-weight="700">Bottom 1.5m = 75m³</text>

          ${svgBuffer(166, 62, 134, 154, 0.5, "2,400 m³", "12m Tall")}
          <text x="233" y="52" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">50% = 6m Lift</text>
          <rect x="168" y="196" width="130" height="18" fill="rgba(245,158,11,0.35)"/>
          <text x="233" y="209" text-anchor="middle" fill="#fde68a" font-size="9.5" font-weight="700">Bottom 1.5m = 300m³ (Ramps 0→100%)</text>

          <!-- Right: Head Lift Trap & Parallel vs Serial -->
          <rect x="386" y="14" width="360" height="114" rx="8" fill="#111827" stroke="#f87171" stroke-width="1.6"/>
          <text x="566" y="34" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">📐 SIDE VIEW TRAP: Inline Buffer Kills Pump Lift!</text>
          <line x1="402" y1="92" x2="722" y2="92" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(412, 80, "right", true, "50m Pump")}
          ${svgBuffer(512, 48, 64, 62, 0.5, "50% Full")}
          <text x="660" y="76" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="700">Drops to 4m!</text>
          <text x="660" y="108" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Unless 100% full!)</text>

          <rect x="386" y="138" width="360" height="114" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.6"/>
          <text x="566" y="158" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">🗺️ TOP-DOWN: Wire Multiple Buffers in Parallel!</text>
          <line x1="414" y1="232" x2="718" y2="232" stroke="#38bdf8" stroke-width="5"/>
          ${[476, 566, 656].map((x) => `
            <line x1="${x}" y1="232" x2="${x}" y2="212" stroke="#38bdf8" stroke-width="4"/>
            ${svgBuffer(x - 24, 168, 48, 46, 0.7, "Buf")}
            ${svgJunction(x, 232, 9)}
          `).join("")}
        `),
      }
    ],
    bullets: [
      "**Smooth Bottom Ramp (Not a Zero Cliff!):** A Buffer does NOT output `0 m³/min` below `75 m³` / `300 m³`. Instead, as fluid rises across its bottom `1.5 m`, max outflow smoothly ramps up from `0% -> 100%` (`e.g., 37.5 m³` outputs at `50%` speed!).",
      "**Put Buffers BEFORE Pumps (or on Side Branches):** If a Buffer sits *after* a Pump and drops below `100%` full, **it wipes out the Pump's `20 m / 50 m` Head Lift** and resets pressure to the Buffer's own `0–8 m` / `0–12 m` liquid level!",
      "**Parallel Beats Serial:** Linking Buffers one-after-another (`Buf 1 -> Buf 2 -> Buf 3`) creates violent sloshing. Wire them off side branches in parallel.",
    ],
    buildSteps: [
      "1. Need big surge storage before an uphill climb? Build your **Industrial Fluid Buffer** on the ground floor FIRST, then put your **Pipeline Pump** *after* the Buffer exit!",
      "2. Want multiple storage tanks? Connect a row of Junction Crosses along one main pipe and branch each Buffer out sideways.",
    ],
    boxes: [
      { type: "yellow", title: "2022 Guide Correction: Buffers Ramp Smoothly Over Bottom 1.5m", text: "Older guides thought Buffers needed 75 m³ / 300 m³ before flowing at all. In reality, outflow scales smoothly from 0% to 100% across that bottom 1.5m." },
    ],
  },

  {
    id: "pm-09",
    num: 9,
    chapter: "ch2_parts",
    chapterTitle: "2. Pumps, Valves & Buffers",
    title: "Valves (0-MW One-Way Doors, Flow Balancing & Wave Bounce)",
    summary: "Valves block backflow with zero power, limit flow rate cleanly when full, and can bounce fluid waves backward when a machine backs up.",
    whyUseIt: "Valves let you cap exact flow going into split factory wings (e.g., sending exactly 150 m³/min left and 150 m³/min right) and block slosh waves on long pipelines without spending electricity.",
    painPoint: "Putting a Valve on ONLY ONE side of a split lets the open pipe steal 200+ m³/min, and leaving half-full pipes before a Valve makes it output far less than the number you typed.",
    diagrams: [
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW (Left: Valve Splits) + 📐 SIDE VIEW (Right: Wave Bounce Inside a Valve)",
        caption: "Diagram 9: Why Every Branch Needs a Valve & Why Fluid Appears to Flow Backward",
        svg: wrapSvg("pm09", 760, 240, `
          <!-- Left: Top-Down Valve Splits -->
          <rect x="14" y="14" width="356" height="212" rx="8" fill="#111827" stroke="#334155" stroke-width="1.6"/>
          <text x="192" y="34" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">🗺️ TOP-DOWN BAD: Unvalved Pipe Steals Flow!</text>
          <line x1="34" y1="74" x2="104" y2="74" stroke="#38bdf8" stroke-width="5"/>
          <polyline points="104,74 138,56 322,56" fill="none" stroke="#38bdf8" stroke-width="4" marker-end="url(#arr-blue-pm09)"/>
          <polyline points="104,74 138,94 322,94" fill="none" stroke="#38bdf8" stroke-width="4" marker-end="url(#arr-blue-pm09)"/>
          ${svgJunction(104, 74, 10)}
          ${svgValve(204, 94, "Limit 150", false, "bottom")}
          <text x="64" y="64" text-anchor="middle" fill="#cbd5e1" font-size="10">300 In</text>
          <text x="348" y="60" text-anchor="end" fill="#fbbf24" font-size="10.5" font-weight="700">200+</text>
          <text x="348" y="98" text-anchor="end" fill="#fca5a5" font-size="10.5" font-weight="700">~100</text>

          <line x1="28" y1="126" x2="354" y2="126" stroke="#334155" stroke-width="1.5"/>
          <text x="192" y="146" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">🗺️ TOP-DOWN GOOD: Put Valves on ALL Branches!</text>
          <line x1="34" y1="184" x2="104" y2="184" stroke="#38bdf8" stroke-width="5"/>
          <polyline points="104,184 138,166 322,166" fill="none" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm09)"/>
          <polyline points="104,184 138,202 322,202" fill="none" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm09)"/>
          ${svgJunction(104, 184, 10)}
          ${svgValve(204, 166, "150", false)}
          ${svgValve(204, 202, "150", false, "bottom")}
          <text x="348" y="170" text-anchor="end" fill="#6ee7b7" font-size="10.5" font-weight="700">150</text>
          <text x="348" y="206" text-anchor="end" fill="#6ee7b7" font-size="10.5" font-weight="700">150</text>

          <!-- Right: Side-View Wave Bounce -->
          <rect x="386" y="14" width="360" height="212" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.6"/>
          <text x="566" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">📐 SIDE VIEW: Why Fluid Bounces Off a Valve Wall</text>
          <text x="566" y="56" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Step 1: Fluid flows freely until the machine fills to 100%</text>
          <line x1="418" y1="80" x2="672" y2="80" stroke="#38bdf8" stroke-width="6"/>
          ${svgValve(544, 80, "", false)}
          ${svgMachine(674, 62, 56, 36, "Full", "100%", "#64748b")}
          <line x1="436" y1="80" x2="500" y2="80" stroke="#6ee7b7" stroke-width="2.5" marker-end="url(#arr-green-pm09)"/>
          <line x1="576" y1="80" x2="646" y2="80" stroke="#6ee7b7" stroke-width="2.5" marker-end="url(#arr-green-pm09)"/>

          <text x="566" y="124" text-anchor="middle" fill="#fca5a5" font-size="10.5">Step 2: Output full → Valve shuts → Wave bounces BACK!</text>
          <line x1="418" y1="150" x2="672" y2="150" stroke="#38bdf8" stroke-width="6"/>
          ${svgValve(544, 150, "", true)}
          ${svgMachine(674, 132, 56, 36, "Full", "100%", "#f87171")}
          <line x1="504" y1="150" x2="434" y2="150" stroke="#f87171" stroke-width="2.5" marker-end="url(#arr-red-pm09)"/>
          <text x="566" y="192" text-anchor="middle" fill="#94a3b8" font-size="10.5">Nothing leaked backward through the Valve!</text>
          <text x="566" y="208" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Incoming fluid simply hit the closed door &amp; bounced back.</text>
        `),
      }
    ],
    bullets: [
      "**Exact Float Limits:** Typing a decimal like `45.5 m³/min` and pressing Enter works cleanly — the gauge needle only rounds visually.",
      "**Limit ALL Branches:** Whenever splitting a pipe with Valves, make sure **every** split pipe has a Valve whose limits sum to your input (`Input Flow = Sum of Valve Limits`).",
      "**Remember Full Input Pipes:** A Valve on a `50%` full pipe will output less than its setting because the incoming pipe is throttled.",
    ],
    buildSteps: [
      "1. Snap a **Valve** onto any horizontal or vertical pipe (pointing the circular arrow in your desired travel direction).",
      "2. Press `E`, type your exact limit (e.g., `150`), and press `Enter` to lock it.",
    ],
    quiz: {
      question: "Look at Diagram 9 (Right): Why does a pipe BEFORE a one-way Valve sometimes show liquid moving backward away from the Valve?",
      answer: "No liquid leaked backward through the Valve! Once the pipe after the Valve fills to 100%, the Valve cannot push any more liquid in, so incoming liquid piles up against the closed Valve door and rebounds backward like ripples hitting a pool wall.",
    },
  },

  // =========================================================================
  // CHAPTER 3: REAL FACTORY SETUPS (10-14)
  // =========================================================================
  {
    id: "pm-10",
    num: 10,
    chapter: "ch3_setups",
    chapterTitle: "3. Real Factory Setups",
    title: "Building Perfect Machine Manifolds (Top-Feeding +2m, Pre-Fill & Loop-Backs)",
    summary: "Run your main feed pipe +2 meters ABOVE your machines' input ports, pre-fill their 50 m³ tanks, and loop both ends together.",
    whyUseIt: "Whenever you feed 4, 8, or 20 Refineries, Blenders, Coal Generators, or Fuel Generators off one pipe, Top-Feeding + Pre-Filling stops the annoying problem where the last two machines keep shutting off.",
    painPoint: "If your main manifold sits below machine input height (bottom-fed), a tiny 5% dip in pipe fullness drains ALL machine feeds at once, causing constant stuttering.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Bottom-Fed (Broken) vs. Top-Fed +2m Gravity Drop (Best Practice)",
        caption: "Diagram 10A (Side View): Why Raising Your Main Header +2m Fixes Starving Machines",
        svg: wrapSvg("pm10a", 760, 215, `
          ${sideFloor(760, 192, ["0m", "2m", "4m"], true)}
          <!-- Left: Broken Bottom-Fed -->
          <rect x="44" y="14" width="332" height="170" rx="8" fill="#111827" stroke="#f87171" stroke-width="1.6"/>
          <text x="210" y="34" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">❌ BAD SIDE VIEW: Main Pipe Below Input Ports</text>
          ${svgMachine(74, 72, 92, 62, "Refinery #1", "Input @ +2m", "#64748b")}
          ${svgMachine(238, 72, 92, 62, "Refinery #2", "Input @ +2m", "#64748b")}
          <polyline points="56,162 350,162" fill="none" stroke="#38bdf8" stroke-width="6"/>
          <polyline points="120,162 120,134" fill="none" stroke="#f87171" stroke-width="4" marker-end="url(#arr-red-pm10a)"/>
          <polyline points="284,162 284,134" fill="none" stroke="#f87171" stroke-width="4" marker-end="url(#arr-red-pm10a)"/>
          ${svgJunction(120, 162, 10)}
          ${svgJunction(284, 162, 10)}
          <text x="210" y="154" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="700">Pipe on Floor (0m) → Starves inputs!</text>

          <!-- Right: Good Top-Fed -->
          <rect x="392" y="14" width="352" height="170" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.6"/>
          <text x="568" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">✅ GOOD SIDE VIEW: Main Pipe +2m ABOVE Inputs</text>
          <polyline points="406,66 724,66" fill="none" stroke="#38bdf8" stroke-width="6"/>
          ${svgMachine(432, 118, 92, 62, "Refinery #1", "50m³ Pre-Filled!", "#10b981")}
          ${svgMachine(598, 118, 92, 62, "Refinery #2", "50m³ Pre-Filled!", "#10b981")}
          <line x1="478" y1="66" x2="478" y2="112" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm10a)"/>
          <line x1="644" y1="66" x2="644" y2="112" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm10a)"/>
          ${svgJunction(478, 66, 10)}
          ${svgJunction(644, 66, 10)}
          <text x="568" y="54" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">Header +2m to +4m High (Gravity pulls straight down!)</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Full Looped Refinery Row on Foundation Grid",
        caption: "Diagram 10B (Top-Down View): How to Wire the Loop-Back Return Pipe Across a Machine Row",
        svg: wrapSvg("pm10b", 760, 170, `
          ${topGrid("pm10b", 760, 170, "8m × 8m Foundation Grid (Row of 4 Refineries)")}
          <line x1="36" y1="64" x2="682" y2="64" stroke="#38bdf8" stroke-width="6"/>
          <polyline points="682,64 682,36 168,36 168,64" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="6,3"/>
          <text x="425" y="29" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Loop-Back Return Pipe (Feeds End Machines From BOTH Sides!)</text>
          ${svgMachine(24, 46, 90, 36, "Fluid Source", "300 / 600", "#38bdf8")}
          ${[168, 308, 448, 588].map((x, i) => `
            <line x1="${x}" y1="64" x2="${x}" y2="104" stroke="#38bdf8" stroke-width="4" marker-end="url(#arr-blue-pm10b)"/>
            ${svgJunction(x, 64, 10)}
            ${svgMachine(x - 42, 108, 84, 42, `Machine #${i + 1}`, "Pre-Fill 50m³", "#10b981")}
          `).join("")}
        `),
      }
    ],
    bullets: [
      "**Feed From `+2 m` Above:** Place your manifold Pipeline Supports 1–2 clicks higher (`+2 m` to `+4 m`) than the machine ports so gravity drains fluid straight down into each machine.",
      "**Pre-Fill All Machine `50 m³` Buffers:** Leave machines on Standby for 60 seconds after connecting pipes so every internal machine tank hits `50/50 m³` first.",
      "**Loop Long Rows:** On `6+` machines, connect a return pipe from the last Junction back to the first Junction — eliminating back-wave dead ends.",
    ],
    buildSteps: [
      "1. Place a line of **Pipeline Supports** raised **1–2 clicks (`+2–4 m`)** in front of your machines and build the main header pipe along them.",
      "2. Add **T-Junctions** (or Crosses) rotated so the side port points straight **down** into each machine.",
      "3. Bridge a **Loop-Back** pipe connecting the far end of the header back to the very first Junction, pre-fill, and switch on power!",
    ],
    boxes: [
      { type: "green", title: "Example Real Factory: 10 Fuel Generators on 300 m³/min Rocket Fuel", text: "Even with zero Pumps (Rocket Fuel is Gas!), pre-filling + looping the end guarantees Generator #10 never flickers at startup." },
    ],
  },

  {
    id: "pm-11",
    num: 11,
    chapter: "ch3_setups",
    chapterTitle: "3. Real Factory Setups",
    title: "Running Full 600 m³/min Mk.2 Pipes Without Losing Flow",
    summary: "Never let back-sloshing reach the very first pipe touching a 600 m³/min Oil Extractor or overclocked Blender.",
    whyUseIt: "Pure Crude Oil nodes (600 m³/min at 250%), Heavy Oil Residue Refineries, and 250% Nuclear Water pipelines often mysteriously average 570–590 m³/min. Fixing that single source bottleneck recovers 100% of your 600 m³/min capacity.",
    painPoint: "When a slosh wave travels backward from the first Junction and fills the pipe touching your 600 m³/min Oil Extractor, the Extractor loses a fraction of a second of output time and can NEVER catch back up because 600 is already the max speed.",
    diagrams: [
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN VIEW (Fix A: Immediate Split) + 📐 SIDE VIEWS (Fix B: Gravity Drop & Fix C: Pump/Valve Wall)",
        caption: "Diagram 11: 3 Foolproof Ways to Get Exact 600.0 m³/min Out of One Mk.2 Pipe",
        svg: wrapSvg("pm11", 760, 240, `
          <!-- Fix A: Top-Down Split -->
          <rect x="14" y="14" width="240" height="212" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.8"/>
          <text x="134" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">🗺️ TOP-DOWN — Fix A (Best!)</text>
          <text x="134" y="50" text-anchor="middle" fill="#94a3b8" font-size="9.5">Split immediately at Source!</text>
          ${svgMachine(28, 102, 66, 46, "600/min", "Pure Oil", "#38bdf8")}
          <line x1="94" y1="125" x2="142" y2="125" stroke="#38bdf8" stroke-width="6"/>
          <polyline points="142,125 142,84 228,84" fill="none" stroke="#10b981" stroke-width="4.5" marker-end="url(#arr-green-pm11)"/>
          <polyline points="142,125 142,166 228,166" fill="none" stroke="#10b981" stroke-width="4.5" marker-end="url(#arr-green-pm11)"/>
          ${svgJunction(142, 125, 11, "T-Junc")}
          <text x="190" y="74" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">300 Left</text>
          <text x="190" y="182" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">300 Right</text>
          <text x="134" y="210" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">Loop both halves together!</text>

          <!-- Fix B: Side View Drop -->
          <rect x="266" y="14" width="236" height="212" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="384" y="34" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">📐 SIDE VIEW — Fix B (Drop)</text>
          <rect x="276" y="196" width="216" height="12" rx="2" fill="#334155"/>
          <text x="384" y="205" text-anchor="middle" fill="#cbd5e1" font-size="8.5">0m Floor</text>
          ${svgMachine(280, 74, 72, 44, "600/min", "+2m High", "#38bdf8")}
          <polyline points="352,96 404,96 404,168 482,168" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linejoin="round" marker-end="url(#arr-blue-pm11)"/>
          ${svgJunction(446, 168, 10)}
          <text x="446" y="128" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">Drops</text>
          <text x="446" y="142" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">2-4m</text>
          <text x="384" y="220" text-anchor="middle" fill="#94a3b8" font-size="9.5">Gravity empties source pipe fast</text>

          <!-- Fix C: Side View Valve/Pump Lock -->
          <rect x="514" y="14" width="232" height="212" rx="8" fill="#111827" stroke="#f59e0b" stroke-width="1.8"/>
          <text x="630" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">📐 SIDE VIEW — Fix C (Diode)</text>
          <rect x="524" y="196" width="212" height="12" rx="2" fill="#334155"/>
          <text x="630" y="205" text-anchor="middle" fill="#cbd5e1" font-size="8.5">0m Floor</text>
          ${svgMachine(526, 134, 68, 44, "600/min", "Source", "#38bdf8")}
          <line x1="594" y1="156" x2="728" y2="156" stroke="#38bdf8" stroke-width="6" marker-end="url(#arr-amber-pm11)"/>
          ${svgValve(644, 156, "Open 600", false)}
          <text x="630" y="96" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">Blocks waves from bouncing</text>
          <text x="630" y="110" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">into the source pipe!</text>
          <text x="630" y="220" text-anchor="middle" fill="#94a3b8" font-size="9.5">Use Pump or Open Valve (600)</text>
        `),
      },
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Why 600 m³/min Pipes Drop to ~575 Without Split/Drop/Diode",
        caption: "Diagram 11B (Side View): How a Back-Slosh Wave Hits the Source Pipe & How Splitting Eliminates It",
        svg: wrapSvg("pm11b", 760, 155, `
          ${sideFloor(760, 132, ["0m", "2m", "4m"], true)}
          ${svgMachine(48, 72, 118, 60, "600/min Source", "Pure Oil / Blender", "#f87171")}
          <line x1="166" y1="104" x2="412" y2="104" stroke="#38bdf8" stroke-width="6"/>
          <line x1="366" y1="104" x2="220" y2="104" stroke="#f87171" stroke-width="3" marker-end="url(#arr-red-pm11b)"/>
          ${svgJunction(412, 104, 12, "1st Cross")}
          <line x1="424" y1="104" x2="680" y2="104" stroke="#38bdf8" stroke-width="5"/>
          <text x="290" y="88" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">← Wave hits Source Pipe! (Clips to ~575)</text>
          <text x="568" y="88" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Fix: Split at 1st T-Junction into two 300s!</text>
        `),
      }
    ],
    bullets: [
      "**Fix A (Best & Zero Power):** Attach a **Pipeline T-Junction** right outside your `600 m³/min` Extractor/Blender and immediately split it into two **`300 m³/min` looped manifold pipes** (neither branch hits 600!).",
      "**Fix B (`+2 m` Gravity Drop):** Build your `600 m³/min` producer one floor/foundation higher than your manifold so liquid falls straight downward away from the port.",
      "**Fix C (One-Way Lock):** Place a **Pump** or fully open **Valve (`600 m³/min`)** on the very first pipe exit so downstream manifold waves bounce off the Valve instead of hitting the Extractor.",
    ],
    buildSteps: [
      "1. Never drag one single long `600 m³/min` Mk.2 pipe down 10 machines in a straight dead-end line.",
      "2. Place a **Pipeline T-Junction** within 1 foundation of your `600 m³/min` Oil Extractor and run two lines feeding both ends of your Refinery row.",
    ],
  },

  {
    id: "pm-12",
    num: 12,
    chapter: "ch3_setups",
    chapterTitle: "3. Real Factory Setups",
    title: "Recycling Byproduct Water & Acid Without Clogging (Aluminum & Nuclear Acid)",
    summary: "Never feed fresh Water Extractors straight into a level byproduct pipe — run dedicated byproduct machines OR use a VIP Priority Junction.",
    whyUseIt: "Essential for EVERY Aluminum factory (Sloppy Alumina + Electrode Aluminum Scrap), Uranium/Plutonium Sulfuric Acid loops, and Heavy Oil Residue recycling.",
    painPoint: "If your Scrap Refineries produce 120 m³/min of byproduct water and you merge that flat into a Water Extractor pipe, the Water Extractor fills the shared pipe to 100%, choking the Scrap Refineries until your whole aluminum factory shuts down.",
    diagrams: [
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — The Aluminum Clog Trap vs. Dedicated Byproduct Refineries (100% Jam-Proof!)",
        caption: "Diagram 12: Real Example — 3 Sloppy Alumina Refineries + 3 Scrap Refineries (Zero Valves/Pumps Needed!)",
        svg: wrapSvg("pm12", 760, 250, `
          ${topGrid("pm12", 760, 250, "8m × 8m Foundation Grid (Looking Down)")}
          <!-- Left: Broken Mix -->
          <rect x="18" y="34" width="332" height="200" rx="8" fill="rgba(17,24,39,0.92)" stroke="#f87171" stroke-width="1.8"/>
          <text x="184" y="54" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">❌ CLOG TRAP: Mixing Fresh &amp; Byproduct Flat</text>
          ${svgMachine(28, 76, 86, 46, "Water Ext.", "120 m³/min", "#38bdf8")}
          ${svgMachine(166, 70, 74, 58, "Alumina", "Needs 180", "#f59e0b")}
          ${svgMachine(264, 70, 76, 58, "Scrap", "60 Out!", "#f87171")}
          <line x1="114" y1="99" x2="166" y2="99" stroke="#38bdf8" stroke-width="5"/>
          <line x1="240" y1="99" x2="264" y2="99" stroke="#fbbf24" stroke-width="5"/>
          ${svgJunction(140, 99, 9)}
          <polyline points="302,128 302,168 140,168 140,108" fill="none" stroke="#f87171" stroke-width="4" marker-end="url(#arr-red-pm12)"/>
          <text x="184" y="196" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">Water Extractor floods pipe to 100%</text>
          <text x="184" y="212" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">→ Scrap Refinery jams &amp; stops!</text>

          <!-- Right: Dedicated Refineries Gold Standard -->
          <rect x="364" y="34" width="378" height="200" rx="8" fill="rgba(17,24,39,0.92)" stroke="#10b981" stroke-width="1.8"/>
          <text x="553" y="54" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">✅ GOLD STANDARD: Dedicated Fresh vs. Recycled Refineries</text>
          ${svgMachine(378, 72, 92, 46, "Fresh Water", "240 m³/min", "#38bdf8")}
          <line x1="470" y1="95" x2="516" y2="95" stroke="#38bdf8" stroke-width="5" marker-end="url(#arr-blue-pm12)"/>
          ${svgMachine(522, 72, 108, 46, "2x Alumina", "Fresh ONLY!", "#38bdf8")}

          ${svgMachine(378, 138, 92, 48, "Byproduct", "360 m³/min", "#10b981")}
          <line x1="470" y1="162" x2="516" y2="162" stroke="#10b981" stroke-width="5" marker-end="url(#arr-green-pm12)"/>
          ${svgMachine(522, 138, 108, 48, "1–2x Alumina", "Recycled ONLY!", "#10b981")}

          <polyline points="630,95 654,95 654,162 630,162" fill="none" stroke="#f59e0b" stroke-width="3"/>
          <line x1="654" y1="128" x2="722" y2="128" stroke="#f59e0b" stroke-width="4" marker-end="url(#arr-amber-pm12)"/>
          <text x="692" y="116" text-anchor="middle" fill="#fbbf24" font-size="9.5" font-weight="700">To Scrap</text>
          <text x="553" y="214" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Pipes NEVER touch! Zero Valves, Zero Pumps, Zero Clogs!</text>
        `),
      },
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Alternative Byproduct Fixes (VIP Priority Stack vs. Burn Water in Coal / Wet Concrete)",
        caption: "Diagram 12B (Side View): When You Only Have 1 Alumina Refinery (VIP Stack) or Want a Water Sink",
        svg: wrapSvg("pm12b", 760, 165, `
          ${sideFloor(760, 144, ["0m", "2m", "4m"], true)}
          <rect x="44" y="14" width="332" height="122" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.6"/>
          <text x="210" y="34" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">Alt 2: VIP Priority Merger (See Lesson 15!)</text>
          <line x1="56" y1="68" x2="236" y2="68" stroke="#38bdf8" stroke-width="4.5"/>
          <line x1="56" y1="110" x2="348" y2="110" stroke="#10b981" stroke-width="5" marker-end="url(#arr-green-pm12b)"/>
          <line x1="236" y1="68" x2="236" y2="110" stroke="#38bdf8" stroke-width="4.5"/>
          ${svgJunction(236, 68, 10)}${svgJunction(236, 110, 10)}
          <text x="134" y="58" text-anchor="middle" fill="#7dd3fc" font-size="9.5">Fresh Water (+2.5m Top)</text>
          <text x="134" y="100" text-anchor="middle" fill="#6ee7b7" font-size="9.5">Recycled (#1 Bottom)</text>

          <rect x="392" y="14" width="352" height="122" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.6"/>
          <text x="568" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">Alt 3: Burn Byproduct Water (No Loop Back!)</text>
          ${svgMachine(406, 62, 102, 54, "Scrap Refinery", "120 Water Out", "#f59e0b")}
          <line x1="508" y1="89" x2="574" y2="89" stroke="#38bdf8" stroke-width="5" marker-end="url(#arr-blue-pm12b)"/>
          ${svgMachine(578, 56, 148, 66, "Coal Generators /", "Wet Concrete → Sink!", "#10b981")}
        `),
      }
    ],
    bullets: [
      "**Option 1 — Dedicated Byproduct Refineries (100% Jam-Proof):** Divide your first-stage Refineries into two isolated groups: Group A runs **only** on Fresh Water Extractors, and Group B runs **only** on Recycled Byproduct Water. Since fresh water never enters Group B, Scrap Refineries can **never** clog!",
      "**Option 2 — VIP Priority Junction (Lesson 15):** If you only have 1 Alumina Refinery, build a vertical **VIP Junction** so recycled water drains first from the bottom port.",
      "**Option 3 — Burn Excess Water Elsewhere:** Pipe Scrap byproduct water straight into **Coal Generators** or a **Wet Concrete** Refinery -> Sink.",
    ],
    buildSteps: [
      "1. Calculate total byproduct water per minute (`e.g., 3 Electrode Scrap Refineries = 360 m³/min Water`).",
      "2. Set aside exact Refineries (`e.g., 2 Sloppy Alumina @ 200 each = 360 total`) on their OWN closed loop connected ONLY to the Scrap water outputs.",
      "3. Feed the remaining Alumina Refineries purely from Water Extractors, and combine only their Alumina Solution outputs!",
    ],
  },

  {
    id: "pm-13",
    num: 13,
    chapter: "ch3_setups",
    chapterTitle: "3. Real Factory Setups",
    title: "Power Plant Plumbing Secrets (Fuel Generator Auto-Flush & Nuclear 10 m³ Gulps)",
    summary: "Fuel Generators automatically flush old fuel when you upgrade fuel types — while Nuclear Power Plants gulp water in huge 10 m³ batches!",
    whyUseIt: "Saves hours of tedious manual flushing when upgrading a Fuel Power Plant to Turbofuel/Rocket Fuel, and prevents mysterious blackouts on overclocked Nuclear Power Plants.",
    painPoint: "Players spend ages manually flushing 100 Fuel Generators when upgrading fuel types (unnecessary!), OR wonder why a 250% Nuclear Power Plant on a 600 m³/min water pipe flickers off even though the water pipe looks mostly full.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Power Plant Tank Rules: Fuel Auto-Flush vs. Nuclear 10 m³ Gulp Threshold",
        caption: "Diagram 13: Fuel Generator Auto-Flush Secret & Why Nuclear Plants Need Pre-Filled Dedicated Water Pipes",
        svg: wrapSvg("pm13", 760, 225, `
          ${sideFloor(760, 202, ["0m", "2m", "4m"], true)}
          <!-- Left: Fuel Gen Auto Flush -->
          <rect x="44" y="14" width="332" height="180" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.6"/>
          <text x="210" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">Fuel Generator Auto-Flush on Upgrade!</text>
          <text x="210" y="50" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Fuel → Turbofuel → Rocket Fuel → Ionized Fuel)</text>
          <line x1="60" y1="126" x2="188" y2="126" stroke="#f59e0b" stroke-width="6" marker-end="url(#arr-amber-pm13)"/>
          ${svgMachine(194, 82, 152, 86, "Fuel Generator", "Auto-Flushes Old Fuel!", "#10b981")}
          <text x="124" y="114" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">New Fuel Arrives</text>
          <text x="270" y="158" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="700">(50 m³ Tank Clears Itself!)</text>

          <!-- Right: Nuclear 10 m3 Gulp -->
          <rect x="392" y="14" width="352" height="180" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.6"/>
          <text x="568" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">Coal (1 m³ Gulp) vs. Nuclear (10 m³ Batch Gulp!)</text>
          <line x1="412" y1="126" x2="532" y2="126" stroke="#38bdf8" stroke-width="6" marker-end="url(#arr-blue-pm13)"/>
          ${svgMachine(538, 82, 184, 86, "Nuclear Power Plant", "Waits for FULL 10 m³ Batch!", "#f59e0b")}
          <text x="472" y="110" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">Dedicated 600</text>
          <text x="472" y="144" text-anchor="middle" fill="#7dd3fc" font-size="9.5">(Pre-fill 50 m³ slot!)</text>
          <text x="630" y="158" text-anchor="middle" fill="#fbbf24" font-size="9.5" font-weight="700">Won't run if tank &lt; 10 m³!</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Dedicated Water Line Per 250% Nuclear Power Plant (600 m³/min Each)",
        caption: "Diagram 13B (Top-Down View): Rock-Solid 250% Nuclear Water Plumbing (Zero Daisy-Chaining!)",
        svg: wrapSvg("pm13b", 760, 150, `
          ${topGrid("pm13b", 760, 150, "8m × 8m Foundation Grid (One Dedicated Mk.2 Pipe Per 250% Reactor)")}
          ${svgMachine(24, 34, 156, 36, "2x Water Extractors", "240 + 240 = 480/min", "#38bdf8")}
          ${svgMachine(24, 84, 156, 36, "1x Water Extractor", "100% = 120/min", "#38bdf8")}
          <polyline points="180,52 280,52 280,76" fill="none" stroke="#38bdf8" stroke-width="5"/>
          <polyline points="180,102 280,102 280,76" fill="none" stroke="#38bdf8" stroke-width="5"/>
          ${svgJunction(280, 76, 11)}
          <line x1="280" y1="76" x2="480" y2="76" stroke="#10b981" stroke-width="6" marker-end="url(#arr-green-pm13b)"/>
          <text x="380" y="64" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Dedicated Mk.2 Pipe (600 m³/min)</text>
          ${svgMachine(486, 46, 236, 60, "1x Nuclear Power Plant @ 250%", "Pre-Fill 50m³ Before Rods!", "#f59e0b")}
        `),
      }
    ],
    bullets: [
      "**Fuel Generator Auto-Flush:** Unlike Refineries or Blenders, **Fuel Generators automatically erase leftover old Fuel** inside their `50 m³` tank the instant a new valid fuel touches their input! Only flush your pipes when upgrading.",
      "**Nuclear `10 m³` Batch Requirement:** A Coal Generator only waits for `1 m³` of water per burn cycle, **but a Nuclear Power Plant waits until `10 m³` accumulates** inside its input tank!",
      "**Never Daisy-Chain 250% Nuclear Plants:** At `250%` clock speed, a Nuclear Plant burns `600 m³/min` of water (`10 m³/s`). Give **each** `250%` Nuclear Plant its own dedicated Mk.2 pipe (or `2` Water Extractors + `1` underclocked Extractor) and pre-fill it to `50/50 m³` before inserting Uranium/Plutonium Fuel Rods!",
    ],
    buildSteps: [
      "1. Upgrading Fuel Power? Switch your Blenders to Turbofuel/Rocket Fuel, flush ONLY the pipe network once, and let every Fuel Generator auto-flush itself.",
      "2. Building Nuclear? Run `1` dedicated water pipe (`300` at 100% or `600` at 250%) per Reactor and let all Reactors fill to `50 m³` water before loading fuel rods.",
    ],
  },

  {
    id: "pm-14",
    num: 14,
    chapter: "ch3_setups",
    chapterTitle: "3. Real Factory Setups",
    title: "Fluid Train Stations (27s Pause Fix) & Resource Well Pressurizers (3-Shard Trick)",
    summary: "Wire BOTH ports of a Fluid Freight Platform into an Industrial Buffer to survive the 27-second docking pause — and put 3 Shards ONLY in your Resource Well Pressurizer!",
    whyUseIt: "Fluid Train Stations and Nitrogen/Water/Oil Resource Wells both suffer hidden throttling if you wire them like simple Miners or single pipes.",
    painPoint: "Using only 1 pipe on a Fluid Freight Platform permanently caps throughput far below 600 m³/min during 27s train docks, and wasting Shards on individual Resource Well Extractors wastes dozens of Power Shards!",
    diagrams: [
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Dual-Port Fluid Train Station (Top) & Resource Well Pressurizer (Bottom)",
        caption: "Diagram 14: Beating the 27s Train Freeze & Overclocking Up to 8 Wells With 3 Shards",
        svg: wrapSvg("pm14", 760, 265, `
          ${topGrid("pm14", 760, 265, "8m × 8m Foundation Grid (Looking Down)")}
          <!-- Top: Fluid Train Station -->
          <rect x="20" y="34" width="720" height="104" rx="8" fill="rgba(17,24,39,0.92)" stroke="#f59e0b" stroke-width="1.8"/>
          <text x="380" y="52" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">Fluid Freight Platform: Always Connect BOTH Ports Into an Industrial Buffer!</text>
          ${svgMachine(34, 64, 174, 62, "Fluid Freight Platform", "Freezes 27s per Train!", "#f59e0b")}
          <polyline points="208,80 318,80 318,95" fill="none" stroke="#38bdf8" stroke-width="5"/>
          <polyline points="208,110 318,110 318,95" fill="none" stroke="#38bdf8" stroke-width="5"/>
          <line x1="318" y1="95" x2="392" y2="95" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm14)"/>
          <text x="262" y="72" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="700">Mk.2 (600)</text>
          <text x="262" y="125" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="700">Mk.2 (600)</text>
          <text x="348" y="72" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="700">1,200 Burst!</text>
          ${svgBuffer(398, 56, 114, 72, 0.72, "2,400 m³", "Covers 27s")}
          <line x1="512" y1="95" x2="594" y2="95" stroke="#38bdf8" stroke-width="5.5" marker-end="url(#arr-blue-pm14)"/>
          ${svgMachine(598, 70, 126, 50, "Your Factory", "Steady 600/min", "#10b981")}

          <!-- Bottom: Resource Well Pressurizer -->
          <rect x="20" y="148" width="720" height="104" rx="8" fill="rgba(17,24,39,0.92)" stroke="#a78bfa" stroke-width="1.8"/>
          <text x="380" y="166" text-anchor="middle" fill="#d8b4fe" font-size="11.5" font-weight="700">Resource Well Pressurizer Secret: 3 Shards Boost ALL Satellite Extractors!</text>
          ${svgMachine(38, 178, 178, 60, "Central Pressurizer", "Put 3 Shards HERE (250%)", "#a78bfa")}
          <line x1="216" y1="208" x2="292" y2="208" stroke="#a78bfa" stroke-width="3.5" stroke-dasharray="5,3" marker-end="url(#arr-purple-pm14)"/>
          ${svgMachine(296, 178, 128, 60, "6–8 Satellite Wells", "0 Shards Needed!", "#10b981")}
          <text x="580" y="196" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">• 3 Shards overclock ALL 6–8 Extractors to 250%!</text>
          <text x="580" y="214" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">• Standby toggle skips the 16.5s spin-up on restart!</text>
          <text x="580" y="232" text-anchor="middle" fill="#94a3b8" font-size="9.5">(Each Extractor has its own 10 m natural Head Lift)</text>
        `),
      },
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Fluid Freight Platform Capacity (4 : 3 Ratio) & Resource Well Natural 10m Head Lift",
        caption: "Diagram 14B (Side View): Why One Freight Car (1,600 m³) Fits Inside One Platform (2,400 m³) + Well Lift",
        svg: wrapSvg("pm14b", 760, 165, `
          ${sideFloor(760, 144, ["0m", "5m", "10m"], true)}
          ${svgMachine(48, 62, 166, 82, "Fluid Freight Car", "Max = 1,600 m³", "#38bdf8")}
          <line x1="214" y1="104" x2="262" y2="104" stroke="#f59e0b" stroke-width="4" marker-end="url(#arr-amber-pm14b)"/>
          ${svgMachine(268, 48, 186, 96, "Fluid Freight Platform", "Max = 2,400 m³ (4:3!)", "#f59e0b")}
          <line x1="474" y1="18" x2="474" y2="138" stroke="#334155" stroke-width="1.5"/>
          ${svgMachine(492, 84, 108, 60, "Well Extractor", "10m Natural Lift", "#a78bfa")}
          <polyline points="600,114 646,114 646,60 726,60" fill="none" stroke="#a78bfa" stroke-width="5" marker-end="url(#arr-purple-pm14b)"/>
          <text x="676" y="48" text-anchor="middle" fill="#d8b4fe" font-size="10" font-weight="700">Gas: ∞ Height!</text>
          <text x="676" y="100" text-anchor="middle" fill="#7dd3fc" font-size="9.5">Water/Oil: 10m</text>
        `),
      }
    ],
    bullets: [
      "**Fluid Freight Platform (`27 s` Lock & `4:3` Tank Ratio):** Every Fluid Platform locks both pipes for `27 seconds` per train dock — wire **both ports** (`1,200 m³/min` catch-up) into an **Industrial Fluid Buffer** (`2,400 m³` vs Freight Car's `1,600 m³`).",
      "**Pressurizer 3-Shard Multiplier:** Never put Power Shards in Resource Well Extractors (they don't even have shard slots!). Put `3` Shards inside the **central Resource Well Pressurizer** to scale ALL `6–8` surrounding wells up to `250%`.",
      "**Instant `0.0s` Pressurizer Restart:** Once a Resource Well Pressurizer finishes its initial `16.5-second` spin-up, turning Standby OFF and ON later skips the `16.5s` spin-up unless you dismantle and rebuild it!",
    ],
    buildSteps: [
      "1. At any Fluid Train Station, attach two Mk.2 pipes from **both** platform ports into a Junction Cross right into an **Industrial Fluid Buffer**.",
      "2. At Nitrogen / Water / Oil Resource Wells, overclock the **central Pressurizer** to `250%` first so every satellite Extractor updates cleanly.",
    ],
  },

  // =========================================================================
  // CHAPTER 4: SPECIAL PIPE CIRCUITS (15-18)
  // =========================================================================
  {
    id: "pm-15",
    num: 15,
    chapter: "ch4_circuits",
    chapterTitle: "4. Special Pipe Circuits",
    title: "Variable Input Priority [VIP] Junction (Always Drain Recycled Fluid First!)",
    summary: "Forces a pipe junction to drain 100% of your bottom input pipe before taking even 1 drop from the top backup input pipe.",
    whyUseIt: "Build a VIP whenever you HAVE to merge two liquid sources into the same factory row and one source MUST NEVER back up — like Aluminum Scrap byproduct water returning to Alumina Refineries, or Sulfuric Acid returning to Uranium processing!",
    painPoint: "If you merge Recycled Water + Fresh Water in a flat Junction Cross on the floor, the Fresh Water Extractors push just as hard as the Recycled Water and jam your Scrap Refineries.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Exact Vertical Stack Heights (Foundation Floor = 0m, Upper Cross = +2.5m)",
        caption: "Diagram 15A (Side View): Classic Dual-Pump VIP vs. Ironclad Powered+Unpowered VIP (Why Pumps Beat Open Valves)",
        svg: wrapSvg("pm15a", 760, 240, `
          ${sideFloor(760, 218, ["0m", "2m", "4m", "6m"], true)}
          <!-- Left: Classic Dual-Pump VIP -->
          <rect x="44" y="14" width="328" height="196" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="208" y="34" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="700">Option A: Dual-Pump VIP (Powered or Unpowered!)</text>
          <!-- Upper Fresh (+2.5m) -->
          <line x1="56" y1="86" x2="256" y2="86" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(118, 74, "right", true, "Fresh (#2)")}
          <text x="86" y="76" text-anchor="middle" fill="#7dd3fc" font-size="9.5">+2.5m High</text>
          <!-- Lower Priority (0m) -->
          <line x1="56" y1="168" x2="354" y2="168" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm15a)"/>
          ${svgPump(118, 156, "right", true, "Byproduct (#1)")}
          <text x="86" y="156" text-anchor="middle" fill="#6ee7b7" font-size="9.5">Floor (0m)</text>
          <!-- Vertical Pipe between Crosses -->
          <line x1="256" y1="86" x2="256" y2="168" stroke="#38bdf8" stroke-width="5"/>
          ${svgJunction(256, 86, 13, "Top Cross")}
          ${svgJunction(256, 168, 13, "Bottom Cross")}
          <text x="322" y="156" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Out to Factory</text>

          <!-- Right: Ironclad Powered+Unpowered VIP -->
          <rect x="388" y="14" width="356" height="196" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.8"/>
          <text x="566" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Option B: Asymmetric Ironclad VIP (Unpowered Top Pump)</text>
          <line x1="402" y1="86" x2="618" y2="86" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(488, 74, "right", false, "Unpowered 0m Strip")}
          <text x="444" y="74" text-anchor="middle" fill="#7dd3fc" font-size="9.5">Fresh (+2.5m)</text>

          <line x1="402" y1="168" x2="726" y2="168" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm15a)"/>
          ${svgPump(488, 156, "right", true, "Byproduct +20m (#1)")}
          <text x="444" y="156" text-anchor="middle" fill="#6ee7b7" font-size="9.5">Byproduct (0m)</text>
          <line x1="618" y1="86" x2="618" y2="168" stroke="#38bdf8" stroke-width="5"/>
          ${svgJunction(618, 86, 13, "Top Cross")}
          ${svgJunction(618, 168, 13, "Bottom Cross")}
          <text x="684" y="156" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Out (#1 + #2)</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — How the VIP Junction Sits on Your Foundation Grid",
        caption: "Diagram 15B (Top-Down View): Footprint on Foundations (Bottom Pipe Lies Flat; Upper Pipe Stacks Above It)",
        svg: wrapSvg("pm15b", 760, 155, `
          ${topGrid("pm15b", 760, 155, "8m × 8m Foundation Grid (VIP Footprint = 2 Foundations)")}
          <line x1="44" y1="98" x2="690" y2="98" stroke="#10b981" stroke-width="6" marker-end="url(#arr-green-pm15b)"/>
          ${svgPump(188, 86, "right", true, "Byproduct #1 (0m Floor)")}
          <polyline points="44,54 388,54 388,98" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linejoin="round"/>
          ${svgPump(210, 42, "right", false, "Fresh #2 (+2.5m)")}
          ${svgJunction(388, 98, 14, "Stacked Crosses")}
          <text x="580" y="84" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Combined Output → Refineries</text>
          <text x="580" y="120" text-anchor="middle" fill="#94a3b8" font-size="10">Upper Cross sits directly above Bottom Cross!</text>
        `),
      }
    ],
    bullets: [
      "**Why It Works (Both Powered & Unpowered!):** Once both outlet pipes fill and merge at the stacked Crosses, they share ONE pressure ceiling — so the lower pipe (`0 m`) always has `+2.5–3 m` more pressure headroom than the upper pipe (`+2.5 m`)!",
      "**Why Pumps Beat Open Valves on VIPs:** Every **Pipeline Pump** (even unpowered!) completely **strips upstream Head Lift** and blocks reverse flow from pushing back upstream. **Open Valves** do NOT strip upstream pressure — if your Fresh pipe comes down from a higher Water Extractor or tower, that extra pressure passes right through an Open Valve!",
      "**Asymmetric Ironclad Option B (0 MW on Top):** Put an **unpowered Mk.1 Pump** on the upper Fresh pipe (`strips Fresh pressure to 0 m`) and a **powered Mk.1 Pump** (or unpowered if both heights match) on the bottom Byproduct pipe — Byproduct wins `100%` of the time!",
    ],
    buildSteps: [
      "1. Place **Bottom Junction Cross** flat on the foundation floor (horizontal ports aligned left/right, vertical ports pointing straight up/down).",
      "2. Place **Top Junction Cross** directly `2.5–4 m` above it (using a vertical Pipeline Support or temporary 2m foundation) and connect them with a vertical pipe.",
      "3. Wire **Byproduct (#1 Priority)** into the **Bottom Cross** through a **Pipeline Pump**, wire **Fresh (#2 Backup)** into the **Top Cross** through a **Pipeline Pump** (even **unpowered** strips Fresh upstream head lift!), and take your **Output** out the opposite side of the **Bottom Cross**!",
    ],
  },

  {
    id: "pm-16",
    num: 16,
    chapter: "ch4_circuits",
    chapterTitle: "4. Special Pipe Circuits",
    title: "Variable Output Priority [VOP] & Gravity Overflow Dam (Feed Power First!)",
    summary: "Send 100% of your fuel or water out the bottom pipe to your Power Generators first — excess only spills over a +6m arch into Packagers once Generators are full!",
    whyUseIt: "Perfect for Fuel setups where you want 100% of Fuel going to Fuel Generators to keep the lights on, while automatically sending ONLY leftover Fuel to a Packager (for Jetpack Fuel, Drones, or Sinking) — OR spilling excess Water into Coal / Wet Concrete!",
    painPoint: "If you split Fuel horizontally with a normal Junction Cross, your Packager steals 50% of your Fuel even while your Fuel Generators are starving!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Gravity Overflow Dam (Left: +6m Arch) & Multi-Floor VOP Stack (Right)",
        caption: "Diagram 16A (Side View): Exact Height Setup Showing How the +6m Arch Blocks Overflow Until Primary Is Full",
        svg: wrapSvg("pm16a", 760, 235, `
          ${sideFloor(760, 212, ["0m", "2m", "4m", "6m", "8m"], true)}
          <!-- Left: Overflow Dam -->
          <rect x="44" y="14" width="336" height="190" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.8"/>
          <text x="212" y="34" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">Gravity Overflow Dam (1 Main, 1 Overflow)</text>
          <line x1="58" y1="184" x2="362" y2="184" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm16a)"/>
          ${svgPump(68, 172, "right", true, "Lift (Optional)")}
          ${svgJunction(174, 184, 12)}
          <polyline points="174,172 174,66 254,66 254,132 360,132" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linejoin="round" marker-end="url(#arr-amber-pm16a)"/>
          ${svgValve(296, 132, "Valve", false)}
          <text x="214" y="56" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">+6m Arch (Below Pump Limit!)</text>
          <text x="296" y="198" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Main → Generators (#1)</text>
          <text x="312" y="114" text-anchor="middle" fill="#fbbf24" font-size="10">Extra → Packager (#2)</text>

          <!-- Right: Multi-Row VOP -->
          <rect x="392" y="14" width="352" height="190" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.8"/>
          <text x="568" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">VOP Stack (Prioritize Generator Rows 1 → 2 → 3)</text>
          <line x1="406" y1="184" x2="646" y2="184" stroke="#38bdf8" stroke-width="5"/>
          <line x1="510" y1="184" x2="510" y2="78" stroke="#38bdf8" stroke-width="5"/>
          <line x1="510" y1="130" x2="646" y2="130" stroke="#38bdf8" stroke-width="5"/>
          <line x1="510" y1="78" x2="646" y2="78" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(418, 172, "right", true, "Pump")}
          ${svgJunction(510, 184, 11)}
          ${svgJunction(510, 130, 11)}
          ${svgJunction(510, 78, 11)}
          ${svgValve(580, 184, "", false)}
          ${svgValve(580, 130, "", false)}
          ${svgValve(580, 78, "", false)}
          <line x1="636" y1="184" x2="658" y2="184" stroke="#10b981" stroke-width="3" marker-end="url(#arr-green-pm16a)"/>
          <line x1="636" y1="130" x2="658" y2="130" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-blue-pm16a)"/>
          <line x1="636" y1="78" x2="658" y2="78" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr-amber-pm16a)"/>
          <text x="702" y="188" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Row 1 (1st)</text>
          <text x="702" y="134" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">Row 2 (2nd)</text>
          <text x="702" y="82" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">Row 3 (Last)</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Overflow Dam Footprint Connecting Refineries → Fuel Generators + Packager",
        caption: "Diagram 16B (Top-Down View): Floor Footprint of Your Fuel + Jetpack Packager Overflow",
        svg: wrapSvg("pm16b", 760, 145, `
          ${topGrid("pm16b", 760, 145, "8m × 8m Foundation Grid (Looking Down)")}
          ${svgMachine(24, 52, 114, 46, "Fuel Refineries", "Source Flow", "#38bdf8")}
          <line x1="138" y1="75" x2="546" y2="75" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm16b)"/>
          ${svgJunction(288, 75, 13, "Overflow Cross")}
          ${svgMachine(554, 52, 174, 46, "Fuel Generators", "#1 Priority (Flat on Floor)", "#10b981")}
          <polyline points="288,62 288,36 456,36" fill="none" stroke="#f59e0b" stroke-width="4.5" marker-end="url(#arr-amber-pm16b)"/>
          ${svgValve(372, 36, "Valve", false)}
          <text x="412" y="24" text-anchor="middle" fill="#fbbf24" font-size="9.5" font-weight="700">+6m Arch Up &amp; Down</text>
          ${svgMachine(462, 18, 128, 34, "Packager", "#2 Overflow Only!", "#f59e0b")}
        `),
      }
    ],
    bullets: [
      "**Power Generators Never Starve:** Your primary line stays flat at `0 m`, so 100% of fuel goes to Generators until they are completely full.",
      "**Keep the Arch Below Source Head Lift:** If a Refinery feeds the junction (`10 m` natural Head Lift), make the overflow arch **`4–8 m` tall** (`1–2` walls high). Never make it `12+ m` without adding a Pump!",
      "**Add a Downstream Valve on the Overflow Leg:** Prevents backflow from the Packager/Sink side from bouncing back over the arch.",
    ],
    buildSteps: [
      "1. Place a **Pipeline Junction Cross** upright on the floor in front of your Fuel source (`horizontal in -> horizontal out -> straight up overflow`).",
      "2. Run the flat exit straight to your **Fuel Generators** (`#1 Priority`).",
      "3. Place a Pipeline Support raised `+6 m` (3 clicks) next to the Cross, loop a pipe out the **top port** over the raised support, down through an open **Valve**, and into your **Packager** (`#2 Overflow`).",
    ],
  },

  {
    id: "pm-17",
    num: 17,
    chapter: "ch4_circuits",
    chapterTitle: "4. Special Pipe Circuits",
    title: "Water Towers & Two-Way Blackout Loops (Pressurize Your Whole Factory @ 0 MW!)",
    summary: "Pump liquid up ONE tower once — or fill a single sky-pipe above a 0 m³/min closed Valve — to give your entire lower factory free Head Lift forever.",
    whyUseIt: "Instead of placing and powering 20 separate Pipeline Pumps across a sprawling multi-floor factory, pump ONE single pipe to the roof height once and let gravity + pressure share that Head Lift everywhere below!",
    painPoint: "Forgetting to keep the top of a Water Tower 100% full (or placing a Fluid Buffer below 100% inline at the bottom) drops the entire factory's Head Lift back to 0 m.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Classic Buffer Water Tower vs. Zero-Power Closed-Valve Sky-Pipe + Two-Way Bypass",
        caption: "Diagram 17: 3 Ways to Build a Water Tower (Including the Zero-Power 0 m³/min Valve Tower!)",
        svg: wrapSvg("pm17", 760, 250, `
          ${sideFloor(760, 228, ["0m", "10m", "20m", "30m", "40m", "50m"], true)}
          <!-- Left: Classic Buffer Water Tower -->
          <rect x="44" y="14" width="224" height="206" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.6"/>
          <text x="156" y="34" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">Classic Buffer Tower</text>
          ${svgBuffer(116, 46, 80, 68, 1.0, "100% Full", "Roof (+40m)")}
          <line x1="156" y1="114" x2="156" y2="196" stroke="#38bdf8" stroke-width="5"/>
          <line x1="60" y1="196" x2="252" y2="196" stroke="#10b981" stroke-width="5" marker-end="url(#arr-green-pm17)"/>
          ${svgValve(156, 152, "0 m³/min", true)}
          ${svgJunction(156, 196, 10)}
          <text x="156" y="213" text-anchor="middle" fill="#94a3b8" font-size="9.5">Buffer must stay 100% full!</text>

          <!-- Middle: NEW 0-MW Closed Valve Sky Pipe -->
          <rect x="280" y="14" width="234" height="206" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.8"/>
          <text x="397" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">NEW: 0-MW Closed-Valve Tower</text>
          <rect x="366" y="48" width="62" height="22" rx="4" fill="#113328" stroke="#10b981" stroke-width="1.5"/>
          <text x="397" y="63" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="700">Roof (+50m)</text>
          <line x1="397" y1="70" x2="397" y2="196" stroke="#38bdf8" stroke-width="6"/>
          <line x1="298" y1="196" x2="496" y2="196" stroke="#10b981" stroke-width="5" marker-end="url(#arr-green-pm17)"/>
          ${svgValve(397, 140, "Set 0 m³/min!", true)}
          ${svgJunction(397, 196, 10)}
          <text x="397" y="102" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">1 Full Pipe (No Buffer!)</text>
          <text x="397" y="213" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">Delete Pump → 98% Lift @ 0 MW!</text>

          <!-- Right: Two-Way Pump -->
          <rect x="526" y="14" width="218" height="206" rx="8" fill="#111827" stroke="#fbbf24" stroke-width="1.6"/>
          <text x="635" y="34" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">Two-Way Blackout Bypass</text>
          <line x1="606" y1="204" x2="606" y2="54" stroke="#38bdf8" stroke-width="5" marker-end="url(#arr-blue-pm17)"/>
          <polyline points="606,76 672,76 672,182 606,182" fill="none" stroke="#f59e0b" stroke-width="4" marker-end="url(#arr-amber-pm17)"/>
          ${svgJunction(606, 76, 10)}
          ${svgJunction(606, 182, 10)}
          <rect x="593" y="110" width="26" height="36" rx="4" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>
          <text x="562" y="132" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">Pump</text>
          <text x="706" y="124" text-anchor="middle" fill="#fbbf24" font-size="9.5">Gravity</text>
          <text x="706" y="138" text-anchor="middle" fill="#fbbf24" font-size="9.5">drain</text>
          <text x="635" y="213" text-anchor="middle" fill="#94a3b8" font-size="9.5">Lets tower drain back if power dies</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Connecting One 0-MW Water Tower Into a Whole Factory Network",
        caption: "Diagram 17B (Top-Down View): Build the Tower Once in One Corner Foundation — It Pressurizes Every Wing!",
        svg: wrapSvg("pm17b", 760, 145, `
          ${topGrid("pm17b", 760, 145, "8m × 8m Foundation Grid (One Corner Tower Feeds Whole Factory)")}
          <rect x="28" y="42" width="110" height="58" rx="6" fill="#113328" stroke="#10b981" stroke-width="2"/>
          <text x="83" y="66" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">Sky-Pipe Tower</text>
          <text x="83" y="82" text-anchor="middle" fill="#fbbf24" font-size="9.5">+ Valve @ 0 m³/min</text>
          <line x1="138" y1="71" x2="670" y2="71" stroke="#38bdf8" stroke-width="5.5"/>
          ${svgJunction(230, 71, 10, "Main Bus")}
          <line x1="230" y1="71" x2="230" y2="112" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm17b)"/>
          ${svgMachine(248, 96, 128, 34, "Wing A (+20m)", "0 Pumps Needed!", "#10b981")}
          ${svgJunction(460, 71, 10)}
          <line x1="460" y1="71" x2="460" y2="112" stroke="#10b981" stroke-width="4" marker-end="url(#arr-green-pm17b)"/>
          ${svgMachine(478, 96, 134, 34, "Wing B (+35m)", "0 Pumps Needed!", "#10b981")}
          <text x="692" y="75" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">→ Wing C</text>
        `),
      }
    ],
    bullets: [
      "**How the `0-MW` Closed-Valve Tower Works:** Because a closed Valve (`0 m³/min`) blocks all fluid from draining out while still transmitting **`98%` of upstream Head Lift**, you only need to pump **one single vertical pipe** to roof height once, close the Valve to `0`, and **delete your temporary Pump**!",
      "**Saved Across Reloads:** The filled tower pipe stays full across save/load, giving every pipe below it permanent `98%` Head Lift at `0 MW`.",
      "**Two-Way Pump Loop:** Useful if you *want* an elevated Fluid Buffer to automatically drain back down to emergency Coal/Fuel Generators when power goes out.",
    ],
    buildSteps: [
      "1. Put a **Junction Cross** on your main water/oil supply pipe at floor level, and build one vertical pipe climbing up to your highest machine floor (`e.g., +40 m`).",
      "2. Place a **Valve** just above the bottom Junction (wide open) and attach a temporary **Pipeline Pump** above/below it until the top pipe is `100%` full.",
      "3. Set the Valve to **`0 m³/min`** and dismantle the temporary Pump — enjoy free Head Lift across every connected floor!",
    ],
  },

  {
    id: "pm-18",
    num: 18,
    chapter: "ch4_circuits",
    chapterTitle: "4. Special Pipe Circuits",
    title: "Side-Branch Surge Buffers (Why Old 2022 “Flow Equalizers” Break Head Lift)",
    summary: "Never put a Fluid Buffer inline after a Pump like the old 2022 Equalizer — wire Surge Buffers sideways off a T-Junction instead!",
    whyUseIt: "Build a Side-Branch Surge Buffer whenever you want to smooth out pulsing Refineries, Blenders, or Train platforms on a pressurized factory floor WITHOUT accidentally wiping out your uphill Pump Head Lift.",
    painPoint: "Old 2022 guides advised wrapping a Fluid Buffer + Valve inline (`Flow Equalizer` / `Compensator`) to stop gauge wobble. In reality, whenever that Buffer isn't 100% full, it resets a 50m Pump right down to 4m!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — Old 2022 Inline Equalizer (Breaks Lift) vs. 🗺️ Side-Branch Surge Buffer (Keeps Full Lift!)",
        caption: "Diagram 18: Why Side-Branching Preserves 50m Head Lift While Smoothing Pulses",
        svg: wrapSvg("pm18", 760, 215, `
          <!-- Left: Old Equalizer (Broken) -->
          <rect x="14" y="14" width="356" height="188" rx="8" fill="#111827" stroke="#f87171" stroke-width="1.8"/>
          <text x="192" y="34" text-anchor="middle" fill="#fca5a5" font-size="11.5" font-weight="700">❌ AVOID: Old 2022 Inline Equalizer (Kills Lift!)</text>
          <rect x="24" y="182" width="336" height="12" rx="2" fill="#334155"/><text x="192" y="191" text-anchor="middle" fill="#cbd5e1" font-size="8.5">0m Floor</text>
          <line x1="28" y1="142" x2="348" y2="142" stroke="#38bdf8" stroke-width="5" marker-end="url(#arr-red-pm18)"/>
          ${svgPump(34, 130, "right", true, "50m Pump")}
          ${svgJunction(124, 142, 10)}
          ${svgValve(194, 142, "Valve", false, "bottom")}
          ${svgJunction(264, 142, 10)}
          <polyline points="124,132 124,78 264,78 264,132" fill="none" stroke="#38bdf8" stroke-width="4"/>
          ${svgBuffer(164, 48, 60, 50, 0.5, "<100%")}
          <text x="314" y="114" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">Drops to</text>
          <text x="314" y="128" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">4m Lift!</text>

          <!-- Right: Side-Branch Surge Damper (Good) -->
          <rect x="386" y="14" width="360" height="188" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.8"/>
          <text x="566" y="34" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">✅ GOOD (TOP-DOWN): Side-Branch Surge Buffer</text>
          <line x1="406" y1="84" x2="726" y2="84" stroke="#10b981" stroke-width="6" marker-end="url(#arr-green-pm18)"/>
          ${svgPump(424, 72, "right", true, "50m Pump")}
          ${svgJunction(542, 84, 11)}
          <line x1="542" y1="84" x2="542" y2="120" stroke="#38bdf8" stroke-width="5"/>
          ${svgBuffer(504, 118, 76, 66, 0.65, "Surge", "Side Tee")}
          <text x="660" y="68" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Full 50m Lift Kept!</text>
          <text x="660" y="138" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Main trunk stays 100% full</text>
          <text x="660" y="154" text-anchor="middle" fill="#94a3b8" font-size="10">(Or put Buffer BEFORE Pump!)</text>
        `),
      },
      {
        angle: "TOP",
        angleText: "🗺️ TOP-DOWN FLOOR VIEW — Putting a Surge Buffer BEFORE Your Pump vs. Side-Branching After",
        caption: "Diagram 18B (Top-Down View): Both Safe Ways to Smooth Pulsing Machines Without Breaking Head Lift",
        svg: wrapSvg("pm18b", 760, 145, `
          ${topGrid("pm18b", 760, 145, "8m × 8m Foundation Grid (Looking Down)")}
          ${svgMachine(24, 52, 104, 46, "Pulsing Source", "Train / Extractor", "#38bdf8")}
          <line x1="128" y1="75" x2="184" y2="75" stroke="#38bdf8" stroke-width="5"/>
          ${svgBuffer(186, 42, 74, 62, 0.7, "Buffer", "Before Pump!")}
          <line x1="260" y1="75" x2="316" y2="75" stroke="#38bdf8" stroke-width="5"/>
          ${svgPump(316, 63, "right", true, "50m Pump")}
          <line x1="368" y1="75" x2="486" y2="75" stroke="#10b981" stroke-width="5.5" marker-end="url(#arr-green-pm18b)"/>
          ${svgJunction(428, 75, 10)}
          <line x1="428" y1="75" x2="428" y2="112" stroke="#38bdf8" stroke-width="4"/>
          <text x="428" y="128" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="700">Optional Side Surge Tee</text>
          ${svgMachine(492, 52, 232, 46, "Uphill Factory (+40m High)", "Smooth Flow + Full 50m Lift!", "#10b981")}
        `),
      }
    ],
    bullets: [
      "**Never Put Partially Full Buffers Inline After a Pump:** An inline Buffer breaks the continuous full-pipe pressure chain.",
      "**Best Way to Smooth Flow:** Place your Buffer **before** your Pump, or branch it sideways off a **Pipeline T-Junction** on your flat manifold.",
    ],
    buildSteps: [
      "1. Place a **Pipeline T-Junction** (or Cross) on your horizontal main line.",
      "2. Attach a single side pipe into a **Fluid Buffer** sitting at the same floor height — keep your main line continuous!",
    ],
  },

  // =========================================================================
  // CHAPTER 5: TRICKS & TROUBLESHOOTING (19-20)
  // =========================================================================
  {
    id: "pm-19",
    num: 19,
    chapter: "ch5_tricks_faq",
    chapterTitle: "5. Tricks & Troubleshooting",
    title: "5 Hidden Pipe Building Tricks Every Pioneer Should Know",
    summary: "Stack Fluid Buffers like skyscrapers, place Floor Holes BEFORE pipes, flush one pipe in 1 click, and use the 5 Pipe Build Modes.",
    whyUseIt: "Speeds up clean factory building dramatically — saving foundations, avoiding invisible Floor Hole disconnects, and fixing wrong-fluid accidents in 1 second.",
    painPoint: "Dropping a Pipeline Floor Hole onto an existing pipe end often fails to connect internally, causing a full pipe on one side of a floor and an empty pipe on the other!",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — 4 Visual Pipe Construction Tricks (Concrete Floor = 0m)",
        caption: "Diagram 19: Skyscraper Buffer Stacking, Floor Hole Build Order, 1-Click Flush & [R] Build Modes",
        svg: wrapSvg("pm19", 760, 265, `
          <!-- Panel 1: Buffer Stack -->
          <rect x="14" y="12" width="356" height="120" rx="8" fill="#111827" stroke="#38bdf8" stroke-width="1.6"/>
          <text x="192" y="32" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-weight="700">1. Skyscraper Fluid Buffers (Zero Foundations!)</text>
          ${svgBuffer(46, 40, 50, 38, 0.4, "Top")}
          ${svgBuffer(46, 82, 50, 38, 0.9, "Base")}
          <text x="234" y="64" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Aim a Fluid Buffer right at an</text>
          <text x="234" y="80" text-anchor="middle" fill="#cbd5e1" font-size="10.5">existing Buffer! It snaps flush on top,</text>
          <text x="234" y="96" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="700">hides its legs, &amp; spins ports freely!</text>

          <!-- Panel 2: Floor Hole -->
          <rect x="386" y="12" width="360" height="120" rx="8" fill="#111827" stroke="#f59e0b" stroke-width="1.6"/>
          <text x="566" y="32" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="700">2. Pipeline Floor Hole Order Rule</text>
          <rect x="404" y="72" width="120" height="16" rx="2" fill="#334155" stroke="#94a3b8"/>
          <rect x="452" y="66" width="24" height="28" rx="3" fill="#f59e0b"/>
          <line x1="464" y1="44" x2="464" y2="66" stroke="#38bdf8" stroke-width="5"/>
          <line x1="464" y1="94" x2="464" y2="118" stroke="#38bdf8" stroke-width="5"/>
          <text x="634" y="62" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Place Floor Hole FIRST!</text>
          <text x="634" y="80" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Then snap pipes to top &amp; bottom.</text>
          <text x="634" y="96" text-anchor="middle" fill="#fca5a5" font-size="10">(Putting a Hole onto an existing</text>
          <text x="634" y="110" text-anchor="middle" fill="#fca5a5" font-size="10">pipe often fails to weld!)</text>

          <!-- Panel 3: Instant Flush -->
          <rect x="14" y="142" width="356" height="112" rx="8" fill="#111827" stroke="#10b981" stroke-width="1.6"/>
          <text x="192" y="164" text-anchor="middle" fill="#6ee7b7" font-size="11.5" font-weight="700">3. Instant Single-Pipe Clear (No Flush Menu!)</text>
          <text x="192" y="188" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Wrong liquid stuck in ONE short pipe?</text>
          <text x="192" y="208" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="700">Hold Ctrl &amp; Upgrade Mk.1 ↔ Mk.2 (or snap a Valve)</text>
          <text x="192" y="228" text-anchor="middle" fill="#94a3b8" font-size="10">Empties ONLY that pipe without draining neighbors!</text>

          <!-- Panel 4: Build Modes -->
          <rect x="386" y="142" width="360" height="112" rx="8" fill="#111827" stroke="#a78bfa" stroke-width="1.6"/>
          <text x="566" y="164" text-anchor="middle" fill="#d8b4fe" font-size="11.5" font-weight="700">4. Press [R] for 5 Pipe Build Modes + Support Tilt</text>
          <text x="566" y="188" text-anchor="middle" fill="#cbd5e1" font-size="10.5">Default (Auto 2D) · Auto Curve · Noodle · Straight · Horiz-to-Vert</text>
          <text x="566" y="208" text-anchor="middle" fill="#7dd3fc" font-size="10.5">• Use Straight / Horiz-to-Vert for clean 90° factory risers</text>
          <text x="566" y="228" text-anchor="middle" fill="#7dd3fc" font-size="10.5">• Scroll Pipeline Supports to tilt pipes in crisp 22.5° steps!</text>
        `),
      }
    ],
    bullets: [
      "**Trick 1 — Skyscraper Fluid Buffers:** Aim any **Fluid Buffer** directly at another Buffer to snap it flush on top (`+8 m` / `+12 m`), automatically tuck away its legs, and scroll-spin its ports.",
      "**Trick 2 — Floor Hole Order:** Always build the **Pipeline Floor Hole** onto the foundation FIRST, then attach pipes to both sides.",
      "**Trick 3 — Instant Single-Pipe Flush:** Upgrading (`Ctrl` + click) a pipe between Mk.1 and Mk.2 or splitting it with an attachment immediately wipes that single pipe's contents without draining the rest of your factory.",
      "**Trick 4 — `0.5 m` Attachment Snap Rule:** Snapping a Pump/Valve/Junction within `0.5 meters` of a pipe end snaps right onto the existing end port; snapping farther inward cuts the pipe cleanly in two.",
      "**Trick 5 — `22.5°` Support Tilt & `R` Build Modes:** Scroll the mouse wheel while placing a **Pipeline Support** to angle pipes cleanly up ramps in `22.5°` increments, and press `R` for **Straight**, **Noodle**, or **Horizontal-to-Vertical**!",
    ],
    buildSteps: [
      "1. Stack 3–5 Fluid Buffers straight upward to make a compact gravity tower with zero scaffolds.",
      "2. When routing through floors, place ALL **Pipeline Floor Holes** before dragging any pipes.",
    ],
  },

  {
    id: "pm-20",
    num: 20,
    chapter: "ch5_tricks_faq",
    chapterTitle: "5. Tricks & Troubleshooting",
    title: "The 3-Step Visual Troubleshooting Flowchart & 15-Question Rapid-Fire FAQ",
    summary: "Fix any broken pipe network in 30 seconds by checking Connections → Head Lift → Flow & Slosh in order.",
    whyUseIt: "Your one-stop emergency repair handbook when a factory stops getting liquid or gas — find the exact symptom below and fix it in seconds.",
    painPoint: "Guessing and adding random Pumps without checking bad Floor Hole welds or inline Buffers wastes hours and often makes sloshing worse.",
    diagrams: [
      {
        angle: "SIDE",
        angleText: "📐 SIDE VIEW — 30-Second Visual Rescue Order (Check Step 1 → Step 2 → Step 3)",
        caption: "Diagram 20: Always Check Connections First, Then Head Lift, Then Manifold & 600 m³/min Slosh",
        svg: wrapSvg("pm20", 760, 220, `
          <!-- Step 1 -->
          <rect x="14" y="14" width="224" height="192" rx="10" fill="#111827" stroke="#f87171" stroke-width="2"/>
          <text x="126" y="38" text-anchor="middle" fill="#fca5a5" font-size="12.5" font-weight="800">STEP 1: CONNECTIONS</text>
          <line x1="34" y1="84" x2="110" y2="84" stroke="#38bdf8" stroke-width="6"/>
          <rect x="114" y="68" width="14" height="32" fill="#94a3b8"/>
          <line x1="132" y1="84" x2="218" y2="84" stroke="#334155" stroke-width="6"/>
          <text x="72" y="66" text-anchor="middle" fill="#7dd3fc" font-size="10.5" font-weight="700">100% Full</text>
          <text x="176" y="66" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">0% Empty?!</text>
          <text x="126" y="128" text-anchor="middle" fill="#e2e8f0" font-size="10.5">Broken pipe weld at a</text>
          <text x="126" y="144" text-anchor="middle" fill="#e2e8f0" font-size="10.5">Floor Hole, Support, or Pump!</text>
          <text x="126" y="176" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Fix: Rebuild those 2 pipes</text>

          <line x1="238" y1="110" x2="264" y2="110" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-gray-pm20)"/>

          <!-- Step 2 -->
          <rect x="268" y="14" width="224" height="192" rx="10" fill="#111827" stroke="#f59e0b" stroke-width="2"/>
          <text x="380" y="38" text-anchor="middle" fill="#fbbf24" font-size="12.5" font-weight="800">STEP 2: HEAD LIFT</text>
          <polyline points="294,114 340,114 340,62 396,62" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linejoin="round"/>
          <line x1="340" y1="86" x2="340" y2="62" stroke="#334155" stroke-width="6"/>
          <text x="415" y="96" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="700">Stops climbing?</text>
          <text x="380" y="130" text-anchor="middle" fill="#e2e8f0" font-size="10.5">• Unpowered Pump on line?</text>
          <text x="380" y="146" text-anchor="middle" fill="#e2e8f0" font-size="10.5">• Inline Buffer &lt; 100% full?</text>
          <text x="380" y="162" text-anchor="middle" fill="#e2e8f0" font-size="10.5">• Height &gt; 10 / 20 / 50 m?</text>
          <text x="380" y="182" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Fix: Power / Add Pump</text>

          <line x1="492" y1="110" x2="518" y2="110" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arr-gray-pm20)"/>

          <!-- Step 3 -->
          <rect x="522" y="14" width="224" height="192" rx="10" fill="#111827" stroke="#10b981" stroke-width="2"/>
          <text x="634" y="38" text-anchor="middle" fill="#6ee7b7" font-size="12.5" font-weight="800">STEP 3: FLOW &amp; SLOSH</text>
          <text x="634" y="74" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="700">Pipes 50% full or ~580/min?</text>
          <text x="634" y="106" text-anchor="middle" fill="#e2e8f0" font-size="10.5">1. Pre-fill pipes + 50m³ tanks</text>
          <text x="634" y="124" text-anchor="middle" fill="#e2e8f0" font-size="10.5">2. Feed manifold from +2m ABOVE</text>
          <text x="634" y="142" text-anchor="middle" fill="#e2e8f0" font-size="10.5">3. Loop ends &amp; split 600s</text>
          <text x="634" y="160" text-anchor="middle" fill="#e2e8f0" font-size="10.5">4. Keep chains &lt; 100 pipes</text>
          <text x="634" y="182" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700">Fix: Top-Feed + Loop!</text>
        `),
      }
    ],
    bullets: [
      "**FAQ 1 — Pipe full before a Floor Hole/Support, completely empty right after:** Broken weld! Delete and rebuild the two pipes touching that Floor Hole (always place Floor Holes FIRST!).",
      "**FAQ 2 — My 600 m³/min pipe stalls around ~575–590 m³/min:** Source wave bounce! Split immediately at the producer via a T-Junction into two `300 m³/min` looped lines (Lesson 11).",
      "**FAQ 3 — I added an inline Fluid Buffer and my uphill machines starved:** Any Buffer under `100%` full resets upstream Head Lift to `0–8 m` / `0–12 m`. Place Pumps AFTER Buffers or branch Buffers sideways (Lesson 8 / 18).",
      "**FAQ 4 — Do Nitrogen Gas, Rocket Fuel, or Ionized Fuel need Pumps?** Never! Gases ignore gravity completely — and Fluid Buffers + Valves work normally on Gases (Lesson 4).",
      "**FAQ 5 — Do dips into valleys need Pumps?** No! Gravity pushes water right back up to your starting Head Lift altitude (Lesson 3).",
      "**FAQ 6 — Can I use a Mk.1 Pump (`20 m`) on a Mk.2 (`600 m³/min`) pipe?** Yes! Both Pumps handle `600 m³/min` equally — Mk.2 only lifts higher (`50 m` vs `20 m`).",
      "**FAQ 7 — My Refinery stopped even though its item belt is empty:** Check its **byproduct fluid output**! If *any* output fills up, the Refinery halts (Lesson 12).",
      "**FAQ 8 — How do I delete fluid in my inventory or one faulty pipe?** Drag fluid in your inventory to the Trash icon, or `Ctrl`-tap Mk.1 ↔ Mk.2 on that one pipe (Lesson 19).",
      "**FAQ 9 — My Fluid Train Station can't sustain 600 m³/min:** Connect **both** ports on the Fluid Freight Platform (`1,200` burst) into an Industrial Fluid Buffer to cover the `27 s` train pause (Lesson 14).",
      "**FAQ 10 — My massive unpumped manifold dies near the far end:** Chains of more than `100` consecutive short pipe segments + junctions drop upstream Head Lift — keep chains under `100` pieces or add a Pump halfway down.",
      "**FAQ 11 — Why did my short `< 5.5 m` pipe spawn with no glowing Flow Ring?** Pipes under `5.5 meters` (`3/4` of a Foundation) hide the ring visually — they still carry 100% full flow (Lesson 2).",
      "**FAQ 12 — Do I have to flush Fuel Generators when upgrading to Turbofuel or Rocket Fuel?** No! Fuel Generators auto-flush old fuel as soon as the new fuel reaches them — flush only the pipes (Lesson 13).",
      "**FAQ 13 — Why does my 250% Nuclear Plant flicker even with water nearby?** Nuclear Plants wait for a full `10 m³` gulp before burning! Give each `250%` Reactor its own pre-filled `600 m³/min` water pipe (Lesson 13).",
      "**FAQ 14 — Where do Power Shards go on a Resource Well?** Put `3` Shards inside the **central Resource Well Pressurizer** to boost ALL `6–8` satellite Extractors at once (Lesson 14).",
      "**FAQ 15 — How can I stack Fluid Buffers vertically without foundations?** Aim a Fluid Buffer hologram straight at the top of an existing Buffer — it snaps flush and hides its support legs (Lesson 19).",
    ],
    buildSteps: [
      "1. Check **Step 1 (Connections):** Press `E` on the full pipe and the empty pipe on each side of a Floor Hole or Pump — rebuild any missing weld.",
      "2. Check **Step 2 (Head Lift):** Look for unpowered Pumps, inline Buffers below `100%`, or climbs above `10 / 20 / 50 m`.",
      "3. Check **Step 3 (Flow & Slosh):** Pre-fill machine `50 m³` buffers, elevate headers `+2 m`, and split `600 m³/min` lines into loops.",
    ],
    boxes: [
      { type: "green", title: "Ready to Plumb Anything!", text: "Start simple: keep pipes 100% full, feed manifolds +2m from above, loop long rows, split 600 m³/min lines early, and use Dedicated Refineries or a 0-MW VIP for byproducts." },
    ],
  },
];

export const VISUAL_MANUAL_COUNT = LESSONS.length;

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRichInline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<span class="pm-highlight">$1</span>');
}

function matchesManualSearch(lesson, q) {
  if (!q) return true;
  const ql = q.toLowerCase();
  const hay = [
    lesson.chapterTitle,
    lesson.title,
    lesson.summary,
    lesson.whyUseIt || "",
    lesson.painPoint || "",
    ...(lesson.bullets || []),
    ...(lesson.buildSteps || []),
    ...(lesson.boxes || []).map((b) => `${b.title} ${b.text}`),
    lesson.quiz ? `${lesson.quiz.question} ${lesson.quiz.answer}` : "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(ql);
}

export function renderVisualPlumbingManual(container, searchQuery, activeChapterId, onSelectChapter) {
  const filtered = LESSONS.filter((l) => matchesManualSearch(l, searchQuery));
  const visible =
    activeChapterId === "ALL" ? filtered : filtered.filter((l) => l.chapter === activeChapterId);

  const legendCard = document.createElement("section");
  legendCard.className = "pm-legend-bar";
  legendCard.innerHTML = `
    <span class="pm-legend-title">Guide Legend:</span>
    <span class="pm-legend-chip pm-chip-green">🎯 Why Use It &amp; Solutions</span>
    <span class="pm-legend-chip pm-chip-blue">📐 Blue = Golden Rules</span>
    <span class="pm-legend-chip pm-chip-red">💥 Red = Traps &amp; What Breaks</span>
    <span class="pm-legend-chip pm-chip-yellow">💡 Yellow = Why It Happens</span>
  `;
  container.appendChild(legendCard);

  if (!searchQuery) {
    renderTopPipeXRaySandbox(container);
  }

  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-col";
    empty.textContent = "No visual lessons matched your search. Try 'pump', 'gas', '600', 'aluminum', 'nuclear', or 'vip'.";
    container.appendChild(empty);
    return;
  }

  for (const lesson of visible) {
    const card = document.createElement("article");
    card.className = "card pm-lesson-card";

    // 1. Header
    const header = document.createElement("div");
    header.className = "pm-lesson-head";
    header.innerHTML = `
      <div class="card-badges">
        <span class="code-badge">Lesson ${lesson.num}</span>
        <button type="button" class="sprint-badge pm-chap-btn" title="Filter to ${escapeHtml(lesson.chapterTitle)}">${escapeHtml(lesson.chapterTitle)}</button>
      </div>
      <h3 class="pm-lesson-title">${escapeHtml(lesson.title)}</h3>
      <p class="pm-lesson-summary">${escapeHtml(lesson.summary)}</p>
    `;
    const chapBtn = header.querySelector(".pm-chap-btn");
    if (chapBtn && typeof onSelectChapter === "function") {
      chapBtn.addEventListener("click", () => onSelectChapter(lesson.chapter));
    }
    card.appendChild(header);

    // 2. Concrete Purpose & Pain Point ("What Is This Good For?" + "What Breaks Without It?")
    if (lesson.whyUseIt || lesson.painPoint) {
      const whyGrid = document.createElement("div");
      whyGrid.className = "pm-why-grid";
      if (lesson.whyUseIt) {
        const wBox = document.createElement("div");
        wBox.className = "pm-box pm-box-green";
        wBox.innerHTML = `
          <div class="pm-box-title">🎯 What Is This Good For? (Real Factory Examples)</div>
          <div class="pm-box-text">${formatRichInline(lesson.whyUseIt)}</div>
        `;
        whyGrid.appendChild(wBox);
      }
      if (lesson.painPoint) {
        const pBox = document.createElement("div");
        pBox.className = "pm-box pm-box-red";
        pBox.innerHTML = `
          <div class="pm-box-title">💥 What Happens If You Don't Know This?</div>
          <div class="pm-box-text">${formatRichInline(lesson.painPoint)}</div>
        `;
        whyGrid.appendChild(pBox);
      }
      card.appendChild(whyGrid);
    }

    // 3. Multi-Angle Visual SVG Blueprints
    for (const d of lesson.diagrams || []) {
      const wrap = document.createElement("div");
      wrap.className = "pm-svg-wrap";
      const badgeCls = d.angle === "TOP" ? "pm-angle-top" : "pm-angle-side";
      wrap.innerHTML = `
        <div class="pm-svg-header">
          <div class="pm-svg-angle ${badgeCls}">${d.angleText}</div>
          <div class="pm-svg-caption">${escapeHtml(d.caption)}</div>
        </div>
        <div class="pm-svg-stage">${d.svg}</div>
      `;
      card.appendChild(wrap);
    }

    // 4. Plain-English Rules
    if (lesson.bullets && lesson.bullets.length > 0) {
      const ul = document.createElement("ul");
      ul.className = "pm-bullets";
      for (const b of lesson.bullets) {
        const li = document.createElement("li");
        li.innerHTML = formatRichInline(b);
        ul.appendChild(li);
      }
      card.appendChild(ul);
    }

    // 5. Concrete Step-by-Step Build Recipe
    if (lesson.buildSteps && lesson.buildSteps.length > 0) {
      const stepWrap = document.createElement("div");
      stepWrap.className = "pm-steps-card";
      stepWrap.innerHTML = `<div class="pm-steps-title">🛠️ Exact Step-by-Step Build Recipe</div>`;
      const ol = document.createElement("div");
      ol.className = "pm-steps-list";
      for (const st of lesson.buildSteps) {
        const row = document.createElement("div");
        row.className = "pm-step-row";
        row.innerHTML = formatRichInline(st);
        ol.appendChild(row);
      }
      stepWrap.appendChild(ol);
      card.appendChild(stepWrap);
    }

    // 6. Color-Coded Callout Boxes
    if (lesson.boxes && lesson.boxes.length > 0) {
      const boxGrid = document.createElement("div");
      boxGrid.className = "pm-box-grid";
      for (const box of lesson.boxes) {
        const div = document.createElement("div");
        div.className = `pm-box pm-box-${box.type}`;
        div.innerHTML = `
          <div class="pm-box-title">${escapeHtml(box.title)}</div>
          <div class="pm-box-text">${formatRichInline(box.text)}</div>
        `;
        boxGrid.appendChild(div);
      }
      card.appendChild(boxGrid);
    }

    // 7. Interactive Knowledge Check
    if (lesson.quiz) {
      const qCard = document.createElement("div");
      qCard.className = "pm-quiz-card";
      qCard.innerHTML = `
        <div class="pm-quiz-q"><strong>Knowledge Check:</strong> ${escapeHtml(lesson.quiz.question)}</div>
        <button type="button" class="btn btn-sm pm-quiz-btn">Show Answer</button>
        <div class="pm-box pm-box-green pm-quiz-ans hidden">
          <div class="pm-box-title">Answer</div>
          <div class="pm-box-text">${formatRichInline(lesson.quiz.answer)}</div>
        </div>
      `;
      const btn = qCard.querySelector(".pm-quiz-btn");
      const ans = qCard.querySelector(".pm-quiz-ans");
      btn.addEventListener("click", () => {
        const showing = !ans.classList.contains("hidden");
        ans.classList.toggle("hidden", showing);
        btn.textContent = showing ? "Show Answer" : "Hide Answer";
      });
      card.appendChild(qCard);
    }

    enhanceLessonWithInteractivity(card, lesson);
    container.appendChild(card);
  }
}
