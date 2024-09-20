import React, { useRef, useState } from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Typography from "@mui/material/Typography";

const ProjectTabContent = (props) => {
  const toggleProjectPrivacy = (event) => {
    props.toggleProjectPrivacy(event.target.checked);
  };

  return (
    <div>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Description
          </Typography>
          {props.userRole !== "ReadOnly" && (
            <TextareaAutosize
              minRows={5}
              id="descriptionEdit"
              ref={props.descriptionEditRef}
              style={{ display: props.editingDescription ? "block" : "none" }}
              className="descriptionEditBox"
              onKeyDown={props.handleKeyPress}
              onBlur={props.handleBlur}
            />
          )}
          <Typography variant="body2" color="text.secondary">
            <p
              className="description"
              onClick={props.startEditingDescription}
              title={props.userRole === "ReadOnly" ? "" : "Click to edit"}
            >
              {props.metadata.DESCRIPTION}
            </p>
          </Typography>
          <Typography variant="h5" component="div">
            Created
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <p className="createDate">{props.metadata.CREATEDATE}</p>
            {props.user !== props.owner && (
              <p>
                <p className="tabTitle tabTitleTopMargin">Created by</p>
                <p className="createDate">{props.owner}</p>
              </p>
            )}
            {props.metadata.OLDVERSION && (
              <div className="tabTitle tabTitleTopMargin">Imported project</div>
            )}
          </Typography>
        </CardContent>
        <CardActions>
          {props.userRole !== "ReadOnly" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.metadata.PRIVATE}
                  onChange={props.toggleProjectPrivacy}
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
