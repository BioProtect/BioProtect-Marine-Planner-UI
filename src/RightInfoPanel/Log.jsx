import { useEffect, useRef, useMemo } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

// ---------- status → colour map (MUI sx values) ----------
const STATUS_CHIP = {
  Queued: { bg: "#e3f2fd", fg: "#1565c0" },
  Preparing: { bg: "#e3f2fd", fg: "#1565c0" },
  Started: { bg: "#e3f2fd", fg: "#1565c0" },
  Running: { bg: "#fff8e1", fg: "#f57f17" },
  Finished: { bg: "#e8f5e9", fg: "#2e7d32" },
  UploadComplete: { bg: "#e8f5e9", fg: "#2e7d32" },
  FeatureCreated: { bg: "#e8f5e9", fg: "#2e7d32" },
  Failed: { bg: "#ffebee", fg: "#c62828" },
  Error: { bg: "#ffebee", fg: "#c62828" },
  WebSocketError: { bg: "#ffebee", fg: "#c62828" },
  SocketClosedUnexpectedly: { bg: "#ffebee", fg: "#c62828" },
  SocketClosedCleanly: { bg: "#f3e5f5", fg: "#6a1b9a" },
};

const formatElapsed = (seconds) => {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

// --------------------------------------------------------
// <Log />
// --------------------------------------------------------
const Log = ({ messages = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Wait one frame so the browser has laid out the new row before scrolling.
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages.length]);

  // Derive whether the stream is "live" from the last message status.
  const isLive = useMemo(() => {
    if (messages.length === 0) return false;
    const last = messages[messages.length - 1];
    return ["Running", "Queued", "Preparing", "Started"].includes(last.status);
  }, [messages]);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ---- Header ---- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        {/* Pulsing dot when live */}
        {isLive && (
          <Box sx={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
            <Box
              sx={{
                "@keyframes ping": {
                  "0%": { transform: "scale(1)", opacity: 0.75 },
                  "75%, 100%": { transform: "scale(2.2)", opacity: 0 },
                },
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
            <Box
              sx={{
                position: "relative",
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#4caf50",
              }}
            />
          </Box>
        )}

        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
          Run log
        </Typography>

        <Chip
          label={messages.length}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            fontVariantNumeric: "tabular-nums",
          }}
        />
      </Box>

      {/* ---- Entries ---- */}
      <Box
        ref={scrollRef}
        sx={{
          overflowY: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: "0.75rem",
          flex: 1,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary", fontSize: "0.8rem" }}>
            Waiting for run output...
          </Box>
        )}

        {messages.map((msg, idx) => {
          const status = msg.status || "";
          const chipColors = STATUS_CHIP[status];
          const elapsed = formatElapsed(msg.elapsed);
          const text = msg.message || msg.info || msg.error || "";
          const hasError = Object.prototype.hasOwnProperty.call(msg, "error");

          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                px: 2,
                py: 0.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: "action.hover" },
                ...(hasError && { bgcolor: "error.main", color: "error.contrastText", "&:hover": { bgcolor: "error.dark" } }),
              }}
            >
              {/* Timestamp / elapsed */}
              <Box
                component="span"
                sx={{
                  flexShrink: 0,
                  color: hasError ? "inherit" : "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 48,
                }}
              >
                {elapsed || msg.time || ""}
              </Box>

              {/* Status chip */}
              {chipColors && (
                <Box
                  component="span"
                  sx={{
                    flexShrink: 0,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    bgcolor: hasError ? "transparent" : chipColors.bg,
                    color: hasError ? "inherit" : chipColors.fg,
                    border: hasError ? "1px solid currentColor" : "none",
                    lineHeight: 1.4,
                  }}
                >
                  {status}
                </Box>
              )}

              {/* Message text */}
              <Box
                component="span"
                sx={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  color: hasError ? "inherit" : "text.primary",
                  lineHeight: 1.5,
                }}
              >
                {text}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Log;
