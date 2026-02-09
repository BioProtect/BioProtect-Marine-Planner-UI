import { patchItemById, replaceItemsById } from "@store/rtkqCacheHelpers";

import { featureApiSlice } from "@slices/featureSlice";

/**
 * Patch one feature inside getAllFeatures cache.
 */
export const setOneFeatureInCache =
  ({ id, patch }) =>
  (dispatch) => {
    return dispatch(
      featureApiSlice.util.updateQueryData(
        "getAllFeatures",
        undefined,
        (draft) => {
          patchItemById(draft, id, patch);
        }
      )
    );
  };

/**
 * Replace many features (whole objects) inside getAllFeatures cache.
 * Pass full updated feature objects (must include id).
 */
export const setAllFeaturesInCache =
  ({ features }) =>
  (dispatch) => {
    const byId = new Map((features || []).map((f) => [f.id, f]));
    return dispatch(
      featureApiSlice.util.updateQueryData(
        "getAllFeatures",
        undefined,
        (draft) => {
          replaceItemsById(draft, byId);
        }
      )
    );
  };

export const addFeaturesToCache =
  ({ features }) =>
  (dispatch) => {
    return dispatch(
      featureApiSlice.util.updateQueryData(
        "getAllFeatures",
        undefined,
        (draft) => {
          const list = Array.isArray(draft) ? draft : draft?.data;
          if (!Array.isArray(list)) return;

          for (const feature of features) {
            // avoid duplicates
            if (!list.find((f) => f.id === feature.id)) {
              list.push(feature);
            }
          }

          list.sort((a, b) =>
            (a.alias || "").localeCompare(b.alias || "", undefined, {
              sensitivity: "base",
            })
          );
        }
      )
    );
  };

export const removeFeaturesFromCache =
  ({ ids }) =>
  (dispatch) => {
    return dispatch(
      featureApiSlice.util.updateQueryData(
        "getAllFeatures",
        undefined,
        (draft) => {
          const list = Array.isArray(draft) ? draft : draft?.data;
          if (!Array.isArray(list)) return;

          const removeSet = new Set(ids || []);
          for (let i = list.length - 1; i >= 0; i--) {
            if (removeSet.has(list[i].id)) list.splice(i, 1);
          }
        }
      )
    );
  };
