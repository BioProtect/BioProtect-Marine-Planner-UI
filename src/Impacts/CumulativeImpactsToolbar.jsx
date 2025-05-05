import {
  faCircle,
  faPlusCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const CumulativeImpactsToolbar = ({
  loading,
  userRole,
  openImportedActivitesDialog,
  openHumanActivitiesDialog,
  // deleteImpact,
  selectedImpact,
  selectedProject,
}) => {
  return (
    <div>
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        {userRole !== "ReadOnly" ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="New CI function"
            onClick={openHumanActivitiesDialog}
          >
            Add Activity
          </Button>
        ) : null}

        {userRole !== "ReadOnly" ? (
          <Button
            show={userRole !== "ReadOnly"}
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="View uploaded activities"
            onClick={openImportedActivitesDialog}
            disabled={loading}
          >
            Run Cumulative Impact
          </Button>
        ) : null}

        {/* <Button
          startIcon={
            <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
          }
          title="Delete feature"
          onClick={deleteImpact}
          disabled={
            selectedImpact === undefined ||
            loading ||
            (selectedImpact &&
              selectedImpact.created_by === "global admin")
          }
        >
          Delete
        </Button> */}

        <Button
          startIcon={<FontAwesomeIcon icon={faCircle} />}
          title="Clear all Impact layers"
          // onClick={clearAllImpacts}
          disabled={!selectedProject || loading}
        >
          Clear all
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default CumulativeImpactsToolbar;
