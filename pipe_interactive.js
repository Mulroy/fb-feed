// Interactive Simulation, 2D Cutaway Animation & Step-by-Step Build Engine
// Pure vanilla ES module; zero code/binary leaks, zero branding strings, works offline & on GitHub Pages.

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ============================================================================
// 1. Data-Driven Physics & Controls for All 20 Lessons (pm-01 .. pm-20)
// ============================================================================

const LESSON_SIM_CONFIGS = {
  "pm-01": {
    title: "Interactive Slosh & Fullness Simulator",
    presetId: "fill_slosh",
    brokenLabel: "❌ Half-Full Setup (50% Fill)",
    fixedLabel: "✅ Pre-Filled Setup (100%+)",
    brokenDefaults: { fill: 50, rate: 300 },
    fixedDefaults: { fill: 104, rate: 300 },
    sliders: [
      { key: "fill", label: "Pipe Fullness", min: 5, max: 108, step: 1, unit: "%" },
      { key: "rate", label: "Pipe Tier Cap", min: 300, max: 600, step: 300, unit: " m³/min" },
    ],
    evaluate(s, isFixed) {
      const fill = s.fill;
      const cap = s.rate;
      const effScale = Math.min(1, Math.max(0, fill / 100));
      const flow = +(cap * effScale).toFixed(1);
      const sloshing = fill > 2 && fill < 99.5;
      const overfill = Math.max(0, +(fill - 100).toFixed(1));
      const headM = fill >= 100 ? +(1.3 + overfill * 0.85).toFixed(1) : +(fill * 0.013).toFixed(2);
      return {
        flow,
        cap,
        fill,
        overfill,
        headM,
        waterZ: headM,
        sloshing,
        severity: fill < 55 ? "red" : (sloshing ? "amber" : "green"),
        verdict: fill >= 100
          ? "✅ 100% Locked Flow (Zero Sloshing!)"
          : (sloshing ? `🌊 Sloshing! Capped at ${Math.round(effScale * 100)}% Flow` : "⚠️ Nearly Empty Pipe"),
        explain: fill >= 100
          ? "Every segment stays full, so waves cannot bounce backward and machines receive steady fluid."
          : `At ${fill}% full, outflow shrinks proportionally to ${Math.round(effScale * 100)}% (${flow} m³/min) while waves slosh back and forth.`,
        visualKind: "cutaway_horizontal",
      };
    },
  },
  "pm-02": {
    title: "Staircase Gravity & Machine Gulp Lab",
    presetId: "fill_slosh",
    brokenLabel: "❌ Staircase & Starved Pipe",
    fixedLabel: "✅ Elevated Header + Full Line",
    brokenDefaults: { fill: 42, len: 4.5 },
    fixedDefaults: { fill: 100, len: 12.0 },
    sliders: [
      { key: "fill", label: "Feeder Pipe Fullness", min: 15, max: 105, step: 1, unit: "%" },
      { key: "len", label: "Pipe Segment Length", min: 2.0, max: 20.0, step: 0.5, unit: " m" },
    ],
    evaluate(s) {
      const ringVisible = s.len >= 5.5;
      const effPct = Math.min(100, Math.round(s.fill));
      const flow = +(300 * Math.min(1, s.fill / 100)).toFixed(1);
      const sloshing = s.fill < 99.5;
      return {
        flow,
        cap: 300,
        fill: s.fill,
        overfill: Math.max(0, +(s.fill - 100).toFixed(1)),
        headM: s.fill >= 100 ? 6.0 : +(s.fill * 0.013).toFixed(2),
        waterZ: s.fill >= 100 ? 6.0 : 1.0,
        sloshing,
        severity: !ringVisible && sloshing ? "amber" : (sloshing ? "amber" : "green"),
        verdict: `${sloshing ? "🌊 Gulp Dip / Starve" : "✅ Smooth Gulps"} · ${ringVisible ? "Flow Ring ON" : "NO Vanilla Ring (<5.5m)"}`,
        explain: `${ringVisible ? "Length >= 5.50 m so the vanilla pulsing ring spawns." : "Length under 5.50 m hides the vanilla Flow Ring even when liquid is moving!"} Lower staircase pipes always fill before upper ones.`,
        visualKind: "staircase",
      };
    },
  },
  "pm-03": {
    title: "Water-Level Ceiling & Head Lift Sandbox",
    presetId: "headlift_buffer",
    brokenLabel: "❌ Hill Too Tall (Over Ceiling)",
    fixedLabel: "✅ Powered Pump Boost",
    brokenDefaults: { hill: 18, pump: 0 },
    fixedDefaults: { hill: 18, pump: 20 },
    sliders: [
      { key: "hill", label: "Hill / Pipe Peak Height", min: 4, max: 58, step: 1, unit: " m" },
      { key: "pump", label: "Added Pump (0 / 20 / 50m)", min: 0, max: 50, step: 10, unit: " m" },
    ],
    evaluate(s) {
      const designHead = 10 + s.pump;
      const trueMax = s.pump === 0 ? 12 : (s.pump <= 20 ? 32 : 65);
      const canClimbDesign = s.hill <= designHead;
      const canClimbPhysics = s.hill <= trueMax;
      const flow = canClimbPhysics ? (canClimbDesign ? 300 : 285) : 0;
      return {
        flow,
        cap: 300,
        fill: canClimbPhysics ? 100 : 12,
        overfill: canClimbDesign ? 4.0 : 0,
        headM: designHead,
        waterZ: designHead,
        targetZ: s.hill,
        trueMax,
        sloshing: !canClimbPhysics,
        severity: !canClimbPhysics ? "red" : (!canClimbDesign ? "amber" : "green"),
        verdict: canClimbDesign
          ? `✅ Reaches ${s.hill}m (Under ${designHead}m Water Level)`
          : (canClimbPhysics ? `⚠️ Hidden 10% Physics Margin (${s.hill}m <= ${trueMax}m)` : `🚨 Stopped Cold! Needs ${s.hill}m > ${trueMax}m Max`),
        explain: canClimbDesign
          ? `Source (${10}m) + Pump (${s.pump}m) pushes the invisible Water-Level Line to ${designHead}m, easily climbing the ${s.hill}m peak (and free-falling back up after any valley!).`
          : `Above ${designHead}m, the pump gauge hits 100% red warning; past ${trueMax}m true physics max, liquid stalls to 0 m³/min.`,
        visualKind: "water_table",
      };
    },
  },
  "pm-04": {
    title: "Liquid vs. Gas Gravity Comparison",
    presetId: "fill_slosh",
    brokenLabel: "💧 Liquid Mode (Needs Pumps)",
    fixedLabel: "💨 Gas Mode (0 Pumps Forever)",
    brokenDefaults: { isGas: 0, height: 120 },
    fixedDefaults: { isGas: 1, height: 500 },
    sliders: [
      { key: "isGas", label: "Fluid Form (0=Liquid / 1=Gas)", min: 0, max: 1, step: 1, unit: "" },
      { key: "height", label: "Tower Height", min: 10, max: 500, step: 10, unit: " m" },
    ],
    evaluate(s) {
      const gas = s.isGas >= 1;
      const reachesTop = gas || s.height <= 12;
      return {
        flow: reachesTop ? 600 : 0,
        cap: 600,
        fill: reachesTop ? 100 : 8,
        overfill: 0,
        headM: gas ? 200 : 12,
        waterZ: gas ? s.height : 12,
        targetZ: s.height,
        isGas: gas,
        sloshing: !reachesTop,
        severity: reachesTop ? "green" : "red",
        verdict: gas
          ? `💨 Gas Climbs ${s.height}m With 0 Pumps! (Pressure P = 200)`
          : (s.height <= 12 ? "💧 Liquid Climbs Within 12m" : `🚨 Liquid Blocked at 12m (Needs Pumps for ${s.height}m)`),
        explain: gas
          ? "Gases completely ignore height and Head Lift. Both sky-towers AND Fluid Buffers work smoothly on Gas!"
          : "Liquids obey gravity and stall at ~12m without pumps.",
        visualKind: "water_table",
      };
    },
  },
  "pm-05": {
    title: "3 : 8 Coal Generator Loop Interactive Checker",
    presetId: "mk2_600_clip",
    brokenLabel: "❌ Single Dead-End Pipe (300 Cap!)",
    fixedLabel: "✅ Fed From Both Ends (360 Total)",
    brokenDefaults: { looped: 0, gens: 8 },
    fixedDefaults: { looped: 1, gens: 8 },
    sliders: [
      { key: "looped", label: "Loop Setup (0=Single End / 1=Both Ends)", min: 0, max: 1, step: 1, unit: "" },
      { key: "gens", label: "Active Coal Generators (45 m³/m each)", min: 1, max: 8, step: 1, unit: " gens" },
    ],
    evaluate(s) {
      const demand = s.gens * 45;
      const pipeCap = s.looped >= 1 ? 600 : 300;
      const delivered = Math.min(demand, pipeCap);
      const starved = demand > pipeCap;
      return {
        flow: delivered,
        cap: pipeCap,
        fill: starved ? 62 : 100,
        overfill: starved ? 0 : 2.5,
        headM: 10,
        waterZ: 10,
        sloshing: starved,
        severity: starved ? "red" : "green",
        verdict: starved
          ? `🚨 Bottlenecked! Pipe Caps at 300 vs ${demand} m³/min Needed (Last Gen Starves)`
          : `✅ All ${s.gens} Coal Generators Fed Smoothly (${delivered} / ${demand} m³/min)`,
        explain: starved
          ? "3 Water Extractors = 360 m³/min, which cannot squeeze through a single 300 m³/min Mk.1 pipe."
          : "Connecting the 3rd Extractor to the far end splits flow cleanly: 240 from left + 120 from right!",
        visualKind: "manifold_loop",
      };
    },
  },
  "pm-06": {
    title: "Pump Spacing & Over-Design Meter Tester",
    presetId: "headlift_buffer",
    brokenLabel: "❌ Stacked Pumps (Wastes Head Lift!)",
    fixedLabel: "✅ Properly Spaced Pump Chain",
    brokenDefaults: { spacing: 5, lift: 21 },
    fixedDefaults: { spacing: 20, lift: 20 },
    sliders: [
      { key: "spacing", label: "Pump Spacing Above Source", min: 2, max: 24, step: 1, unit: " m" },
      { key: "lift", label: "Target Pipe Height After Pump", min: 10, max: 26, step: 1, unit: " m" },
    ],
    evaluate(s) {
      const trueReach = s.spacing <= 12 ? (s.spacing + 22) : 12;
      const overMax = s.lift > 22;
      const ok = s.spacing <= 12 && !overMax;
      return {
        flow: ok ? 300 : (s.spacing <= 12 && s.lift <= 22 ? 290 : 0),
        cap: 300,
        fill: ok ? 100 : 20,
        overfill: s.lift <= 20 && s.spacing <= 10 ? 4.0 : 0,
        headM: s.spacing <= 12 ? 20 : 0,
        waterZ: s.spacing <= 12 ? (s.spacing + 20) : 10,
        targetZ: s.spacing + s.lift,
        sloshing: !ok,
        severity: !ok ? "red" : (s.lift > 20 ? "amber" : "green"),
        verdict: s.spacing > 12
          ? `🚨 Pump Placed at ${s.spacing}m (>12m Source)! Dry Pump Can't Prime`
          : (s.lift > 22 ? "🚨 Over 22m True Max Head Lift!" : (s.lift > 20 ? "⚠️ Past 20m Design Ring (Using 22m Buffer)" : `✅ Clean Lift (+${s.lift}m Above Pump)`)),
        explain: "Pumps RESET head lift from their own position rather than adding onto old pump pressure — mount pumps at or just below the previous 10m/20m blue snap ring!",
        visualKind: "water_table",
      };
    },
  },
  "pm-07": {
    title: "Unpowered Pump vs. Closed Valve Lab",
    presetId: "zero_mw_tower",
    brokenLabel: "❌ Unpowered Pump (Resets Head Lift to 0m!)",
    fixedLabel: "✅ Closed Valve (0 MW, 98% Head Lift Passes!)",
    brokenDefaults: { part: 0, upstreamHead: 40 },
    fixedDefaults: { part: 1, upstreamHead: 40 },
    sliders: [
      { key: "part", label: "Device (0=Unpowered Pump / 1=Closed Valve)", min: 0, max: 1, step: 1, unit: "" },
      { key: "upstreamHead", label: "Upstream Tower Head", min: 10, max: 60, step: 2, unit: " m" },
    ],
    evaluate(s) {
      const isValve = s.part >= 1;
      const outHead = isValve ? +(s.upstreamHead * 0.98).toFixed(1) : 0.0;
      return {
        flow: isValve ? 0 : 120,
        cap: isValve ? 0 : 300,
        fill: 100,
        overfill: isValve ? 4.5 : 0,
        headM: outHead,
        waterZ: outHead,
        sloshing: false,
        severity: isValve ? "cyan" : "red",
        verdict: isValve
          ? `💎 Closed Valve: 0 m³/m Flow, ${outHead}m (98%) Head Lift @ 0 MW!`
          : `🚨 Unpowered Pump: Flow Passes Downhill, Head Lift WIPED to 0.0m!`,
        explain: isValve
          ? "A closed 0 m³/min Valve blocks 100% of water volume while acting as a free pressure-transmission diode!"
          : "Never leave an unpowered Pump on an uphill line — turning off a Pump wipes upstream Head Lift right down to 0 meters.",
        visualKind: "water_table",
      };
    },
  },
  "pm-08": {
    title: "Fluid Buffer Placement & Bottom 1.5m Ramp",
    presetId: "headlift_buffer",
    brokenLabel: "❌ Inline Buffer After Pump (Kills Lift!)",
    fixedLabel: "✅ Side-Tee Buffer / Pump After Buffer",
    brokenDefaults: { inline: 1, fill: 45 },
    fixedDefaults: { inline: 0, fill: 95 },
    sliders: [
      { key: "inline", label: "Wiring (1=Inline / 0=Side-Tee)", min: 0, max: 1, step: 1, unit: "" },
      { key: "fill", label: "Buffer Fill Level", min: 5, max: 100, step: 5, unit: "%" },
    ],
    evaluate(s) {
      const wiped = s.inline >= 1 && s.fill < 99.9;
      const tankHead = +((s.fill / 100) * 12).toFixed(1);
      const outHead = wiped ? tankHead : 40.0;
      // Bottom 1.5m of 12m Industrial Buffer = 12.5% fill
      const rampPct = Math.min(100, Math.round((s.fill / 12.5) * 100));
      return {
        flow: +(300 * (rampPct / 100)).toFixed(1),
        cap: 300,
        fill: s.fill,
        overfill: 0,
        headM: outHead,
        waterZ: outHead,
        sloshing: wiped,
        severity: wiped ? "red" : (rampPct < 100 ? "amber" : "green"),
        verdict: wiped
          ? `🚨 Head Lift Wiped to ${tankHead}m! (Inline Tank Reset 40m Pump)`
          : (rampPct < 100 ? `⚠️ Bottom 1.5m Ramp: ${rampPct}% Output Speed` : "✅ Full 40m Head Lift Preserved + Surge Protected!"),
        explain: wiped
          ? "Any partially full inline Fluid Buffer throws away all pump pressure behind it. Downstream pipes can only climb as high as the liquid inside the tank."
          : "Keeping the Buffer on a side tee (or placing your Pump AFTER the Buffer) lets the factory keep full pressure while storing reserve volume.",
        visualKind: "buffer_cutaway",
      };
    },
  },
  "pm-09": {
    title: "Valve Backflow Block & Over-Limiting Demo",
    presetId: "fill_slosh",
    brokenLabel: "❌ Open Line (Waves Bounce Backward)",
    fixedLabel: "✅ Directional Valve Stops Back-Slosh",
    brokenDefaults: { hasValve: 0, limit: 300 },
    fixedDefaults: { hasValve: 1, limit: 300 },
    sliders: [
      { key: "hasValve", label: "Valve Installed (0=No / 1=Yes)", min: 0, max: 1, step: 1, unit: "" },
      { key: "limit", label: "Valve Flow Cap", min: 0, max: 600, step: 30, unit: " m³/min" },
    ],
    evaluate(s) {
      const diode = s.hasValve >= 1;
      const effCap = diode ? s.limit : 300;
      const choked = diode && s.limit < 300 && s.limit > 0;
      return {
        flow: Math.min(300, effCap),
        cap: effCap,
        fill: 78,
        overfill: 0,
        headM: 12,
        waterZ: 12,
        sloshing: !diode,
        severity: !diode ? "amber" : (choked ? "amber" : "green"),
        verdict: !diode
          ? "🌊 Backflow Sloshing Toward Source"
          : (s.limit === 0 ? "⛔ Valve Closed (0 m³/m)" : (choked ? `⚠️ Choked Downstream to ${s.limit} m³/m` : "✅ 1-Way Flow Door Blocks Back-Slosh (0 MW)")),
        explain: diode
          ? "Remember: Setting a Valve lower than actual pipe need makes downstream machines fill at a half-full rate — leave Valves at 600 when only blocking backflow!"
          : "Without a 1-way Valve or full pipe, slosh waves travel backward down the manifold.",
        visualKind: "cutaway_horizontal",
      };
    },
  },
  "pm-10": {
    title: "Manifold Feed Comparison (Bottom vs Top-Fed)",
    presetId: "mk2_600_clip",
    brokenLabel: "❌ Flat Manifold & Unfilled Start",
    fixedLabel: "✅ Top-Fed (+2m), Pre-Filled & Looped",
    brokenDefaults: { topFeed: 0, prefill: 45 },
    fixedDefaults: { topFeed: 1, prefill: 100 },
    sliders: [
      { key: "topFeed", label: "Header (+2m Drop? 0=Flat / 1=Top-Fed)", min: 0, max: 1, step: 1, unit: "" },
      { key: "prefill", label: "Header Pre-Fill %", min: 25, max: 105, step: 5, unit: "%" },
    ],
    evaluate(s) {
      const ok = s.topFeed >= 1 && s.prefill >= 95;
      const flow = ok ? 300 : +(300 * Math.min(1, s.prefill / 100) * (s.topFeed ? 1 : 0.85)).toFixed(1);
      return {
        flow,
        cap: 300,
        fill: s.prefill,
        overfill: Math.max(0, s.prefill - 100),
        headM: s.topFeed ? 6 : 2,
        waterZ: s.topFeed ? 6 : 2,
        sloshing: !ok,
        severity: ok ? "green" : "amber",
        verdict: ok
          ? "✅ End Machines Run 100% Continuously!"
          : "⚠️ Machine #1 Steals Gravity Priority & End Machine Stutters",
        explain: ok
          ? "Each machine fills its internal 50 m³ tank smoothly from overhead gravity drops with zero slosh fighting."
          : "Flat headers drain out through the first port whenever pipe level drops below 100%.",
        visualKind: "manifold_loop",
      };
    },
  },
  "pm-11": {
    title: "600 m³/min First-Junction Clipping Simulator",
    presetId: "mk2_600_clip",
    brokenLabel: "❌ Straight Single Dead-End (Drops to ~572)",
    fixedLabel: "✅ Loop / T-Split at Source (Full 600.0)",
    brokenDefaults: { looped: 0, load: 600 },
    fixedDefaults: { looped: 1, load: 600 },
    sliders: [
      { key: "looped", label: "Fix (0=Dead-End / 1=Loop or T-Split)", min: 0, max: 1, step: 1, unit: "" },
      { key: "load", label: "Extractor Output Rate", min: 300, max: 600, step: 30, unit: " m³/min" },
    ],
    evaluate(s) {
      const clipping = s.looped === 0 && s.load > 550;
      const delivered = clipping ? +(s.load * 0.953).toFixed(1) : s.load;
      return {
        flow: delivered,
        cap: 600,
        fill: clipping ? 99.6 : 100,
        overfill: clipping ? 0 : 3.5,
        headM: 12,
        waterZ: 12,
        sloshing: clipping,
        severity: clipping ? "red" : "green",
        verdict: clipping
          ? `🚨 Clipping Loss! Delivering ${delivered} / ${s.load} m³/min`
          : `✅ Zero Budget Loss! True ${delivered.toFixed(1)} m³/min Delivered`,
        explain: clipping
          ? "Back-sloshing fills the first short segment too tightly (<167 L free space), so leftover machine push time gets discarded each tick."
          : "Splitting flow right at the output (or feeding the manifold from both ends) guarantees enough headroom every tick for 600.0 m³/min!",
        visualKind: "manifold_loop",
      };
    },
  },
  "pm-12": {
    title: "Byproduct Water Recycling Sandbox (Aluminum)",
    presetId: "aluminum_vip",
    brokenLabel: "❌ Flat Level Merge (Refineries Lock Up!)",
    fixedLabel: "✅ VIP Priority (Recycled Bottom / Fresh Top)",
    brokenDefaults: { vip: 0, fresh: 240, recycled: 120 },
    fixedDefaults: { vip: 1, fresh: 240, recycled: 120 },
    sliders: [
      { key: "vip", label: "Wiring (0=Flat Merge / 1=VIP Priority)", min: 0, max: 1, step: 1, unit: "" },
      { key: "recycled", label: "Recycled Water Rate", min: 60, max: 240, step: 20, unit: " m³/min" },
    ],
    evaluate(s) {
      const deadlocked = s.vip === 0;
      const freshUsed = Math.max(0, 360 - s.recycled);
      return {
        flow: deadlocked ? 180 : 360,
        cap: 600,
        fill: deadlocked ? 105 : 98,
        overfill: deadlocked ? 9.5 : 1.0,
        headM: 12,
        waterZ: 12,
        freshUsed,
        recycledUsed: deadlocked ? 30 : s.recycled,
        sloshing: deadlocked,
        severity: deadlocked ? "red" : "green",
        verdict: deadlocked
          ? `🚨 Aluminum Deadlock! Fresh Water Backing Up Recycled Line`
          : `✅ 100% Priority: Burns ALL ${s.recycled} Recycled + ${freshUsed} Fresh m³/min`,
        explain: deadlocked
          ? "Fresh Extractors push continuously, filling the junction to 100% and stopping Scrap Refineries from dumping waste water."
          : "Stacked VIP merges into one shared Pressure Group where the 0.0m bottom pipe always gets +2.5–3m more headroom than the upper port (and Pumps strip upstream pressure cleanly!).",
        visualKind: "vip_junction",
      };
    },
  },
  "pm-13": {
    title: "Fuel Auto-Flush & Nuclear 10 m³ Gulp Tester",
    presetId: "power_well_nuclear",
    brokenLabel: "❌ Starved Nuclear Line (<10 m³ Batches)",
    fixedLabel: "✅ Full Nuclear Feeder + Auto-Flush Fuel",
    brokenDefaults: { fill: 14, mode: 0 },
    fixedDefaults: { fill: 100, mode: 1 },
    sliders: [
      { key: "mode", label: "Focus (0=Nuclear 10m³ Water / 1=Fuel Upgrade)", min: 0, max: 1, step: 1, unit: "" },
      { key: "fill", label: "Feeder Pipe Reserve (m³ / %)", min: 5, max: 100, step: 5, unit: "%" },
    ],
    evaluate(s) {
      const pipeM3 = +(s.fill * 0.16).toFixed(1);
      const starved = s.mode === 0 && pipeM3 < 10.0;
      return {
        flow: s.mode === 1 ? 300 : (starved ? 180 : 600),
        cap: 600,
        fill: s.fill,
        overfill: s.fill >= 100 ? 4 : 0,
        headM: 12,
        waterZ: 12,
        sloshing: starved,
        severity: starved ? "red" : "green",
        verdict: s.mode === 1
          ? "✅ Fuel Generators Auto-Flush Old Fuel (Only Flush Pipes!)"
          : (starved ? `🚨 Pipe Holds ${pipeM3} m³ (< 10.0 m³ Nuclear Gulp!) -> Plant Stalls!` : `✅ ${pipeM3} m³ Ready — Instant 10 m³ Nuclear Gulp!`),
        explain: s.mode === 1
          ? "Unlike Refineries/Packagers, Fuel Generators clear their internal 50 m³ fuel tank automatically the moment Rocket Fuel or Turbofuel touches the port."
          : "Nuclear Power Plants load Water only in 10,000 L (10 m³) batches — keep feeder lines 100% full at all times.",
        visualKind: "cutaway_horizontal",
      };
    },
  },
  "pm-14": {
    title: "Fluid Train 27s Dock & Well Pressurizer Lab",
    presetId: "train_dock_27s",
    brokenLabel: "❌ No Station Buffer (27s Starve)",
    fixedLabel: "✅ 2,400 m³ Buffer + 3-Shard Pressurizer",
    brokenDefaults: { hasBuf: 0, shards: 0 },
    fixedDefaults: { hasBuf: 1, shards: 3 },
    sliders: [
      { key: "hasBuf", label: "Station Buffer (0=Direct Pipe / 1=Industrial Tank)", min: 0, max: 1, step: 1, unit: "" },
      { key: "shards", label: "Well Pressurizer Power Shards", min: 0, max: 3, step: 1, unit: " shards" },
    ],
    evaluate(s) {
      const wellMult = 100 + s.shards * 50;
      const steady = s.hasBuf >= 1;
      return {
        flow: steady ? Math.round(300 * (wellMult / 100)) : 0,
        cap: 900,
        fill: steady ? 92 : 10,
        overfill: 0,
        headM: 10,
        waterZ: 10,
        sloshing: !steady,
        severity: !steady ? "red" : "green",
        verdict: steady
          ? `✅ 27s Dock Bridged Smoothly · Well @ ${wellMult}% across ALL Nodes (0s Standby Restart!)`
          : `🚨 Docking Freezes Platform Pipes for 27.0s — Downstream Runs Dry!`,
        explain: "Put all 3 Power Shards ONLY in the central Resource Well Pressurizer (up to 8 Extractors scale at once!), and place an Industrial Fluid Buffer next to every Train Platform.",
        visualKind: "buffer_cutaway",
      };
    },
  },
  "pm-15": {
    title: "VIP Junction PortZ Priority Sandbox",
    presetId: "aluminum_vip",
    brokenLabel: "❌ Upside-Down / Flat Cross",
    fixedLabel: "✅ Upright Stack (Bottom 0.0m vs Top 1.3m)",
    brokenDefaults: { upright: 0, recycled: 180 },
    fixedDefaults: { upright: 1, recycled: 180 },
    sliders: [
      { key: "upright", label: "Stack Mode (0=Flat / 1=Vertical VIP)", min: 0, max: 1, step: 1, unit: "" },
      { key: "recycled", label: "Bottom Port Inflow (Recycled)", min: 60, max: 300, step: 20, unit: " m³/min" },
    ],
    evaluate(s) {
      const ok = s.upright >= 1;
      return {
        flow: 300,
        cap: 300,
        fill: ok ? 100 : 105,
        overfill: ok ? 2 : 9,
        headM: 12,
        waterZ: 12,
        sloshing: !ok,
        severity: ok ? "green" : "red",
        verdict: ok
          ? `✅ Bottom PortZ=0.0m Priority Drains 100% of ${s.recycled} m³/m First!`
          : "🚨 Same Height = 50/50 Tug-of-War (Byproduct Backs Up)",
        explain: ok
          ? "Stacked Crosses share one Pressure Group where Bottom (0m) has +2.5–3m more headroom than Top (+2.5m), whether Pumps are powered or unpowered! Unpowered Pumps beat Open Valves because Pumps strip upstream Head Lift."
          : "Flat Crosses give all 4 horizontal ports the exact same PortZ = 0.0m, letting high-pressure extractors block your byproduct.",
        visualKind: "vip_junction",
      };
    },
  },
  "pm-16": {
    title: "VOP Power-First Overflow Dam Sandbox",
    presetId: "vop_overflow",
    brokenLabel: "❌ Flat Split (Power Starves at Low Supply!)",
    fixedLabel: "✅ Overflow Loop (Power Fed 100% Before Sink)",
    brokenDefaults: { dam: 0, supply: 180 },
    fixedDefaults: { dam: 1, supply: 180 },
    sliders: [
      { key: "dam", label: "Circuit (0=Flat T-Split / 1=4m Gravity Dam)", min: 0, max: 1, step: 1, unit: "" },
      { key: "supply", label: "Incoming Fuel (Power needs 150)", min: 60, max: 300, step: 20, unit: " m³/min" },
    ],
    evaluate(s) {
      const powerNeed = 150;
      let toPower, toSink;
      if (s.dam >= 1) {
        toPower = Math.min(s.supply, powerNeed);
        toSink = Math.max(0, s.supply - powerNeed);
      } else {
        toPower = Math.round(s.supply * 0.5);
        toSink = s.supply - toPower;
      }
      const gridSafe = toPower >= Math.min(s.supply, powerNeed);
      return {
        flow: s.supply,
        cap: 300,
        fill: s.supply > 150 ? 100 : 75,
        overfill: s.supply > 150 ? 3 : 0,
        headM: 10,
        waterZ: 10,
        toPower,
        toSink,
        sloshing: !gridSafe,
        severity: gridSafe ? "green" : "red",
        verdict: gridSafe
          ? `✅ Power Gets ${toPower}/150 m³/m First! Sink Gets Overflow (${toSink})`
          : `🚨 Flat Split Steals Half! Power Only Gets ${toPower}/150 -> Breaker Trips!`,
        explain: "Forcing the overflow pipe up a +4m inverted U-bend ensures zero fluid reaches Sinks or Packagers until Power Generators fill completely.",
        visualKind: "vop_overflow",
      };
    },
  },
  "pm-17": {
    title: "0-MW Closed-Valve Water Tower & Two-Way Blackout Prevention",
    presetId: "zero_mw_tower",
    brokenLabel: "❌ Valve Open / Two-Way Loop Without Isolation",
    fixedLabel: "✅ Closed Valve (0 m³/m Flow, 98% Head @ 0 MW!)",
    brokenDefaults: { closedValve: 0, towerH: 50 },
    fixedDefaults: { closedValve: 1, towerH: 50 },
    sliders: [
      { key: "closedValve", label: "Tower Valve (0=Open Drain / 1=Closed 0m³/m)", min: 0, max: 1, step: 1, unit: "" },
      { key: "towerH", label: "Water Tower Peak Height", min: 20, max: 80, step: 5, unit: " m" },
    ],
    evaluate(s) {
      const diode = s.closedValve >= 1;
      const factoryHead = +(s.towerH * 0.98).toFixed(1);
      return {
        flow: diode ? 0 : 280,
        cap: diode ? 0 : 300,
        fill: 105,
        overfill: 6.0,
        headM: diode ? factoryHead : +(s.towerH * 0.45).toFixed(1),
        waterZ: diode ? factoryHead : +(s.towerH * 0.45).toFixed(1),
        sloshing: !diode,
        severity: diode ? "cyan" : "amber",
        verdict: diode
          ? `💎 Tower Locked: 0 m³/m Drain, Entire Factory Pressurized to ${factoryHead}m @ 0 MW!`
          : `⚠️ Open Tower Draining & Dropping Head Lift to ${+(s.towerH * 0.45).toFixed(1)}m`,
        explain: diode
          ? "Fill the elevated reference pipe once with a single Pump, set the connecting Valve to 0 m³/min, and delete the pump — 98% of tower head lift stays active forever!"
          : "Leaving the reference loop open lets backflow or drains reduce your tower's pressure ceiling.",
        visualKind: "water_table",
      };
    },
  },
  "pm-18": {
    title: "Side-Branch Buffer vs. Old 2022 Equalizer Comparison",
    presetId: "headlift_buffer",
    brokenLabel: "❌ 2022 Inline Equalizer Buffer (Breaks Lift!)",
    fixedLabel: "✅ Clean Side-Branch Surge Tank",
    brokenDefaults: { branch: 0, surge: 40 },
    fixedDefaults: { branch: 1, surge: 85 },
    sliders: [
      { key: "branch", label: "Layout (0=Old Inline / 1=Side Branch)", min: 0, max: 1, step: 1, unit: "" },
      { key: "surge", label: "Tank Reserve Level", min: 10, max: 100, step: 5, unit: "%" },
    ],
    evaluate(s) {
      const safe = s.branch >= 1;
      const head = safe ? 42.0 : +((s.surge / 100) * 12).toFixed(1);
      return {
        flow: safe ? 600 : 210,
        cap: 600,
        fill: safe ? 100 : s.surge,
        overfill: safe ? 4 : 0,
        headM: head,
        waterZ: head,
        sloshing: !safe,
        severity: safe ? "green" : "red",
        verdict: safe
          ? "✅ Main Line Keeps Full 42m Lift While Side Tank Absorbs Pulses"
          : `🚨 2022 Equalizer Bug: Tank at ${s.surge}% Cuts Head Lift to ${head}m!`,
        explain: "In modern v1.2.5.1 builds, inline tanks break Pressure Groups. Putting the buffer off to the side on a Junction Cross gives smooth storage with zero lift loss.",
        visualKind: "buffer_cutaway",
      };
    },
  },
  "pm-19": {
    title: "100-Hop Union-Find Chain & Building Trick Checker",
    presetId: "fill_slosh",
    brokenLabel: "❌ >100 Segments Without a Valve/Pump",
    fixedLabel: "✅ Hop Reset Every ~80 Segments",
    brokenDefaults: { hops: 104, hasReset: 0 },
    fixedDefaults: { hops: 104, hasReset: 1 },
    sliders: [
      { key: "hops", label: "Consecutive Full Pipes + Junctions", min: 20, max: 120, step: 4, unit: " boxes" },
      { key: "hasReset", label: "Reset Valve / Pump (0=None / 1=Installed)", min: 0, max: 1, step: 1, unit: "" },
    ],
    evaluate(s) {
      const broken = s.hops > 100 && s.hasReset === 0;
      const effectiveHops = s.hasReset ? Math.ceil(s.hops / 2) : s.hops;
      return {
        flow: broken ? 0 : 600,
        cap: 600,
        fill: broken ? 15 : 100,
        overfill: broken ? 0 : 5,
        headM: broken ? 0 : 40,
        waterZ: broken ? 2 : 40,
        sloshing: broken,
        severity: broken ? "red" : (effectiveHops >= 85 ? "amber" : "green"),
        verdict: broken
          ? `🚨 Hit 100-Hop Engine Cutoff (${s.hops} Boxes)! Head Lift Vanished`
          : `✅ Safe Chain (${effectiveHops}/100 Hops — Full 40m Head Lift!)`,
        explain: "The engine stops walking Pressure Group parents after 100 steps. Any wide-open Valve or Pump cleanly starts a fresh 0-hop pressure chain!",
        visualKind: "cutaway_horizontal",
      };
    },
  },
  "pm-20": {
    title: "3-Step Live Pipe Symptom -> Fix Simulator",
    presetId: "fill_slosh",
    brokenLabel: "❌ Diagnose Failing Line",
    fixedLabel: "✅ Apply 3-Step Fix",
    brokenDefaults: { fill: 55, hop: 40 },
    fixedDefaults: { fill: 103, hop: 40 },
    sliders: [
      { key: "fill", label: "Measured Pipe Fullness", min: 10, max: 106, step: 2, unit: "%" },
      { key: "hop", label: "Pipe Peak Above Last Pump", min: 0, max: 30, step: 2, unit: " m" },
    ],
    evaluate(s) {
      const tooHigh = s.hop > 22;
      const emptyLow = s.fill < 99 && !tooHigh;
      const flow = tooHigh ? 0 : Math.round(600 * Math.min(1, s.fill / 100));
      return {
        flow,
        cap: 600,
        fill: tooHigh ? 5 : s.fill,
        overfill: Math.max(0, s.fill - 100),
        headM: 22,
        waterZ: 22,
        targetZ: s.hop,
        sloshing: tooHigh || emptyLow,
        severity: tooHigh ? "red" : (emptyLow ? "amber" : "green"),
        verdict: tooHigh
          ? `🚨 Step 1 Failed: ${s.hop}m > 22m Pump Max -> Move Pump Lower!`
          : (emptyLow ? `⚠️ Step 2/3 Fix: Pre-Fill to 100% (Currently ${s.fill}%)` : "✅ All 3 Checks Passed (Height OK, 100% Full, 600 m³/min!)"),
        explain: "Check Head Lift first -> Pre-fill pipes + machines second -> Isolate slosh/byproduct loops third.",
        visualKind: "water_table",
      };
    },
  },
};

