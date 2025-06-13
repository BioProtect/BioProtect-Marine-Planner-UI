import { Link, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import MarxanDialog from "./MarxanDialog";
import React from "react";
import ToolbarButton from "./ToolbarButton";
import { toggleDialog } from "./slices/uiSlice";

const UpdateWDPADialog = ({
  registry,
  newWDPAVersion,
  updateWDPA,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const htmlContent = registry
    ? `${registry.WDPA.latest_version} is available. Details <a href='${registry.WDPA.metadataUrl}' target='_blank'>here</a>. Click below to update.`
    : "";

  const closeDialog = () =>
    dispatch(
      toggleDialog({ dialogName: "updateWDPADialogOpen", isOpen: false })
    );

  return (
    <MarxanDialog
      loading={uiState.loading}
      open={uiState.dialogStates.updateWDPADialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      contentWidth={380}
      offsetY={260}
      title="Update WDPA"
    >
      {newWDPAVersion && (
        <div>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 2 }}>
            <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </Typography>
          <ToolbarButton
            title="Update WDPA"
            onClick={updateWDPA}
            label="Update"
            disabled={uiState.loading}
          />
        </div>
      )}
    </MarxanDialog>
  );
};

export default UpdateWDPADialog;
