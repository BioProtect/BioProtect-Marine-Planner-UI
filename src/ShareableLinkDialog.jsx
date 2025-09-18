import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "./MarxanDialog";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "@slices/uiSlice";

const ShareableLinkDialog = ({ shareableLinkUrl }) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [link, setLink] = useState(shareableLinkUrl);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(
      () => {
        alert("Link copied to clipboard!");
      },
      () => {
        alert("Failed to copy. Your browser may not support this feature.");
      }
    );
  };

  const closeDialog = () =>
    dispatch(
      toggleDialog({ dialogName: "shareableLinkDialogOpen", isOpen: false })
    );

  return (
    <MarxanDialog
      open={dialogStates.shareableLinkDialogOpen}
      onOk={() => closeDialog()}
      contentWidth={600}
      height={150}
      offsetX={80}
      offsetY={360}
      title="Shareable Link"
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          value={link}
          onChange={(e) => setLink(e.target.value)}
          multiline
          rows={2}
          variant="outlined"
          label="Shareable Link"
          fullWidth
          InputProps={{
            style: { fontSize: "14px" },
          }}
          InputLabelProps={{
            style: { fontSize: "16px" },
          }}
        />
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faClipboard} />}
          onClick={copyToClipboard}
          style={{ alignSelf: "flex-start" }}
        >
          Copy to Clipboard
        </Button>
      </Box>
    </MarxanDialog>
  );
};

export default ShareableLinkDialog;
