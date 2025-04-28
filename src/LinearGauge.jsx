import { Box } from "@mui/material";
import React from "react";

const LinearGauge = ({
  protected_percent = -1,
  target_value = 0,
  scaledWidth = 100,
  color = "#00bcd4",
  visible = true,
  useFeatureColors = false,
  small = false,
}) => {
  const scale = scaledWidth / 100;
  const protectedWidth = Math.max(0, Math.round(protected_percent * scale));
  const targetOffset = Math.round(target_value * scale);
  const shortfallWidth = Math.max(0, targetOffset - protectedWidth);
  const remainingWidth = Math.max(0, scaledWidth - protectedWidth - shortfallWidth);

  const showText = protectedWidth >= 26;
  const height = small ? 2 : 18;
  const barText = `${Math.round(protected_percent)}%`;

  return (
    <Box
      display="flex"
      width={scaledWidth}
      height={height}
      opacity={protected_percent === -1 ? 0.3 : 1}
      border={visible ? "1px solid #ccc" : "none"}
      borderRadius={1}
      overflow="hidden"
      fontSize={12}
    >
      {/* Protected */}
      <Box
        title={`${protected_percent}% protected`}
        width={protectedWidth}
        bgcolor={useFeatureColors ? color : "#00bcd4"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={showText ? "white" : "transparent"}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {barText}
      </Box>

      {/* Target shortfall */}
      <Box
        title={`Target: ${target_value}%`}
        width={shortfallWidth}
        bgcolor="#ccc"
      />

      {/* Remainder */}
      <Box
        width={remainingWidth}
        bgcolor="#eee"
        color="rgba(0,0,0,0.7)"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        px={1}
        fontStyle={!visible ? "italic" : "normal"}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {!visible && "Does not occur"}
      </Box>
    </Box>
  );
};

export default LinearGauge;
