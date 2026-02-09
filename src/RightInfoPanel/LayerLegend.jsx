import { useEffect, useState } from "react";

import Hexagon from "react-hexagon";
import { Stack } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import TransparencyControl from "../TransparencyControl";
import Typography from "@mui/material/Typography";

const LayerLegend = (props) => {
  const [opacity, setOpacity] = useState(0);

  /**
   * Determine a representative layer:
   * - first subLayer if present
   * - otherwise the layer itself
   */
  const effectiveLayer =
    props.subLayers && props.subLayers.length
      ? props.subLayers[0]
      : props.layer;

  useEffect(() => {
    if (!effectiveLayer?.paint || !effectiveLayer?.type) return;

    let initialOpacity = 0;

    switch (effectiveLayer.type) {
      case "fill":
        initialOpacity = effectiveLayer.paint["fill-opacity"] ?? 0;
        break;
      case "line":
        initialOpacity = effectiveLayer.paint["line-opacity"] ?? 0;
        break;
      case "circle":
        initialOpacity = effectiveLayer.paint["circle-opacity"] ?? 0;
        break;
      default:
        break;
    }
    setOpacity(initialOpacity);
  }, [effectiveLayer]);

  const changeOpacity = (newOpacity) => {
    //the layer legend may in fact represent many separate layers (e.g. for features) - these are passed in as subLayers and each needs to have the opacity set
    setOpacity(newOpacity);

    if (props.subLayers?.length) {
      props.subLayers.forEach((layer) => {
        if (!layer?.id) return; // guard
        props.changeOpacity(layer.id, newOpacity);
      });
    } else if (props.layer?.id) {
      props.changeOpacity(props.layer.id, newOpacity);
    }
  };

  const renderItems = () => {
    //iterate through the items in this layers legend. get a unique key
    //if the legend is showing a range in values then put in a horizontal separator between the items
    return props.items.map((item, index) => {
      const key = `legend_${props.layer?.id ?? "static"}_${index}`;
      return (
        <div key={key} style={{ display: props.range ? "inline" : "block" }}>
          <Hexagon
            className={"hexLegendItem"}
            style={{
              fill: item.fillColor,
              stroke: item.strokeColor,
              strokeWidth: 30,
            }}
          />
          <div
            style={{
              display: "inline-flex",
              verticalAlign: "top",
            }}
          >
            {item.label}
          </div>
        </div>
      );
    });
  };

  let items = props.loading ? (
    <SyncIcon
      className="spin costsLayerSpinner"
      style={{ display: props.loading ? "inline-block" : "none" }}
      key={"costsspinner"}
    />
  ) : (
    renderItems()
  );

  return (
    <>
      <Stack direction="row" pl={1} alignItems="center" spacing={1}>
        <Typography variant="h6" component="div" noWrap sx={{ flexShrink: 0 }}>
          {props.layer?.metadata?.name ?? "Layer"}
        </Typography>
        {(props.layer?.id || props.subLayers?.length) && (
          <TransparencyControl
            changeOpacity={changeOpacity}
            opacity={opacity}
          />
        )}
      </Stack>
      <Stack spacing={1} p={1} sx={{ maxHeight: "100vh", overflowY: "auto" }}>
        {items}
      </Stack>
    </>
  );
};

export default LayerLegend;
