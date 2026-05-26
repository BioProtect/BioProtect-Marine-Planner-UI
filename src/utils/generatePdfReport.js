import jsPDF from "jspdf";
import logoSrc from "@images/bioprotect_nobgrnd.png";

// Brand colours
const TEAL = [0, 150, 135];
const DARK = [33, 33, 33];
const GREY = [117, 117, 117];
const LIGHT_TEAL = [0, 188, 212];

/** Resolve the natural pixel dimensions of a base64/URL image. */
function getImageDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 16, height: 9 }); // safe fallback
    img.src = src;
  });
}

/** Load an image URL into an HTMLImageElement (waits for decode). */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generate and auto-download a PDF report for a Prioritizr results view.
 *
 * Header layout (A4 portrait, 12 mm margins):
 *   ┌──────────┬─────────────────────────┬──────────────────┐
 *   │  Logo    │  BioProtect / project   │  PU metadata     │
 *   │  28 mm   │  teal block ~90 mm      │  ~65 mm          │
 *   └──────────┴─────────────────────────┴──────────────────┘
 *   Map — full content width, aspect-ratio preserved
 *   ┌──────────────────┬────────────────────┬────────────────┐
 *   │  Activities      │  Features (col 1)  │  Features (2)  │
 *   └──────────────────┴────────────────────┴────────────────┘
 *   Selected Runs — full width
 */
