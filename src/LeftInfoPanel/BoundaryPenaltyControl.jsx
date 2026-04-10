import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Discrete preset levels — keeps users away from values that lock CBC up.
// Each step balances clustering strength vs solver speed.
const LEVELS = [
  { value: 0, label: "None", penalty: 0, hint: "Fastest. No spatial clustering." },
  { value: 1, label: "Light", penalty: 0.0005, hint: "Mild clustering. Still fast." },
  { value: 2, label: "Moderate", penalty: 0.001, hint: "Balanced clustering. Slower." },
  { value: 3, label: "Strong", penalty: 0.002, hint: "Tight clusters. Much slower." },
  { value: 4, label: "Max", penalty: 0.005, hint: "Strongest. Can take many minutes." },
];

const SLIDER_MARKS = LEVELS.map(({ value, label }) => ({ value, label }));

const penaltyToStep = (penalty) => {
  const match = LEVELS.find((l) => Math.abs(l.penalty - penalty) < 1e-9);
  return match ? match.value : 0;
};

const BoundaryPenaltyControl = ({ value, onChange, disabled }) => {
  const step = penaltyToStep(value);
  const current = LEVELS[step] ?? LEVELS[0];

  const handleChange = (_e, newStep) => {
    const next = LEVELS[newStep] ?? LEVELS[0];
    onChange(next.penalty);
  };

  return (
    <Box sx={{ px: 2, py: 1, width: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Boundary penalty
        </Typography>
        <Tooltip
          title="Higher values cluster selected planning units together but increase solver time exponentially. Start at None and raise gradually if you need tighter reserves."
          arrow
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 14, color: "text.secondary", cursor: "help" }}
          />
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {current.label} ({current.penalty})
        </Typography>
      </Stack>

      <Slider
        size="small"
        value={step}
        onChange={handleChange}
        disabled={disabled}
        step={null}
        min={0}
        max={LEVELS.length - 1}
        marks={SLIDER_MARKS}
        sx={{
          mt: 0.5,
          "& .MuiSlider-markLabel": { fontSize: "0.65rem" },
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5, fontStyle: "italic" }}
      >
        {current.hint}
      </Typography>
    </Box>
  );
};

export default BoundaryPenaltyControl;
