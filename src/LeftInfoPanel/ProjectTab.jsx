import React, { useRef, useState } from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Typography from "@mui/material/Typography";
import { selectUserData } from "../slices/authSlice";
import { useSelector } from "react-redux";

const ProjectTabContent = ({
  toggleProjectPrivacy,
  metadata,
  owner,
  updateDetails
}) => {
  const userData = useSelector(selectUserData);
  const [editing, setEditing] = useState(false);
  const handleChange = (e) => {
    setEditing(false);
    updateDetails(e);
  };

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editing ? (
              <span onClick={setEditing(true)}>
                {metadata.DESCRIPTION}
              </span>
            ) : (
              <input
                id="descriptionEdit"
                value={metadata.DESCRIPTION || ""}
                className="descriptionEditBox"
                onChange={(e) => handleChange(e)}
              ></input>
            )}
          </Typography>
          <Typography variant="h5" component="div">
            Created
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <span className="createDate">{metadata.CREATEDATE}</span>
            {userData.username !== owner && (
              <span>
                <span className="tabTitle tabTitleTopMargin">Created by</span>
                <span className="createDate">{owner}</span>
              </span>
            )}
            {metadata.OLDVERSION && (
              <span className="tabTitle tabTitleTopMargin">
                Imported project
              </span>
            )}
          </Typography>
        </CardContent>
        <CardActions>
          {userData.role !== "ReadOnly" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(metadata.PRIVATE)}
                  onChange={toggleProjectPrivacy}
                  size="small"
                />
              }
              label="Private"
              sx={{ fontSize: "12px" }}
            />
          )}
        </CardActions>
      </Card>
    </div>
  );
};

export default ProjectTabContent;
