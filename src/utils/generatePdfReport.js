import jsPDF from "jspdf";

// Brand colours
const TEAL = [0, 150, 135]; // BioProtect teal (matches #00967)
const DARK = [33, 33, 33];
const GREY = [117, 117, 117];
const LIGHT_TEAL = [0, 188, 212]; // header bar colour from CSS

/**
 * Generate and auto-download a PDF report for a Prioritizr results view.
 *
 * @param {object} opts
 * @param {object}   opts.project         - Project record { name, description, ... }
 * @param {object}   opts.metadata        - Planning-unit metadata { pu_alias, pu_area, pu_country, ... }
 * @param {Array}    opts.features        - Project features [{ name, target_value }, ...]
 * @param {Array}    opts.activities      - Uploaded activities [{ activity, filename }, ...]
 * @param {Array}    opts.selectedRuns    - Run records currently selected [{ id, label, description }, ...]
 * @param {string|null} opts.mapImageDataUrl - base64 PNG from map canvas, or null
 */
export async function generatePdfReport({
  project,
  metadata,
  features = [],
  activities = [],
  selectedRuns = [],
  mapImageDataUrl = null,
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const PAGE_W = 297;
  const PAGE_H = 210;
  const MARGIN = 12;
  const MAP_W = 210; // left column width for map
  const GAP = 5;
  const RIGHT_X = MARGIN + MAP_W + GAP;
  const RIGHT_W = PAGE_W - RIGHT_X - MARGIN;
  const CONTENT_H = PAGE_H - 2 * MARGIN;
  const LINE_H = 4.2; // standard line height (mm)

  // ------------------------------------------------------------------ Map
  if (mapImageDataUrl) {
    // Slight grey bg so transparent-edge maps look clean
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(MARGIN, MARGIN, MAP_W, CONTENT_H, 2, 2, "F");
    doc.addImage(
      mapImageDataUrl,
      "PNG",
      MARGIN,
      MARGIN,
      MAP_W,
      CONTENT_H,
      undefined,
      "FAST",
    );
    // Border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, MARGIN, MAP_W, CONTENT_H, 2, 2);
  } else {
    // Placeholder
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(MARGIN, MARGIN, MAP_W, CONTENT_H, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text("Map not available", MARGIN + MAP_W / 2, MARGIN + CONTENT_H / 2, {
      align: "center",
    });
  }

  // ------------------------------------------------------------------ Right column
  let y = MARGIN;

  // ---- Header bar ----
  const HEADER_H = 18;
  doc.setFillColor(...LIGHT_TEAL);
  doc.roundedRect(RIGHT_X, y, RIGHT_W, HEADER_H, 2, 2, "F");

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BioProtect", RIGHT_X + 4, y + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Marine Spatial Planning", RIGHT_X + 4, y + 13);

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date());
  doc.text(dateStr, RIGHT_X + RIGHT_W - 4, y + 7, { align: "right" });

  y += HEADER_H + 5;

  // ---- Project name ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  const projectName = project?.name || "Unnamed Project";
  const nameLines = doc.splitTextToSize(projectName, RIGHT_W);
  doc.text(nameLines, RIGHT_X, y);
  y += nameLines.length * 5.5 + 2;

  // ---- Planning unit metadata ----
  const metaRows = [];
  if (metadata?.pu_alias) metaRows.push(["Planning grid", metadata.pu_alias]);
  if (metadata?.pu_area && Number(metadata.pu_area) > 0)
    metaRows.push([
      "Hex area",
      `${Number(metadata.pu_area).toLocaleString("en-GB", { maximumFractionDigits: 1 })} km²`,
    ]);
  if (metadata?.pu_country) metaRows.push(["Country", metadata.pu_country]);
  if (metadata?.pu_domain) metaRows.push(["Domain", metadata.pu_domain]);

  if (metaRows.length > 0) {
    const LABEL_W = 28;
    for (const [label, value] of metaRows) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(label, RIGHT_X, y);
      doc.setTextColor(...DARK);
      const valueLines = doc.splitTextToSize(value, RIGHT_W - LABEL_W);
      doc.text(valueLines, RIGHT_X + LABEL_W, y);
      y += Math.max(valueLines.length, 1) * LINE_H;
    }
    y += 2;
  }

  // Helper: section header
  const sectionHeader = (title, count) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(RIGHT_X, y, RIGHT_X + RIGHT_W, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEAL);
    doc.text(`${title} (${count})`, RIGHT_X, y);
    y += 5;
  };

  // Helper: bullet list item
  const bulletItem = (text, maxW) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`• ${text}`, maxW - 3);
    doc.text(lines, RIGHT_X + 2, y);
    y += lines.length * LINE_H;
  };

  // ---- Activities ----
  if (activities.length > 0 && y < PAGE_H - MARGIN - 15) {
    sectionHeader("ACTIVITIES", activities.length);
    const MAX_ITEMS = 20;
    let shown = 0;
    for (const act of activities) {
      if (y > PAGE_H - MARGIN - 15) break;
      const name = act.activity || act.filename || "Unknown";
      bulletItem(name, RIGHT_W);
      shown++;
      if (shown >= MAX_ITEMS) break;
    }
    if (activities.length > shown) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(`+ ${activities.length - shown} more`, RIGHT_X + 4, y);
      y += LINE_H;
    }
    y += 2;
  }

  // ---- Features ----
  if (features.length > 0 && y < PAGE_H - MARGIN - 12) {
    sectionHeader("FEATURES", features.length);
    const MAX_ITEMS = 25;
    let shown = 0;
    for (const feat of features) {
      if (y > PAGE_H - MARGIN - 10) break;
      const name = feat.name || `Feature ${feat.feature_unique_id ?? ""}`;
      const target =
        feat.target_value != null ? ` — target ${feat.target_value}%` : "";
      bulletItem(name + target, RIGHT_W);
      shown++;
      if (shown >= MAX_ITEMS) break;
    }
    if (features.length > shown) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text(`+ ${features.length - shown} more`, RIGHT_X + 4, y);
      y += LINE_H;
    }
    y += 2;
  }

  // ---- Selected runs ----
  if (selectedRuns.length > 0 && y < PAGE_H - MARGIN - 10) {
    sectionHeader("SELECTED RUNS", selectedRuns.length);
    for (const run of selectedRuns) {
      if (y > PAGE_H - MARGIN - 8) break;
      const name = run.label?.trim() || `Run ${run.id}`;
      bulletItem(name, RIGHT_W);
    }
    y += 2;
  }

  // ---- Footer ----
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text("Generated by BioProtect", MARGIN, PAGE_H - 4);
  doc.text(
    `bioprotect.io`,
    PAGE_W - MARGIN,
    PAGE_H - 4,
    { align: "right" },
  );

  // ------------------------------------------------------------------ Save
  const safeName = (project?.name || "report")
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 50);

  doc.save(`${safeName}_prioritizr_report.pdf`);
}
