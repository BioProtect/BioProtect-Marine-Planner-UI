import MarxanDialog from "./MarxanDialog";
import React from "react";

const LoadingDialog = (props) => {
  return (
    <MarxanDialog
      {...props}
      showOverlay={true}
      showCancelButton={false}
      hideOKButton={true}
      contentWidth={358}
      title="Loading.."
      modal={true}
    />
  );
};

export default LoadingDialog;
