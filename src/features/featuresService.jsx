import CONSTANTS from "../bpVars.jsx";

// seed a random color if missing; returns a copy — features from the RTK Query cache are frozen
const ensureFeatureColor = (feature) =>
  feature.color
    ? feature
    : {
        ...feature,
        color: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
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
