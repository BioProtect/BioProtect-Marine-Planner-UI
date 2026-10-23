import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import BPDialog from "./BPDialog";
import React from "react";
import { toggleDialog } from "@slices/uiSlice";

const ResetDialog = ({ onOk, loading }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);

  return (
    <BPDialog
      open={uiState.dialogStates.resetDialogOpen}
      loading={uiState.loading}
      onOk={onOk}
      onCancel={() =>
        dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: false }))
      }
      onClose={() =>
        dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: false }))
      }
      contentWidth={240}
      title="Reset database"
      okLabel="Yes"
      cancelLabel="No"
      showCancelButton={true}
    >
      <Box>
        <Typography variant="body1">Are you sure you want to reset?</Typography>
      </Box>
    </BPDialog>
  );
};

export default ResetDialog;
