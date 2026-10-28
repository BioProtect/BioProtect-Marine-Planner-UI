import LayerRow, { formatPct } from "./LayerRow";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import HexagonIcon from "@mui/icons-material/Hexagon";
import HexagonOutlinedIcon from "@mui/icons-material/HexagonOutlined";
import SyncIcon from "@mui/icons-material/Sync";

const layerOpacity = (layer) => {
  if (!layer?.paint) return 0;
  switch (layer.type) {
    case "fill":
      return layer.paint["fill-opacity"] ?? 0;
    case "line":
      return layer.paint["line-opacity"] ?? 0;
    case "circle":
      return layer.paint["circle-opacity"] ?? 0;
    default:
      return 0;
  }
};

export const Swatch = ({ item }) => (
  <span
    style={{
      position: "relative",
      display: "inline-block",
      width: 14,
      height: 16,
      flex: "none",
    }}
  >
    <HexagonIcon
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        color: item.fillColor,
      }}
    />
    <HexagonOutlinedIcon
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        color: item.strokeColor,
      }}
    />
  </span>
);

const SwatchLabel = ({ item }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
    <Swatch item={item} />
    {item.label}
  </Box>
);

// One legend block for a layer, or a group of layers (features, activities)
// driven by one slider. The key under the slider is `children` when given
// (gradients), else the items: inline for a few (status), a scrolling list
// for groups.
const LayerLegend = (props) => {
  const name = props.layer?.metadata?.name ?? "Layer";
  const items = props.items ?? [];
  const layers = props.subLayers?.length
    ? props.subLayers
    : props.layer?.id
      ? [props.layer]
      : [];
  const first = layers[0];
  const [opacity, setOpacity] = useState(layerOpacity(first));
  useEffect(() => setOpacity(layerOpacity(first)), [first]);

  if (!layers.length) return null;

  const change = (v) => {
    setOpacity(v);
    layers.forEach((l) => l?.id && props.changeOpacity(l.id, v));
  };

  const isGroup = layers.length > 1 && items.length === layers.length;
  let key = props.children;
  if (props.loading) {
    key = <SyncIcon className="spin costsLayerSpinner" fontSize="small" />;
  } else if (!key && isGroup) {
    key = (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          mt: 0.5,
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {items.map((item) => (
          <SwatchLabel key={item.label} item={item} />
        ))}
      </Box>
    );
  } else if (!key && items.length) {
    key = (
      <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.5 }}>
        {items.map((item) => (
          <SwatchLabel key={item.label} item={item} />
        ))}
      </Box>
    );
  }

  return (
    <LayerRow name={name} value={opacity} onChange={change} format={formatPct}>
      {key}
    </LayerRow>
  );
};

export default LayerLegend;
