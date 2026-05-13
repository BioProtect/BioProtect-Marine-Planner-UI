/**
 * FeatureProgressDemo.jsx
 *
 * Design showcase for feature rows in the LeftInfoPanel.
 * All six requirements are met in each of the three variants:
 *
 *   ✓  Editable goal (click-to-edit inline)
 *   ✓  Goal marker visible on the gauge
 *   ✓  Per-row menu button
 *   ✓  Click-to-select with clear visual indicator
 *   ✓  Preprocessed indicator (distinct from selected)
 *   ✓  Looks complete and intentional with no Prioritizr results yet
 *
 * Usage:  <FeatureProgressDemo />   (drop into any route for review)
 */

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// ── Demo data ──────────────────────────────────────────────────────────────────

const INIT_FEATURES = [
  { id: 1, name: "Maerl Beds",       goal: 30, achieved: 42, preprocessed: true,  color: "#4caf50" },
  { id: 2, name: "Seagrass Meadows", goal: 17, achieved: 11, preprocessed: false, color: "#ef5350" },
  { id: 3, name: "Kelp Forest",      goal: 50, achieved: 50, preprocessed: true,  color: "#f4a335" },
  { id: 4, name: "Cold-water Coral", goal: 25, achieved:  4, preprocessed: false, color: "#ef5350" },
  { id: 5, name: "Sandy Shore",      goal: 40, achieved: 38, preprocessed: false, color: "#f4a335" },
];

// ── Shared helpers ─────────────────────────────────────────────────────────────

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** Three-tier colour: met / close / missed */
const achieveColor = (a, t) =>
  a >= t ? "#2e7d32" : a / t >= 0.75 ? "#ed6c02" : "#c62828";

/** Point on a circle, where pct=0 → top, going clockwise */
const polar = (cx, cy, r, pct) => {
  const rad = ((pct / 100) * 360 - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};

// ── Shared state hook ──────────────────────────────────────────────────────────
//  Each VariantSection gets its own instance so they don't share selection state.

function useVariantState() {
  const [goals, setGoals] = useState(
    Object.fromEntries(INIT_FEATURES.map((f) => [f.id, f.goal])),
  );
  const [selectedId, setSelectedId]   = useState(null);
  const [editingId,  setEditingId]    = useState(null);
  const [localGoal,  setLocalGoal]    = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId !== null) setTimeout(() => inputRef.current?.focus(), 0);
  }, [editingId]);

  const startEdit = (e, id) => {
    e.stopPropagation();
    setEditingId(id);
    setLocalGoal(String(goals[id]));
  };

  const commitEdit = () => {
    if (editingId === null) return;
    const next = clamp(Number(localGoal) || 0);
    setGoals((prev) => ({ ...prev, [editingId]: next }));
    setEditingId(null);
  };

  const changeLocal = (v) => {
    if (v === "" || (/^\d+$/.test(v) && Number(v) <= 100)) setLocalGoal(v);
  };

  const toggleSelect = (e, id) =>
    setSelectedId((prev) => (prev === id ? null : id));

  return {
    goals, selectedId, editingId, localGoal, inputRef,
    startEdit, commitEdit, changeLocal, toggleSelect,
  };
}

// ── Shared row shell ───────────────────────────────────────────────────────────
//  Handles selection highlight, left-border states, and the menu button.
//  Children slot in via `avatar` and `body`.

