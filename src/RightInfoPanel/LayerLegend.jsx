import { IconButton, Stack } from "@mui/material";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useEffect, useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import Swatch from "../Swatch";
import SyncIcon from "@mui/icons-material/Sync";
import TransparencyControl from "../TransparencyControl";
import Typography from "@mui/material/Typography";

const LayerLegend = (props) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let layer = props.subLayers ? props.subLayers[0] : props.layer;
    let initialOpacity = 0;
    switch (layer.type) {
      case "fill":
        initialOpacity = layer.paint["fill-opacity"];
        break;
      case "line":
        initialOpacity = layer.paint["line-opacity"];
        break;
      default:
        break;
    }
    setOpacity(initialOpacity);
  }, [props.layer, props.subLayers]);

  const changeOpacity = (newOpacity) => {
    //the layer legend may in fact represent many separate layers (e.g. for features) - these are passed in as subLayers and each needs to have the opacity set
    setOpacity(newOpacity);
    if (props.subLayers) {
      props.subLayers.forEach((layer) => {
        props.changeOpacity(layer.id, newOpacity);
      });
    } else {
      //call the change opacity method on a single layer - this actually changes the opacity of the layer
      props.changeOpacity(props.layer.id, newOpacity);
    }
  };

  const renderItems = () => {
    //iterate through the items in this layers legend
    //get a unique key
    //if the legend is showing a range in values then put in a horizontal separator between the items
    return props.items.map((item, index) => {
      let key = `legend_${props.layer.id}_item_${index}`;
      return (
        <div key={key} style={{ display: props.range ? "inline" : "block" }}>
          <Swatch item={item} key={key} shape={props.shape} />
          <div
            style={{
              display: "inline-flex",
              verticalAlign: "top",
            }}
            key={`${key}_label`}
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

  let setSymbologyBtn = props.setSymbology ? (
    <IconButton
      className="setSymbologyBtn"
      onClick={props.setSymbology}
      title="Configure symbology"
      style={{ color: "gainsboro" }}
    >
      <SettingsIcon />
    </IconButton>
  ) : null;

  return (
    <React.Fragment>
      <Stack
        direction="row"
        spacing={1}
        p={2}
        justifyContent="left"
        alignItems="center"
      >
        <Typography variant="h5" component="div">
          {props.layer.metadata.name}
        </Typography>
        {setSymbologyBtn}
        <TransparencyControl changeOpacity={changeOpacity} opacity={opacity} />
      </Stack>
      <Stack spacing={1} p={2}>
        {items}
      </Stack>
    </React.Fragment>
  );
};

export default LayerLegend;
