import { Box } from "@mui/material";
import LogItem from "./LogItem";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import Badge from "@mui/material/Badge";

const typeColors = {
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  success:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  error: "bg-destructive/15 text-destructive border-destructive/20",
  warning:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
};

const Log = ({ messages = [], preprocessing, mouseEnter, mouseLeave }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessages = () =>
    messages.map((message, index) => {
      let className = "";
      let updatedMessage = { ...message };

      // message cleaning and formatting
      switch (message.status) {
        case "Started":
        case "Queued":
        case "Preparing":
          className = "logItem logStart";
          break;

        case "Running":
        case "Preprocessing":
        case "FeatureCreated":
          className = "logItem logMessageBlock";
          break;

        case "Finished":
        case "UploadComplete":
        case "Error":
        case "Failed":
          className = "logItem logFinish";
          break;

        default:
          className = "logItem logNone";
          break;
      }

      // handle error override
      if (message.hasOwnProperty("error")) {
        updatedMessage.info = message.error;
      }

      return (
        <LogItem
          key={index}
          message={updatedMessage}
          preprocessing={preprocessing}
          className={className}
        />
      );
    });

  return (
    <Box
      id="log"
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {renderMessages()}
    </Box>
  );
};

export default Log;
