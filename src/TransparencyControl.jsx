import React, { useState } from "react";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const TransparencyControl = ({ opacity, changeOpacity }) => {
  const [oldOpacity, setOldOpacity] = useState(0.5);

  const handleChange = (event, newValue) => {
    // Capture the current opacity before changing it
    setOldOpacity(opacity);
    changeOpacity(newValue);
  };

  const toggleLayer = () => {
    if (opacity > 0) {
      // Hide the layer
      handleChange(undefined, 0);
    } else {
      // Show the layer using the old opacity
      handleChange(undefined, oldOpacity);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="center"
      alignItems="center"
      pb={2}
      pt={2}
      pr={4}
      sx={{ width: "100%" }}
    >
      <div className="transparencyControl" title="Click to toggle visibility">
        {opacity === 0 ? (
          <VisibilityOffIcon onClick={toggleLayer} />
        ) : (
          <VisibilityIcon onClick={toggleLayer} />
        )}
      </div>
      <Box sx={{ flexGrow: 1 }}>
        <Slider
          value={opacity}
          onChange={handleChange}
          aria-label="Opacity"
          min={0}
          step={0.1}
          max={1}
        />
      </Box>
    </Stack>
  );
};

export default TransparencyControl;
