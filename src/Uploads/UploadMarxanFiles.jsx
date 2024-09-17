import React, { useState } from "react";

import FileUpload from "./FileUpload";
import MarxanTextField from "../MarxanTextField";
import UploadFolder from "./UploadFolder";

const UploadMarxanFiles = (props) => {
  const [zipFilename, setZipFilename] = useState("");
  console.log("zipFilename ", zipFilename);

  const handleSetZipFilename = (filename) => {
    setZipFilename(filename);
    props.setZipFilename(filename); // Call the parent function to update the filename in parent state
  };

  return (
    <div>
      <h1>Upload shit</h1>
      <UploadFolder
        label="Marxan project folder"
        filesListed={props.filesListed}
      />
      <FileUpload
        {...props}
        fileMatch={".zip"}
        destFolder="imports"
        mandatory={true}
        filename={zipFilename}
        setFilename={handleSetZipFilename}
        label="Planning grid zipped shapefile"
        style={{ paddingTop: "15px" }}
      />
      <MarxanTextField
        style={{ width: "310px" }}
        value={props.planning_grid_name}
        onChange={props.setPlanningGridName}
        floatingLabelText="Planning grid name"
      />
    </div>
  );
};

export default UploadMarxanFiles;
