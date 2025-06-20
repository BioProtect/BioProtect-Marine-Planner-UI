import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import {
  Sync as SyncIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import { setSnackbarMessage, setSnackbarOpen } from "@slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import { setFeatureDatasetFilename } from "@slices/featureSlice";

// FileUpload component refactored to use React 18 and MUI 5
const FileUpload = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui)
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [destinationFolder, setDestinationFolder] = useState("imports");
  const id = `upload-${props.filename}`;

  const handleChange = async (e) => {
    console.log("handling change in file upload ", e);
    console.log("handling change in file upload target ", e.target);
    if (props.destFolder) {
      setDestinationFolder(props.destFolder);
    }

    if (e.target.files.length) {
      setLoading(true);
      const target = e.target.files[0];
      console.log("target ", target);
      const filename = target.name;
      console.log("destinationFolder -- ", destinationFolder)
      // upload file  - if its an impact it uploads slightly differently
      try {
        let response;
        if (uiState.selectedActivity) {
          console.log("selectedActivity ", uiState.selectedActivity);
          response = await props.fileUpload({
            value: target,
            filename: filename,
            destFolder: destinationFolder,
            activity: uiState.selectedActivity.activity,
          });
        } else {
          response = await props.fileUpload(
            target,
            filename,
            destinationFolder,
          );
        }
        console.log(response)
        dispatch(setSnackbarOpen(true));
        dispatch(setSnackbarMessage(response.info));
      } catch (error) {
        dispatch(setSnackbarOpen(true));
        dispatch(setSnackbarMessage("Error: ", error));
      } finally {
        setLoading(false);
        setActive(false);
      }

      // Reset file input
      document.getElementById(id).value = "";
    }
  };

  const handleClick = () => {
    setActive(true);
  };

  return (
    <Box component="form" sx={{ ...props.style }}>
      <Typography
        sx={{
          color: active ? "primary.main" : "text.secondary",
        }}
      >
        {props.label} - {props.filename}
      </Typography>

      <Box display="flex" alignItems="center">

        <IconButton
          component="label"
          sx={{ cursor: "pointer" }}
          title="Click to upload a file"
          onChange={handleChange}
          onClick={handleClick}
        >
          <UploadFileIcon />
          <input
            type="file"
            accept={props.fileMatch}
            id={id}
            style={{ display: "none" }}
          />
        </IconButton>

        <Typography
          sx={{ width: "168px", textOverflow: "ellipsis", overflow: "hidden" }}
        >
          {props.filename}
        </Typography>
        {loading && (
          <CircularProgress size={24} sx={{ ml: 1, color: "secondary.main" }} />
        )}
      </Box>
    </Box>
  );
};

export default FileUpload;
