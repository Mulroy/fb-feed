// Interactive Mod Visual Studio Dashboard (public/mod_studio.js)
// Granular visual editor + live 16:9 canvas preview + custom PNG slot uploader + PipeXRayConfig.json / PipeXRayTunables.h / Chat Prompt exporter.
// Zero branding strings, zero binary hex leaks, clean persistent DOM controls for silky 60 FPS slider dragging.

const STUDIO_STORAGE_KEY = "pipe_xray_studio_cfg_v13";

export const DEFAULT_TUNABLES = {
  MinFluidLuminance: 0.30,
  FluidEmissiveBoost: 1.45,
  FluidCoreAlpha: 0.90,
  FluidColorOverrides: {
    Water: "#2eb8ff",
    "Crude Oil": "#753d9e",
    "Heavy Oil Residue": "#c23ddb",
    Fuel: "#ff941f",
    Turbofuel: "#fa383d",
    "Rocket Fuel": "#ff6b47",
    "Ionized Fuel": "#3df5e0",
    "Alumina Solution": "#dbe0f0",
    "Sulfuric Acid": "#f5eb29",
    "Nitric Acid": "#7af56b",
    "Nitrogen Gas": "#add6ff",
    "Dark Matter Residue": "#a357ff",
    "Excited Photonic Matter": "#47ffc2",
  },
  ChevronStyle: 0, // 0=Chevron, 1=SolidArrow, 2=Diamond
  ChevronSpeedCmPerSec: 75,
  ChevronMinSpeedCmPerSec: 18,
  ChevronSpacingCm: 175,
  ChevronWingLengthCm: 52,
  ChevronThicknessCm: 16,
  ChevronRadialOffsetCm: 6.5,
  ChevronEmissiveBoost: 1.85,
  ChevronColor: "#f2faff",
  ChevronWarningColor: "#ffd629",
  ChevronCustomPngPath: "arrow_indicator.png",

  GlassOpacity: 0.20,
  TopCutawayAngleDeg: 110,
  bForceTopCutaway: false,
  bTintGlassByPressureGroup: true,
  OverfillPulseSpeed: 4.2,
  OverfillPulseColor: "#33ffeb",
  WaterTableRadiusCm: 240,
  WaterTableOpacity: 0.26,

  HudTopSafeMarginPx: 114,
  HudBottomSafeMarginPx: 96,
  HudMinCardWidthPx: 288,
  HudPaddingPx: 10,
  HudFontScale: 0.95,
  InspectorFontScale: 0.94,
  InspectorLineHeightFactor: 1.0,
  bHudDropShadow: true,
  bInspectorAnchorRight: true,
  HudBgColor: "#080d17",
  HudBgOpacity: 0.90,
  HudBorderColor: "#386b9e",
  HudAimedBorderColor: "#40f5ff",
  MaxHudCards: 22,
  CullRadiusMeters: 55,
  MaxActiveGlassPipes: 64,
  bShowRowFlow: true,
  bShowRowFill: true,
  bShowRowHead: true,
  bShowRowBadge: true,
  CustomCardFramePngPath: "card_frame.png",
  CustomAlertIconPngPath: "alert_icon.png",
};

const QUICK_PRESETS = {
  demo: {
    label: "✨ Crisp Demo Showcase (v1.3 Default)",
    patch: { ...structuredClone(DEFAULT_TUNABLES) },
  },
  oil: {
    label: "🛢️ High-Contrast Dark Oils",
    patch: {
      MinFluidLuminance: 0.42,
      FluidEmissiveBoost: 1.75,
      GlassOpacity: 0.16,
      ChevronSpeedCmPerSec: 65,
      ChevronWingLengthCm: 60,
    },
  },
  minimal: {
    label: "🔎 Clean Minimal HUD",
    patch: {
      bShowRowBadge: true,
      bShowRowHead: false,
      HudFontScale: 0.88,
      InspectorFontScale: 0.88,
      HudMinCardWidthPx: 250,
      GlassOpacity: 0.14,
      bForceTopCutaway: true,
    },
  },
};

function escHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hexToRgb(hex) {
  const clean = String(hex || "#ffffff").replace("#", "").padEnd(6, "f");
  const n = parseInt(clean.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  const toH = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function applyLuminanceFloor(hex, floor01, boost) {
  let { r, g, b } = hexToRgb(hex);
  let nr = r / 255, ng = g / 255, nb = b / 255;
  const lum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
  if (lum < floor01) {
    if (lum <= 0.02) {
      nr = 0.52; ng = 0.34; nb = 0.72;
    } else {
      const lift = (floor01 - lum) * 0.85;
      nr = Math.min(1, nr + lift);
      ng = Math.min(1, ng + lift);
      nb = Math.min(1, nb + lift);
    }
  }
  const gain = Math.min(1.6, 0.75 + boost * 0.25);
  return rgbToHex(nr * 255 * gain, ng * 255 * gain, nb * 255 * gain);
}

function srgbChannelToLinear(c8) {
  const c = Math.max(0, Math.min(1, c8 / 255));
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function escapeCppString(str) {
  return String(str ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function isImgReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0);
}

function drawRoundedRect(c, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r, w * 0.5, h * 0.5));
  c.beginPath();
  if (typeof c.roundRect === "function") {
    c.roundRect(x, y, w, h, rad);
  } else {
    c.moveTo(x + rad, y);
    c.arcTo(x + w, y, x + w, y + h, rad);
    c.arcTo(x + w, y + h, x, y + h, rad);
    c.arcTo(x, y + h, x, y, rad);
    c.arcTo(x, y, x + w, y, rad);
    c.closePath();
  }
}

function hexToFLinearCode(hex, alpha = 1.0) {
  const { r, g, b } = hexToRgb(hex);
  return `FLinearColor(${srgbChannelToLinear(r).toFixed(4)}f, ${srgbChannelToLinear(g).toFixed(4)}f, ${srgbChannelToLinear(b).toFixed(4)}f, ${Number(alpha).toFixed(2)}f)`;
}

function loadStudioState() {
  const base = structuredClone(DEFAULT_TUNABLES);
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        cfg: {
          ...base,
          ...(parsed.cfg || {}),
          FluidColorOverrides: { ...base.FluidColorOverrides, ...(parsed.cfg?.FluidColorOverrides || {}) },
        },
        preview: {
          fluidName: parsed.preview?.fluidName || "Crude Oil",
          fillPct: typeof parsed.preview?.fillPct === "number" ? parsed.preview.fillPct : 72,
          flowM3Min: typeof parsed.preview?.flowM3Min === "number" ? parsed.preview.flowM3Min : 240,
          bWarning: !!parsed.preview?.bWarning,
          bShowWaterTable: parsed.preview?.bShowWaterTable ?? true,
        },
        pngs: parsed.pngs || {}, // { arrow: dataUrl, card: dataUrl, alert: dataUrl }
      };
    }
  } catch {
    // fallback cleanly
  }
  return {
    cfg: base,
    preview: { fluidName: "Crude Oil", fillPct: 72, flowM3Min: 240, bWarning: false, bShowWaterTable: true },
    pngs: {},
  };
}