// ============================================================================
// 2. Shared SVG 2D Cutaway Physics Renderer (Side View & Top-Down Floor View)
// ============================================================================

function buildDynamicCutawaySvg(uid, simResult, simConfig, viewMode, showXRay) {
  const w = 680;
  const h = 210;
  const flowRatio = Math.min(1.6, Math.max(0, simResult.flow / Math.max(60, simResult.cap || 300)));
  const animDur = simResult.flow <= 1 ? "0s" : `${Math.max(0.32, 2.2 - flowRatio * 1.1).toFixed(2)}s`;
  const fill01 = Math.min(1, Math.max(0, simResult.fill / 100));
  const fluidCol = simResult.isGas ? "#a78bfa" : (simResult.overfill > 0.2 ? "#22d3ee" : "#38bdf8");
  const statusCol = simResult.severity === "red" ? "#f87171" : (simResult.severity === "amber" ? "#f59e0b" : (simResult.severity === "cyan" ? "#22d3ee" : "#10b981"));
  const streamCls = simResult.flow <= 1 ? "pm-stream-stopped" : (simResult.sloshing ? "pm-stream-slosh" : "pm-stream-flow");

  let body = "";

  // Background Grid / Concrete Floor
  if (simResult.visualKind === "manifold_loop" || viewMode === "TOP") {
    const shortTitle = esc((simConfig?.title || "Pipe Layout").replace(/\s*Sandbox$/i, "").slice(0, 28));
    const topLabel = simResult.visualKind === "manifold_loop" ? "🗺️ TOP-DOWN 8m×8m FLOOR GRID" : `🗺️ TOP VIEW: ${shortTitle}`;
    body += `
      <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="8" fill="#07101f" stroke="#1e293b"/>
      <pattern id="g-${uid}" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="#162238" stroke-width="1"/></pattern>
      <rect x="10" y="10" width="${w - 20}" height="${h - 20}" fill="url(#g-${uid})"/>
      <rect x="18" y="16" width="248" height="20" rx="4" fill="#064e3b" stroke="#10b981"/>
      <text x="142" y="29" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="800">${topLabel}</text>
    `;
  } else {
    body += `
      <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="8" fill="#07101f" stroke="#1e293b"/>
      <rect x="14" y="176" width="${w - 28}" height="18" rx="3" fill="#1e293b" stroke="#334155"/>
      <text x="26" y="189" fill="#94a3b8" font-size="9.5" font-weight="700">0m CONCRETE FOUNDATION FLOOR</text>
      <rect x="18" y="16" width="136" height="20" rx="4" fill="#172554" stroke="#38bdf8"/>
      <text x="86" y="29" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="800">📐 SIDE VIEW CUTAWAY</text>
    `;
  }

  // Specialized Cutaway Geometries
  if (viewMode === "TOP") {
    body += `
      <!-- Top-Down 8m x 8m Floor Manifold / Twin Header Schematic -->
      <path d="M 75 82 L 590 82" fill="none" stroke="#334155" stroke-width="18" stroke-linecap="round"/>
      <path d="M 75 82 L 590 82" fill="none" stroke="${fluidCol}" stroke-width="9" class="${streamCls}" style="animation-duration:${animDur}"/>
      <path d="M 165 82 L 165 152 M 310 82 L 310 152 M 455 82 L 455 152 M 560 82 L 560 152" fill="none" stroke="#334155" stroke-width="14"/>
      <path d="M 165 82 L 165 152 M 310 82 L 310 152 M 455 82 L 455 152 M 560 82 L 560 152" fill="none" stroke="${statusCol}" stroke-width="7" class="${streamCls}" style="animation-duration:${animDur}"/>
      <rect x="135" y="146" width="60" height="34" rx="5" fill="#0f172a" stroke="#38bdf8"/><text x="165" y="167" text-anchor="middle" fill="#bae6fd" font-size="9.5" font-weight="800">M #1</text>
      <rect x="280" y="146" width="60" height="34" rx="5" fill="#0f172a" stroke="#38bdf8"/><text x="310" y="167" text-anchor="middle" fill="#bae6fd" font-size="9.5" font-weight="800">M #2</text>
      <rect x="425" y="146" width="60" height="34" rx="5" fill="#0f172a" stroke="${statusCol}"/><text x="455" y="167" text-anchor="middle" fill="#bae6fd" font-size="9.5" font-weight="800">M #3</text>
      <rect x="530" y="146" width="60" height="34" rx="5" fill="#0f172a" stroke="${statusCol}"/><text x="560" y="167" text-anchor="middle" fill="${statusCol}" font-size="9.5" font-weight="800">END M #4</text>
      <circle cx="165" cy="82" r="9" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
      <circle cx="310" cy="82" r="9" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
      <circle cx="455" cy="82" r="9" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
      <circle cx="560" cy="82" r="9" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
      <text x="340" y="56" text-anchor="middle" fill="${statusCol}" font-size="11.5" font-weight="800">${esc(simResult.verdict)}</text>
    `;
  } else if (simResult.visualKind === "water_table") {
    const scaleY = (meters) => Math.max(40, Math.min(172, 174 - (meters / 65) * 124));
    const waterLineY = scaleY(simResult.waterZ ?? 12);
    const peakY = scaleY(simResult.targetZ ?? 18);
    const hasFluidAtPeak = (simResult.targetZ ?? 18) <= (simResult.trueMax ?? simResult.waterZ ?? 12);

    body += `
      <!-- Rising Pipe Path -->
      <path d="M 80 166 L 195 166 L 295 ${peakY} L 540 ${peakY}" fill="none" stroke="#334155" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 80 166 L 195 166 L 295 ${peakY} L 540 ${peakY}" fill="none" stroke="#0b1526" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 80 166 L 195 166 L 295 ${hasFluidAtPeak ? peakY : waterLineY}" fill="none" stroke="${fluidCol}" stroke-width="10" stroke-opacity="0.72" stroke-linecap="round" stroke-linejoin="round"/>
      ${hasFluidAtPeak ? `<path d="M 80 166 L 195 166 L 295 ${peakY} L 540 ${peakY}" fill="none" stroke="${fluidCol}" stroke-width="8" class="${streamCls}" style="animation-duration:${animDur}"/>` : ""}
      <!-- Water-Level Horizon Line -->
      <line x1="56" y1="${waterLineY}" x2="${w - 22}" y2="${waterLineY}" stroke="#22d3ee" stroke-width="2" stroke-dasharray="7,5"/>
      <rect x="${w - 198}" y="${waterLineY - 21}" width="174" height="18" rx="4" fill="#082f49" stroke="#22d3ee"/>
      <text x="${w - 111}" y="${waterLineY - 9}" text-anchor="middle" fill="#67e8f9" font-size="10" font-weight="800">🌊 WATER LEVEL: ${simResult.waterZ}m</text>
      <!-- Source & Peak Labels -->
      <rect x="34" y="138" width="70" height="36" rx="5" fill="#0f2942" stroke="#38bdf8"/>
      <text x="69" y="159" text-anchor="middle" fill="#bae6fd" font-size="10" font-weight="800">SOURCE</text>
      <circle cx="295" cy="${peakY}" r="10" fill="#1e293b" stroke="${statusCol}" stroke-width="2.5"/>
      <text x="420" y="${Math.max(52, peakY - 14)}" text-anchor="middle" fill="${statusCol}" font-size="11" font-weight="800">Peak: ${simResult.targetZ ?? "--"}m (${hasFluidAtPeak ? "FLOWING" : "DRY!"})</text>
    `;
  } else if (simResult.visualKind === "vip_junction" || simResult.visualKind === "vop_overflow") {
    const isVop = simResult.visualKind === "vop_overflow";
    const ok = simResult.severity === "green";
    body += `
      <!-- Vertical Junction Stack -->
      <path d="M 105 144 L 315 144 L 545 144" fill="none" stroke="#334155" stroke-width="20" stroke-linecap="round"/>
      <path d="M 105 84 L 315 84 L 315 144" fill="none" stroke="#334155" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 105 144 L 315 144 L 545 144" fill="none" stroke="${fluidCol}" stroke-width="10" class="${streamCls}" style="animation-duration:${animDur}"/>
      <path d="M 105 84 L 315 84 L 315 144" fill="none" stroke="${ok ? "#f59e0b" : "#f87171"}" stroke-width="8" class="${ok ? "pm-stream-flow" : "pm-stream-slosh"}" style="animation-duration:1.4s"/>
      <!-- PortZ Priority Torus Rings -->
      <circle cx="315" cy="144" r="14" fill="#064e3b" stroke="#10b981" stroke-width="3"/>
      <circle cx="315" cy="84" r="13" fill="#451a03" stroke="#f59e0b" stroke-width="3"/>
      <text x="195" y="130" text-anchor="middle" fill="#6ee7b7" font-size="10.5" font-weight="800">${isVop ? "POWER (Priority PortZ = 0.0m)" : "RECYCLED (Priority PortZ = 0.0m)"}</text>
      <text x="200" y="68" text-anchor="middle" fill="#fcd34d" font-size="10.5" font-weight="800">${isVop ? `EXCESS -> SINK (${simResult.toSink ?? 0} m³/m)` : `FRESH TOP-UP (${simResult.freshUsed ?? 0} m³/m)`}</text>
      <text x="455" y="130" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="800">${isVop ? `Power Fed: ${simResult.toPower ?? 150} m³/m` : `Combined Out: ${simResult.flow} m³/m`}</text>
    `;
  } else if (simResult.visualKind === "buffer_cutaway") {
    const tankFillH = Math.round(96 * fill01);
    const tankTopY = 166 - tankFillH;
    body += `
      <!-- Left Pipe -> Fluid Buffer Cutaway -> Right Pipe -->
      <path d="M 65 130 L 250 130" fill="none" stroke="#334155" stroke-width="20"/>
      <path d="M 390 130 L 605 130" fill="none" stroke="#334155" stroke-width="20"/>
      <path d="M 65 130 L 250 130" fill="none" stroke="${fluidCol}" stroke-width="10" class="${streamCls}" style="animation-duration:${animDur}"/>
      <path d="M 390 130 L 605 130" fill="none" stroke="${statusCol}" stroke-width="10" class="${streamCls}" style="animation-duration:${animDur}"/>
      <!-- Glass Fluid Tank -->
      <rect x="250" y="64" width="140" height="104" rx="10" fill="#0b1526" stroke="#475569" stroke-width="3"/>
      ${tankFillH > 0 ? `<rect x="254" y="${tankTopY}" width="132" height="${tankFillH}" rx="6" fill="${fluidCol}" fill-opacity="0.55"/>` : ""}
      <line x1="254" y1="154" x2="386" y2="154" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="320" y="102" text-anchor="middle" fill="#f8fafc" font-size="14" font-weight="900">${Math.round(simResult.fill)}%</text>
      <text x="320" y="120" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-weight="700">FLUID BUFFER</text>
      <text x="505" y="112" text-anchor="middle" fill="${statusCol}" font-size="11" font-weight="800">Out Head Lift: ${simResult.headM}m</text>
    `;
  } else {
    // Default Horizontal Glass Cutaway Pipe (shows dynamic liquid height, surface waves, chevrons, Overfill pulse)
    const pipeY = 92;
    const pipeH = 56;
    const liqH = Math.round(pipeH * fill01);
    const liqY = pipeY + pipeH - liqH;
    body += `
      <!-- Outer Translucent Glass Tube -->
      <rect x="64" y="${pipeY - 4}" width="552" height="${pipeH + 8}" rx="12" fill="#091324" stroke="${simResult.overfill > 0 ? "#22d3ee" : "#475569"}" stroke-width="3"/>
      <!-- Dynamic Liquid Fill Height inside Pipe -->
      ${liqH > 0 ? `<rect x="68" y="${liqY}" width="544" height="${liqH}" rx="6" fill="${fluidCol}" fill-opacity="0.48"/>` : ""}
      ${fill01 > 0.02 && fill01 < 0.99 ? `<line x1="70" y1="${liqY}" x2="610" y2="${liqY}" stroke="#bae6fd" stroke-width="2.5"/>` : ""}
      <!-- Animated Flow Chevrons -->
      <line x1="80" y1="${pipeY + pipeH * 0.52}" x2="600" y2="${pipeY + pipeH * 0.52}" stroke="#f8fafc" stroke-width="5" class="${streamCls}" style="animation-duration:${animDur}" marker-end="url(#arr-blue-${uid})"/>
      <text x="340" y="${pipeY - 12}" text-anchor="middle" fill="${statusCol}" font-size="11.5" font-weight="800">${esc(simResult.verdict)}</text>
    `;
  }

  // Optional Floating C++-Mod-Style X-Ray Diagnostic Pills
  if (showXRay) {
    body += `
      <g class="pm-xray-overlay">
        <rect x="192" y="138" width="296" height="34" rx="7" fill="#030712" fill-opacity="0.92" stroke="${statusCol}" stroke-width="1.6"/>
        <text x="340" y="153" text-anchor="middle" fill="#f8fafc" font-size="10.5" font-weight="800">
          🔬 FLOW: ${simResult.flow} / ${simResult.cap} m³/m  |  FILL: ${Math.round(simResult.fill)}%${simResult.overfill > 0 ? ` (+${simResult.overfill}%)` : ""}
        </text>
        <text x="340" y="166" text-anchor="middle" fill="${statusCol}" font-size="9.5" font-weight="700">
          HEAD: ${simResult.headM}m  ·  ${simResult.sloshing ? "⚠️ BIDIRECTIONAL SLOSH ACTIVE" : "✅ SMOOTH STREAM"}
        </text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="pm-svg pm-cutaway-svg" role="img">
    <defs>
      <marker id="arr-blue-${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#f8fafc"/>
      </marker>
    </defs>
    ${body}
  </svg>`;
}

// ============================================================================
// 3. Universal Diagram Enhancer (Animates All 33 Existing Multi-Angle SVGs!)
// ============================================================================

function enhanceExistingSvgsInCard(cardElement, simResult, showXRay) {
  const stages = cardElement.querySelectorAll(".pm-svg-stage");
  const flowRatio = Math.min(1.6, Math.max(0.15, simResult.flow / Math.max(60, simResult.cap || 300)));
  const animDur = simResult.flow <= 1 ? "0s" : `${Math.max(0.35, 2.3 - flowRatio * 1.15).toFixed(2)}s`;

  stages.forEach((stage) => {
    const svg = stage.querySelector("svg.pm-svg");
    if (!svg) return;

    // 1. Tag pipe flow lines/paths once and apply live CSS flow/slosh animations
    if (!svg.dataset.pmEnhanced) {
      svg.dataset.pmEnhanced = "1";
      const candidates = svg.querySelectorAll("line, path");
      candidates.forEach((el) => {
        const sw = parseFloat(el.getAttribute("stroke-width") || "0");
        const stroke = (el.getAttribute("stroke") || "").toLowerCase();
        const isFlowStroke = ["#38bdf8", "#10b981", "#a78bfa", "#f59e0b", "#f87171", "#22d3ee"].includes(stroke);
        if (sw >= 4 && isFlowStroke) {
          el.classList.add("pm-anim-pipe-line");
        }
      });
    }

    svg.querySelectorAll(".pm-anim-pipe-line").forEach((el) => {
      el.classList.remove("pm-stream-flow", "pm-stream-slosh", "pm-stream-stopped");
      if (simResult.flow <= 1) {
        el.classList.add("pm-stream-stopped");
      } else if (simResult.sloshing) {
        el.classList.add("pm-stream-slosh");
      } else {
        el.classList.add("pm-stream-flow");
      }
      el.style.animationDuration = animDur;
    });

    // 2. Toggle floating X-Ray telemetry pill directly inside the SVG diagram
    let pill = svg.querySelector(".pm-svg-xray-injected");
    if (showXRay) {
      if (!pill) {
        pill = document.createElementNS("http://www.w3.org/2000/svg", "g");
        pill.setAttribute("class", "pm-svg-xray-injected");
        svg.appendChild(pill);
      }
      const vb = svg.viewBox?.baseVal;
      const vw = vb && vb.width ? vb.width : 760;
      const vh = vb && vb.height ? vb.height : 220;
      const pillW = Math.min(335, Math.max(240, vw - 24));
      const pillX = Math.max(8, vw - pillW - 10);
      const pillY = Math.max(6, vh - 30);
      const badgeColor = simResult.severity === "red" ? "#f87171" : (simResult.severity === "amber" ? "#f59e0b" : (simResult.severity === "cyan" ? "#22d3ee" : "#10b981"));
      pill.innerHTML = `
        <rect x="${pillX}" y="${pillY}" width="${pillW}" height="24" rx="5" fill="#030712" fill-opacity="0.90" stroke="${badgeColor}" stroke-width="1.4"/>
        <text x="${pillX + pillW / 2}" y="${pillY + 15}" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="800">
          🔬 Flow: ${simResult.flow} m³/m · Fill: ${Math.round(simResult.fill)}% · Head: ${simResult.headM}m
        </text>
      `;
    } else if (pill) {
      pill.remove();
    }
  });
}

// ============================================================================
// 4. Per-Lesson Interactive Widget (Sliders + Broken/Fixed + Walkthrough)
// ============================================================================

export function enhanceLessonWithInteractivity(cardElement, lesson) {
  const cfg = LESSON_SIM_CONFIGS[lesson.id];
  if (!cfg) return;

  const state = {
    isFixed: false,
    showXRay: true,
    params: { ...cfg.brokenDefaults },
    activeStep: -1, // -1 = full view, 0..N-1 = build steps, N = Run Flow
    timerId: null,
  };

  const simCard = document.createElement("div");
  simCard.className = "pm-lesson-sim";
  const stepCount = (lesson.buildSteps || []).length;

  simCard.innerHTML = `
    <div class="pm-sim-head">
      <div class="pm-sim-title">🎛️ ${esc(cfg.title)}</div>
      <div class="pm-sim-btn-group">
        <button type="button" class="btn btn-sm pm-sim-btn" data-act="broken">${esc(cfg.brokenLabel)}</button>
        <button type="button" class="btn btn-sm pm-sim-btn" data-act="fixed">${esc(cfg.fixedLabel)}</button>
        <button type="button" class="btn btn-sm pm-sim-btn" data-act="xray"></button>
      </div>
    </div>
    <div class="pm-sim-sliders">
      ${cfg.sliders.map((sl) => `
        <label class="pm-slider-item">
          <span class="pm-slider-lbl">${esc(sl.label)}: <strong data-val-for="${sl.key}"></strong></span>
          <input type="range" class="pm-range" data-key="${sl.key}" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${state.params[sl.key]}" />
        </label>
      `).join("")}
    </div>
    <div class="pm-cutaway-stage"></div>
    <div class="pm-telemetry-strip"></div>
    ${stepCount > 0 ? `
      <div class="pm-walkthrough-bar">
        <span class="pm-walk-lbl">🪜 Animated Build Steps:</span>
        ${(lesson.buildSteps || []).map((_, idx) => `
          <button type="button" class="btn btn-sm pm-step-btn" data-step="${idx}">Step ${idx + 1}</button>
        `).join("")}
        <button type="button" class="btn btn-sm pm-step-btn" data-step="${stepCount}">▶ Run Flow</button>
        <button type="button" class="btn btn-sm pm-auto-btn">⏯ Auto-Play</button>
      </div>
    ` : ""}
  `;

  function updateSimVisuals(syncSliderInputs = false) {
    const res = cfg.evaluate(state.params, state.isFixed);
    const uid = `${lesson.id}-dyn`;

    simCard.querySelector('[data-act="broken"]')?.classList.toggle("pm-btn-broken-active", !state.isFixed);
    simCard.querySelector('[data-act="fixed"]')?.classList.toggle("pm-btn-fixed-active", state.isFixed);
    const xrayBtn = simCard.querySelector('[data-act="xray"]');
    if (xrayBtn) {
      xrayBtn.classList.toggle("pm-btn-xray-active", state.showXRay);
      xrayBtn.textContent = `🔬 X-Ray: ${state.showXRay ? "ON" : "OFF"}`;
    }

    for (const sl of cfg.sliders) {
      const lbl = simCard.querySelector(`[data-val-for="${sl.key}"]`);
      if (lbl) lbl.textContent = `${state.params[sl.key]}${sl.unit}`;
      if (syncSliderInputs) {
        const inp = simCard.querySelector(`.pm-range[data-key="${sl.key}"]`);
        if (inp) inp.value = String(state.params[sl.key]);
      }
    }

    const stage = simCard.querySelector(".pm-cutaway-stage");
    if (stage) stage.innerHTML = buildDynamicCutawaySvg(uid, res, cfg, "SIDE", state.showXRay);

    const tel = simCard.querySelector(".pm-telemetry-strip");
    if (tel) {
      tel.className = `pm-telemetry-strip pm-sev-${res.severity}`;
      tel.innerHTML = `
        <div class="pm-tel-cell"><span>FLOW RATE</span><strong>${res.flow} m³/min</strong></div>
        <div class="pm-tel-cell"><span>PIPE FULLNESS</span><strong>${Math.round(res.fill)}%${res.overfill > 0 ? ` (+${res.overfill}%)` : ""}</strong></div>
        <div class="pm-tel-cell"><span>HEAD LIFT</span><strong>${res.headM} m</strong></div>
        <div class="pm-tel-verdict"><strong>${esc(res.verdict)}</strong><div class="pm-tel-sub">${esc(res.explain)}</div></div>
      `;
    }

    simCard.querySelectorAll(".pm-step-btn").forEach((b) => {
      b.classList.toggle("active", parseInt(b.dataset.step, 10) === state.activeStep);
    });
    const autoBtn = simCard.querySelector(".pm-auto-btn");
    if (autoBtn) autoBtn.textContent = state.timerId ? "⏸ Pause" : "⏯ Auto-Play";

    enhanceExistingSvgsInCard(cardElement, res, state.showXRay);
  }

  function syncBuildStepHighlight() {
    cardElement.querySelectorAll(".pm-step-row").forEach((row, idx) => {
      row.classList.toggle("pm-step-active", state.activeStep === idx);
    });
  }

  simCard.querySelector('[data-act="broken"]')?.addEventListener("click", () => {
    state.isFixed = false;
    state.params = { ...cfg.brokenDefaults };
    updateSimVisuals(true);
  });
  simCard.querySelector('[data-act="fixed"]')?.addEventListener("click", () => {
    state.isFixed = true;
    state.params = { ...cfg.fixedDefaults };
    updateSimVisuals(true);
  });
  simCard.querySelector('[data-act="xray"]')?.addEventListener("click", () => {
    state.showXRay = !state.showXRay;
    updateSimVisuals(false);
  });
  simCard.querySelectorAll(".pm-range").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      state.params[e.target.dataset.key] = parseFloat(e.target.value);
      updateSimVisuals(false);
    });
  });

  simCard.querySelectorAll(".pm-step-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeStep = parseInt(btn.dataset.step, 10);
      if (state.activeStep >= stepCount) {
        state.isFixed = true;
        state.params = { ...cfg.fixedDefaults };
      }
      syncBuildStepHighlight();
      updateSimVisuals(true);
    });
  });

  simCard.querySelector(".pm-auto-btn")?.addEventListener("click", () => {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
      updateSimVisuals(false);
      return;
    }
    state.activeStep = 0;
    syncBuildStepHighlight();
    state.timerId = setInterval(() => {
      if (!simCard.isConnected) {
        clearInterval(state.timerId);
        state.timerId = null;
        return;
      }
      state.activeStep = (state.activeStep + 1) % (stepCount + 1);
      if (state.activeStep === stepCount) {
        state.isFixed = true;
        state.params = { ...cfg.fixedDefaults };
      } else {
        state.isFixed = false;
        state.params = { ...cfg.brokenDefaults };
      }
      syncBuildStepHighlight();
      updateSimVisuals(true);
    }, 1700);
    updateSimVisuals(true);
  });

  // Insert directly before the first diagram (.pm-svg-wrap in Visual Manual or .pipe-diagram-wrap in Pipe Dissection)
  const firstDiagram = cardElement.querySelector(".pm-svg-wrap, .pipe-diagram-wrap, .dropdowns-stack");
  if (firstDiagram) {
    cardElement.insertBefore(simCard, firstDiagram);
  } else {
    cardElement.appendChild(simCard);
  }

  queueMicrotask(() => updateSimVisuals(true));
}

