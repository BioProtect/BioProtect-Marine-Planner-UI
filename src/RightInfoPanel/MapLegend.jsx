import React, { Fragment, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import CONSTANTS from "../bpVars";
import LayerLegend from "./LayerLegend";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";

const YLGN_GRADIENT = [
  "#ffffe5",
  "#f7fcb9",
  "#d9f0a3",
  "#addd8e",
  "#78c679",
  "#41ab5d",
  "#238443",
  "#006837",
  "#004529",
];
const ORRD_GRADIENT = [
  "#fff7ec",
  "#fee8c8",
  "#fdd49e",
  "#fdbb84",
  "#fc8d59",
  "#ef6548",
  "#d7301f",
  "#b30000",
  "#7f0000",
];

const GradientBar = ({ colors, leftLabel, rightLabel, title }) => (
  <Box sx={{ px: 1, py: 0.5 }}>
    {title && (
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ display: "block", mb: 0.3 }}
      >
        {title}
      </Typography>
    )}
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {leftLabel}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 14,
          borderRadius: 1,
          background: `linear-gradient(to right, ${colors.join(", ")})`,
          border: "1px solid #ccc",
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {rightLabel}
      </Typography>
    </Box>
  </Box>
);

const MapLegend = ({ changeOpacity, visibleLayers, costsLoading }) => {
  const [planningGridShape, setPlanningGridShape] = useState("hexagon");
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);

  /**
   * Prioritizr results legend
   * Shows opacity slider + frequency gradient when multiple runs selected
   */
  const getPrioritizrResultsLegend = (layer) => {
    const runCount = selectedRunIds.length;
    return (
      <React.Fragment key={`legend_${layer.id}`}>
        <LayerLegend
          changeOpacity={changeOpacity}
          layer={layer}
          items={[
            {
              fillColor: runCount > 1 ? "#41ab5d" : "#004529",
              strokeColor: "lightgray",
              label: "Selected planning units",
            },
          ]}
          shape={planningGridShape}
        />
        {runCount > 1 && (
          <GradientBar
            colors={YLGN_GRADIENT}
            leftLabel="1 run"
            rightLabel={`${runCount} runs`}
            title="Selection frequency"
          />
        )}
      </React.Fragment>
    );
  };

  const getNonFeatureLegendItems = () => {
    let layers = [];
    let costLayers = visibleLayers.filter(
      (item) => item.id === CONSTANTS.COSTS_LAYER_NAME,
    );
    if (costLayers.length) {
      layers = visibleLayers.filter(
        (item) => item.id !== CONSTANTS.COSTS_LAYER_NAME,
      );
      layers.push(costLayers[0]);
    } else {
      layers = visibleLayers;
    }
    return layers.map((layer) => {
      //get a unique key create the legend for non-feature layers
      let key = "legend_" + layer.id;

      if (layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_LAYER) {
        return null;
      }

      switch (layer.metadata.type) {
        case CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS:
          return getPrioritizrResultsLegend(layer);

        case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST: {
          const minVal = layer.metadata.min;
          const maxVal = layer.metadata.max;

          return (
            <React.Fragment key={key}>
              <LayerLegend
                loading={costsLoading}
                changeOpacity={changeOpacity}
                layer={layer}
                items={[
                  {
                    fillColor: ORRD_GRADIENT[0],
                    strokeColor: "lightgray",
                    label: minVal === maxVal ? minVal : "Low cost",
                  },
                ]}
                shape={planningGridShape}
              />
              <GradientBar
                colors={ORRD_GRADIENT}
                leftLabel={minVal ?? "Low"}
                rightLabel={maxVal ?? "High"}
              />
            </React.Fragment>
          );
        }

        case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS: {
          const puLayer = layers.find((l) => l.id === CONSTANTS.PU_LAYER_NAME);
          const statusLayer = layers.find(
            (l) => l.id === CONSTANTS.STATUS_LAYER_NAME,
          );

          return (
            <LayerLegend
              key={key}
              changeOpacity={changeOpacity}
              layer={layer}
              subLayers={[puLayer, statusLayer].filter(Boolean)}
              items={[
                CONSTANTS.PU_STATUS_DEFAULT,
                CONSTANTS.PU_STATUS_LOCKED_IN,
                CONSTANTS.PU_STATUS_LOCKED_OUT,
              ]}
              shape={planningGridShape}
            />
          );
        }
        case CONSTANTS.LAYER_TYPE_PROTECTED_AREAS:
          return (
            <LayerLegend
              key={key}
              changeOpacity={changeOpacity}
              layer={layer}
              items={[
                {
                  fillColor: "rgba(63,127,191)",
                  strokeColor: "lightgray",
                  label: "Marine",
                },
                {
                  fillColor: "rgba(99,148,69)",
                  strokeColor: "lightgray",
                  label: "Terrestrial",
                },
              ]}
              shape="square"
            />
          );

        default:
          return null;
      }
    });
  };

  const getFeatureLegendItems = () => {
    let featureLayers = visibleLayers.filter(
      (layer) => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_LAYER,
    );
    let items = featureLayers.map((layer) => ({
      fillColor: layer.paint["fill-color"],
      strokeColor: "lightgray",
      label: layer.metadata.name,
    }));
    items.sort((a, b) =>
      a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1,
    );
    return items.length ? (
      <LayerLegend
        changeOpacity={changeOpacity}
        layer={{ metadata: { name: "Features" } }}
        subLayers={featureLayers}
        items={items}
        shape={"hexagon"}
      />
    ) : null;
  };

  const getFeaturePUIDLegendItems = () => {
    let featurePUIDLayers = visibleLayers.filter(
      (layer) => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER,
    );
    let items = featurePUIDLayers.map((layer) => ({
      fillColor: "none",
      strokeColor: layer.metadata.lineColor,
      label: layer.metadata.name,
    }));
    return items.length ? (
      <LayerLegend
        changeOpacity={changeOpacity}
        layer={{ metadata: { name: "Planning units for features" } }}
        subLayers={featurePUIDLayers}
        items={items}
        shape={planningGridShape}
      />
    ) : null;
  };

  return (
    <Box
      sx={{
        maxHeight: "calc(100vh - 200px)", // responsive vertical size
        overflowY: "auto",
        pr: 1, // avoids scrollbar overlay
        my: 1,
        // optional: MUI theme scrollbar
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      }}
    >
      {getNonFeatureLegendItems()}
      {getFeatureLegendItems()}
      {getFeaturePUIDLegendItems()}
    </Box>
  );
};

export default MapLegend;
