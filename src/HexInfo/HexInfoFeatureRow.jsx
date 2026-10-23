import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Filled green = preprocessed, hollow grey ring = not
export const dotSx = (on) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  flex: "none",
  bgcolor: on ? "brand.green" : "transparent",
  boxShadow: on ? "none" : "inset 0 0 0 1.5px #b8c4cb",
});

export const HexInfoFeatureRow = ({ row }) => {
  const name = row.alias || row.feature_name || "Unknown";
  const preprocessed = row.preprocessed ?? false;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
        px: 1.75,
        py: 0.9,
        borderBottom: "1px solid #f0f3f5",
      }}
    >
      <Box
        sx={{ ...dotSx(preprocessed), mt: "5px" }}
        title={preprocessed ? "Preprocessed" : "Not preprocessed"}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 13, lineHeight: 1.3, wordBreak: "break-word" }}
        >
          {name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
          {row.created_by ?? "-"}
        </Typography>
      </Box>
    </Box>
  );
};
