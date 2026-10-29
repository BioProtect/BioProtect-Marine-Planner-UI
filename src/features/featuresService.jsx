import CONSTANTS, { PALETTE } from '../bpVars.jsx'

/**
 * Colour-blind-safe colour from the palette, picked by id so a feature keeps
 * its colour. ponytail: 7 colours, so features 7 ids apart share one; a
 * per-project assignment would avoid clashes among the loaded features.
 */
export function featureColor(feature) {
  return feature.color
    || PALETTE.features[Math.abs(Number(feature.id) || 0) % PALETTE.features.length]
}

// returns a copy — features from the RTK Query cache are frozen
function ensureFeatureColor(feature) {
  return feature.color
    ? feature
    : {
        ...feature,
        color: featureColor(feature),
      }
}

export function getPaintProperty(feature) {
  // before you call addMapLayer on a feature…
  feature = ensureFeatureColor(feature)

  if (feature.source !== 'Imported shapefile (points)') {
    return {
      'fill-color': feature.color,
      'fill-opacity': CONSTANTS.FEATURE_LAYER_OPACITY,
      'fill-outline-color': 'rgba(0, 0, 0, 0.2)',
    }
  }
  return {
    'circle-color': feature.color,
    'circle-opacity': CONSTANTS.FEATURE_LAYER_OPACITY,
    'circle-stroke-color': 'rgba(0, 0, 0, 0.7)',
    'circle-radius': 3,
  }
}

export function getTypeProperty(feature) {
  return feature.source !== 'Imported shapefile (points)'
    ? 'fill'
    : 'circle'
}
