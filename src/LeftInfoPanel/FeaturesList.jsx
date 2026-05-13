import { Fragment, memo, useMemo } from "react";
import {
  featureApiSlice,
  setSelectedFeatureId,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import FeatureListItem from "./FeatureListItem";
import FeatureProgressDemo from "./FeatureProgressDemo";
import IconButton from "@mui/material/IconButton";
import LinearGauge from "./LinearGauge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TargetAvatar from "./TargetAvatar";
import Tooltip from "@mui/material/Tooltip";
import { grey } from "@mui/material/colors";
import { projectApiSlice } from "@slices/projectSlice";
import { useGetFeatureRepresentationQuery } from "@slices/prioritizrApiSlice";

const FeaturesList = ({
  updateFeature,
  toggleFeatureLayer,
  toggleFeaturePUIDLayer,
  setMenuAnchor,
}) => {
  const dispatch = useDispatch();
  const activeProjectId = useSelector((state) => state.project.activeProjectId);
  // get all features and then filter by selectedIds for project features
  const selectedIds = useSelector((s) => s.feature.selectedFeatureIds);
  const { data: allFeaturesResp } =
    featureApiSlice.endpoints.getAllFeatures.useQuery();
  const allFeatures = allFeaturesResp?.data ?? [];
  const projectFeatures = allFeatures.filter((f) => selectedIds.includes(f.id));

  // ── Feature representation from selected Prioritizr runs ────────────────
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);
  // Stable sorted key so RTK Query cache works correctly across toggle order
  const sortedRunIds = useMemo(
    () => [...selectedRunIds].sort((a, b) => a - b),
    [selectedRunIds],
  );
  const { data: reprResp } = useGetFeatureRepresentationQuery(sortedRunIds, {
    skip: sortedRunIds.length === 0,
  });
  // Map: feature_unique_id (number) → {
  //   achieved:    number  (server average across the selected runs),
  //   achievedMin: number,
  //   achievedMax: number,
  //   perRun:      number[] (per-run percents — same length as selectedRunIds)
  // }
  // When the API hasn't been extended with `per_run`, we fall back to a
  // single-element array so the tri-state UI degrades to current behaviour.
  const reprByFeatureUniqueId = useMemo(() => {
    if (sortedRunIds.length === 0 || !reprResp?.data) return {};
    return Object.fromEntries(
      reprResp.data.map((r) => {
        const pct = r.represented_percent;
        const perRun =
          Array.isArray(r.per_run) && r.per_run.length > 0
            ? r.per_run.map((p) => p.represented_percent)
            : [pct];
        return [
          r.feature_unique_id,
          {
            achieved: pct,
            achievedMin: Math.min(...perRun),
            achievedMax: Math.max(...perRun),
            perRun,
          },
        ];
      }),
    );
  }, [reprResp, sortedRunIds]);

  const handleIconClick = (evt, id) => {
    evt.stopPropagation();
    setMenuAnchor(evt.target);
    dispatch(setSelectedFeatureId(id));
    dispatch(toggleFeatureD({ dialogName: "featureMenuOpen", isOpen: true }));
  };

  const handleItemClick = (evt, feature) => {
    console.log("item cloisked....");
    const key = evt.altKey
      ? "feature_puid_layer_loaded"
      : "feature_layer_loaded";

    // clone + flip whichever flag
    const updated = {
      ...feature,
      [key]: !feature[key],
    };

    // update the map
    evt.altKey ? toggleFeaturePUIDLayer(updated) : toggleFeatureLayer(updated);

    // and sync your Redux slice
    dispatch(
      projectApiSlice.util.updateQueryData(
        "getProject",
        activeProjectId,
        (draft) => {
          if (!draft?.features) return;

          const f = draft.features.find(
            (pf) => (pf.id ?? pf.id) === updated.id,
          );

          if (f) {
            f[key] = updated[key];
          }
        },
      ),
    );
  };

  const handleTargetChange = (feature, newValue) =>
    updateFeature(feature.id, { target_value: newValue });

  return (
    <List sx={{ maxHeight: "60vh", overflowY: "auto", px: 1, mb: 4 }}>
      {projectFeatures.map((item) => {
        const { id, area, protected_area, target_value, color } = item;
        const repr = reprByFeatureUniqueId[id] ?? null;
        const achieved = repr?.achieved ?? null;
        const achievedMin = repr?.achievedMin ?? null;
        const achievedMax = repr?.achievedMax ?? null;
        const perRun = repr?.perRun ?? null;

        const runCount = perRun?.length ?? 0;
        const metCount =
          perRun != null
            ? perRun.filter((p) => p >= Number(target_value ?? 0)).length
            : 0;

        let protectedPercent;
        if (protected_area === -1) {
          protectedPercent = -1;
        } else if (area > 0 && protected_area > 0) {
          protectedPercent = (protected_area / area) * 100;
        } else {
          protectedPercent = 0;
        }

        const isActive =
          item.feature_layer_loaded || item.feature_puid_layer_loaded;

        const content = (
          <FeatureListItem
            item={item}
            id={id}
            area={area}
            protected_area={protected_area}
            target_value={target_value}
            color={color}
            achieved={achieved}
            achievedMin={achievedMin}
            achievedMax={achievedMax}
            metCount={metCount}
            runCount={runCount}
            protectedPercent={protectedPercent}
            isActive={isActive}
            handleIconClick={handleIconClick}
            handleItemClick={handleItemClick}
            handleTargetChange={handleTargetChange}
          />
        );

        return (
          <Fragment key={`feature-${id}`}>
            <Box>{content}</Box>
          </Fragment>
        );
      })}
    </List>
  );
};

export default memo(FeaturesList);
