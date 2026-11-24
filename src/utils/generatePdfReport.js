import logoSrc from '@images/bioprotect_nobgrnd.png'
import JsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { PALETTE } from '../bpVars'

// Brand colours
const TEAL = [0, 150, 135]
const DARK = [33, 33, 33]
const GREY = [117, 117, 117]
const LIGHT_TEAL = [0, 188, 212]
const GREEN = [21, 128, 61]
const RED = [185, 28, 28]
const AMBER = [161, 98, 7]

// More compared projects than this: one features table per project, as
// three columns each no longer fit across the page.
const MAX_SIDE_BY_SIDE = 3

function hexRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

// t 0-1 on the results ramp (matches the map layer)
function rampColour(t) {
  const stops = PALETTE.results.map(hexRgb)
  const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1)
  const i = Math.min(Math.floor(x), stops.length - 2)
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * (x - i)))
}

function drawRamp(doc, x, y, w, h) {
  const STEPS = 80 // enough steps for a smooth gradient
  const sliceW = w / STEPS
  for (let i = 0; i < STEPS; i++) {
    doc.setFillColor(...rampColour(i / (STEPS - 1)))
    // +0.15 overlap avoids hairline gaps between slices
    doc.rect(x + i * sliceW, y, sliceW + 0.15, h, 'F')
  }
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(0.2)
  doc.rect(x, y, w, h, 'S')
}

const runName = run => run.label?.trim() || `Run ${run.id}`
function pct(v) {
  return v == null
    ? '–'
    : `${Number(v).toFixed(1)}%`
}
function target(f) {
  return f.target == null
    ? '–'
    : `${f.target}%`
}

// "2/3" runs met: green when every run met the target, red when none, else amber
function metCell(f) {
  if (!f.runCount)
    return '–'
  const color = f.metCount === f.runCount
    ? GREEN
    : f.metCount === 0
      ? RED
      : AMBER
  return {
    content: `${f.metCount}/${f.runCount}`,
    styles: { textColor: color },
  }
}

/** Load an image URL into an HTMLImageElement (waits for decode). */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Generate and auto-download a PDF report for a Prioritizr results view.
 *
 * Page 1: header (logo | project | grid metadata), the map, and its legend.
 * Then tables, continuing onto as many pages as they need: projects compared
 * (comparison only), runs, features, activities. Footer on every page.
 *
 * projects: one entry per project on the map, in the map's colour order -
 *   { id, name, grid, resolution, colour, runs, features }, features being
 *   [{ uid, name, target, achieved, metCount, runCount }].
 * comparing: runs from other projects are overlaid (the map then colours
 *   cells by project, and by average share where projects overlap).
 */
