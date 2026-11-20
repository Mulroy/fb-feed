import {
  renderVisualPlumbingManual,
  VISUAL_MANUAL_CHAPTERS,
  VISUAL_MANUAL_COUNT,
} from "./pipe_manual.js?v=20261120_1155";
import {
  renderTopPipeXRaySandbox,
  enhancePipeBibleCardWithSim,
} from "./pipe_interactive.js?v=20261120_1155";
import { renderModVisualStudio } from "./mod_studio.js?v=20261120_1155";

// Flip to false (and remove mod_studio.js import) once the X-Ray video wraps.
const ENABLE_MOD_STUDIO = true;
const LOCAL_STATE_KEY = "pipes_manual_local_state_v1";

const PIPE_TIERS = [
  { id: "ALL", label: "📘 All Lessons" },
  { id: "tier_1_basics", label: "1. Pipe Basics (ELI5)" },
  { id: "tier_2_intermediate", label: "2. Intermediate & Manifolds" },
  { id: "tier_3_circuits", label: "3. Special Circuits" },
  { id: "tier_4_master", label: "4. Master Dissection & Placement" },
  { id: "tier_5_faq", label: "5. Mythbuster & FAQ" },
];

let pipeBibleItems = [];
let activeSection = "manual"; // "manual" | "pipes" | "modstudio"
let pipeTierFilter = "ALL";
let manualChapterFilter = "ALL";
let searchQuery = "";
let localState = loadLocalState();

const sourceMeta = document.getElementById("source-meta");
const searchInput = document.getElementById("search-input");
const secManualBtn = document.getElementById("sec-manual-btn");
const secPipesBtn = document.getElementById("sec-pipes-btn");
const secModStudioBtn = document.getElementById("sec-modstudio-btn");
const manualHeroBanner = document.getElementById("manual-hero-banner");
const pipeHeroBanner = document.getElementById("pipe-hero-banner");
const modstudioHeroBanner = document.getElementById("modstudio-hero-banner");
const focusTabs = document.getElementById("focus-tabs");
const boardContainer = document.getElementById("board-container");
const toastEl = document.getElementById("toast");

if (!ENABLE_MOD_STUDIO && secModStudioBtn) {
  secModStudioBtn.classList.add("hidden");
}

function loadLocalState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || "{}");
    return {
      notes: parsed.notes || {},
      verified: parsed.verified || {},
    };
  } catch {
    return { notes: {}, verified: {} };
  }
}

function saveLocalState() {
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(localState));
  } catch {
    // ignore storage quota failures
  }
}

let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2200);
}

function verdictClass(verdict) {
  const v = (verdict || "").toUpperCase();
  if (v.includes("MYTH") || v.includes("BUSTED")) return "verdict-busted";
  if (v.includes("NEW") || v.includes("DISCOVERY")) return "verdict-new";
  if (v.includes("MATH") || v.includes("AUDIT") || v.includes("PLACEMENT")) return "verdict-math";
  return "verdict-core";
}

function matchesPipeFilters(item) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  const note = localState.notes[item.id] || "";
  const hay = `${item.code || ""} ${item.tier || ""} ${item.verdict || ""} ${item.tag || ""} ${item.title || ""} ${item.subtitle || ""} ${item.simpleRule || ""} ${item.diagram || ""} ${item.howTo || ""} ${item.stepByStep || ""} ${item.proof || ""} ${note}`.toLowerCase();
  return hay.includes(q);
}

function renderPipeTabs(filtered) {
  focusTabs.classList.remove("hidden");
  focusTabs.innerHTML = "";
  for (const t of PIPE_TIERS) {
    const count = t.id === "ALL" ? filtered.length : filtered.filter((i) => i.defaultCategory === t.id).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "focus-tab" + (pipeTierFilter === t.id ? " active" : "");
    btn.textContent = t.id === "ALL" ? `📘 All Lessons (${count})` : `${t.label} (${count})`;
    btn.addEventListener("click", () => {
      pipeTierFilter = t.id;
      render();
    });
    focusTabs.appendChild(btn);
  }
}

