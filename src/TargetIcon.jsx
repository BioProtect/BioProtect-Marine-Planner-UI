import React, { useEffect, useRef, useState } from "react";

import { blue } from "@mui/material/colors";
import { selectCurrentUser } from "@slices/authSlice";
import { useSelector } from "react-redux";

const TargetIcon = ({
  target_value,
  targetStatus,
  visible,
  interestFeature,
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
    let newValue = event.target.value;
    if (newValue > 100) {
      return;
    }
    if (isNumber(newValue) || newValue === "") {
      setLocalTargetValue(newValue === "" ? 0 : Number(newValue));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setEditing(false); // This will trigger onBlur
    }
  };

  const handleBlur = () => {
    setEditing(false);
    updateTargetValue(interestFeature, localTargetValue);
  };

  const handleClick = (event) => {
    if (userData.role !== "ReadOnly") {
      setEditing(true);
      setLocalTargetValue(target_value);
    }
  };

  const getStyles = () => {
    let backgroundColor;
    let fontColor;

    switch (targetStatus) {
      case "Does not occur in planning area":
        backgroundColor = "lightgray";
        fontColor = "white";
        break;
      case "Unknown":
        backgroundColor = "white";
        fontColor = blue[300];
        break;
      case "Target achieved":
        backgroundColor = "white";
        fontColor = blue[300];
        break;
      default:
        backgroundColor = "rgb(255, 64, 129)";
        fontColor = "white";
        break;
    }

    return { backgroundColor, fontColor };
  };

  const { backgroundColor, fontColor } = getStyles();

  return (
    <div
      onClick={(evt) => handleClick(evt)}
      style={{
        position: "absolute",
        left: "0px",
        top: "8px",
        display: visible ? "block" : "none",
      }}
    >
      {editing ? (
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "#2F6AE4",
            userSelect: "none",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            height: "27px",
            width: "27px",
          }}
        >
          <input
            id={`input_${interestFeature.id}`}
            ref={inputRef}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            style={{
              backgroundColor: "transparent",
              border: "none",
              height: "27px",
              width: "27px",
              fontSize: "13px",
              textAlign: "center",
              color: blue[300],
            }}
            value={localTargetValue}
          />
        </div>
      ) : (
        <div
          title={targetStatus}
          style={{
            display: "inline-flex",
            backgroundColor,
            color: fontColor,
            userSelect: "none",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            borderRadius: "50%",
            height: "27px",
            width: "27px",
            border: "1px lightgray solid",
          }}
        >
          {target_value}%
        </div>
      )}
    </div>
  );
};

export default TargetIcon;
