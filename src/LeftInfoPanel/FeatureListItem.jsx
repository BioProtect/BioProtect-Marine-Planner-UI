import {
  Box,
  IconButton,
  InputBase,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveIcon from "@mui/icons-material/Remove";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { grey } from "@mui/material/colors";

const COLORS = {
  blueDeep: "#125085",
  blue: "#3F71B8",
  green: "#5BBD8C",
  greenWarm: "#85B658",
  successDeep: "#2f8a5e",
  amber: "#F5C043",
  amberDeep: "#b58324",
  coralDeep: "#C6603B",
  ink: "#4D4D4D",
  inkSoft: "#6f6f6f",
  inkFaint: "#9b9b9b",
  rule: "#e6e8eb",
  ruleSoft: "#eef0f3",
};

// ────────────────────────────────────────────────────────────────────────────
// Green layered wave shown behind the row when the feature is on the map.
// ────────────────────────────────────────────────────────────────────────────
function WaveOverlay() {
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
          <linearGradient
            id="feature-wave-gradient"
            x1="0"
            x2="1"
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor="#5BBD8C" stopOpacity="0" />
            <stop offset="0.55" stopColor="#5BBD8C" stopOpacity="0.22" />
            <stop offset="1" stopColor="#85B658" stopOpacity="0.30" />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="400"
          height="56"
          fill="url(#feature-wave-gradient)"
        />

        <path
          d="M0,42 C70,22 130,52 210,36 C290,20 350,46 400,34 L400,56 L0,56 Z"
          fill="rgba(91,189,140,.28)"
        />

        <path
          d="M0,48 C80,32 160,58 240,40 C320,26 380,48 400,42 L400,56 L0,56 Z"
          fill="rgba(133,182,88,.22)"
        />

        <path
          d="M0,52 C100,38 200,60 300,46 C340,40 380,52 400,48 L400,56 L0,56 Z"
          fill="rgba(91,189,140,.18)"
        />
      </svg>
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Leading orb — shield outline for idle/preprocessed/selected,
// check for met, dash for mixed, X for missed.
// Same shield icon for idle/preprocessed/selected, only the tile colour
// changes.
// ────────────────────────────────────────────────────────────────────────────
function FeatureOrb({ state }) {
  let background = "#eef1f4";
  let color = COLORS.inkFaint;
  let icon = <ShieldOutlinedIcon sx={{ fontSize: 20 }} />;

  if (state === "preprocessed") {
    background = "linear-gradient(135deg, #e3eef9, #cfdef3)";
    color = COLORS.blueDeep;
  }

  if (state === "selected") {
    background = "linear-gradient(135deg, #d6e5f3, #b9d2ea)";
    color = COLORS.blueDeep;
  }

  if (state === "achieved") {
    background = "linear-gradient(135deg, #e1f4ea, #c5ebd6)";
    color = COLORS.successDeep;
    icon = <CheckIcon sx={{ fontSize: 20 }} />;
  }

  if (state === "mixed") {
    background = "linear-gradient(135deg, #fdf2d4, #f9deaa)";
    color = COLORS.amberDeep;
    icon = <RemoveIcon sx={{ fontSize: 20 }} />;
  }

  if (state === "missed") {
    background = "linear-gradient(135deg, #fde7e0, #fbd5c9)";
    color = COLORS.coralDeep;
    icon = <CloseIcon sx={{ fontSize: 18 }} />;
  }

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

// ────────────────────────────────────────────────────────────────────────────
// Result figures — tri-state.
//
//   verdict   figures               caption          badge
//   ───────   ───────────────────   ──────────────   ─────
//   met       <min>%/<target>%      Min / Target     green ✓
//   mixed     <min>–<max>%/<tgt>%   Range / Target   amber –
//   missed    <max>%/<target>%      Max / Target     coral ✕
// ────────────────────────────────────────────────────────────────────────────
function ResultCluster({ verdict, primary, secondary, target }) {
  // primary  = the single number shown for met/missed (or low end of range)
  // secondary = high end of range when verdict === "mixed", else null

  const isRange = verdict === "mixed" && secondary != null;

  const verdictColor =
    verdict === "met"
      ? COLORS.successDeep
      : verdict === "missed"
        ? COLORS.coralDeep
        : COLORS.amberDeep;

  const badgeBg =
    verdict === "met"
      ? COLORS.green
      : verdict === "missed"
        ? COLORS.coralDeep
        : COLORS.amber;

  const caption =
    verdict === "met"
      ? isRange
        ? "Min / Target"
        : "Result / Target"
      : verdict === "missed"
        ? "Max / Target"
        : "Range / Target";

  return (
    <Stack spacing={0.25} alignItems="flex-end">
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            backgroundColor: badgeBg,
          }}
        >
          {verdict === "met" && <CheckIcon sx={{ fontSize: 10 }} />}
          {verdict === "missed" && <CloseIcon sx={{ fontSize: 10 }} />}
          {verdict === "mixed" && <RemoveIcon sx={{ fontSize: 10 }} />}
        </Box>

        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          <Box component="span" sx={{ color: verdictColor }}>
            {primary}
          </Box>
          {isRange && (
            <>
              <Box
                component="span"
                sx={{ color: COLORS.inkFaint, fontWeight: 500, mx: "1px" }}
              >
                –
              </Box>
              <Box component="span" sx={{ color: verdictColor }}>
                {secondary}
              </Box>
            </>
          )}
          <Box component="span" sx={{ color: COLORS.inkFaint }}>
            %
          </Box>
          <Box component="span" sx={{ color: COLORS.inkFaint, mx: "2px" }}>
            /
          </Box>
          <Box
            component="span"
            sx={{
              color: COLORS.inkSoft,
              fontSize: "0.82em",
            }}
          >
            {target}
          </Box>
          <Box component="span" sx={{ color: COLORS.inkFaint }}>
            %
          </Box>
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          color: COLORS.inkFaint,
          fontWeight: 700,
        }}
      >
        {caption}
      </Typography>
    </Stack>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Subtitle copy per state (single-run / no-result baseline).
// Multi-run results override with a "K of N runs met" copy at render time.
// ────────────────────────────────────────────────────────────────────────────
const SUBTITLE_BY_STATE = {
  idle: "Awaiting preprocess",
  preprocessed: "Ready to run",
  selected: "● On map",
  achieved: "Target met",
  mixed: "Mixed across runs",
  missed: "Target missed",
};

const SUBTITLE_COLOR_BY_STATE = {
  idle: COLORS.inkFaint,
  preprocessed: COLORS.blueDeep,
  selected: COLORS.successDeep,
  achieved: COLORS.successDeep,
  mixed: COLORS.amberDeep,
  missed: COLORS.coralDeep,
};

// ────────────────────────────────────────────────────────────────────────────
// FeatureListItem
// ────────────────────────────────────────────────────────────────────────────
const FeatureListItem = ({
  id,
  item,
  isActive,
  achieved,
  achievedMin,
  achievedMax,
  metCount,
  runCount,
  target_value,
  handleIconClick,
  handleTargetChange,
  handleItemClick,
}) => {
  const hasResult = achieved != null;

  // Multi-run aggregation — only when runCount > 1 and we have min/max
  const isMultiRun =
    hasResult &&
    runCount != null &&
    runCount > 1 &&
    achievedMin != null &&
    achievedMax != null;

  const targetNum = Number(target_value ?? 0);

  let verdict; // "met" | "mixed" | "missed" | undefined (when no result yet)
  if (hasResult) {
    if (isMultiRun) {
      if (achievedMin >= targetNum) verdict = "met";
      else if (achievedMax < targetNum) verdict = "missed";
      else verdict = "mixed";
    } else {
      verdict = achieved >= targetNum ? "met" : "missed";
    }
  }

  const state = hasResult
    ? verdict === "met"
      ? "achieved"
      : verdict === "mixed"
        ? "mixed"
        : "missed"
    : isActive
      ? "selected"
      : item.preprocessed
        ? "preprocessed"
        : "idle";

  // Subtitle copy — dynamic for multi-run
  const subtitle =
    isMultiRun && metCount != null
      ? `${metCount} of ${runCount} runs met`
      : SUBTITLE_BY_STATE[state];

  // ── Inline target editing (matches the old TargetAvatar behaviour) ────────
  const [editing, setEditing] = useState(false);
  const [localTargetValue, setLocalTargetValue] = useState(target_value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setLocalTargetValue(target_value);
  }, [target_value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleTargetInputChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d*$/.test(val) && Number(val) <= 100)) {
      setLocalTargetValue(val === "" ? "" : Number(val));
    }
  };

  const commitEdit = () => {
    setEditing(false);
    const next = Number(localTargetValue) || 0;
    if (next === Number(target_value)) return;
    handleTargetChange(item, next);
  };

  const startEdit = (evt) => {
    evt.stopPropagation();
    if (!hasResult) setEditing(true);
  };

  // ── Result cluster prop derivation ────────────────────────────────────────
  // verdict       primary             secondary
  // met           min (or single)     —
  // mixed         min                 max
  // missed        max (or single)     —
  let resultPrimary;
  let resultSecondary = null;
  if (verdict === "met") {
    resultPrimary = Math.round(isMultiRun ? achievedMin : achieved);
  } else if (verdict === "missed") {
    resultPrimary = Math.round(isMultiRun ? achievedMax : achieved);
  } else if (verdict === "mixed") {
    resultPrimary = Math.round(achievedMin);
    resultSecondary = Math.round(achievedMax);
  }

  return (
    <ListItem
      disablePadding
      onClick={(evt) => handleItemClick(evt, item)}
      sx={{
        width: "100%",
        minHeight: 56,
        px: "10px",
        py: "8px",
        mb: "6px",
        borderRadius: "10px",
        border: `1px solid ${isActive ? COLORS.blue : COLORS.rule}`,
        boxShadow: isActive ? `inset 0 0 0 1px ${COLORS.blue}` : "none",
        backgroundColor: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        transition:
          "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
        "&:hover": {
          borderColor: "#d6dde6",
          boxShadow: "0 6px 18px -10px rgba(18, 80, 133, 0.22)",
        },
      }}
    >
      {isActive && <WaveOverlay />}

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <FeatureOrb state={state} />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: COLORS.blueDeep,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.alias.replaceAll("_", " ")}
        </Typography>

        <Typography
          sx={{
            color: SUBTITLE_COLOR_BY_STATE[state],
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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: 90,
          position: "relative",
          zIndex: 1,
        }}
      >
        {hasResult ? (
          <ResultCluster
            verdict={verdict}
            primary={resultPrimary}
            secondary={resultSecondary}
            target={Math.round(targetNum)}
          />
        ) : editing ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <InputBase
              inputRef={inputRef}
              value={localTargetValue}
              onChange={handleTargetInputChange}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") {
                  setLocalTargetValue(target_value);
                  setEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{
                width: 48,
                fontWeight: 700,
                fontSize: 15,
                color: COLORS.blueDeep,
                backgroundColor: "#fff",
                border: `1.5px solid ${COLORS.blue}`,
                borderRadius: "6px",
                px: "6px",
                py: "2px",
                boxShadow: "0 0 0 3px rgba(63, 113, 184, 0.18)",
                "& input": {
                  textAlign: "right",
                  p: 0,
                },
              }}
            />

            <Typography
              sx={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                color: COLORS.inkFaint,
                fontWeight: 700,
              }}
            >
              %
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={0.25} alignItems="flex-end">
            <Box
              onClick={startEdit}
              sx={{
                display: "inline-flex",
                alignItems: "baseline",
                borderRadius: "6px",
                px: "5px",
                py: "1px",
                cursor: "text",
                "&:hover": {
                  backgroundColor: "#f3f7fb",
                },
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: COLORS.blueDeep,
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                {target_value}
              </Typography>

              <Typography
                component="span"
                sx={{
                  color: COLORS.inkSoft,
                  fontWeight: 600,
                  fontSize: "0.7em",
                  ml: "1px",
                }}
              >
                %
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                color: COLORS.inkFaint,
                fontWeight: 700,
              }}
            >
              Target
            </Typography>
          </Stack>
        )}
      </Box>

      <IconButton
        edge="end"
        onClick={(evt) => {
          evt.stopPropagation();
          handleIconClick(evt, id);
        }}
        sx={{
          ml: 0.5,
          width: 26,
          height: 26,
          borderRadius: "6px",
          color: grey[400],
          position: "relative",
          zIndex: 1,
          "&:hover": {
            backgroundColor: COLORS.ruleSoft,
            color: COLORS.blueDeep,
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </ListItem>
  );
};

export default FeatureListItem;
