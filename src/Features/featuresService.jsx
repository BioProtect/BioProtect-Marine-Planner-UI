import CONSTANTS from "../constants";

export const getPaintProperty = (feature) => {
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
