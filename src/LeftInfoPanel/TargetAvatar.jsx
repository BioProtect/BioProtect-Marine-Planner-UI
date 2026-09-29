import { Avatar, InputBase, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { blue } from "@mui/material/colors";

const TargetAvatar = ({
  target_value,
  targetStatus,
  visible,
  feature,
  updateTargetValue,
}) => {
  const [editing, setEditing] = useState(false);
  const [localTargetValue, setLocalTargetValue] = useState(target_value);
  const inputRef = useRef(null);

  // Keep local edit state in sync with the prop so we don't commit a stale
  // initial value when the parent updates target_value (e.g. after the
  // project features cache loads).
  useEffect(() => {
    if (!editing) setLocalTargetValue(target_value);
  }, [target_value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const isNumber = (str) => /^\d*$/.test(str);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "" || (isNumber(val) && Number(val) <= 100)) {
      setLocalTargetValue(val === "" ? "" : Number(val));
    }
  };

  const handleCommit = () => {
    setEditing(false);
    const next = Number(localTargetValue) || 0;
    if (next === Number(target_value)) return;
    updateTargetValue(feature, next);
  };

  const getColors = () => {
    switch (targetStatus) {
      case "Does not occur in planning area":
        return { bg: "lightgray", fg: "white" };
      case "Unknown":
      case "Target achieved":
        return { bg: "white", fg: blue[700] };
      default:
        return { bg: blue[300], fg: "white" };
    }
  };

  if (!visible) return null;

  const { bg, fg } = getColors();

  return (
    <Tooltip title={targetStatus} arrow disableHoverListener={editing}>
      <Avatar
        onClick={(e) => {
          e.stopPropagation();
          if (!editing) setEditing(true);
        }}
        sx={{
          bgcolor: bg,
          color: fg,
          fontSize: "0.75rem",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        {editing ? (
          <InputBase
            inputRef={inputRef}
            value={localTargetValue}
            onChange={handleChange}
            onBlur={handleCommit}
            onKeyDown={(e) => e.key === "Enter" && handleCommit()}
            onClick={(e) => e.stopPropagation()}
            inputProps={{
              sx: {
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                color: blue[300],
                p: 0,
              },
            }}
          />
        ) : (
          `${target_value}%`
        )}
      </Avatar>
    </Tooltip>
  );
};

export default TargetAvatar;