const PIPE_BIBLE_TO_SIM_ID = {
  "P-01": "pm-01",
  "P-02": "pm-03",
  "P-03": "pm-02",
  "P-04": "pm-04",
  "P-05": "pm-08",
  "P-06": "pm-10",
  "P-07": "pm-11",
  "P-08": "pm-12",
  "P-09": "pm-14",
  "P-10": "pm-15",
  "P-11": "pm-16",
  "P-12": "pm-17",
  "P-13": "pm-18",
  "P-14": "pm-19",
  "P-15": "pm-15",
  "P-16": "pm-19",
  "P-17": "pm-20",
  "P-18": "pm-20",
  "P-19": "pm-13",
  "P-20": "pm-14",
};

export function enhancePipeBibleCardWithSim(cardElement, item) {
  const mappedId = PIPE_BIBLE_TO_SIM_ID[item?.code] || "pm-01";
  enhanceLessonWithInteractivity(cardElement, { id: mappedId, buildSteps: [] });
}

// ============================================================================
// 5. Top "Pipe X-Ray Sandbox & Circuit Workbench" (8 Presets + Live Physics)
// ============================================================================

const SANDBOX_PRESETS = [
  { id: "pm-01", label: "💧 Fill & Slosh (CapHeight)" },
  { id: "pm-03", label: "🌊 Water-Level Head Lift" },
  { id: "pm-08", label: "🫙 Fluid Buffer Trap" },
  { id: "pm-11", label: "🚀 600 m³/min 1st-Junction Fix" },
  { id: "pm-15", label: "⚗️ Aluminum VIP Merge" },
  { id: "pm-16", label: "⚡ Power-First VOP Dam" },
  { id: "pm-17", label: "💎 0-MW Closed-Valve Tower" },
  { id: "pm-14", label: "🚂 Train 27s Dock + Well Shards" },
];

