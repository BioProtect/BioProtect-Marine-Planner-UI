import React, { useEffect, useState } from "react";

import CONSTANTS from "../constants";
import LayerLegend from "./LayerLegend";
import { getMaxNumberOfClasses } from "../Helpers";

const MapLegend = (props) => {
  const [planningGridShape, setPlanningGridShape] = useState("square");

  useEffect(() => {
    setPlanningGridShape(
      props.metadata &&
        props.metadata.PLANNING_UNIT_NAME &&
        props.metadata.PLANNING_UNIT_NAME.includes("hexagon")
        ? "hexagon"
        : "square"
    );
  }, [props.metadata]);

  const getSummedSolution = (layer, colorCode) => {
    // gets the summed solutions legend item
    // get the data value for the highest break in the data to see if we are viewing the sum solutions or an individual solution
    // get the number of classes the user currently has selected
    // get the maximum number of colors in this scheme
    // get the color scheme
    // get the number of colors to show as an array
    // get the legend items
    // see if the data is a range - if the difference in the number of solutions is only 1, then it is not a range
    let items;
    let summed = props.brew.breaks[props.brew.breaks.length - 1] !== 1;
    if (summed) {
      let numClasses = props.brew.getNumClasses();
      let colorSchemeLength = getMaxNumberOfClasses(props.brew, colorCode);
      let colorScheme = props.brew.colorSchemes[colorCode];
      //  let numClassesArray =
      //   numClasses <= colorSchemeLength
      //     ? Array.apply(null, {
      //         length: numClasses,
      //       }).map(Number.call, Number)
      //     : Array.apply(null, {
      //         length: colorSchemeLength,
      //       }).map(Number.call, Number);
      let numClassesArray =
        numClasses <= colorSchemeLength
          ? Array.from({ length: numClasses }, (_, i) => i)
          : Array.from({ length: colorSchemeLength }, (_, i) => i);

      let classesToShow = numClassesArray.length;
      items = numClassesArray.map((item) => {
        let range = props.brew.breaks[item + 1] - props.brew.breaks[item] > 1;
        let suffix =
          props.brew.breaks[item + 1] === 1 ? " solution" : " solutions";

        let legendLabel = range
          ? `${props.brew.breaks[item] + 1} - ${
              props.brew.breaks[item + 1]
            }${suffix}`
          : `${props.brew.breaks[item + 1]}${suffix}`;
        return {
          layer: layer,
          fillColor: colorScheme[classesToShow][item],
          strokeColor: "lightgray",
          label: legendLabel,
        };
      });
      return items;
    } else {
      //viewing a single solution rather than the sum solution
      return [
        {
          fillColor: "rgba(255, 0, 136,1)",
          strokeColor: "lightgray",
          label: "Proposed network",
        },
      ];
    }
  };

  const getNonFeatureLegendItems = () => {
    let layers = [];
    let costLayers = props.visibleLayers.filter(
      (item) => item.id === CONSTANTS.COSTS_LAYER_NAME
    );
    if (costLayers.length) {
      layers = props.visibleLayers.filter(
        (item) => item.id !== CONSTANTS.COSTS_LAYER_NAME
      );
      layers.push(costLayers[0]);
    } else {
      layers = props.visibleLayers;
    }
    return layers.map((layer) => {
      //get a unique key
      //create the legend for non-feature layers
      //get the summed solutions legend
      let key = "legend_" + layer.id;
      if (layer.metadata.type !== CONSTANTS.LAYER_TYPE_FEATURE_LAYER) {
        switch (layer.metadata.type) {
          case CONSTANTS.LAYER_TYPE_SUMMED_SOLUTIONS:
            let items =
              props.brew && props.brew.breaks && props.brew.colorCode
                ? getSummedSolution(layer, props.brew.colorCode)
                : [];
            return (
              <LayerLegend
                key={key}
                topMargin={"15px"}
                changeOpacity={props.changeOpacity}
                layer={layer}
                items={items}
                shape={planningGridShape}
                setSymbology={props.openClassificationDialog}
              />
            );
          case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_COST:
            let minColor = layer.paint["fill-color"][3];
            let maxColor =
              layer.paint["fill-color"][layer.paint["fill-color"].length - 2];
            if (layer.metadata.min === layer.metadata.max) {
              return (
                <LayerLegend
                  key={key}
                  loading={props.costsLoading}
                  topMargin={"15px"}
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
            } else {
              return (
                <LayerLegend
                  key={key}
                  loading={props.costsLoading}
                  topMargin={"15px"}
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
                  range={true}
                />
              );
            }
          case CONSTANTS.LAYER_TYPE_PLANNING_UNITS_STATUS:
            let puLayer = layers.find(
              (layer) => layer.id === CONSTANTS.PU_LAYER_NAME
            );
            let puStatusLayer = layers.find(
              (layer) => layer.id === CONSTANTS.STATUS_LAYER_NAME
            );
            return (
              <LayerLegend
                key={key}
                topMargin={"15px"}
                changeOpacity={props.changeOpacity}
                layer={layer}
                subLayers={[puLayer, puStatusLayer]}
                items={[
                  CONSTANTS.PU_STATUS_DEFAULT,
                  CONSTANTS.PU_STATUS_LOCKED_IN,
                  CONSTANTS.PU_STATUS_LOCKED_OUT,
                ]}
                shape={planningGridShape}
              />
            );
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
                shape={"square"}
              />
            );
          default:
            return null;
        }
      } else {
        return null;
      }
    });
  };

  const getFeatureLegendItems = () => {
    let featureLayers = props.visibleLayers.filter(
      (layer) => layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_LAYER
    );
    let items = featureLayers.map((layer) => ({
      fillColor: layer.paint["fill-color"],
      strokeColor: "lightgray",
      label: layer.metadata.name,
    }));
    items.sort((a, b) =>
      a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1
    );
    return items.length > 0 ? (
      <LayerLegend
        topMargin={"15px"}
        changeOpacity={props.changeOpacity}
        layer={{ metadata: { name: "Features" } }}
        subLayers={featureLayers}
        items={items}
        shape={"square"}
      />
    ) : null;
  };

  const getFeaturePUIDLegendItems = () => {
    let featurePUIDLayers = props.visibleLayers.filter(
      (layer) =>
        layer.metadata.type === CONSTANTS.LAYER_TYPE_FEATURE_PLANNING_UNIT_LAYER
    );
    let items = featurePUIDLayers.map((layer) => ({
      fillColor: "none",
      strokeColor: layer.metadata.lineColor,
      label: layer.metadata.name,
    }));
    return items.length > 0 ? (
      <LayerLegend
        topMargin={"15px"}
        changeOpacity={props.changeOpacity}
        layer={{ metadata: { name: "Planning units for features" } }}
        subLayers={featurePUIDLayers}
        items={items}
        shape={planningGridShape}
      />
    ) : null;
  };

  return (
    <>
      {getNonFeatureLegendItems()}
      {getFeatureLegendItems()}
      {getFeaturePUIDLegendItems()}
    </>
  );
};

export default MapLegend;
