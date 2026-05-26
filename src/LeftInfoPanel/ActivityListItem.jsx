import { Box, IconButton, ListItem, Stack, Typography } from "@mui/material";

import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckIcon from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { grey } from "@mui/material/colors";

const COLORS = {
  blueDeep: "#125085",
  blue: "#3F71B8",
  ink: "#4D4D4D",
  inkSoft: "#6f6f6f",
  inkFaint: "#9b9b9b",
  rule: "#e6e8eb",
  ruleSoft: "#eef0f3",
  amber: "#F5C043",
  amberDeep: "#b58324",
};

// Layered wave behind the row when the activity is on the map.
function WaveOverlay({ color = "#F5C043" }) {
  const gradId = `awg-${color.replace("#", "")}`;
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <svg
        viewBox="0 0 400 56"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={color} stopOpacity="0" />
            <stop offset="0.55" stopColor={color} stopOpacity="0.22" />
            <stop offset="1" stopColor={color} stopOpacity="0.30" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="56" fill={`url(#${gradId})`} />
        <path
          d="M0,42 C70,22 130,52 210,36 C290,20 350,46 400,34 L400,56 L0,56 Z"
          fill={color}
          fillOpacity="0.28"
        />
        <path
          d="M0,48 C80,32 160,58 240,40 C320,26 380,48 400,42 L400,56 L0,56 Z"
          fill={color}
          fillOpacity="0.22"
        />
      </svg>
    </Box>
  );
}

function ActivityOrb({ active }) {
  const background = active
    ? "linear-gradient(135deg, #fdf2d4, #f9deaa)"
    : "#eef1f4";
  const color = active ? COLORS.amberDeep : COLORS.inkFaint;
  const icon = active ? (
    <CheckIcon sx={{ fontSize: 20 }} />
  ) : (
    <BoltOutlinedIcon sx={{ fontSize: 20 }} />
  );
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "9px",
        display: "grid",
        placeItems: "center",
        background,
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );
}

const ActivityListItem = ({
  activity,
  isActive,
  layerColor,
  onClick,
  onMenuClick,
}) => {
  const title = (activity.activity || "").replaceAll("_", " ");
  const subtitle = isActive
    ? "● On map"
    : activity.source
      ? activity.source.toUpperCase()
      : "ACTIVITY";

  return (
    <ListItem
      disablePadding
      onClick={(evt) => onClick(evt, activity)}
      sx={{
        width: "90%",
        minHeight: 56,
        px: "10px",
        py: "8px",
        mb: "6px",
        borderRadius: "10px",
        border: `1px solid ${isActive ? COLORS.amber : COLORS.rule}`,
        boxShadow: isActive ? `inset 0 0 0 1px ${COLORS.amber}` : "none",
        backgroundColor: "#fff",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        transition:
          "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
        "&:hover": {
          borderColor: "#d6dde6",
          boxShadow: "0 6px 18px -10px rgba(181, 131, 36, 0.22)",
        },
      }}
    >
      {isActive && <WaveOverlay color={layerColor} />}

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <ActivityOrb active={isActive} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <Typography
          sx={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: COLORS.blueDeep,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: isActive ? COLORS.amberDeep : COLORS.inkFaint,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            fontSize: "9.5px",
            mt: "1px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </ListItem>
  );
};

export default ActivityListItem;