function renderManualChapterTabs() {
  focusTabs.classList.remove("hidden");
  focusTabs.innerHTML = "";
  for (const ch of VISUAL_MANUAL_CHAPTERS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "focus-tab" + (manualChapterFilter === ch.id ? " active" : "");
    btn.textContent = ch.label;
    btn.addEventListener("click", () => {
      manualChapterFilter = ch.id;
      render();
    });
    focusTabs.appendChild(btn);
  }
}

function createPipeBibleCard(item) {
  const noteVal = localState.notes[item.id] || "";
  const isConfirmed = Boolean(localState.verified[item.id]);

  const card = document.createElement("article");
  card.className = "card pipe-card";
  card.dataset.id = item.id;

  const meta = document.createElement("div");
  meta.className = "card-meta";
  const badges = document.createElement("div");
  badges.className = "card-badges";

  const codeSpan = document.createElement("span");
  codeSpan.className = "code-badge";
  codeSpan.textContent = item.code || "P-00";
  badges.appendChild(codeSpan);

  if (item.tier) {
    const tierSpan = document.createElement("span");
    tierSpan.className = "sprint-badge";
    tierSpan.textContent = item.tier;
    badges.appendChild(tierSpan);
  }

  if (item.verdict) {
    const vSpan = document.createElement("span");
    vSpan.className = `verdict-badge ${verdictClass(item.verdict)}`;
    vSpan.textContent = item.verdict;
    badges.appendChild(vSpan);
  }

  if (item.tag) {
    const tSpan = document.createElement("span");
    tSpan.className = "tag-badge";
    tSpan.textContent = item.tag;
    badges.appendChild(tSpan);
  }

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "confirm-toggle-btn" + (isConfirmed ? " active" : "");
  confirmBtn.textContent = isConfirmed ? "✓ Verified In-Game" : "+ Verify In-Game";
  confirmBtn.addEventListener("click", () => {
    localState.verified[item.id] = !isConfirmed;
    saveLocalState();
    render();
  });
  badges.appendChild(confirmBtn);

  meta.appendChild(badges);
  card.appendChild(meta);

  const titleEl = document.createElement("h3");
  titleEl.className = "card-title";
  titleEl.textContent = item.title;
  card.appendChild(titleEl);

  if (item.subtitle) {
    const subEl = document.createElement("p");
    subEl.className = "pipe-subtitle";
    subEl.textContent = item.subtitle;
    card.appendChild(subEl);
  }

  if (item.simpleRule) {
    const ruleBox = document.createElement("div");
    ruleBox.className = "pipe-simple-rule";
    const ruleLbl = document.createElement("div");
    ruleLbl.className = "pipe-simple-label";
    ruleLbl.textContent = "💡 THE SIMPLE RULE (ELI5 TAKEAWAY)";
    const ruleTxt = document.createElement("div");
    ruleTxt.textContent = item.simpleRule;
    ruleBox.appendChild(ruleLbl);
    ruleBox.appendChild(ruleTxt);
    card.appendChild(ruleBox);
  }

  if (item.diagram) {
    const diagWrap = document.createElement("div");
    diagWrap.className = "pipe-diagram-wrap";
    const diagHead = document.createElement("div");
    diagHead.className = "pipe-diagram-head";
    const diagTitle = document.createElement("span");
    diagTitle.textContent = "📐 Visual Schematic / Circuit Diagram";
    const copyDiagBtn = document.createElement("button");
    copyDiagBtn.type = "button";
    copyDiagBtn.className = "btn btn-xs";
    copyDiagBtn.textContent = "📋 Copy Diagram";
    copyDiagBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(item.diagram);
      showToast(`Copied ${item.code} diagram!`);
    });
    diagHead.appendChild(diagTitle);
    diagHead.appendChild(copyDiagBtn);
    diagWrap.appendChild(diagHead);

    const pre = document.createElement("pre");
    pre.className = "pipe-diagram-box";
    pre.textContent = item.diagram;
    diagWrap.appendChild(pre);
    card.appendChild(diagWrap);
  }

  if (item.howTo) {
    const howEl = document.createElement("p");
    howEl.className = "card-howto pipe-howto";
    howEl.textContent = item.howTo;
    card.appendChild(howEl);
  }

  if (Array.isArray(item.copySnippets) && item.copySnippets.length > 0) {
    const snipRow = document.createElement("div");
    snipRow.className = "snippet-row";
    for (const snip of item.copySnippets) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "snippet-btn";
      btn.textContent = `📋 ${snip.label}`;
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(snip.text || snip.value || "");
        showToast(`Copied: ${snip.label}`);
      });
      snipRow.appendChild(btn);
    }
    card.appendChild(snipRow);
  }

  const stack = document.createElement("div");
  stack.className = "dropdowns-stack";

  if (item.stepByStep) {
    const stepDetails = document.createElement("details");
    stepDetails.className = "card-details steps-details";
    const stepSummary = document.createElement("summary");
    stepSummary.textContent = "🔧 Step-by-Step Build & Verification Guide";
    stepDetails.appendChild(stepSummary);

    const toolbar = document.createElement("div");
    toolbar.className = "details-toolbar";
    const copyStepsBtn = document.createElement("button");
    copyStepsBtn.type = "button";
    copyStepsBtn.className = "btn btn-xs";
    copyStepsBtn.textContent = "📋 Copy Steps";
    copyStepsBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(item.stepByStep);
      showToast("Copied build steps!");
    });
    toolbar.appendChild(copyStepsBtn);
    stepDetails.appendChild(toolbar);

    const stepsBox = document.createElement("div");
    stepsBox.className = "steps-box";
    stepsBox.textContent = item.stepByStep;
    stepDetails.appendChild(stepsBox);
    stack.appendChild(stepDetails);
  }

  const proofDetails = document.createElement("details");
  proofDetails.className = "card-details";
  if (noteVal) proofDetails.open = true;

  const proofSummary = document.createElement("summary");
  proofSummary.textContent = noteVal ? "⚙️ Engine Proof, VAs & My Notes (has note)" : "⚙️ Engine Proof, VAs & My Notes";
  proofDetails.appendChild(proofSummary);

  if (item.proof) {
    const proofToolbar = document.createElement("div");
    proofToolbar.className = "details-toolbar";
    const copyProofBtn = document.createElement("button");
    copyProofBtn.type = "button";
    copyProofBtn.className = "btn btn-xs";
    copyProofBtn.textContent = "📋 Copy Proof";
    copyProofBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(item.proof);
      showToast("Copied engine proof!");
    });
    proofToolbar.appendChild(copyProofBtn);
    proofDetails.appendChild(proofToolbar);

    const proofBox = document.createElement("div");
    proofBox.className = "proof-box";
    proofBox.textContent = item.proof;
    proofDetails.appendChild(proofBox);
  }

  if (Array.isArray(item.vas) && item.vas.length > 0) {
    const vaRow = document.createElement("div");
    vaRow.className = "pipe-va-row";
    for (const va of item.vas) {
      const vaChip = document.createElement("span");
      vaChip.className = "code-badge";
      vaChip.textContent = va;
      vaRow.appendChild(vaChip);
    }
    proofDetails.appendChild(vaRow);
  }

  const noteWrap = document.createElement("div");
  noteWrap.className = "note-box";
  noteWrap.style.marginTop = "8px";
  const noteArea = document.createElement("textarea");
  noteArea.placeholder = "Add personal pipe tests, factory notes, or video ideas...";
  noteArea.value = noteVal;
  noteArea.addEventListener("input", () => {
    localState.notes[item.id] = noteArea.value;
    saveLocalState();
  });
  noteWrap.appendChild(noteArea);
  proofDetails.appendChild(noteWrap);

  stack.appendChild(proofDetails);
  card.appendChild(stack);
  return card;
}