export async function generatePdfReport({
  project,
  metadata,
  activities = [],
  projects = [],
  comparing = false,
  mapImageDataUrl = null,
}) {
  // Pre-load logo before building the doc
  const logoImg = await loadImage(logoSrc)

  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 12
  const CONTENT_W = PAGE_W - 2 * MARGIN // 186 mm

  let y = MARGIN

  // ── 1. Header row (three cells) ─
  const HEADER_H = 28 // height of the whole header strip
  const LOGO_W = HEADER_H // logo cell is square (28 × 28 mm)
  const GAP = 3
  const TEAL_W = 93 // teal brand cell
  const META_W = CONTENT_W - LOGO_W - GAP - TEAL_W - GAP // ~62 mm

  const LOGO_X = MARGIN
  const TEAL_X = LOGO_X + LOGO_W + GAP
  const META_X = TEAL_X + TEAL_W + GAP

  // --- Logo cell (white bg, subtle border so it sits with the other cells) -
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(LOGO_X, y, LOGO_W, HEADER_H, 2, 2, 'F')
  doc.setDrawColor(200, 210, 215)
  doc.setLineWidth(0.25)
  doc.roundedRect(LOGO_X, y, LOGO_W, HEADER_H, 2, 2, 'S')

  if (logoImg) {
    const PAD = 2 // inner padding so the logo doesn't touch the border
    doc.addImage(
      logoImg,
      'PNG',
      LOGO_X + PAD,
      y + PAD,
      LOGO_W - 2 * PAD,
      HEADER_H - 2 * PAD,
    )
  }

  // --- Teal cell (brand + project name) ------------------------------------
  doc.setFillColor(...LIGHT_TEAL)
  doc.roundedRect(TEAL_X, y, TEAL_W, HEADER_H, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text('BioProtect Marine Planner Report', TEAL_X + 4, y + 8)

  const projectName = project?.name
    ? (metadata?.description
        ? `${project.name}: ${metadata.description}`
        : project.name)
    : 'Unnamed Project'
  const nameLines = doc.splitTextToSize(projectName, TEAL_W - 8).slice(0, 2)
  doc.setFontSize(10)
  doc.text(nameLines, TEAL_X + 4, y + 17)

  // --- Metadata cell (planning unit info) ----------------------------------
  doc.setFillColor(245, 248, 250)
  doc.roundedRect(META_X, y, META_W, HEADER_H, 2, 2, 'F')
  doc.setDrawColor(200, 210, 215)
  doc.setLineWidth(0.25)
  doc.roundedRect(META_X, y, META_W, HEADER_H, 2, 2, 'S')

  const dateStr = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date())
  const metaRows = []
  if (metadata?.pu_alias)
    metaRows.push(['Grid', metadata.pu_alias])
  if (metadata?.pu_area && Number(metadata.pu_area) > 0)
    metaRows.push(['Hex area', `${Number(metadata.pu_area).toLocaleString('en-GB', { maximumFractionDigits: 1 })} km²`])
  if (metadata?.pu_domain)
    metaRows.push(['Domain', metadata.pu_domain])
  metaRows.push(['Date', dateStr])

  const LABEL_W = 18
  let metaY = y + 5.5
  for (const [label, value] of metaRows) {
    if (metaY > y + HEADER_H - 3)
      break
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GREY)
    doc.text(label, META_X + 3, metaY)
    doc.setTextColor(...DARK)
    const valLines = doc.splitTextToSize(value, META_W - LABEL_W - 4)
    doc.text(valLines, META_X + LABEL_W, metaY)
    metaY += Math.max(valLines.length, 1) * 4.2
  }

  y += HEADER_H + 5

  //  2. Map (full width, aspect-ratio preserved)
  if (mapImageDataUrl) {
    const img = await loadImage(mapImageDataUrl)
    const ratio = img
      ? img.naturalHeight / img.naturalWidth
      : 9 / 16
    const MAP_MAX_H = 190
    const mapH = Math.min(Math.round(CONTENT_W * ratio), MAP_MAX_H)

    doc.setFillColor(230, 235, 240)
    doc.roundedRect(MARGIN, y, CONTENT_W, mapH, 2, 2, 'F')
    doc.addImage(mapImageDataUrl, 'PNG', MARGIN, y, CONTENT_W, mapH, undefined, 'FAST')
    doc.setDrawColor(180, 185, 190)
    doc.setLineWidth(0.3)
    doc.roundedRect(MARGIN, y, CONTENT_W, mapH, 2, 2, 'S')

    y += mapH + 3
  }

  //  3. Legend, matching what the map shows
  const BAR_H = 5
  const legendTitle = (text) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...DARK)
    doc.text(text, MARGIN, y + 4)
  }
  const rampLabels = (left, right) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...GREY)
    doc.text(left, MARGIN, y + BAR_H + 3.5)
    doc.text(right, MARGIN + CONTENT_W, y + BAR_H + 3.5, { align: 'right' })
    y += BAR_H + 6
  }
  const runCount = projects.reduce((n, p) => n + p.runs.length, 0)

  if (comparing) {
    legendTitle('Picked by one project: its colour')
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    let x = MARGIN
    for (const p of projects) {
      const w = 5 + doc.getTextWidth(p.name) + 6
      if (x + w > MARGIN + CONTENT_W && x > MARGIN) {
        x = MARGIN
        y += 5
      }
      doc.setFillColor(...hexRgb(p.colour))
      doc.rect(x, y, 3.5, 3.5, 'F')
      doc.setTextColor(...DARK)
      doc.text(p.name, x + 5, y + 3)
      x += w
    }
    y += 5
    legendTitle('Picked by more than one: average share of runs')
    y += 6
    drawRamp(doc, MARGIN, y, CONTENT_W, BAR_H)
    rampLabels('0%', '100%')
  }
  else if (runCount > 0) {
    legendTitle('Selection frequency')
    y += 6
    drawRamp(doc, MARGIN, y, CONTENT_W, BAR_H)
    rampLabels('1 run', runCount > 1
      ? `${runCount} runs`
      : '1 run')
  }
  y += 2

  //  4. Tables (autoTable breaks pages and repeats headers)
  const FOOTER_SPACE = 12
  const table = (title, opts) => {
    if (y > PAGE_H - MARGIN - FOOTER_SPACE - 20) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEAL)
    doc.text(title, MARGIN, y + 3)
    autoTable(doc, {
      startY: y + 5,
      margin: {
        left: MARGIN,
        right: MARGIN,
        top: MARGIN,
        bottom: FOOTER_SPACE,
      },
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        textColor: DARK,
        lineColor: [220, 225, 230],
        lineWidth: 0.1,
      },
      headStyles: { fillColor: TEAL, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: {
        fillColor: [245, 248, 250],
      },
      ...opts,
    })
    y = doc.lastAutoTable.finalY + 7
  }

  if (comparing) {
    table(`PROJECTS COMPARED (${projects.length})`, {
      head: [
        [
          '',
          'Project',
          'Grid',
          'Resolution',
          'Runs',
        ],
      ],
      body: projects.map(p => [
        {
          content: '',
          styles: {
            fillColor: hexRgb(p.colour),
          },
        },
        p.name,
        p.grid ?? '–',
        p.resolution ?? '–',
        p.runs.length,
      ]),
      columnStyles: {
        0: { cellWidth: 5 },
      },
    })
  }

  table(`RUNS (${runCount})`, {
    head: [
      [
        'Run',
        ...(comparing
          ? ['Project']
          : []),
        'Created by',
        'Date',
        'Boundary penalty',
        'Cost profile',
      ],
    ],
    body: projects.flatMap(p => p.runs.map(r => [
      r.description?.trim()
        ? `${runName(r)}\n${r.description.trim()}`
        : runName(r),
      ...(comparing
        ? [p.name]
        : []),
      r.created_by_name ?? '–',
      r.created_at
        ? new Date(r.created_at).toLocaleDateString('en-GB')
        : '–',
      Number(r.params?.penalties?.boundary ?? 0),
      r.cost_profile_name ?? '–',
    ])),
  })

  const featureTable = (title, features) => table(title, {
    head: [
      [
        'Feature',
        'Target',
        'Achieved',
        'Runs met',
      ],
    ],
    body: features.map(f => [
      f.name,
      target(f),
      pct(f.achieved),
      metCell(f),
    ]),
  })

  if (!comparing) {
    featureTable(`FEATURES (${projects[0]?.features.length ?? 0})`, projects[0]?.features ?? [])
  }
  else if (projects.length <= MAX_SIDE_BY_SIDE) {
    // every feature of any project, '–' where a project does not have it
    const names = new Map()
    projects.forEach(p => p.features.forEach(f => names.set(f.uid, f.name)))
    const uids = [
      ...names.keys(),
    ].sort((a, b) => String(names.get(a)).localeCompare(String(names.get(b))))
    table(`FEATURES (${uids.length})`, {
      head: [
        [
          {
            content: 'Feature',
            rowSpan: 2,
            styles: { valign: 'bottom' },
          },
          ...projects.map(p => ({
            content: p.name,
            colSpan: 3,
            styles: { halign: 'center' },
          })),
        ],
        projects.flatMap(() => ['Target', 'Achieved', 'Met']),
      ],
      body: uids.map(uid => [
        names.get(uid),
        ...projects.flatMap((p) => {
          const f = p.features.find(x => x.uid === uid)
          return f
            ? [
                target(f),
                pct(f.achieved),
                metCell(f),
              ]
            : ['–', '–', '–']
        }),
      ]),
    })
  }
  else {
    projects.forEach(p => featureTable(`FEATURES - ${p.name} (${p.features.length})`, p.features))
  }

  if (activities.length > 0) {
    table(`ACTIVITIES (${activities.length})`, {
      theme: 'plain',
      body: activities.map(a => [`• ${a.activity || a.filename || 'Unknown'}`]),
      styles: { fontSize: 7.5, cellPadding: 0.8, textColor: DARK },
    })
  }

  //  5. Footer on every page
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GREY)
    doc.text('Generated by BioProtect', MARGIN, PAGE_H - 5)
    doc.text(`Page ${i} of ${pages}`, PAGE_W / 2, PAGE_H - 5, { align: 'center' })
    doc.text('bioprotect-project.eu', PAGE_W - MARGIN, PAGE_H - 5, { align: 'right' })
  }

  //  Save
  const safeName = (project?.name || 'report')
    .replace(/[^\w\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 50)

  doc.save(`${safeName}_prioritizr_report.pdf`)
}
