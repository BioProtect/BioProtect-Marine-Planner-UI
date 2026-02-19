import React, { Fragment, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import CONSTANTS from "../bpVars";
import LayerLegend from "./LayerLegend";

const MapLegend = (props) => {
  const [planningGridShape, setPlanningGridShape] = useState("hexagon");

  /**
   * Prioritizr results legend
   * Binary outcome: selected vs not selected
   */
  const getPrioritizrResultsLegend = (layer) => {
    return (
      <LayerLegend
        key={`legend_${layer.id}`}
        changeOpacity={props.changeOpacity}
        layer={layer}
        items={[
          {
            fillColor: layer.paint?.["fill-color"] ?? "rgba(255,0,136,0.9)",
            strokeColor: "lightgray",
            label: "Selected planning units",
          },
        ]}
        shape={planningGridShape}
      />
    );
  };

  const getNonFeatureLegendItems = () => {
    let layers = [];
    let costLayers = props.visibleLayers.filter(
      (item) => item.id === CONSTANTS.COSTS_LAYER_NAME,
    );
    if (costLayers.length) {
      layers = props.visibleLayers.filter(
        (item) => item.id !== CONSTANTS.COSTS_LAYER_NAME,
      );
      layers.push(costLayers[0]);
    } else {
      layers = props.visibleLayers;
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
          const fillExpr = layer.paint?.["fill-color"];
          if (!Array.isArray(fillExpr)) return null;

          const minColor = fillExpr[3];
          const maxColor = fillExpr[fillExpr.length - 2];

          if (layer.metadata.min === layer.metadata.max) {
            return (
              <LayerLegend
                key={key}
                loading={props.costsLoading}
                changeOpacity={props.changeOpacity}
                layer={layer}
                items={[
                  {
                    fillColor: minColor,
                    strokeColor: "lightgray",
                    label: layer.metadata.min,
                  },
                ]}
                shape={planningGridShape}
              />
            );
          }

          return (
            <LayerLegend
              key={key}
              loading={props.costsLoading}
              changeOpacity={props.changeOpacity}
              layer={layer}
              items={[
                {
                  fillColor: minColor,
                  strokeColor: "lightgray",
                  label: layer.metadata.min,
                },
                {
                  fillColor: maxColor,
                  strokeColor: "lightgray",
                  label: layer.metadata.max,
                },
              ]}
              shape={planningGridShape}
              range
            />
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
              changeOpacity={props.changeOpacity}
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
              changeOpacity={props.changeOpacity}
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
    let featureLayers = props.visibleLayers.filter(
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
        changeOpacity={props.changeOpacity}
        layer={{ metadata: { name: "Features" } }}
        subLayers={featureLayers}
        items={items}
        shape={"hexagon"}
      />
    ) : null;
  };

  const getFeaturePUIDLegendItems = () => {
    let featurePUIDLayers = props.visibleLayers.filter(
      (layer) => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_PU_LAYER,
    );
    let items = featurePUIDLayers.map((layer) => ({
      fillColor: "none",
      strokeColor: layer.metadata.lineColor,
      label: layer.metadata.name,
    }));
    return items.length ? (
      <LayerLegend
        changeOpacity={props.changeOpacity}
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
