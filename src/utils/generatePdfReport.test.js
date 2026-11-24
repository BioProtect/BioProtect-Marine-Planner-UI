import { describe, expect, it, vi } from 'vitest'
import { generatePdfReport } from './generatePdfReport'

// keep the document instead of downloading it
const saved = vi.hoisted(() => ({ doc: null }))
vi.mock('jspdf', async (importOriginal) => {
  const { default: JsPDF } = await importOriginal()
  return {
    // jsPDF sets save on each instance, so it is replaced after construction
    default: class extends JsPDF {
      constructor(...args) {
        super(...args)
        this.save = () => {
          saved.doc = this
        }
      }
    },
  }
})

// jsdom never loads images: fail fast so the logo is just skipped
vi.stubGlobal('Image', class {
  get src() {
    return ''
  }

  set src(_) {
    setTimeout(() => this.onerror?.())
  }
})

function feature(uid, name, metCount, runCount = 2) {
  return {
    uid,
    name,
    target: 17,
    achieved: 20,
    metCount,
    runCount,
  }
}
function run(id, extra = {}) {
  return {
    id,
    label: `Run ${id}`,
    created_by_name: 'ana',
    created_at: '2026-11-01',
    params: {
      penalties: { boundary: 0.5 },
    },
    ...extra,
  }
}

async function reportText(args) {
  await generatePdfReport({
    project: { name: 'Bay' },
    metadata: {},
    ...args,
  })
  return {
    text: saved.doc.output(),
    pages: saved.doc.getNumberOfPages(),
  }
}

describe('generatePdfReport', () => {
  it('comparison: projects table, runs per project, features side by side with gaps', async () => {
    const { text } = await reportText({
      comparing: true,
      projects: [
        {
          id: 1,
          name: 'Coarse Bay',
          grid: 'Grid A',
          resolution: 6,
          colour: '#1f77b4',
          runs: [
            run(1, { cost_profile_name: 'Zero cost' }),
          ],
          features: [
            feature('a', 'Seagrass', 2),
          ],
        },
        {
          id: 2,
          name: 'Fine Bay',
          grid: 'Grid B',
          resolution: 8,
          colour: '#ff7f0e',
          runs: [
            run(2, { cost_profile_name: 'Fishing' }),
          ],
          features: [
            feature('b', 'Kelp', 0),
          ],
        },
      ],
    })
    for (const s of [
      'PROJECTS COMPARED',
      'Coarse Bay',
      'Fine Bay',
      'Grid B',
      'Zero cost',
      'Fishing',
      'Seagrass',
      'Kelp',
      '2/2',
      '0/2',
      'Page 1 of',
    ])
      expect(text).toContain(s)
  })

  it('single project: no comparison table, and long feature lists spill onto more pages', async () => {
    const features = Array.from({ length: 120 }, (_, i) => feature(i, `Feature ${i}`, 1))
    const { text, pages } = await reportText({
      projects: [
        {
          id: 1,
          name: 'Bay',
          runs: [
            run(1),
          ],
          features,
        },
      ],
    })
    expect(text).not.toContain('PROJECTS COMPARED')
    expect(text).toContain('Feature 119')
    expect(pages).toBeGreaterThan(1)
  })
})