function persistStudioState(st) {
  try {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(st));
  } catch {
    // ignore quota errors from huge custom PNGs; config still exports cleanly
  }
}

function triggerDownload(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================================
// Export Generators: JSON Config, C++ PipeXRayTunables.h, & Chat Agent Prompt
// ============================================================================

export function buildConfigJsonString(cfg) {
  return JSON.stringify(cfg, null, 2);
}

export function buildCppTunablesHeader(cfg) {
  const fluidLines = Object.entries(cfg.FluidColorOverrides)
    .map(([k, v]) => `\t\tFluidColorOverrides.Add(TEXT("${escapeCppString(k)}"), ${hexToFLinearCode(v, 1.0)});`)
    .join("\n");

  const styleEnum = cfg.ChevronStyle === 1
    ? "EPipeChevronStyle::SolidArrow"
    : (cfg.ChevronStyle === 2 ? "EPipeChevronStyle::Diamond" : "EPipeChevronStyle::Chevron");

  return `// Exported directly from Mod Visual Studio Dashboard -> Drop into Source/PipeXRayDiagnostics/Public/PipeXRayTunables.h
\tvoid ApplyExportedPresetFromStudio()
\t{
\t\tMinFluidLuminance = ${cfg.MinFluidLuminance.toFixed(2)}f;
\t\tFluidEmissiveBoost = ${cfg.FluidEmissiveBoost.toFixed(2)}f;
\t\tFluidCoreAlpha = ${cfg.FluidCoreAlpha.toFixed(2)}f;
\t\tFluidColorOverrides.Reset();
${fluidLines}

\t\tChevronStyle = ${styleEnum};
\t\tChevronSpeedCmPerSec = ${cfg.ChevronSpeedCmPerSec.toFixed(1)}f;
\t\tChevronMinSpeedCmPerSec = ${cfg.ChevronMinSpeedCmPerSec.toFixed(1)}f;
\t\tChevronSpacingCm = ${cfg.ChevronSpacingCm.toFixed(1)}f;
\t\tChevronWingLengthCm = ${cfg.ChevronWingLengthCm.toFixed(1)}f;
\t\tChevronThicknessCm = ${cfg.ChevronThicknessCm.toFixed(1)}f;
\t\tChevronRadialOffsetCm = ${cfg.ChevronRadialOffsetCm.toFixed(1)}f;
\t\tChevronEmissiveBoost = ${cfg.ChevronEmissiveBoost.toFixed(2)}f;
\t\tChevronColor = ${hexToFLinearCode(cfg.ChevronColor, 0.96)};
\t\tChevronWarningColor = ${hexToFLinearCode(cfg.ChevronWarningColor, 0.98)};
\t\tChevronCustomPngPath = TEXT("${escapeCppString(cfg.ChevronCustomPngPath)}");

\t\tGlassOpacity = ${cfg.GlassOpacity.toFixed(2)}f;
\t\tTopCutawayAngleDeg = ${cfg.TopCutawayAngleDeg.toFixed(1)}f;
\t\tbForceTopCutaway = ${cfg.bForceTopCutaway ? "true" : "false"};
\t\tbTintGlassByPressureGroup = ${cfg.bTintGlassByPressureGroup ? "true" : "false"};
\t\tOverfillPulseSpeed = ${cfg.OverfillPulseSpeed.toFixed(2)}f;
\t\tOverfillPulseColor = ${hexToFLinearCode(cfg.OverfillPulseColor, 1.0)};
\t\tWaterTableRadiusCm = ${cfg.WaterTableRadiusCm.toFixed(1)}f;
\t\tWaterTableOpacity = ${cfg.WaterTableOpacity.toFixed(2)}f;

\t\tHudTopSafeMarginPx = ${cfg.HudTopSafeMarginPx.toFixed(1)}f;
\t\tHudBottomSafeMarginPx = ${cfg.HudBottomSafeMarginPx.toFixed(1)}f;
\t\tHudMinCardWidthPx = ${cfg.HudMinCardWidthPx.toFixed(1)}f;
\t\tHudPaddingPx = ${cfg.HudPaddingPx.toFixed(1)}f;
\t\tHudFontScale = ${cfg.HudFontScale.toFixed(2)}f;
\t\tInspectorFontScale = ${cfg.InspectorFontScale.toFixed(2)}f;
\t\tInspectorLineHeightFactor = ${cfg.InspectorLineHeightFactor.toFixed(2)}f;
\t\tbHudDropShadow = ${cfg.bHudDropShadow ? "true" : "false"};
\t\tbInspectorAnchorRight = ${cfg.bInspectorAnchorRight ? "true" : "false"};
\t\tHudBgOpacity = ${cfg.HudBgOpacity.toFixed(2)}f;
\t\tHudBgColor = ${hexToFLinearCode(cfg.HudBgColor, cfg.HudBgOpacity)};
\t\tHudBorderColor = ${hexToFLinearCode(cfg.HudBorderColor, 0.88)};
\t\tHudAimedBorderColor = ${hexToFLinearCode(cfg.HudAimedBorderColor, 0.98)};
\t\tMaxHudCards = ${Math.round(cfg.MaxHudCards)};
\t\tCullRadiusMeters = ${cfg.CullRadiusMeters.toFixed(1)}f;
\t\tMaxActiveGlassPipes = ${Math.round(cfg.MaxActiveGlassPipes)};
\t\tbShowRowFlow = ${cfg.bShowRowFlow ? "true" : "false"};
\t\tbShowRowFill = ${cfg.bShowRowFill ? "true" : "false"};
\t\tbShowRowHead = ${cfg.bShowRowHead ? "true" : "false"};
\t\tbShowRowBadge = ${cfg.bShowRowBadge ? "true" : "false"};
\t\tCustomCardFramePngPath = TEXT("${escapeCppString(cfg.CustomCardFramePngPath)}");
\t\tCustomAlertIconPngPath = TEXT("${escapeCppString(cfg.CustomAlertIconPngPath)}");
\t}`;
}

export function buildAgentPatchPrompt(cfg, pngs) {
  const diffs = {};
  for (const [k, v] of Object.entries(cfg)) {
    if (k === "FluidColorOverrides") {
      const fDiffs = {};
      for (const [fk, fv] of Object.entries(v)) {
        if (DEFAULT_TUNABLES.FluidColorOverrides[fk] !== fv) fDiffs[fk] = fv;
      }
      if (Object.keys(fDiffs).length > 0) diffs.FluidColorOverrides = fDiffs;
    } else if (DEFAULT_TUNABLES[k] !== v) {
      diffs[k] = v;
    }
  }
  const pngList = Object.entries(pngs || {})
    .filter(([, url]) => !!url)
    .map(([slot]) => slot);

  return [
    "Apply my visual dashboard tweaks from Mod Visual Studio to PipeXRayTunables.h, repackage PipeXRayDiagnostics, update Google Drive zip, and update MOD_BIBLE.md:",
    pngList.length ? `Custom PNG slots staged in browser: ${pngList.join(", ")} (remember to attach or drop PNGs into Mods/PipeXRayDiagnostics/Config/).` : "Custom PNGs: none changed.",
    "Changed parameters JSON:",
    JSON.stringify(diffs, null, 2),
  ].join("\n\n");
}

// ============================================================================
// Main Studio Renderer
// ============================================================================

export function renderModVisualStudio(container, showToastFn) {
  const state = loadStudioState();
  let activeSubTab = "fluids";
  let rafId = 0;

  const loadedImages = { arrow: null, card: null, alert: null };
  function syncCustomImageObjs() {
    for (const key of ["arrow", "card", "alert"]) {
      const src = state.pngs[key];
      if (!src) {
        loadedImages[key] = null;
        continue;
      }
      const img = new Image();
      img.src = src;
      loadedImages[key] = img;
    }
  }
  syncCustomImageObjs();

  const shell = document.createElement("div");
  shell.className = "ms-shell";
  shell.innerHTML = `
    <div class="ms-top-bar card">
      <div class="ms-preset-row">
        <span class="ms-sec-lbl">Quick Visual Presets:</span>
        ${Object.entries(QUICK_PRESETS).map(([k, p]) => `<button type="button" class="btn btn-sm" data-ms-preset="${k}">${p.label}</button>`).join("")}
      </div>
      <div class="ms-export-row">
        <button type="button" class="btn btn-primary btn-sm" data-ms-exp="prompt">📋 Copy Agent Patch Prompt</button>
        <button type="button" class="btn btn-sm" data-ms-exp="json">⬇️ PipeXRayConfig.json (F9 Live)</button>
        <button type="button" class="btn btn-sm" data-ms-exp="cpp">⬇️ C++ PipeXRayTunables Preset</button>
      </div>
    </div>

    <div class="ms-workspace">
      <!-- Live 16:9 In-Game Preview Canvas -->
      <section class="ms-preview-col card">
        <div class="ms-preview-head">
          <div>
            <strong>🎥 Live In-Game Mod Preview (16:9 Viewport Simulation)</strong>
            <span class="ms-muted">Shows real glass transparency, fluid luminance floor, aero speed, HUD safe zones &amp; Inspector text fit.</span>
          </div>
          <div class="ms-preview-toggles">
            <label class="ms-inline-ctl">Fluid:
              <select class="select-input ms-prev-ctl" data-prev="fluidName">
                ${Object.keys(DEFAULT_TUNABLES.FluidColorOverrides).map((fn) => `<option value="${escHtml(fn)}">${escHtml(fn)}</option>`).join("")}
              </select>
            </label>
            <label class="ms-inline-ctl">Fill <strong data-prev-lbl="fillPct"></strong>:
              <input type="range" class="pm-range ms-prev-range" data-prev="fillPct" min="0" max="108" step="1" />
            </label>
            <label class="ms-inline-ctl">Flow <strong data-prev-lbl="flowM3Min"></strong>:
              <input type="range" class="pm-range ms-prev-range" data-prev="flowM3Min" min="0" max="600" step="10" />
            </label>
            <label class="ms-chk"><input type="checkbox" class="ms-prev-chk" data-prev="bWarning" /> Alert State</label>
            <label class="ms-chk"><input type="checkbox" class="ms-prev-chk" data-prev="bShowWaterTable" /> Water Table</label>
          </div>
        </div>
        <canvas class="ms-canvas" width="960" height="540"></canvas>
      </section>

      <!-- Granular Control Panel -->
      <section class="ms-controls-col card">
        <div class="ms-subtabs">
          <button type="button" class="focus-tab active" data-ms-tab="fluids">💧 Fluids &amp; Colors</button>
          <button type="button" class="focus-tab" data-ms-tab="arrows">➡️ Aero Indicators</button>
          <button type="button" class="focus-tab" data-ms-tab="glass">🧊 Glass &amp; Table</button>
          <button type="button" class="focus-tab" data-ms-tab="hud">🪪 HUD &amp; Safe Zone</button>
          <button type="button" class="focus-tab" data-ms-tab="inspector">📋 Fonts &amp; Inspector</button>
          <button type="button" class="focus-tab" data-ms-tab="assets">🖼️ PNGs &amp; Export</button>
        </div>

        <div class="ms-panels">
          <div class="ms-panel" data-ms-panel="fluids"></div>
          <div class="ms-panel hidden" data-ms-panel="arrows"></div>
          <div class="ms-panel hidden" data-ms-panel="glass"></div>
          <div class="ms-panel hidden" data-ms-panel="hud"></div>
          <div class="ms-panel hidden" data-ms-panel="inspector"></div>
          <div class="ms-panel hidden" data-ms-panel="assets"></div>
        </div>
      </section>
    </div>
  `;

  container.appendChild(shell);

  // Helpers to build persistent bound controls (Range + Number paired, Color picker + Hex, Checkbox, Select)
  const bindings = [];

  function sliderControl(key, label, min, max, step, unit = "") {
    const id = `ms-c-${key}`;
    const wrap = document.createElement("div");
    wrap.className = "ms-ctl-row";
    wrap.innerHTML = `
      <div class="ms-ctl-top">
        <label for="${id}">${escHtml(label)}</label>
        <div class="ms-num-unit">
          <input type="number" class="ms-num-inp" min="${min}" max="${max}" step="${step}" />
          <span>${escHtml(unit)}</span>
        </div>
      </div>
      <input id="${id}" type="range" class="pm-range" min="${min}" max="${max}" step="${step}" />
    `;
    const r = wrap.querySelector('input[type="range"]');
    const n = wrap.querySelector('input[type="number"]');
    const syncUi = () => {
      r.value = String(state.cfg[key]);
      n.value = String(state.cfg[key]);
    };
    const commitFinal = (val) => {
      const parsed = parseFloat(val);
      if (Number.isFinite(parsed)) {
        state.cfg[key] = Math.min(max, Math.max(min, parsed));
      }
      syncUi();
      persistStudioState(state);
      refreshExportBoxes();
    };
    r.addEventListener("input", () => commitFinal(r.value));
    n.addEventListener("input", () => {
      const parsed = parseFloat(n.value);
      if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
        state.cfg[key] = parsed;
        r.value = String(parsed);
        persistStudioState(state);
        refreshExportBoxes();
      }
    });
    n.addEventListener("change", () => commitFinal(n.value));
    n.addEventListener("blur", () => commitFinal(n.value));
    bindings.push(syncUi);
    return wrap;
  }

  function colorControl(key, label, fluidKey = null) {
    const wrap = document.createElement("div");
    wrap.className = "ms-color-row";
    wrap.innerHTML = `
      <span>${escHtml(label)}</span>
      <div class="ms-color-right">
        <input type="color" class="ms-color-inp" />
        <input type="text" class="ms-hex-inp" maxlength="7" />
      </div>
    `;
    const cp = wrap.querySelector('input[type="color"]');
    const hx = wrap.querySelector('input[type="text"]');
    const getVal = () => (fluidKey ? state.cfg.FluidColorOverrides[fluidKey] : state.cfg[key]);
    const setVal = (v) => {
      if (fluidKey) state.cfg.FluidColorOverrides[fluidKey] = v;
      else state.cfg[key] = v;
    };
    const syncUi = () => {
      const v = getVal() || "#ffffff";
      cp.value = v;
      hx.value = v;
    };
    cp.addEventListener("input", () => {
      setVal(cp.value);
      hx.value = cp.value;
      persistStudioState(state);
      refreshExportBoxes();
    });
    const commitHex = () => {
      const trimmed = hx.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
        setVal(trimmed.toLowerCase());
        cp.value = getVal();
        hx.value = getVal();
        persistStudioState(state);
        refreshExportBoxes();
      } else {
        syncUi();
      }
    };
    hx.addEventListener("change", commitHex);
    hx.addEventListener("blur", commitHex);
    bindings.push(syncUi);
    return wrap;
  }

  function checkControl(key, label) {
    const lbl = document.createElement("label");
    lbl.className = "ms-chk-row";
    lbl.innerHTML = `<input type="checkbox" /> <span>${escHtml(label)}</span>`;
    const cb = lbl.querySelector("input");
    const syncUi = () => { cb.checked = !!state.cfg[key]; };
    cb.addEventListener("change", () => {
      state.cfg[key] = cb.checked;
      persistStudioState(state);
      refreshExportBoxes();
    });
    bindings.push(syncUi);
    return lbl;
  }

  // Populate Panel 1: Fluids & Colors
  const pFluids = shell.querySelector('[data-ms-panel="fluids"]');
  pFluids.appendChild(sliderControl("MinFluidLuminance", "Minimum Fluid Luminance Floor (Fixes Black Crude Oil)", 0.0, 0.70, 0.02));
  pFluids.appendChild(sliderControl("FluidEmissiveBoost", "Fluid Core Glow / Emissive Boost", 0.5, 3.0, 0.05, "x"));
  pFluids.appendChild(sliderControl("FluidCoreAlpha", "Inner Liquid Opacity", 0.15, 1.0, 0.02));
  const fluidGrid = document.createElement("div");
  fluidGrid.className = "ms-color-grid";
  for (const fname of Object.keys(DEFAULT_TUNABLES.FluidColorOverrides)) {
    fluidGrid.appendChild(colorControl(null, fname, fname));
  }
  pFluids.appendChild(fluidGrid);

  // Populate Panel 2: Aero Indicators
  const pArrows = shell.querySelector('[data-ms-panel="arrows"]');
  const styleRow = document.createElement("div");
  styleRow.className = "ms-ctl-row";
  styleRow.innerHTML = `
    <div class="ms-ctl-top"><label>Indicator Geometry Shape</label></div>
    <select class="select-input ms-style-sel">
      <option value="0">0 — Crisp Double-Ribbon Chevron (Default)</option>
      <option value="1">1 — Solid Filled Arrowhead Triangle</option>
      <option value="2">2 — Flow Pulse Diamond</option>
    </select>
  `;
  const styleSel = styleRow.querySelector("select");
  styleSel.addEventListener("change", () => {
    state.cfg.ChevronStyle = parseInt(styleSel.value, 10) || 0;
    persistStudioState(state);
    refreshExportBoxes();
  });
  bindings.push(() => { styleSel.value = String(state.cfg.ChevronStyle); });
  pArrows.appendChild(styleRow);
  pArrows.appendChild(sliderControl("ChevronSpeedCmPerSec", "Flow Arrow Speed (Was 290 cm/s -> Now 75 cm/s)", 10, 260, 5, " cm/s"));
  pArrows.appendChild(sliderControl("ChevronMinSpeedCmPerSec", "Base Minimum Creep Speed", 0, 80, 2, " cm/s"));
  pArrows.appendChild(sliderControl("ChevronSpacingCm", "Distance Between Arrows", 60, 380, 5, " cm"));
  pArrows.appendChild(sliderControl("ChevronWingLengthCm", "Arrow Head Length / Size", 18, 110, 2, " cm"));
  pArrows.appendChild(sliderControl("ChevronThicknessCm", "Ribbon Band Width / Thickness", 6, 40, 1, " cm"));
  pArrows.appendChild(sliderControl("ChevronRadialOffsetCm", "Radial Float Outside Pipe Skin", -4, 24, 0.5, " cm"));
  pArrows.appendChild(sliderControl("ChevronEmissiveBoost", "Arrow Glow Multiplier", 0.5, 4.0, 0.05, "x"));
  pArrows.appendChild(colorControl("ChevronColor", "Normal Flow Arrow Color"));
  pArrows.appendChild(colorControl("ChevronWarningColor", "Warning / Slosh Arrow Color"));

  // Populate Panel 3: Glass & Water Table
  const pGlass = shell.querySelector('[data-ms-panel="glass"]');
  pGlass.appendChild(sliderControl("GlassOpacity", "Outer Glass Opacity (0.20 = Clear Crystal)", 0.02, 0.75, 0.02));
  pGlass.appendChild(checkControl("bForceTopCutaway", "Open Physical Viewing Slot Along Top of Pipe (Cutaway)"));
  pGlass.appendChild(sliderControl("TopCutawayAngleDeg", "Cutaway Top Slot Opening Angle", 20, 175, 5, "°"));
  pGlass.appendChild(checkControl("bTintGlassByPressureGroup", "Tint Glass Shell by Pressure Group Color (Mode 2 & 4)"));
  pGlass.appendChild(sliderControl("OverfillPulseSpeed", "Overfill (>100%) Shimmer Pulse Speed", 0.0, 12.0, 0.2, " Hz"));
  pGlass.appendChild(colorControl("OverfillPulseColor", "Overfill Highlight Tint"));
  pGlass.appendChild(sliderControl("WaterTableRadiusCm", "Water-Table Horizon Disc Radius", 80, 500, 10, " cm"));
  pGlass.appendChild(sliderControl("WaterTableOpacity", "Water-Table Disc Opacity", 0.05, 0.80, 0.02));

  // Populate Panel 4: HUD & Safe Zones
  const pHud = shell.querySelector('[data-ms-panel="hud"]');
  pHud.appendChild(sliderControl("HudTopSafeMarginPx", "Top Safe Zone (Never Overlap Banner!)", 40, 240, 2, " px"));
  pHud.appendChild(sliderControl("HudBottomSafeMarginPx", "Bottom Hotbar Safe Clearance", 40, 220, 2, " px"));
  pHud.appendChild(sliderControl("HudMinCardWidthPx", "Minimum Card Width (Auto-Expands if Needed)", 190, 520, 4, " px"));
  pHud.appendChild(sliderControl("HudPaddingPx", "Card & Inspector Inner Padding", 4, 24, 1, " px"));
  pHud.appendChild(sliderControl("HudBgOpacity", "Card / Panel Background Opacity", 0.20, 1.0, 0.02));
  pHud.appendChild(colorControl("HudBgColor", "Card / Panel Background Tint"));
  pHud.appendChild(colorControl("HudBorderColor", "Standard Pipe Card Border"));
  pHud.appendChild(colorControl("HudAimedBorderColor", "Aimed Pipe & Inspector Border"));
  pHud.appendChild(sliderControl("MaxHudCards", "Max Simultaneous Floating Cards", 2, 48, 1));
  pHud.appendChild(sliderControl("CullRadiusMeters", "X-Ray Scan Radius", 15, 160, 5, " m"));
  pHud.appendChild(sliderControl("MaxActiveGlassPipes", "Max Simultaneous Glass Pipes", 8, 192, 4));
  pHud.appendChild(checkControl("bShowRowFlow", "Show Row 1: Flow Rate + EMA"));
  pHud.appendChild(checkControl("bShowRowFill", "Show Row 2: Progress Bar + Fill/Overfill"));
  pHud.appendChild(checkControl("bShowRowHead", "Show Row 3: Head Lift + Pressure Group Hops"));
  pHud.appendChild(checkControl("bShowRowBadge", "Show Row 4: Top Diagnostic Badge"));

  // Populate Panel 5: Fonts & Inspector
  const pInsp = shell.querySelector('[data-ms-panel="inspector"]');
  pInsp.appendChild(sliderControl("HudFontScale", "Floating Card Text Size Scale", 0.65, 1.60, 0.02, "x"));
  pInsp.appendChild(sliderControl("InspectorFontScale", "Deep Inspector Text Size Scale", 0.65, 1.60, 0.02, "x"));
  pInsp.appendChild(sliderControl("InspectorLineHeightFactor", "Deep Inspector Line Spacing Multiplier", 0.85, 1.60, 0.02, "x"));
  pInsp.appendChild(checkControl("bHudDropShadow", "1px Crisp Drop Shadow Behind All HUD Text"));
  pInsp.appendChild(checkControl("bInspectorAnchorRight", "Dock Deep X-Ray Inspector on Right Side (Uncheck = Left)"));

  // Populate Panel 6: PNG Uploads & Code Exporter
  const pAssets = shell.querySelector('[data-ms-panel="assets"]');
  pAssets.innerHTML = `
    <div class="ms-png-grid">
      <div class="ms-png-slot" data-slot="arrow">
        <div class="ms-png-head"><strong>1. Arrow Indicator Texture (PNG)</strong><span>Maps onto 3D flow arrows</span></div>
        <div class="ms-png-preview" data-png-prev="arrow">Built-in crisp white arrow</div>
        <input type="file" accept="image/png,image/*" class="ms-file-inp" data-png-inp="arrow" />
        <button type="button" class="btn btn-xs" data-png-clr="arrow">Clear PNG</button>
      </div>
      <div class="ms-png-slot" data-slot="card">
        <div class="ms-png-head"><strong>2. Floating Card Frame (PNG)</strong><span>Draws over HUD card borders</span></div>
        <div class="ms-png-preview" data-png-prev="card">Built-in glowing HUD box</div>
        <input type="file" accept="image/png,image/*" class="ms-file-inp" data-png-inp="card" />
        <button type="button" class="btn btn-xs" data-png-clr="card">Clear PNG</button>
      </div>
      <div class="ms-png-slot" data-slot="alert">
        <div class="ms-png-head"><strong>3. Alert Badge Icon (PNG)</strong><span>Shown beside Row 4 diagnostics</span></div>
        <div class="ms-png-preview" data-png-prev="alert">Built-in emoji / colored text</div>
        <input type="file" accept="image/png,image/*" class="ms-file-inp" data-png-inp="alert" />
        <button type="button" class="btn btn-xs" data-png-clr="alert">Clear PNG</button>
      </div>
    </div>
    <label class="field-label">Generated Output Preview (Copy Prompt into Chat or Save JSON -> Press F9 in Game)</label>
    <textarea class="ms-export-preview" rows="8" readonly></textarea>
  `;

  function refreshPngPreviews() {
    for (const [slot, label] of [["arrow", "Built-in crisp arrow"], ["card", "Built-in HUD box"], ["alert", "Built-in badge icon"]]) {
      const box = pAssets.querySelector(`[data-png-prev="${slot}"]`);
      if (!box) continue;
      if (state.pngs[slot]) {
        box.innerHTML = `<img src="${state.pngs[slot]}" alt="${slot}" class="ms-png-thumb" /> <span>Loaded Custom PNG</span>`;
      } else {
        box.textContent = label;
      }
    }
  }
  refreshPngPreviews();

  pAssets.querySelectorAll("[data-png-inp]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const slot = inp.dataset.pngInp;
      const file = inp.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.pngs[slot] = String(reader.result || "");
        if (slot === "arrow") state.cfg.ChevronCustomPngPath = file.name;
        if (slot === "card") state.cfg.CustomCardFramePngPath = file.name;
        if (slot === "alert") state.cfg.CustomAlertIconPngPath = file.name;
        syncCustomImageObjs();
        refreshPngPreviews();
        persistStudioState(state);
        refreshExportBoxes();
        showToastFn?.(`Loaded ${file.name} into preview! Drop it into Mods/PipeXRayDiagnostics/Config/ for F9 in-game.`);
      };
      reader.readAsDataURL(file);
    });
  });

  pAssets.querySelectorAll("[data-png-clr]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slot = btn.dataset.pngClr;
      delete state.pngs[slot];
      const fileInp = pAssets.querySelector(`[data-png-inp="${slot}"]`);
      if (fileInp) fileInp.value = "";
      if (slot === "arrow") state.cfg.ChevronCustomPngPath = DEFAULT_TUNABLES.ChevronCustomPngPath;
      if (slot === "card") state.cfg.CustomCardFramePngPath = DEFAULT_TUNABLES.CustomCardFramePngPath;
      if (slot === "alert") state.cfg.CustomAlertIconPngPath = DEFAULT_TUNABLES.CustomAlertIconPngPath;
      syncCustomImageObjs();
      refreshPngPreviews();
      persistStudioState(state);
      refreshExportBoxes();
    });
  });

  const exportArea = pAssets.querySelector(".ms-export-preview");
  function refreshExportBoxes() {
    if (exportArea) {
      exportArea.value = buildAgentPatchPrompt(state.cfg, state.pngs);
    }
  }

  function syncAllControls() {
    bindings.forEach((fn) => fn());
    refreshExportBoxes();
  }
  syncAllControls();

  // Preview Controls Binding
  const pFluidSel = shell.querySelector('[data-prev="fluidName"]');
  const pFillR = shell.querySelector('.ms-prev-range[data-prev="fillPct"]');
  const pFlowR = shell.querySelector('.ms-prev-range[data-prev="flowM3Min"]');
  const pWarnC = shell.querySelector('.ms-prev-chk[data-prev="bWarning"]');
  const pWtC = shell.querySelector('.ms-prev-chk[data-prev="bShowWaterTable"]');

  function syncPreviewControls() {
    pFluidSel.value = state.preview.fluidName;
    pFillR.value = String(state.preview.fillPct);
    pFlowR.value = String(state.preview.flowM3Min);
    pWarnC.checked = state.preview.bWarning;
    pWtC.checked = state.preview.bShowWaterTable;
    shell.querySelector('[data-prev-lbl="fillPct"]').textContent = `${state.preview.fillPct}%`;
    shell.querySelector('[data-prev-lbl="flowM3Min"]').textContent = `${state.preview.flowM3Min} m³/m`;
  }
  syncPreviewControls();

  pFluidSel.addEventListener("change", () => { state.preview.fluidName = pFluidSel.value; persistStudioState(state); });
  pFillR.addEventListener("input", () => { state.preview.fillPct = parseFloat(pFillR.value); syncPreviewControls(); persistStudioState(state); });
  pFlowR.addEventListener("input", () => { state.preview.flowM3Min = parseFloat(pFlowR.value); syncPreviewControls(); persistStudioState(state); });
  pWarnC.addEventListener("change", () => { state.preview.bWarning = pWarnC.checked; persistStudioState(state); });
  pWtC.addEventListener("change", () => { state.preview.bShowWaterTable = pWtC.checked; persistStudioState(state); });

  // Sub-Tab Switcher
  shell.querySelectorAll("[data-ms-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSubTab = btn.dataset.msTab;
      shell.querySelectorAll("[data-ms-tab]").forEach((b) => b.classList.toggle("active", b.dataset.msTab === activeSubTab));
      shell.querySelectorAll("[data-ms-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.msPanel !== activeSubTab));
    });
  });

  // Preset Buttons
  shell.querySelectorAll("[data-ms-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = QUICK_PRESETS[btn.dataset.msPreset];
      if (!preset) return;
      const freshBase = structuredClone(DEFAULT_TUNABLES);
      state.cfg = {
        ...freshBase,
        ...structuredClone(preset.patch),
        FluidColorOverrides: {
          ...freshBase.FluidColorOverrides,
          ...(preset.patch.FluidColorOverrides || {}),
        },
      };
      syncAllControls();
      persistStudioState(state);
      showToastFn?.(`Applied preset: ${preset.label}`);
    });
  });

  // Export Buttons
  shell.querySelector('[data-ms-exp="prompt"]')?.addEventListener("click", async () => {
    const promptTxt = buildAgentPatchPrompt(state.cfg, state.pngs);
    await navigator.clipboard.writeText(promptTxt);
    showToastFn?.("Copied Agent Patch Prompt — paste it in chat to bake changes into C++ & Drive!");
  });
  shell.querySelector('[data-ms-exp="json"]')?.addEventListener("click", () => {
    triggerDownload("PipeXRayConfig.json", buildConfigJsonString(state.cfg));
    showToastFn?.("Downloaded PipeXRayConfig.json (drop into Saved/PipeXRayDiagnostics/ and press F9!)");
  });
  shell.querySelector('[data-ms-exp="cpp"]')?.addEventListener("click", () => {
    triggerDownload("PipeXRayTunables_Preset.h", buildCppTunablesHeader(state.cfg));
    showToastFn?.("Downloaded PipeXRayTunables_Preset.h!");
  });

  // ============================================================================
  // Live 16:9 Canvas Viewport Animation Loop
  // ============================================================================
  const canvas = shell.querySelector(".ms-canvas");
  const ctx = canvas.getContext("2d");

  function drawPreviewFrame(nowMs) {
    if (!shell.isConnected) {
      cancelAnimationFrame(rafId);
      return;
    }

    const t = nowMs * 0.001;
    const cfg = state.cfg;
    const prev = state.preview;
    const W = canvas.width;
    const H = canvas.height;
    const isGas = ["Nitrogen Gas", "Dark Matter Residue", "Excited Photonic Matter"].includes(prev.fluidName);
    const overfillPct = Math.max(0, prev.fillPct - 100);
    const rawHex = cfg.FluidColorOverrides[prev.fluidName] || "#2eb8ff";
    const effFluidHex = applyLuminanceFloor(rawHex, cfg.MinFluidLuminance, cfg.FluidEmissiveBoost);

    // 1. Factory concrete floor & grid background
    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#101827");
    bgGrad.addColorStop(1, "#1e2736");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.09)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // 2. Water-Table Horizon Plane behind pipe
    if (prev.bShowWaterTable && !isGas) {
      const wtY = 235;
      ctx.save();
      ctx.fillStyle = `rgba(56, 189, 248, ${cfg.WaterTableOpacity * 0.65})`;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(380, wtY, Math.min(260, cfg.WaterTableRadiusCm * 0.72), 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = "700 11px system-ui, sans-serif";
      ctx.fillStyle = "#67e8f9";
      ctx.fillText("🌊 GROUP WATER-TABLE CEILING (21.6m)", 265, wtY - 40);
      ctx.restore();
    }

    // 3. Translucent Glass Pipe Shell + Dynamic Liquid D-Chord Core + Junction Rings
    const px = 70, py = 290, pw = 540, ph = 92;
    const fill01 = Math.min(1, Math.max(0, prev.fillPct / 100));

    // Metallic Pipe Junction Cross on right
    ctx.fillStyle = "#293a52";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.fillRect(px + pw - 22, py - 24, 52, ph + 48);
    ctx.strokeRect(px + pw - 22, py - 24, 52, ph + 48);

    // PortZ Rings (Emerald & Amber)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.strokeRect(px + pw - 16, py + 4, 40, ph - 8);
    ctx.strokeStyle = "#f59e0b";
    ctx.strokeRect(px + pw - 8, py - 22, 24, 18);

    // Inner Pipe Cavity
    ctx.fillStyle = "#080f1d";
    drawRoundedRect(ctx, px, py, pw - 22, ph, 14);
    ctx.fill();

    // Inner Luminous Fluid Core
    if (fill01 > 0.01) {
      const corePad = 5;
      const coreH = (ph - corePad * 2) * (isGas ? 0.96 : fill01);
      const coreY = isGas ? (py + corePad + ((ph - corePad * 2) * (1 - 0.96)) / 2) : (py + ph - corePad - coreH);
      let drawHex = effFluidHex;
      if (!isGas && overfillPct > 0.1 && cfg.OverfillPulseSpeed > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(t * cfg.OverfillPulseSpeed);
        ctx.shadowColor = cfg.OverfillPulseColor;
        ctx.shadowBlur = 12 * pulse;
      }
      const { r, g, b } = hexToRgb(drawHex);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${isGas ? cfg.FluidCoreAlpha * Math.max(0.3, fill01) : cfg.FluidCoreAlpha})`;
      drawRoundedRect(ctx, px + corePad, coreY, pw - 32, coreH, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!isGas && fill01 > 0.03 && fill01 < 0.98) {
        ctx.strokeStyle = "#e0f2fe";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px + 8, coreY);
        ctx.lineTo(px + pw - 30, coreY);
        ctx.stroke();
      }
    }

    // Outer Glass Tube Rim & Tint (plus optional top cutaway reveal window)
    const gCol = hexToRgb(cfg.bTintGlassByPressureGroup ? "#22d3ee" : "#93c5fd");
    ctx.fillStyle = `rgba(${gCol.r}, ${gCol.g}, ${gCol.b}, ${cfg.GlassOpacity})`;
    ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
    ctx.lineWidth = 2.4;
    drawRoundedRect(ctx, px, py, pw - 22, ph, 14);
    ctx.fill();
    ctx.stroke();
    if (cfg.bForceTopCutaway) {
      const slotH = Math.min(34, (cfg.TopCutawayAngleDeg / 180) * 34);
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(px + 12, py + 4, pw - 46, slotH);
    }

    // 4. Slow, Crisp Scrolling Aero Flow Indicators
    const normFlow = Math.min(1.35, prev.flowM3Min / 300);
    const pxSpeed = (prev.flowM3Min > 1 ? (cfg.ChevronMinSpeedCmPerSec + cfg.ChevronSpeedCmPerSec * normFlow) : 0) * 0.65;
    const spacingPx = Math.max(36, cfg.ChevronSpacingCm * 0.55);
    const arrowLenPx = Math.max(12, cfg.ChevronWingLengthCm * 0.52);
    const arrowHalfW = Math.max(5, cfg.ChevronThicknessCm * 0.65);
    const arrowY = py - cfg.ChevronRadialOffsetCm * 0.9 + 14;
    const offset = pxSpeed > 0 ? ((t * pxSpeed) % spacingPx) : 0;
    const arrowColHex = prev.bWarning ? cfg.ChevronWarningColor : cfg.ChevronColor;

    for (let ax = px + 18 + offset; ax < px + pw - 36; ax += spacingPx) {
      ctx.save();
      ctx.translate(ax, arrowY);
      ctx.fillStyle = arrowColHex;
      ctx.strokeStyle = arrowColHex;
      ctx.shadowColor = arrowColHex;
      ctx.shadowBlur = Math.min(12, cfg.ChevronEmissiveBoost * 4);

      if (isImgReady(loadedImages.arrow)) {
        ctx.drawImage(loadedImages.arrow, -arrowLenPx * 0.6, -arrowHalfW, arrowLenPx * 1.2, arrowHalfW * 2);
      } else if (cfg.ChevronStyle === 1) {
        ctx.beginPath();
        ctx.moveTo(arrowLenPx * 0.6, 0);
        ctx.lineTo(-arrowLenPx * 0.5, -arrowHalfW);
        ctx.lineTo(-arrowLenPx * 0.5, arrowHalfW);
        ctx.closePath();
        ctx.fill();
      } else if (cfg.ChevronStyle === 2) {
        ctx.beginPath();
        ctx.moveTo(arrowLenPx * 0.55, 0);
        ctx.lineTo(0, -arrowHalfW);
        ctx.lineTo(-arrowLenPx * 0.55, 0);
        ctx.lineTo(0, arrowHalfW);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.lineWidth = Math.max(3, cfg.ChevronThicknessCm * 0.28);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(-arrowLenPx * 0.45, -arrowHalfW);
        ctx.lineTo(arrowLenPx * 0.45, 0);
        ctx.lineTo(-arrowLenPx * 0.45, arrowHalfW);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Top Status Banner (shows safe clearance!)
    ctx.fillStyle = "rgba(8, 15, 28, 0.90)";
    ctx.fillRect(14, 16, W - 28, 24);
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.fillStyle = "#91e1ff";
    ctx.fillText("PIPE X-RAY [4: Full Master Demo] | Pipes: 12 | WaterTable: AUTO | [F8] Mode  [Ctrl+F8] PreFill  [F9] Reload Config", 24, 32);

    // 6. Auto-Measured Deep X-Ray Inspector Panel FIRST (so Card avoids both Banner and Inspector!)
    const pad = cfg.HudPaddingPx;
    const safeTop = Math.max(52, cfg.HudTopSafeMarginPx * 0.6);
    const bgRgb = hexToRgb(cfg.HudBgColor);
    const iScale = cfg.InspectorFontScale;
    const iLines = [
      `DEEP X-RAY INSPECTOR: Pipeline Mk.2 #21474`,
      `Fluid: ${prev.fluidName} (${isGas ? "GAS" : "LIQUID"}) | Net #20`,
      `Content: ${(prev.fillPct * 0.16).toFixed(2)} / 16.00 m3 (${prev.fillPct}%)`,
      `Flow Instant: ${prev.flowM3Min}.0 m3/min | EMA: ${(prev.flowM3Min * 0.95).toFixed(1)}`,
      `Port[0] PortZ=0.00m (PRIORITY) | Port[1] 1.30m`,
      prev.bWarning ? `[WARNING] CapHeight / Slosh Detected` : `ALL CLEAR: Full & Pressurized!`,
    ];
    ctx.font = `700 ${Math.round(11.5 * iScale)}px system-ui, sans-serif`;
    let inspMaxW = 240;
    iLines.forEach((l) => { inspMaxW = Math.max(inspMaxW, ctx.measureText(l).width); });
    const inspW = Math.min(W - 40, inspMaxW + pad * 2.5);
    const lineStep = Math.round(16 * iScale * cfg.InspectorLineHeightFactor);
    const inspH = pad * 2 + iLines.length * lineStep;
    const inspX = cfg.bInspectorAnchorRight ? (W - inspW - 14) : 14;
    const inspY = safeTop;

    ctx.fillStyle = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${Math.min(1, cfg.HudBgOpacity + 0.04)})`;
    ctx.fillRect(inspX, inspY, inspW, inspH);
    ctx.strokeStyle = cfg.HudAimedBorderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(inspX, inspY, inspW, inspH);

    let iy = inspY + pad + Math.round(10 * iScale);
    iLines.forEach((l, idx) => {
      if (cfg.bHudDropShadow) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillText(l, inspX + pad + 1, iy + 1);
      }
      ctx.fillStyle = idx === 0 ? cfg.HudAimedBorderColor : (idx === iLines.length - 1 ? (prev.bWarning ? "#f87171" : "#34d399") : "#e2e8f0");
      ctx.fillText(l, inspX + pad, iy);
      iy += lineStep;
    });

    // 7. Auto-Measured Floating Card on opposite side from Deep X-Ray Inspector (never collides!)
    const fScale = cfg.HudFontScale;
    const rows = [];
    if (cfg.bShowRowFlow) rows.push(`${prev.fluidName} | ${prev.flowM3Min.toFixed(1)} (EMA ${(prev.flowM3Min * 0.94).toFixed(1)}) / 300 m3/m >>>`);
    if (cfg.bShowRowFill) rows.push(`Fill ${Math.min(100, prev.fillPct)}%${overfillPct > 0 ? ` (+${overfillPct.toFixed(1)}% Over)` : ""} | ${(prev.fillPct * 0.12).toFixed(1)}/12.0 m3 | Cap 100%`);
    if (cfg.bShowRowHead) rows.push(isGas ? "GAS P=182.0 / 200.0 | Net #1" : "Head 19.6/21.6m (Table 21.6m) | Grp #3 (Hop 12/100)");
    if (cfg.bShowRowBadge) rows.push(prev.bWarning ? "SLOSHING / CAPHEIGHT THROTTLE ACTIVE" : "PRESSURIZED STREAM OK");

    ctx.font = `700 ${Math.round(12 * fScale)}px system-ui, sans-serif`;
    let maxRowW = 0;
    rows.forEach((rTxt) => { maxRowW = Math.max(maxRowW, ctx.measureText(rTxt).width); });
    const cardW = Math.min(W - 40, Math.max(cfg.HudMinCardWidthPx, maxRowW + pad * 2.4));
    const barSpace = cfg.bShowRowFill ? 12 : 0;
    const cardH = pad * 1.4 + barSpace + Math.max(1, rows.length) * Math.round(16 * fScale);
    const cardX = cfg.bInspectorAnchorRight
      ? Math.max(14, Math.min(44, inspX - cardW - 16))
      : Math.max(inspX + inspW + 16, Math.min(W - cardW - 14, W - cardW - 44));
    const cardY = Math.max(safeTop, Math.min(py - cardH - 36, H - cfg.HudBottomSafeMarginPx - cardH));

    ctx.fillStyle = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${cfg.HudBgOpacity})`;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    if (isImgReady(loadedImages.card)) {
      ctx.drawImage(loadedImages.card, cardX, cardY, cardW, cardH);
    } else {
      ctx.strokeStyle = prev.bWarning ? "#f87171" : cfg.HudAimedBorderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);
    }

    let cy = cardY + pad + Math.round(11 * fScale);
    rows.forEach((rTxt, idx) => {
      if (idx === 1 && cfg.bShowRowFill) {
        const barY = cy - Math.round(8 * fScale);
        ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
        ctx.fillRect(cardX + pad, barY, cardW - pad * 2, 6);
        ctx.fillStyle = overfillPct > 0 ? cfg.OverfillPulseColor : effFluidHex;
        ctx.fillRect(cardX + pad, barY, (cardW - pad * 2) * fill01, 6);
        cy += 11;
      }
      if (cfg.bHudDropShadow) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillText(rTxt, cardX + pad + 1, cy + 1);
      }
      ctx.fillStyle = idx === 0 ? "#ffffff" : (idx === rows.length - 1 && cfg.bShowRowBadge ? (prev.bWarning ? "#f87171" : "#34d399") : "#cbd5e1");
      if (idx === rows.length - 1 && cfg.bShowRowBadge && isImgReady(loadedImages.alert)) {
        ctx.drawImage(loadedImages.alert, cardX + pad, cy - 11, 13, 13);
        ctx.fillText(rTxt, cardX + pad + 18, cy);
      } else {
        ctx.fillText(rTxt, cardX + pad, cy);
      }
      cy += Math.round(16 * fScale);
    });

    rafId = requestAnimationFrame(drawPreviewFrame);
  }

  rafId = requestAnimationFrame(drawPreviewFrame);
}
