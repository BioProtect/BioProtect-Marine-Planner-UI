import { Box, InputBase, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { blue } from "@mui/material/colors";
import { selectCurrentUser } from "@slices/authSlice";
import { useSelector } from "react-redux";

const TargetIcon = ({
  target_value,
  targetStatus,
  visible,
  feature,
  updateTargetValue,
}) => {
  const [editing, setEditing] = useState(false);
  const [localTargetValue, setLocalTargetValue] = useState(target_value);
  const inputRef = useRef(null);
  const userData = useSelector(selectCurrentUser);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const isNumber = (str) => /^\d+$/.test(str);

  const handleChange = (event) => {
    console.log("event ", event);
    let newValue = event.target.value;
    if (newValue > 100) {
      return;
    }
    if (isNumber(newValue) || newValue === "") {
      setLocalTargetValue(newValue === "" ? 0 : Number(newValue));
    }
  };

  const handleKeyDown = (event) => {
    console.log("event ", event);
    if (event.key === "Enter") {
      setEditing(false);
      handleBlur(event);
    }
  };

  const handleBlur = () => {
    console.log("handling blur......")
    setEditing(false);
    console.log("localTargetValue ", localTargetValue);
    console.log("feature ", feature);
    updateTargetValue(feature, localTargetValue);

  };

  const handleClick = () => {
    if (editing) return; // don’t re-trigger while already editing
    if (userData.role !== "ReadOnly") {
      setEditing(true);
      setLocalTargetValue(target_value);
    }
  };

  const getStyles = () => {
    switch (targetStatus) {
      case "Does not occur in planning area":
        return { backgroundColor: "lightgray", fontColor: "white" };
      case "Unknown":
      case "Target achieved":
        return { backgroundColor: "white", fontColor: blue[300] };
      default:
        return { backgroundColor: "rgb(255, 64, 129)", fontColor: "white" };
    }
  };

  const { backgroundColor, fontColor } = getStyles();

  return (
    <Box onClick={handleClick}>
      {editing ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            bgcolor: "#2F6AE4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InputBase
            id={`input_${feature.id}`}
            inputRef={inputRef}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={localTargetValue}
            onClick={(e) => e.stopPropagation()} // ⬅️ prevent parent Box click
            inputProps={{
              sx: {
                width: 44,
                height: 44,
                textAlign: "center",
                fontSize: "0.8rem",
                color: blue[300],
                p: 0,
              },
            }}
          />
        </Box>
      ) : (
        <Tooltip title={targetStatus} arrow>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: backgroundColor,
              color: fontColor,
              fontSize: "0.75rem",
              border: "3px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
          >
            {target_value}%
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default TargetIcon;
