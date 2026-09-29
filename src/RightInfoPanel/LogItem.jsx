import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import { Chip } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const LogItem = ({ message, preprocessing, className }) => {
  const hasError = Object.prototype.hasOwnProperty.call(message, "error");

  return (
    <Box className={className} sx={{ display: "flex", flexWrap: "wrap" }}>
      {/* Preprocessing complete */}
      {message.status === "Finished" && !hasError && (
        <Box
          sx={{ display: "flex", alignItems: "center", color: "success.main" }}
        >
          <CheckCircleIcon sx={{ mr: 0.75 }} />
          <Typography variant="body2">Preprocessing completed</Typography>
        </Box>
      )}

      {/* Upload complete */}
      {message.status === "UploadComplete" && (
        <Box
          sx={{ display: "flex", alignItems: "center", color: "error.main" }}
        >
          <ArrowCircleRightIcon sx={{ mr: 0.75 }} />
          <Typography variant="body2">Upload Complete</Typography>
        </Box>
      )}

      {/* Error */}
      {hasError && (
        <Box
          sx={{ display: "flex", alignItems: "center", color: "error.main" }}
        >
          <WarningAmberIcon sx={{ mr: 0.75 }} />
          <Typography variant="body2">{message.info}</Typography>
        </Box>
      )}

      {/* Message */}
      <Box component="span">{message.info || message.message}</Box>
      <Accordion disableGutters sx={{ boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption">
            Live Updates ({messages.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ maxHeight: 150, overflowY: "auto", p: 1 }}>
          {messages.map((m, i) => (
            <Typography key={i} variant="caption" display="block">
              {m}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LogItem;
