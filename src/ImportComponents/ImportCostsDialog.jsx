import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";
import { toggleDialog } from "../slices/uiSlice";

const ImportCostsDialog = ({
  addCost,
  deleteCostFileThenClose,
  fileUpload,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);

  const [costsFilename, setCostsFilename] = useState("");
  const [costName, setCostName] = useState("");

  const resetState = () => {
    setCostsFilename("");
    setCostName("");
  };

  const onOk = () => {
    // Add the cost to the application state
    addCost(costName);
    resetState();
    dispatch(
      toggleDialog({ dialogName: "importCostsDialogOpen", isOpen: false })
    );
  };

  const handleFileUpdate = (filename) => {
    setCostsFilename(filename);
    setCostName(filename.substring(0, filename.length - 5));
  };

  const handleClose = async () => {
    await deleteCostFileThenClose(costName);
    resetState();
    dispatch(
      toggleDialog({ dialogName: "importCostsDialogOpen", isOpen: false })
    );
  };

  return (
    <MarxanDialog
      open={dialogStates.importCostsDialogOpen}
      contentWidth={390}
      offsetY={80}
      title="Import Cost Surface"
      showCancelButton={true}
      onOk={onOk}
      onCancel={() => handleClose()}
      onClose={() => handleClose()}
    >
      <FileUpload
        {...props}
        fileUpload={fileUpload}
        fileMatch={".cost"}
        mandatory={true}
        filename={costsFilename}
        setFilename={handleFileUpdate}
        label="Costs surface filename"
        style={{ paddingTop: "15px" }}
      />
    </MarxanDialog>
  );
};

export default ImportCostsDialog;