function updateSectionUI() {
  const isManual = activeSection === "manual";
  const isPipes = activeSection === "pipes";
  const isModStudio = activeSection === "modstudio" && ENABLE_MOD_STUDIO;

  secManualBtn.classList.toggle("active", isManual);
  secPipesBtn.classList.toggle("active", isPipes);
  if (secModStudioBtn) secModStudioBtn.classList.toggle("active", isModStudio);

  secManualBtn.textContent = `📘 Visual Plumbing Manual (${VISUAL_MANUAL_COUNT})`;
  secPipesBtn.textContent = `🔧 Pipe Engine Dissection (${pipeBibleItems.length})`;

  manualHeroBanner.classList.toggle("hidden", !isManual);
  pipeHeroBanner.classList.toggle("hidden", !isPipes);
  if (modstudioHeroBanner) modstudioHeroBanner.classList.toggle("hidden", !isModStudio);
  if (searchInput) searchInput.classList.toggle("hidden", isModStudio);

  if (isManual) {
    sourceMeta.textContent = `Public Edition • ${VISUAL_MANUAL_COUNT} Visual Lessons`;
    searchInput.placeholder = "Search simple guide: pump, gas, 600, buffer, manifold...";
  } else if (isPipes) {
    sourceMeta.textContent = `Binary Verified • ${pipeBibleItems.length} Dissections`;
    searchInput.placeholder = "Search Pipe Dissection rules, diagrams, circuits, VAs...";
  } else {
    sourceMeta.textContent = "Mod Visual Studio • Pipe X-Ray v1.3";
  }
}

