import {
  faArrowAltCircleRight,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import { Chip } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Typography from "@mui/material/Typography";

const LogItem = ({ message, preprocessing, className }) => {
  const hasError = Object.prototype.hasOwnProperty.call(message, "error");

  return (
    <Box className={className} sx={{ display: "flex", flexWrap: "wrap" }}>
      {/* Preprocessing complete */}
      {message.status === "Finished" && !hasError && (
        <FontAwesomeIcon
          icon={faCheckCircle}
          style={{ color: "green", marginRight: "6px" }}
        >
          Preprocessing completed
        </FontAwesomeIcon>
      )}

      {/* Upload complete */}
      {message.status === "UploadComplete" && (
        <FontAwesomeIcon
          icon={faArrowAltCircleRight}
          style={{ color: "green", marginRight: "6px" }}
        >
          Upload Complete
        </FontAwesomeIcon>
      )}

      {/* Error */}
      {hasError && (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          style={{ color: "red", marginRight: "6px" }}
        >
          {message.info}
        </FontAwesomeIcon>
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
