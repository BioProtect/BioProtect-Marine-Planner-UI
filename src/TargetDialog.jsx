import { Box, TextField } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MarxanDialog from "./MarxanDialog";
import { isValidTargetValue } from "./Helpers";
import { toggleDialog } from "./slices/uiSlice";

const TargetDialog = ({ updateTargetValueForFeatures, ...props }) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);

  const [targetValue, setTargetValue] = useState(17);
  const [validTarget, setValidTarget] = useState(true);

  const validateTarget = () => {
    const isValid = isValidTargetValue(targetValue);
    setValidTarget(isValid);

    if (isValid) {
      updateTargetValueForFeatures(targetValue);
      dispatch(toggleDialog({ dialogName: "targetDialogOpen", isOpen: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      validateTarget();
    }
  };

  return (
    <MarxanDialog
      open={dialogStates.targetDialogOpen}
      contentWidth={240}
      offsetX={80}
      offsetY={260}
      title="Target for all features"
      onOk={() => validateTarget()}
      onCancel={() =>
        dispatch(
          toggleDialog({ dialogName: "targetDialogOpen", isOpen: false })
        )
      }
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <TextField
          id="commonTarget"
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          onKeyDown={handleKeyPress}
          error={!validTarget}
          helperText={!validTarget ? "Invalid target" : ""}
          inputProps={{
            style: { fontSize: "13px", width: "70px", textAlign: "center" },
          }}
          label="Target Value"
          variant="outlined"
          size="small"
        />
      </Box>
    </MarxanDialog>
  );
};

export default TargetDialog;