function render() {
  updateSectionUI();
  boardContainer.innerHTML = "";

  if (activeSection === "modstudio" && ENABLE_MOD_STUDIO) {
    focusTabs.classList.add("hidden");
    focusTabs.innerHTML = "";
    boardContainer.className = "board-list modstudio-wide";
    renderModVisualStudio(boardContainer, showToast);
    return;
  }

  if (activeSection === "manual") {
    renderManualChapterTabs();
    boardContainer.className = "board-list";
    renderVisualPlumbingManual(boardContainer, searchQuery, manualChapterFilter, (chId) => {
      manualChapterFilter = chId;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return;
  }

  const ordered = [...pipeBibleItems].sort((a, b) => (a.num || 0) - (b.num || 0));
  const filtered = ordered.filter(matchesPipeFilters);
  renderPipeTabs(filtered);
  boardContainer.className = "board-list";
  if (!searchQuery) {
    renderTopPipeXRaySandbox(boardContainer);
  }
  const listItems =
    pipeTierFilter === "ALL" ? filtered : filtered.filter((i) => i.defaultCategory === pipeTierFilter);
  if (listItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-col";
    empty.textContent = "No Pipe & Fluid lessons matched your search.";
    boardContainer.appendChild(empty);
  } else {
    for (const item of listItems) {
      const card = createPipeBibleCard(item);
      enhancePipeBibleCardWithSim(card, item);
      boardContainer.appendChild(card);
    }
  }
}

secManualBtn.addEventListener("click", () => {
  activeSection = "manual";
  render();
});
secPipesBtn.addEventListener("click", () => {
  activeSection = "pipes";
  render();
});
if (secModStudioBtn && ENABLE_MOD_STUDIO) {
  secModStudioBtn.addEventListener("click", () => {
    activeSection = "modstudio";
    render();
  });
}

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim();
  render();
});

function syncHashRoute() {
  const h = window.location.hash;
  if (h === "#modstudio" && ENABLE_MOD_STUDIO) activeSection = "modstudio";
  else if (h === "#pipes") activeSection = "pipes";
  else if (h === "#manual") activeSection = "manual";
}

window.addEventListener("hashchange", () => {
  syncHashRoute();
  render();
});

async function init() {
  syncHashRoute();
  try {
    const resp = await fetch("./pipe_bible.json?v=20261120_1155", { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      pipeBibleItems = Array.isArray(data.items) ? data.items : [];
    }
  } catch {
    pipeBibleItems = [];
  }
  render();
}

init();
