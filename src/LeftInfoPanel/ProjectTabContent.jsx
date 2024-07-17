import React, { useRef, useState } from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Typography from "@mui/material/Typography";

const ProjectTabContent = (props) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      props.setEditingDescription(false);
    }
  };

  const handleBlur = () => {
    props.setEditingDescription(false);
  };

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
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
            />
          )}
          {props.userRole === "ReadOnly" ? (
            <Typography variant="body2" color="text.secondary">
              <div
                className="description"
                title={props.metadata.DESCRIPTION}
                dangerouslySetInnerHTML={{
                  __html: props.metadata.DESCRIPTION,
                }}
              />
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              <div
                className="description"
                onClick={props.startEditingDescription}
                style={{
                  display: !props.editingDescription ? "block" : "none",
                }}
                title="Click to edit"
                dangerouslySetInnerHTML={{
                  __html: props.metadata.DESCRIPTION,
                }}
              />
            </Typography>
          )}
          <Typography variant="h5" component="div">
            Created
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <div className="createDate">{props.metadata.CREATEDATE}</div>
            {props.user !== props.owner && (
              <div>
                <div className="tabTitle tabTitleTopMargin">Created by</div>
                <div className="createDate">{props.owner}</div>
              </div>
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
