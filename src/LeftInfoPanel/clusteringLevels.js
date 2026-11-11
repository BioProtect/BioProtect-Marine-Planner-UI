/**
 * Clustering strength (0..1) sent as penalties.boundary. The R script turns it
 * into repeated solves that discount cells next to selected ones, so runs stay
 * inside the time budget on any grid size (see run_prioritzr_v2.R).
 */
export const LEVELS = [
  {
    value: 0,
    label: 'None',
    penalty: 0,
    hint: 'No spatial clustering. Fastest.',
  },
  {
    value: 1,
    label: 'Light',
    penalty: 0.3,
    hint: 'Removes most isolated cells. Small extra cost.',
  },
  {
    value: 2,
    label: 'Moderate',
    penalty: 0.5,
    hint: 'Groups cells into larger patches.',
  },
  {
    value: 3,
    label: 'Strong',
    penalty: 0.7,
    hint: 'Compact patches. Higher cost.',
  },
  {
    value: 4,
    label: 'Max',
    penalty: 0.9,
    hint: 'Most compact patches. Highest cost.',
  },
]