export function renderTopPipeXRaySandbox(container) {
  const box = document.createElement("section");
  box.className = "card pm-sandbox-card";

  const state = {
    presetId: "pm-01",
    isFixed: false,
    showXRay: true,
    viewAngle: "SIDE",
    params: { ...LESSON_SIM_CONFIGS["pm-01"].brokenDefaults },
  };

  function renderSandboxShell() {
    const cfg = LESSON_SIM_CONFIGS[state.presetId];
    box.innerHTML = `
      <div class="pm-sandbox-header">
        <div>
          <span class="code-badge">LIVE WORKBENCH</span>
          <h3 class="pm-sandbox-title">🔬 Interactive Pipe X-Ray Sandbox &amp; Circuit Lab</h3>
          <p class="pm-sandbox-sub">Pick any factory circuit, toggle <strong>Broken vs. Fixed</strong>, drag sliders, or use <strong>Pre-Fill / Half-Fill</strong> shortcuts to watch the real engine math respond instantaneously.</p>
        </div>
        <div class="pm-sim-btn-group">
          <button type="button" class="btn btn-sm pm-sim-btn" data-sb="broken">${esc(cfg.brokenLabel)}</button>
          <button type="button" class="btn btn-sm pm-sim-btn" data-sb="fixed">${esc(cfg.fixedLabel)}</button>
          <button type="button" class="btn btn-sm pm-sim-btn" data-sb="xray"></button>
        </div>
      </div>

      <div class="pm-preset-pills">
        ${SANDBOX_PRESETS.map((p) => `
          <button type="button" class="btn btn-sm ${state.presetId === p.id ? "active" : ""}" data-preset="${p.id}">${p.label}</button>
        `).join("")}
      </div>

      <div class="pm-sandbox-actions">
        <button type="button" class="btn btn-sm pm-quick-btn" data-quick="prefill">⚡ Pre-Fill Line to 107.5%</button>
        <button type="button" class="btn btn-sm pm-quick-btn" data-quick="halffill">🌊 Set Half-Full (50%) to Trigger Slosh</button>
        <div class="pm-sim-btn-group">
          <button type="button" class="btn btn-sm ${state.viewAngle === "SIDE" ? "active" : ""}" data-angle="SIDE">📐 Side View</button>
          <button type="button" class="btn btn-sm ${state.viewAngle === "TOP" ? "active" : ""}" data-angle="TOP">🗺️ Top-Down Floor</button>
        </div>
      </div>

      <div class="pm-sim-sliders">
        ${cfg.sliders.map((sl) => `
          <label class="pm-slider-item">
            <span class="pm-slider-lbl">${esc(sl.label)}: <strong data-sb-val="${sl.key}"></strong></span>
            <input type="range" class="pm-range" data-sb-key="${sl.key}" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${state.params[sl.key]}" />
          </label>
        `).join("")}
      </div>

      <div class="pm-cutaway-stage"></div>
      <div class="pm-telemetry-strip"></div>
    `;

    box.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.presetId = btn.dataset.preset;
        state.isFixed = false;
        state.params = { ...LESSON_SIM_CONFIGS[state.presetId].brokenDefaults };
        renderSandboxShell();
      });
    });

    box.querySelector('[data-sb="broken"]')?.addEventListener("click", () => {
      state.isFixed = false;
      state.params = { ...cfg.brokenDefaults };
      updateSandboxLive(true);
    });
    box.querySelector('[data-sb="fixed"]')?.addEventListener("click", () => {
      state.isFixed = true;
      state.params = { ...cfg.fixedDefaults };
      updateSandboxLive(true);
    });
    box.querySelector('[data-sb="xray"]')?.addEventListener("click", () => {
      state.showXRay = !state.showXRay;
      updateSandboxLive(false);
    });

    box.querySelector('[data-quick="prefill"]')?.addEventListener("click", () => {
      state.isFixed = true;
      state.params = { ...cfg.fixedDefaults };
      for (const k of ["fill", "prefill"]) {
        if (k in state.params) {
          const slDef = cfg.sliders.find((s) => s.key === k);
          const cap = slDef ? slDef.max : 107;
          state.params[k] = Math.min(cap, k === "fill" ? 107 : 105);
        }
      }
      updateSandboxLive(true);
    });
    box.querySelector('[data-quick="halffill"]')?.addEventListener("click", () => {
      state.isFixed = false;
      state.params = { ...cfg.brokenDefaults };
      if ("fill" in state.params) state.params.fill = 50;
      if ("prefill" in state.params) state.params.prefill = 50;
      updateSandboxLive(true);
    });

    box.querySelectorAll("[data-angle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.viewAngle = btn.dataset.angle;
        box.querySelectorAll("[data-angle]").forEach((b) => b.classList.toggle("active", b.dataset.angle === state.viewAngle));
        updateSandboxLive(false);
      });
    });

    box.querySelectorAll("[data-sb-key]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        state.params[e.target.dataset.sbKey] = parseFloat(e.target.value);
        updateSandboxLive(false);
      });
    });

    updateSandboxLive(true);
  }

  function updateSandboxLive(syncInputs = false) {
    const cfg = LESSON_SIM_CONFIGS[state.presetId];
    const res = cfg.evaluate(state.params, state.isFixed);

    box.querySelector('[data-sb="broken"]')?.classList.toggle("pm-btn-broken-active", !state.isFixed);
    box.querySelector('[data-sb="fixed"]')?.classList.toggle("pm-btn-fixed-active", state.isFixed);
    const xrayBtn = box.querySelector('[data-sb="xray"]');
    if (xrayBtn) {
      xrayBtn.classList.toggle("pm-btn-xray-active", state.showXRay);
      xrayBtn.textContent = `🔬 X-Ray Floating Numbers: ${state.showXRay ? "ON" : "OFF"}`;
    }

    for (const sl of cfg.sliders) {
      const lbl = box.querySelector(`[data-sb-val="${sl.key}"]`);
      if (lbl) lbl.textContent = `${state.params[sl.key]}${sl.unit}`;
      if (syncInputs) {
        const inp = box.querySelector(`[data-sb-key="${sl.key}"]`);
        if (inp) inp.value = String(state.params[sl.key]);
      }
    }

    const stage = box.querySelector(".pm-cutaway-stage");
    if (stage) stage.innerHTML = buildDynamicCutawaySvg("sb-main", res, cfg, state.viewAngle, state.showXRay);

    const tel = box.querySelector(".pm-telemetry-strip");
    if (tel) {
      tel.className = `pm-telemetry-strip pm-sev-${res.severity}`;
      tel.innerHTML = `
        <div class="pm-tel-cell"><span>INSTANT FLOW</span><strong>${res.flow} / ${res.cap} m³/min</strong></div>
        <div class="pm-tel-cell"><span>PIPE FULLNESS</span><strong>${Math.round(res.fill)}%${res.overfill > 0 ? ` (+${res.overfill}%)` : ""}</strong></div>
        <div class="pm-tel-cell"><span>ACTIVE HEAD LIFT</span><strong>${res.headM} m</strong></div>
        <div class="pm-tel-verdict"><strong>${esc(res.verdict)}</strong><div class="pm-tel-sub">${esc(res.explain)}</div></div>
      `;
    }
  }

  container.appendChild(box);
  renderSandboxShell();
}
