import React, { useState } from "react";

import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";

const ImportCostsDialog = (props) => {
  const [costsFilename, setCostsFilename] = useState("");
  const [costName, setCostName] = useState("");

  const resetState = () => {
    setCostsFilename("");
    setCostName("");
  };

  const onOk = () => {
    // Add the cost to the application state
    props.addCost(costName);
    resetState();
    props.setImportCostsDialogOpen(false);
  };

  const handleFileUpdate = (filename) => {
    setCostsFilename(filename);
    setCostName(filename.substring(0, filename.length - 5));
  };

  const handleClose = async () => {
    await props.deleteCostFileThenClose(costName);
    resetState();
    props.setImportCostsDialogOpen(false);
  };

  return (
    <MarxanDialog
      {...props}
      contentWidth={390}
      offsetY={80}
      okDisabled={props.loading}
      title="Import Cost Surface"
      showCancelButton={true}
      onOk={onOk}
      onCancel={() => handleClose()}
      onClose={() => handleClose()}
      helpLink={"user.html#importing-a-cost-surface"}
    >
      <FileUpload
        {...props}
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
