import {
  faCircle,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const CumulativeImpactsToolbar = (props) => {
  return (
    <div>
      {props.metadataOV && (
        <div className="tabTitle">
          This is an imported project. Only features from this project are
          shown.
        </div>
      )}
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        {props.userRole !== "ReadOnly" && !props.metadataOV ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="New CI function"
            onClick={props.openHumanActivitiesDialog}
          >
            Add Activity
          </Button>
        ) : null}

        {!props.metadataOV && props.userRole !== "ReadOnly" ? (
          <Button
            show={!props.metadataOV && props.userRole !== "ReadOnly"}
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="View uploaded activities"
            onClick={props.openImportedActivitesDialog}
            disabled={props.loading}
          >
            Run Cumulative Impact
          </Button>
        ) : null}

        <Button
          startIcon={
            <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
          }
          title="Delete feature"
          onClick={props.deleteImpact}
          disabled={
            props.selectedImpact === undefined ||
            props.loading ||
            (props.selectedImpact &&
              props.selectedImpact.created_by === "global admin")
          }
        >
          Delete
        </Button>

        <Button
          startIcon={<FontAwesomeIcon icon={faCircle} />}
          title="Clear all Impact layers"
          // onClick={props.clearAllImpacts}
          disabled={!props.selectedProject || props.loading}
        >
          Clear all
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default CumulativeImpactsToolbar;
