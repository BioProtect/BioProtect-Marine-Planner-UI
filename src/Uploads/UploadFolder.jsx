import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

const UploadFolder = ({ label, filesListed }) => {
  const [folderUploadText, setFolderUploadText] = useState("");
  const [active, setActive] = useState(false);

  const handleClick = () => setActive(true);

  const handleChange = (e) => {
    const files = e.target.files;
    filesListed(files);
    setFolderUploadText(files.length + " files");
    setActive(false);
  };

  const addDirectory = (node) => {
    if (node) {
      node.directory = true;
      node.webkitdirectory = true;
    }
  };

  return (
    <div>
      <div
        className="uploadLabel"
        style={{
          color: active ? "rgb(0, 188, 212)" : "rgba(0, 0, 0, 0.3)",
        }}
      >
        {label}
      </div>
      <div className="uploadFileField">
        <div className="uploadFileFieldIcon">
          <div style={{ display: "inline-flex" }}>
            <label htmlFor="folderSelector">
              <FontAwesomeIcon
                icon={faFolder}
                title="Click to select a Marxan project folder"
                style={{ cursor: "pointer", display: "inline-flex" }}
              />
            </label>
          </div>
          <input
            id="folderSelector"
            ref={addDirectory}
            type="file"
            onChange={handleChange}
            onClick={handleClick}
            style={{ display: "none", width: "10px" }}
          />
        </div>
        <div className="uploadFileFieldLabel">{folderUploadText}</div>
      </div>
    </div>
  );
};

export default UploadFolder;
