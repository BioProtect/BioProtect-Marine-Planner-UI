import { useEffect, useRef } from "react";

import Badge from "@mui/material/Badge";
import { Box } from "@mui/material";
import LogItem from "./LogItem";

const typeColors = {
  Started: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Preprocessing:
    "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Finished:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  error: "bg-destructive/15 text-destructive border-destructive/20",
  Running:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
};

const Log = ({ messages = [], preprocessing, mouseEnter, mouseLeave }) => {
  console.log("messages ", messages);
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
    // <Box
    //   id="log"
    //   onMouseEnter={mouseEnter}
    //   onMouseLeave={mouseLeave}
    //   sx={{
    //     display: "flex",
    //     flexDirection: "column",
    //   }}
    // >
    //   {renderMessages()}
    // </Box>
    <div className="w-full rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/30">
        {messages.length > 0 && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
        <span className="font-medium text-sm text-foreground">
          Running Prioritizr
        </span>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {messages.length}
        </Badge>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="overflow-y-auto font-mono text-xs"
        style={{ "calc(100vh - 120px)": "100%" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 px-4 py-1.5 hover:bg-muted/50 transition-colors"
          >
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {msg.elapsedtime}
            </span>

            {msg.status && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                  typeColors[msg.status] || ""
                }`}
              >
                {msg.status}
              </span>
            )}

            <span className="text-foreground break-all">
              {msg.info || msg.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Log;
