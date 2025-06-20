import CONSTANTS from "../constants";

// wherever you first load your features, or right before styling them,
// you can “seed” each feature with a color if it’s missing:
const ensureFeatureColor = (feature) => {
  if (!feature.color) {
    // pick one from your palette if you have one, e.g. window.colors:
    if (Array.isArray(window.colors) && window.colors.length) {
      feature.color = window.colors[feature.id % window.colors.length];
    } else {
      // otherwise generate a random hex
      feature.color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    }
  }
  return feature;
};


export const getPaintProperty = (feature) => {
  // before you call addMapLayer on a feature…
  feature = ensureFeatureColor(feature);

  console.log("feature ", feature);
  if (feature.source !== "Imported shapefile (points)") {
    return {
      "fill-color": feature.color,
      "fill-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
      "fill-outline-color": "rgba(0, 0, 0, 0.2)",
    };
  }
  return {
    "circle-color": feature.color,
    "circle-opacity": CONSTANTS.FEATURE_LAYER_OPACITY,
    "circle-stroke-color": "rgba(0, 0, 0, 0.7)",
    "circle-radius": 3,
  };
};

export const getTypeProperty = (feature) =>
  feature.source !== "Imported shapefile (points)" ? "fill" : "circle";
