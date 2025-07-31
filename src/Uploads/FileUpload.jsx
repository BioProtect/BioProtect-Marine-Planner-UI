import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import UploadFile from "@mui/icons-material/UploadFileTwoTone";
import { setFeatureFilename } from "@slices/featureSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";

// FileUpload component refactored to use React 18 and MUI 5
const FileUpload = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui)
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [destinationFolder, setDestinationFolder] = useState("imports");
  const id = `upload-${props.filename}`;
  const { showMessage } = useAppSnackbar();


  const handleChange = async (e) => {
    if (props.destFolder) {
      setDestinationFolder(props.destFolder);
    }

    if (e.target.files.length) {
      setLoading(true);
      const target = e.target.files[0];
      const filename = target.name;
      // upload file  - if its an impact it uploads slightly differently
      try {
        let response;
        if (uiState.selectedActivity) {
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
        if (!response || !response.file) {
          throw new Error("Invalid response from upload");
        }
        console.log("response after file upload ", response);
        dispatch(setFeatureFilename(response.file))
        showMessage(response.info, "success")
      } catch (error) {
        showMessage(`Upload error: ${error.message || error}`, "error");
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
        {props.label} {props.filename}
      </Typography>

      <Box display="flex" alignItems="center">

        <IconButton
          component="label"
          sx={{ cursor: "pointer" }}
          title="Click to upload a file"
          onChange={handleChange}
          onClick={handleClick}
        >
          <UploadFile color="primary" fontSize='large' />
          <input
            type="file"
            accept={props.fileMatch}
            id={id}
            style={{ display: "none" }}
          />
        </IconButton>

        <Typography
          sx={{ width: "168px", textOverflow: "ellipsis" }}
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
