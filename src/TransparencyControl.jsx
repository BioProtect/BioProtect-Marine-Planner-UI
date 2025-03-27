import React, { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import Box from "@mui/material/Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";

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
    >
      <div className="transparencyControl" title="Click to toggle visibility">
        <FontAwesomeIcon
          icon={opacity === 0 ? faEyeSlash : faEye}
          style={{ color: "gainsboro" }}
          onClick={toggleLayer}
        />
      </div>
      <Box sx={{ width: 100 }}>
        <Slider
          value={opacity}
          onChange={handleChange}
          aria-label="Default"
          min={0}
          step={0.1}
          max={1}
        />
      </Box>
    </Stack>
  );
};

export default TransparencyControl;
