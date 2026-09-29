import CONSTANTS from "../bpVars.jsx";

// wherever you first load your features, or right before styling them,
// you can “seed” each feature with a color if it’s missing:
// returns a copy — features from the RTK Query cache are frozen
const ensureFeatureColor = (feature) => {
  if (feature.color) return feature;
  // pick one from your palette if you have one, e.g. window.colors:
  const color =
    Array.isArray(window.colors) && window.colors.length
      ? window.colors[feature.id % window.colors.length]
      : // otherwise generate a random hex
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0");
  return { ...feature, color };
};

export const getPaintProperty = (feature) => {
  // before you call addMapLayer on a feature…
  feature = ensureFeatureColor(feature);

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