function FeatureRow({
  feature,
  isSelected,
  onClick,
  avatar,
  body,
}) {
  const { preprocessed } = feature;

  return (
    <ListItem
      onClick={onClick}
      alignItems="flex-start"
      sx={{
        px: 1.5,
        py: 0.75,
        cursor: "pointer",
        pr: "44px",                         // room for the menu button
        borderLeft: "3px solid",
        borderLeftColor: isSelected
          ? "#1565c0"
          : preprocessed
            ? "#388e3c"
            : "transparent",
        bgcolor: isSelected ? "rgba(21,101,192,0.08)" : "transparent",
        transition: "background-color 0.15s ease, border-left-color 0.15s ease",
        "&:hover": {
          bgcolor: isSelected
            ? "rgba(21,101,192,0.12)"
            : "rgba(0,0,0,0.035)",
        },
      }}
      secondaryAction={
        <IconButton
          edge="end"
          size="small"
          onClick={(e) => e.stopPropagation()}
          sx={{ color: "grey.400", "&:hover": { color: "grey.700" } }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      }
    >
      {avatar && (
        <ListItemAvatar sx={{ minWidth: 50, mt: 0.25 }}>
          {avatar}
        </ListItemAvatar>
      )}
      {body}
    </ListItem>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function VariantSection({ id, label, description, hasResults, children }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "grey.50",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "grey.800",
              color: "white",
              fontSize: "0.58rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {id}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          {!hasResults && (
            <Chip
              label="No results"
              size="small"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                bgcolor: "#fff8e1",
                color: "#e65100",
                fontWeight: 700,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ pl: 3.5, display: "block" }}
        >
          {description}
        </Typography>
      </Box>
      <List dense disablePadding>
        {children}
      </List>
    </Paper>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VARIANT 1  —  Circle Goal  +  Notch Gauge
//
//  The goal avatar is an editable circle (like the current TargetAvatar but
//  refined).  The gauge shows a dashed goal fill when there are no results,
//  and a solid achievement bar + blue notch when results are available.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function GoalCircle({ goal, preprocessed, isEditing, onStartEdit, onCommit, localGoal, onChange, inputRef }) {
  return (
    <Box sx={{ position: "relative", userSelect: "none" }}>
      <Tooltip
        title={isEditing ? "" : "Click to edit goal"}
        arrow
        disableInteractive
        disableHoverListener={isEditing}
      >
        <Box
          onClick={isEditing ? undefined : onStartEdit}
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: preprocessed ? "#388e3c" : "#1565c0",
            bgcolor: preprocessed ? "#f1f8e9" : "#e3f2fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isEditing ? "default" : "pointer",
            transition: "box-shadow 0.15s ease",
            "&:hover": isEditing
              ? {}
              : { boxShadow: "0 0 0 3px rgba(21,101,192,0.22)" },
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={localGoal}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommit();
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 30,
                border: "none",
                background: "transparent",
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#1565c0",
                outline: "none",
                padding: 0,
              }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: preprocessed ? "#388e3c" : "#1565c0",
                lineHeight: 1,
              }}
            >
              {goal}%
            </Typography>
          )}
        </Box>
      </Tooltip>

      {/* Preprocessed badge */}
      {preprocessed && !isEditing && (
        <Tooltip title="Preprocessed" arrow disableInteractive>
          <Box
            sx={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 13,
              height: 13,
              borderRadius: "50%",
              bgcolor: "#388e3c",
              border: "1.5px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.46rem",
              color: "white",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            ✓
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}

/** Dashed blue fill = goal only; solid coloured fill + blue notch = results */
function NotchGauge({ goal, achieved, hasResults }) {
  const t = clamp(goal);

  if (!hasResults) {
    return (
      <Tooltip
        title={`Conservation goal: ${t}%  ·  Run Prioritizr to see achievement`}
        placement="top"
        arrow
        disableInteractive
      >
        <Box>
          <Box
            sx={{
              height: 8,
              borderRadius: 1.5,
              bgcolor: "grey.200",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dashed goal fill — communicates "target, not yet measured" */}
            <Box
              sx={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: `${t}%`,
                backgroundImage:
                  "repeating-linear-gradient(90deg,#1565c0 0px,#1565c0 5px,transparent 5px,transparent 9px)",
                opacity: 0.55,
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: "0.58rem",
              color: "text.disabled",
              mt: 0.3,
              lineHeight: 1,
            }}
          >
            Goal: {t}% — no results yet
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  const a = clamp(achieved);
  const color = achieveColor(a, t);

  return (
    <Tooltip
      title={`Achieved: ${a.toFixed(1)}%  ·  Goal: ${t}%`}
      placement="top"
      arrow
      disableInteractive
    >
      {/* overflow:visible so the notch can poke out top/bottom */}
      <Box
        sx={{
          height: 8,
          borderRadius: 1.5,
          bgcolor: "grey.200",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Clip the achievement fill to the track shape */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${a}%`,
              bgcolor: color,
              transition: "width 0.4s ease, background-color 0.3s ease",
            }}
          />
        </Box>

        {/* Goal notch */}
        {t > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: `${t}%`,
              top: -3,
              bottom: -3,
              width: 3,
              transform: "translateX(-50%)",
              bgcolor: "#1565c0",
              borderRadius: 0.5,
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}

function Variant1({ hasResults }) {
  const s = useVariantState();

  return (
    <VariantSection
      id="1"
      label="Circle Goal  +  Notch Gauge"
      description={
        hasResults
          ? "Achievement bar with blue notch at the goal.  Circle: click to edit goal."
          : "Dashed fill shows the goal target.  No bar drawn until results arrive."
      }
      hasResults={hasResults}
    >
      {INIT_FEATURES.map((f, i) => {
        const goal      = s.goals[f.id];
        const isEditing = s.editingId === f.id;
        const isSelected = s.selectedId === f.id;

        return (
          <React.Fragment key={f.id}>
            {i > 0 && <Divider component="li" />}
            <FeatureRow
              feature={f}
              isSelected={isSelected}
              onClick={(e) => !isEditing && s.toggleSelect(e, f.id)}
              avatar={
                <GoalCircle
                  goal={goal}
                  preprocessed={f.preprocessed}
                  isEditing={isEditing}
                  onStartEdit={(e) => s.startEdit(e, f.id)}
                  onCommit={s.commitEdit}
                  localGoal={s.localGoal}
                  onChange={s.changeLocal}
                  inputRef={isEditing ? s.inputRef : undefined}
                />
              }
              body={
                <ListItemText
                  primary={f.name}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: isSelected ? 600 : 400, lineHeight: 1.3 },
                  }}
                  secondary={
                    <NotchGauge
                      goal={goal}
                      achieved={f.achieved}
                      hasResults={hasResults}
                    />
                  }
                  secondaryTypographyProps={{ component: "div", sx: { mt: 0.5 } }}
                />
              }
            />
          </React.Fragment>
        );
      })}
    </VariantSection>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VARIANT 2  —  Inline Goal Chip  +  Bi-Track Gauge
//
//  No avatar column.  The goal is shown as a small clickable chip inline with
//  the feature name row.  Two stacked bars appear below: the top bar always
//  shows the goal, the bottom bar appears only when results are available.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BiTrackGauge({ goal, achieved, hasResults, isEditing, onStartEdit, onCommit, localGoal, onChange, inputRef }) {
  const t = clamp(goal);

  const GoalLabel = () =>
    isEditing ? (
      <input
        ref={inputRef}
        value={localGoal}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 26,
          border: "none",
          borderBottom: "1px solid #1565c0",
          background: "transparent",
          fontSize: "0.6rem",
          fontWeight: 700,
          color: "#1565c0",
          outline: "none",
          padding: 0,
          textAlign: "center",
        }}
      />
    ) : (
      <Typography
        component="span"
        onClick={onStartEdit}
        sx={{
          fontSize: "0.6rem",
          fontWeight: 700,
          color: "#1565c0",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          cursor: "pointer",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Goal
      </Typography>
    );

  if (!hasResults) {
    return (
      <Stack spacing={0.5}>
        {/* Goal row */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ width: 26, flexShrink: 0 }}>
            <GoalLabel />
          </Box>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 1,
              bgcolor: "grey.200",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${t}%`,
                height: "100%",
                bgcolor: "#1565c0",
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            sx={{
              width: 28,
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#1565c0",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {t}%
          </Typography>
        </Stack>

        {/* Met row — placeholder until results arrive */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography
            sx={{
              width: 26,
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            Met
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 1,
              border: "1px dashed",
              borderColor: "grey.300",
              bgcolor: "grey.100",
            }}
          />
          <Typography
            sx={{
              width: 28,
              fontSize: "0.65rem",
              color: "text.disabled",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            —
          </Typography>
        </Stack>
      </Stack>
    );
  }

  const a = clamp(achieved);
  const color = achieveColor(a, t);

  return (
    <Stack spacing={0.5}>
      {/* Goal row */}
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box sx={{ width: 26, flexShrink: 0 }}>
          <GoalLabel />
        </Box>
        <Box
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: "grey.200",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${t}%`,
              height: "100%",
              bgcolor: "#1565c0",
              borderRadius: 1,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
        <Typography
          sx={{
            width: 28,
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#1565c0",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {t}%
        </Typography>
      </Stack>

      {/* Met row */}
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography
          sx={{
            width: 26,
            fontSize: "0.6rem",
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          Met
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: "grey.200",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${a}%`,
              height: "100%",
              bgcolor: color,
              borderRadius: 1,
              transition: "width 0.4s ease, background-color 0.3s ease",
            }}
          />
        </Box>
        <Typography
          sx={{
            width: 28,
            fontSize: "0.65rem",
            fontWeight: 700,
            color,
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {a}%
        </Typography>
      </Stack>
    </Stack>
  );
}

function Variant2({ hasResults }) {
  const s = useVariantState();

  return (
    <VariantSection
      id="2"
      label="Inline Goal Chip  +  Bi-Track Gauge"
      description={
        hasResults
          ? "Dual rows: goal (blue) + achieved (green/amber).  Click 'Goal' label to edit."
          : "Goal bar always visible.  Met bar shows a placeholder until results exist."
      }
      hasResults={hasResults}
    >
      {INIT_FEATURES.map((f, i) => {
        const goal       = s.goals[f.id];
        const isEditing  = s.editingId === f.id;
        const isSelected = s.selectedId === f.id;

        const nameRow = (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.4 }}>
            {/* Preprocessed dot */}
            {f.preprocessed && (
              <Tooltip title="Preprocessed" arrow disableInteractive>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#388e3c",
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            )}
            <Typography
              variant="body2"
              sx={{ fontWeight: isSelected ? 600 : 400, lineHeight: 1.2 }}
            >
              {f.name}
            </Typography>
          </Stack>
        );

        return (
          <React.Fragment key={f.id}>
            {i > 0 && <Divider component="li" />}
            <FeatureRow
              feature={f}
              isSelected={isSelected}
              onClick={(e) => !isEditing && s.toggleSelect(e, f.id)}
              body={
                <ListItemText
                  disableTypography
                  primary={nameRow}
                  secondary={
                    <BiTrackGauge
                      goal={goal}
                      achieved={f.achieved}
                      hasResults={hasResults}
                      isEditing={isEditing}
                      onStartEdit={(e) => s.startEdit(e, f.id)}
                      onCommit={s.commitEdit}
                      localGoal={s.localGoal}
                      onChange={s.changeLocal}
                      inputRef={isEditing ? s.inputRef : undefined}
                    />
                  }
                />
              }
            />
          </React.Fragment>
        );
      })}
    </VariantSection>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VARIANT 3  —  Arc Badge  (unified avatar)
//
//  The avatar is a 44 px SVG ring that carries both values.
//  • No results:  ghost arc up to goal%, goal % centred, blue tick at goal
//  • With results: achievement arc fills, tick stays, centre shows achieved%
//  • Preprocessed: outer green ring
//  • Selected: outer blue ring (instead of green if not preprocessed)
//  Goal is editable by clicking the small "Goal %" label in the secondary text.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ArcBadge({ goal, achieved, hasResults, preprocessed, isSelected }) {
  const t = clamp(goal);
  const a = hasResults ? clamp(achieved) : 0;
  const color = hasResults ? achieveColor(a, t) : "#1565c0";

  const S = 44, cx = S / 2, cy = S / 2, r = 16;
  const circ = 2 * Math.PI * r;

  // Goal tick endpoints
  const [gox, goy] = polar(cx, cy, r - 4, t);
  const [gix, giy] = polar(cx, cy, r + 3, t);

  // Centre label
  const centreText = hasResults ? `${Math.round(a)}%` : `${t}%`;

  return (
    <Tooltip
      title={
        hasResults
          ? `Achieved: ${a.toFixed(1)}%  ·  Goal: ${t}%`
          : `Goal: ${t}%  ·  Run Prioritizr to see achievement`
      }
      arrow
      disableInteractive
    >
      <svg width={S} height={S} style={{ display: "block", overflow: "visible" }}>
        {/* State ring — preprocessed (green) or selected (blue), outermost */}
        {(preprocessed || isSelected) && (
          <circle
            cx={cx} cy={cy} r={r + 5}
            fill="none"
            stroke={preprocessed ? "#388e3c" : "#1565c0"}
            strokeWidth={2}
            opacity={0.45}
          />
        )}

        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth={5} />

        {/* Goal ghost arc — dashed appearance via opacity when no results */}
        {!hasResults && t > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#1565c0"
            strokeWidth={5}
            strokeDasharray={`${(t / 100) * circ} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90,${cx},${cy})`}
            opacity={0.3}
          />
        )}

        {/* Achievement arc */}
        {hasResults && a > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeDasharray={`${(a / 100) * circ} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90,${cx},${cy})`}
          />
        )}

        {/* Goal tick — always visible */}
        {t > 0 && (
          <line
            x1={gox} y1={goy}
            x2={gix} y2={giy}
            stroke="#1565c0"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Centre text */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight="800"
          fill={color}
        >
          {centreText}
        </text>
      </svg>
    </Tooltip>
  );
}

function InlineGoalEdit({ goal, isEditing, onStartEdit, onCommit, localGoal, onChange, inputRef }) {
  if (isEditing) {
    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontSize: "0.6rem", color: "text.secondary" }}>Goal:</Typography>
        <input
          ref={inputRef}
          value={localGoal}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommit();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 32,
            border: "none",
            borderBottom: "1px solid #1565c0",
            background: "transparent",
            fontSize: "0.62rem",
            fontWeight: 700,
            color: "#1565c0",
            outline: "none",
            padding: 0,
            textAlign: "center",
          }}
        />
        <Typography sx={{ fontSize: "0.6rem", color: "text.secondary" }}>%</Typography>
      </Stack>
    );
  }

  return (
    <Tooltip title="Click to edit goal" arrow disableInteractive>
      <Typography
        onClick={onStartEdit}
        sx={{
          fontSize: "0.6rem",
          color: "#1565c0",
          fontWeight: 600,
          cursor: "pointer",
          display: "inline",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Goal: {goal}%
      </Typography>
    </Tooltip>
  );
}

function Variant3({ hasResults }) {
  const s = useVariantState();

  return (
    <VariantSection
      id="3"
      label="Arc Badge  (avatar replaces circle)"
      description={
        hasResults
          ? "Arc fills to achieved %.  Blue tick = goal.  Outer ring = preprocessed / selected."
          : "Ghost arc shows the goal target.  Goal % centred.  Click label to edit."
      }
      hasResults={hasResults}
    >
      {INIT_FEATURES.map((f, i) => {
        const goal       = s.goals[f.id];
        const isEditing  = s.editingId === f.id;
        const isSelected = s.selectedId === f.id;

        return (
          <React.Fragment key={f.id}>
            {i > 0 && <Divider component="li" />}
            <FeatureRow
              feature={f}
              isSelected={isSelected}
              onClick={(e) => !isEditing && s.toggleSelect(e, f.id)}
              avatar={
                <ArcBadge
                  goal={goal}
                  achieved={f.achieved}
                  hasResults={hasResults}
                  preprocessed={f.preprocessed}
                  isSelected={isSelected}
                />
              }
              body={
                <ListItemText
                  primary={f.name}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: isSelected ? 600 : 400, lineHeight: 1.3 },
                  }}
                  secondary={
                    <InlineGoalEdit
                      goal={goal}
                      isEditing={isEditing}
                      onStartEdit={(e) => s.startEdit(e, f.id)}
                      onCommit={s.commitEdit}
                      localGoal={s.localGoal}
                      onChange={s.changeLocal}
                      inputRef={isEditing ? s.inputRef : undefined}
                    />
                  }
                  secondaryTypographyProps={{ component: "div", sx: { mt: 0.25 } }}
                />
              }
            />
          </React.Fragment>
        );
      })}
    </VariantSection>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VARIANT 4  —  Option 1 layout  +  Preprocessed chips
//
//  Closest to the mockup selected by the user:
//   • Feature colour dot  ·  name  ·  preprocessed chip
//   • Achievement % right-aligned  ·  dashed editable target pill  ·  menu
//   • Full-width bar below with a floating goal % label above the notch
//   • No-results state: empty bar + notch only, italic status text
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Small square helper (mimics checkbox icon in chips without extra import) ──
function TinySquare({ color = "currentColor" }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        width: 8,
        height: 8,
        border: "1.5px solid",
        borderColor: color,
        borderRadius: "1.5px",
        flexShrink: 0,
      }}
    />
  );
}

// ── Preprocessed / not-preprocessed chip ──────────────────────────────────────

function PreprocessedChip({ preprocessed }) {
  return preprocessed ? (
    <Chip
      icon={<TinySquare color="#1976d2" />}
      label="preprocessed"
      size="small"
      sx={{
        height: 20,
        fontSize: "0.6rem",
        fontWeight: 500,
        bgcolor: "#e3f2fd",
        color: "#1565c0",
        border: "1px solid #90caf9",
        "& .MuiChip-label": { px: 0.75 },
        "& .MuiChip-icon": { ml: 0.75, mr: -0.25 },
      }}
    />
  ) : (
    <Chip
      icon={<TinySquare color="#9e9e9e" />}
      label="not preprocessed"
      size="small"
      variant="outlined"
      sx={{
        height: 20,
        fontSize: "0.6rem",
        fontWeight: 400,
        color: "text.secondary",
        borderColor: "grey.300",
        bgcolor: "transparent",
        "& .MuiChip-label": { px: 0.75 },
        "& .MuiChip-icon": { ml: 0.75, mr: -0.25 },
      }}
    />
  );
}

// ── Dashed editable target pill ───────────────────────────────────────────────

function TargetPill({ goal, isEditing, onStartEdit, onCommit, localGoal, onChange, inputRef }) {
  return (
    <Tooltip
      title={isEditing ? "" : "Click to edit target"}
      arrow
      disableInteractive
      disableHoverListener={isEditing}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={isEditing ? undefined : onStartEdit}
        sx={{
          border: "1.5px dashed",
          borderColor: isEditing ? "#1565c0" : "grey.400",
          borderRadius: "20px",
          px: 1,
          py: 0.3,
          cursor: isEditing ? "default" : "pointer",
          bgcolor: "transparent",
          flexShrink: 0,
          transition: "border-color 0.15s ease",
          "&:hover": isEditing
            ? {}
            : { borderColor: "#1565c0", bgcolor: "rgba(21,101,192,0.04)" },
        }}
      >
        <TinySquare color={isEditing ? "#1565c0" : "#9e9e9e"} />
        <Typography
          sx={{
            fontSize: "0.6rem",
            color: "text.secondary",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          target&nbsp;
        </Typography>
        {isEditing ? (
          <>
            <input
              ref={inputRef}
              value={localGoal}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommit();
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 26,
                border: "none",
                borderBottom: "1px solid #1565c0",
                background: "transparent",
                fontSize: "0.62rem",
                fontWeight: 700,
                color: "#1565c0",
                outline: "none",
                padding: 0,
                textAlign: "center",
              }}
            />
            <Typography sx={{ fontSize: "0.6rem", color: "text.secondary", lineHeight: 1 }}>
              %
            </Typography>
          </>
        ) : (
          <Typography
            sx={{
              fontSize: "0.62rem",
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {goal}%
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );
}

// ── Full-width bar with floating goal label above the notch ───────────────────

function GaugeBar({ goal, achieved, hasResults, featureColor }) {
  const t = clamp(goal);
  const a = hasResults ? clamp(achieved) : null;
  const barColor = a !== null ? achieveColor(a, t) : null;

  return (
    // pt makes room for the floating "30%" label above the notch
    <Box sx={{ position: "relative", pt: "14px", mt: 0.25 }}>
      {/* Floating goal label */}
      {t > 0 && (
        <Typography
          sx={{
            position: "absolute",
            top: 0,
            left: `${t}%`,
            transform: "translateX(-50%)",
            fontSize: "0.58rem",
            color: "text.secondary",
            lineHeight: 1,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {t}%
        </Typography>
      )}

      {/* Track */}
      <Box
        sx={{
          height: 7,
          borderRadius: 1.5,
          bgcolor: "grey.200",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Clip inner fill */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          {a !== null && a > 0 && (
            <Box
              sx={{
                position: "absolute",
                inset: "0 auto 0 0",
                width: `${a}%`,
                bgcolor: barColor,
                transition: "width 0.4s ease, background-color 0.3s ease",
              }}
            />
          )}
        </Box>

        {/* Notch — dark neutral line so it reads over any bar colour */}
        {t > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: `${t}%`,
              top: -1,
              bottom: -1,
              width: 2,
              transform: "translateX(-50%)",
              bgcolor: "grey.600",
              borderRadius: 0.5,
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </Box>
  );
}

// ── The full Variant 4 row ─────────────────────────────────────────────────────

function Variant4({ hasResults }) {
  const s = useVariantState();

  return (
    <VariantSection
      id="4"
      label="Option 1 layout  +  preprocessed chips"
      description={
        hasResults
          ? "Colour dot · name · chip · achieved% · dashed target pill · menu. Bar below."
          : "No results yet: grey dot, italic status text, bar shows notch only."
      }
      hasResults={hasResults}
    >
      {INIT_FEATURES.map((f, i) => {
        const goal       = s.goals[f.id];
        const isEditing  = s.editingId === f.id;
        const isSelected = s.selectedId === f.id;

        // Achievement colour — grey when no results
        const achieveCol = hasResults ? achieveColor(f.achieved, goal) : null;

        return (
          <React.Fragment key={f.id}>
            {i > 0 && <Divider component="li" />}

            <Box
              onClick={(e) => !isEditing && s.toggleSelect(e, f.id)}
              sx={{
                px: 1.5,
                pt: 0.75,
                pb: 1,
                cursor: "pointer",
                borderLeft: "3px solid",
                borderLeftColor: isSelected ? "#1565c0" : "transparent",
                bgcolor: isSelected ? "rgba(21,101,192,0.08)" : "transparent",
                transition: "background-color 0.15s ease, border-left-color 0.15s ease",
                "&:hover": {
                  bgcolor: isSelected
                    ? "rgba(21,101,192,0.12)"
                    : "rgba(0,0,0,0.035)",
                },
              }}
            >
              {/* ── Name row ──────────────────────────────────────────────── */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                {/* Feature colour dot — grey until results confirm it's active */}
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: hasResults ? f.color : "grey.400",
                    flexShrink: 0,
                    transition: "background-color 0.3s ease",
                  }}
                />

                {/* Feature name */}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    flexShrink: 1,
                    minWidth: 0,
                  }}
                >
                  {f.name}
                </Typography>

                {/* Preprocessed chip */}
                <PreprocessedChip preprocessed={f.preprocessed} />

                <Box sx={{ flex: 1 }} />

                {/* Achievement % (or italic status when no results) */}
                {hasResults ? (
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: achieveCol,
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {f.achieved}%
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "text.disabled",
                      fontStyle: "italic",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.preprocessed ? "awaiting results" : "no data"}
                  </Typography>
                )}

                {/* Dashed target pill */}
                <TargetPill
                  goal={goal}
                  isEditing={isEditing}
                  onStartEdit={(e) => s.startEdit(e, f.id)}
                  onCommit={s.commitEdit}
                  localGoal={s.localGoal}
                  onChange={s.changeLocal}
                  inputRef={isEditing ? s.inputRef : undefined}
                />

                {/* Menu */}
                <IconButton
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ color: "grey.400", flexShrink: 0, ml: -0.5 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Stack>

              {/* ── Bar row ───────────────────────────────────────────────── */}
              <GaugeBar
                goal={goal}
                achieved={f.achieved}
                hasResults={hasResults}
                featureColor={f.color}
              />
            </Box>
          </React.Fragment>
        );
      })}
    </VariantSection>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Root
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function FeatureProgressDemo() {
  const [hasResults, setHasResults] = useState(false);

  return (
    <Box sx={{ p: 2.5, maxWidth: 400, mx: "auto" }}>

      {/* Header */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25 }}>
        Feature Row — Design Variants
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Features 1 &amp; 3 are preprocessed.  Click any row to select it.
        Click the goal indicator (circle, pill, arc, or target pill) to edit inline.
        Variant 4 is the new approach from the mockup.
      </Typography>

      {/* Results toggle */}
      <Paper
        variant="outlined"
        sx={{ px: 2, py: 1, mb: 3, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {hasResults ? "Prioritizr results available" : "No Prioritizr results yet"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasResults
              ? "Achievement bars and percentages are shown."
              : "Only the conservation goal is displayed."}
          </Typography>
        </Box>
        <Switch
          checked={hasResults}
          onChange={(e) => setHasResults(e.target.checked)}
          color="success"
        />
      </Paper>

      <Stack spacing={3}>
        <Variant4 hasResults={hasResults} />
        <Variant1 hasResults={hasResults} />
        <Variant2 hasResults={hasResults} />
        <Variant3 hasResults={hasResults} />
      </Stack>

      {/* Legend */}
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
        sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        {[
          { color: "#1565c0", label: "Conservation goal" },
          { color: "#2e7d32", label: "Target met" },
          { color: "#ed6c02", label: "≥ 75% of goal" },
          { color: "#c62828", label: "< 75% of goal" },
          { color: "#388e3c", label: "Preprocessed" },
        ].map(({ color, label }) => (
          <Stack key={label} direction="row" alignItems="center" spacing={0.4}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: color,
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: "0.58rem", color: "text.secondary" }}>
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
