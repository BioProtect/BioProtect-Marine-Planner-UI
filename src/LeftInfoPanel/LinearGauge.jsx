import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

/**
 * LinearGauge
 *
 * When no run is selected (`achieved` is null/undefined):
 *   – shows a plain blue bar filled to `target`% (original behaviour)
 *
 * When a run is selected (`achieved` is a number 0-100):
 *   – grey track
 *   – coloured fill showing how much of the feature the solution protects
 *       green  (#2e7d32) if achieved ≥ target
 *       amber  (#ed6c02) if achieved < target
 *   – thin blue vertical marker at the target position
 *   – tooltip with exact numbers
 */
export default function LinearGauge({ value: target, achieved }) {
  const hasResult = achieved != null;

  if (!hasResult) {
    // ── No run selected: plain blue target bar ─────────────────────────────
    return (
      <Box
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "grey.200",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${Math.min(target ?? 0, 100)}%`,
            bgcolor: "#1a90ff",
            borderRadius: 1,
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    );
  }

  // ── Run selected: achieved bar + target marker ──────────────────────────
  const clampedAchieved = Math.min(Math.max(achieved, 0), 100);
  const clampedTarget   = Math.min(Math.max(target  ?? 0, 0), 100);
  const met = clampedAchieved >= clampedTarget;

  const tooltipText = `Achieved: ${clampedAchieved.toFixed(1)}%  ·  Target: ${clampedTarget}%`;

  return (
    <Tooltip title={tooltipText} placement="top" arrow disableInteractive>
      <Box
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "grey.200",
          position: "relative",
          overflow: "visible", // let the target marker poke out slightly
        }}
      >
        {/* Achieved fill */}
        <Box
          sx={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${clampedAchieved}%`,
            bgcolor: met ? "#2e7d32" : "#ed6c02",
            borderRadius: 1,
            transition: "width 0.4s ease, background-color 0.3s ease",
          }}
        />

        {/* Target marker — thin blue vertical line */}
        {clampedTarget > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: `${clampedTarget}%`,
              top: -2,
              bottom: -2,
              width: 2,
              bgcolor: "#1a90ff",
              borderRadius: 0.5,
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