export async function generatePdfReport({
  project,
  metadata,
  features = [],
  activities = [],
  selectedRuns = [],
  mapImageDataUrl = null,
}) {
  // Pre-load logo before building the doc
  const logoImg = await loadImage(logoSrc);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 12;
  const CONTENT_W = PAGE_W - 2 * MARGIN; // 186 mm
  const LINE_H = 4.5;

  let y = MARGIN;

  // ── 1. Header row (three cells) ─
  const HEADER_H = 28;           // height of the whole header strip
  const LOGO_W = HEADER_H;     // logo cell is square (28 × 28 mm)
  const GAP = 3;
  const TEAL_W = 93;           // teal brand cell
  const META_W = CONTENT_W - LOGO_W - GAP - TEAL_W - GAP; // ~62 mm

  const LOGO_X = MARGIN;
  const TEAL_X = LOGO_X + LOGO_W + GAP;
  const META_X = TEAL_X + TEAL_W + GAP;

  // --- Logo cell (white bg, subtle border so it sits with the other cells) -
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(LOGO_X, y, LOGO_W, HEADER_H, 2, 2, "F");
  doc.setDrawColor(200, 210, 215);
  doc.setLineWidth(0.25);
  doc.roundedRect(LOGO_X, y, LOGO_W, HEADER_H, 2, 2, "S");

  if (logoImg) {
    const PAD = 2; // inner padding so the logo doesn't touch the border
    doc.addImage(
      logoImg, "PNG",
      LOGO_X + PAD, y + PAD,
      LOGO_W - 2 * PAD, HEADER_H - 2 * PAD,
    );
  }

  // --- Teal cell (brand + project name) ------------------------------------
  doc.setFillColor(...LIGHT_TEAL);
  doc.roundedRect(TEAL_X, y, TEAL_W, HEADER_H, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("BioProtect Marine Planner Report", TEAL_X + 4, y + 8);

  const projectName = project?.name
    ? (metadata?.description
      ? `${project.name}: ${metadata.description}`
      : project.name)
    : "Unnamed Project";
  const nameLines = doc.splitTextToSize(projectName, TEAL_W - 8).slice(0, 2);
  doc.setFontSize(10);
  doc.text(nameLines, TEAL_X + 4, y + 17);

  // --- Metadata cell (planning unit info) ----------------------------------
  doc.setFillColor(245, 248, 250);
  doc.roundedRect(META_X, y, META_W, HEADER_H, 2, 2, "F");
  doc.setDrawColor(200, 210, 215);
  doc.setLineWidth(0.25);
  doc.roundedRect(META_X, y, META_W, HEADER_H, 2, 2, "S");

  const dateStr = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date());
  const metaRows = [];
  if (metadata?.pu_alias) metaRows.push(["Grid", metadata.pu_alias]);
  if (metadata?.pu_area && Number(metadata.pu_area) > 0) metaRows.push(["Hex area", `${Number(metadata.pu_area).toLocaleString("en-GB", { maximumFractionDigits: 1 })} km²`]);
  if (metadata?.pu_country) metaRows.push(["Country", metadata.pu_country]);
  if (metadata?.pu_domain) metaRows.push(["Domain", metadata.pu_domain]);
  metaRows.push(["Date", dateStr]);

  const LABEL_W = 18;
  let metaY = y + 5.5;
  for (const [label, value] of metaRows) {
    if (metaY > y + HEADER_H - 3) break;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(label, META_X + 3, metaY);
    doc.setTextColor(...DARK);
    const valLines = doc.splitTextToSize(value, META_W - LABEL_W - 4);
    doc.text(valLines, META_X + LABEL_W, metaY);
    metaY += Math.max(valLines.length, 1) * 4.2;
  }

  y += HEADER_H + 5;

  //  2. Map (full width, aspect-ratio preserved) 
  if (mapImageDataUrl) {
    const { width: imgW, height: imgH } = await getImageDimensions(mapImageDataUrl);
    const ratio = imgH / imgW;
    const MAP_MAX_H = 190;
    const mapH = Math.min(Math.round(CONTENT_W * ratio), MAP_MAX_H);

    doc.setFillColor(230, 235, 240);
    doc.roundedRect(MARGIN, y, CONTENT_W, mapH, 2, 2, "F");
    doc.addImage(mapImageDataUrl, "PNG", MARGIN, y, CONTENT_W, mapH, undefined, "FAST");
    doc.setDrawColor(180, 185, 190);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, mapH, 2, 2, "S");

    y += mapH + 3;
  }

  //  2b. Selection frequency legend 
  if (selectedRuns.length > 0) {
    // YlGn colour stops (matches the map layer paint expression)
    const YLGN = [
      [0.00, 255, 255, 229], // #ffffe5
      [0.25, 217, 240, 163], // #d9f0a3
      [0.50, 120, 198, 121], // #78c679
      [0.75, 35, 132, 67], // #238443
      [1.00, 0, 69, 41], // #004529
    ];

    const lerp = (a, b, t) => Math.round(a + t * (b - a));
    const interpColor = (t) => {
      for (let i = 0; i < YLGN.length - 1; i++) {
        const [t0, r0, g0, b0] = YLGN[i];
        const [t1, r1, g1, b1] = YLGN[i + 1];
        if (t <= t1) {
          const f = (t - t0) / (t1 - t0);
          return [lerp(r0, r1, f), lerp(g0, g1, f), lerp(b0, b1, f)];
        }
      }
      return [0, 69, 41];
    };

    // Label above bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    doc.text("Selection frequency", MARGIN, y + 4);

    const BAR_H = 5;
    const barY = y + 6;
    const STEPS = 80; // enough steps for a smooth gradient
    const sliceW = CONTENT_W / STEPS;

    for (let i = 0; i < STEPS; i++) {
      const [r, g, b] = interpColor(i / (STEPS - 1));
      doc.setFillColor(r, g, b);
      // +0.15 overlap avoids hairline gaps between slices
      doc.rect(MARGIN + i * sliceW, barY, sliceW + 0.15, BAR_H, "F");
    }

    // Thin border around the whole bar
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN, barY, CONTENT_W, BAR_H, "S");

    // End labels
    const runsLabel = selectedRuns.length > 1 ? `${selectedRuns.length} runs` : "1 run";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    doc.text("1 run", MARGIN, barY + BAR_H + 3.5);
    doc.text(runsLabel, MARGIN + CONTENT_W, barY + BAR_H + 3.5, { align: "right" });

    y += 6 + BAR_H + 6; // title + bar + label gap
  } else {
    y += 3;
  }
  //  Selected Runs — full width 
  if (selectedRuns.length > 0 && y < PAGE_H - MARGIN - 12) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEAL);
    doc.text(`SELECTED RUNS (${selectedRuns.length})`, MARGIN, y);
    y += 5;

    for (const run of selectedRuns) {
      if (y > PAGE_H - MARGIN - 8) break;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...DARK);
      const name = run.label?.trim() || `Run ${run.id}`;
      const lines = doc.splitTextToSize(`• ${name}`, CONTENT_W - 3);
      doc.text(lines, MARGIN + 2, y);
      y += lines.length * LINE_H;
    }
  }

  // 3. Three-column section: Activities | Features col-1 | Features col-2 
  const COL_GAP = 4;
  const COL_W = (CONTENT_W - 2 * COL_GAP) / 3; // ~60.7 mm each
  const COL_A_X = MARGIN;
  const COL_F1_X = MARGIN + COL_W + COL_GAP;
  const COL_F2_X = MARGIN + (COL_W + COL_GAP) * 2;

  // Helper — section divider + teal title
  const sectionHeader = (title, count, x, yRef) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(x, yRef, x + COL_W, yRef);
    yRef += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEAL);
    doc.text(`${title} (${count})`, x, yRef);
    return yRef + 5;
  };

  // Helper — bullet line (may wrap within column)
  const bulletItem = (text, x, yRef) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`• ${text}`, COL_W - 3);
    doc.text(lines, x + 2, yRef);
    return yRef + lines.length * LINE_H;
  };

  // Feature bullet — name on line 1, target/achieved/status on line 2.
  // Colour the status line green when every run met the target, red when none
  // did, and amber for partial success.
  const featureItem = (feat, x, yRef) => {
    const label =
      feat.alias || `Feature ${feat.feature_unique_id ?? feat.id ?? ""}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    const nameLines = doc.splitTextToSize(`• ${label}`, COL_W - 3);
    doc.text(nameLines, x + 2, yRef);
    let nextY = yRef + nameLines.length * LINE_H;

    const target = feat.target_value != null ? Number(feat.target_value) : null;
    const achieved = feat.achieved != null ? Number(feat.achieved) : null;
    const runCount = Number(feat.runCount ?? 0);
    const metCount = Number(feat.metCount ?? 0);

    const parts = [];
    if (target != null) parts.push(`target ${target}%`);
    if (achieved != null) parts.push(`got ${achieved.toFixed(1)}%`);
    if (runCount > 0) parts.push(`${metCount}/${runCount} runs met`);

    if (parts.length > 0) {
      let color = GREY;
      if (runCount > 0) {
        if (metCount === runCount) color = [21, 128, 61];      // green
        else if (metCount === 0) color = [185, 28, 28];        // red
        else color = [161, 98, 7];                             // amber
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(...color);
      const statusLines = doc.splitTextToSize(parts.join(" · "), COL_W - 6);
      doc.text(statusLines, x + 5, nextY);
      nextY += statusLines.length * (LINE_H - 0.6);
    }
    return nextY + 0.5;
  };

  let yAct = y;
  let yFeatL = y;
  let yFeatR = y;

  // Activities
  if (activities.length > 0) {
    yAct = sectionHeader("ACTIVITIES", activities.length, COL_A_X, yAct);
    let shown = 0;
    for (const act of activities) {
      if (yAct > PAGE_H - MARGIN - 12) break;
      yAct = bulletItem(act.activity || act.filename || "Unknown", COL_A_X, yAct);
      if (++shown >= 30) break;
    }
    if (activities.length > shown) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(`+ ${activities.length - shown} more`, COL_A_X + 4, yAct);
      yAct += LINE_H;
    }
  }

  // Features — split evenly across the two right columns
  if (features.length > 0) {
    const half = Math.ceil(features.length / 2);
    yFeatL = sectionHeader("FEATURES", features.length, COL_F1_X, yFeatL);
    // Right column header shows empty count placeholder (same title row height)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(COL_F2_X, yFeatR, COL_F2_X + COL_W, yFeatR);
    yFeatR = yFeatL; // align both columns after the header

    features.forEach((feat, i) => {
      const isLeft = i < half;
      const x = isLeft ? COL_F1_X : COL_F2_X;
      const yLimit = PAGE_H - MARGIN - 12;

      if (isLeft && yFeatL > yLimit) return;
      if (!isLeft && yFeatR > yLimit) return;

      const newY = featureItem(feat, x, isLeft ? yFeatL : yFeatR);

      if (isLeft) yFeatL = newY;
      else yFeatR = newY;
    });
  }

  y = Math.max(yAct, yFeatL, yFeatR) + 3;

  //  5. Footer 
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text("Generated by BioProtect", MARGIN, PAGE_H - 5);
  doc.text("bioprotect-project.eu", PAGE_W - MARGIN, PAGE_H - 5, { align: "right" });

  //  Save 
  const safeName = (project?.name || "report")
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 50);

  doc.save(`${safeName}_prioritizr_report.pdf`);
}
