import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import {
  Sync as SyncIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { setFeatureDatasetFilename } from "../slices/uiSlice";

// FileUpload component refactored to use React 18 and MUI 5
const FileUpload = (props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [destinationFolder, setDestinationFolder] = useState("");
  const id = `upload-${props.parameter}`;

  const handleChange = async (e) => {
    if (props.destFolder) {
      setDestinationFolder(props.destFolder);
    }

    if (e.target.files.length) {
      setLoading(true);
      const target = e.target.files[0];
      // upload file  - if its an impact it uploads slightly differently
      try {
        let response;
        if (props.selectedActivity) {
          response = await props.fileUpload({
            value: target,
            filename: target.name,
            destFolder: destinationFolder,
            activity: props.selectedActivity,
          });
        } else {
          response = await props.fileUpload(
            target,
            target.name,
            destinationFolder
          );
        }
        dispatch(setFeatureDatasetFilename(response.file));
        props.setMessage(response.info);
      } catch (error) {
        console.error("File upload error: ", error);
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
        {props.label}
      </Typography>
      <Box display="flex" alignItems="center">
        <IconButton
          component="label"
          sx={{ cursor: "pointer" }}
          title="Click to upload a file"
        >
          <UploadFileIcon />
          <input
            type="file"
            onChange={handleChange}
            onClick={handleClick}
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
