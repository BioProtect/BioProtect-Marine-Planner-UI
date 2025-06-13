import {
  faCircle,
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toggleDialog } from "../slices/uiSlice";

const CumulativeImpactsToolbar = ({
  userRole,
  openHumanActivitiesDialog,
  // deleteImpact,
  selectedImpact,
  selectedProject,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
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
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="View uploaded activities"
            onClick={() => dispatch(
              toggleDialog({
                dialogName: "importedActivitiesDialogOpen",
                isOpen: true
              })
            )}
            disabled={uiState.loading}
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
          disabled={!selectedProject || uiState.loading}
        >
          Clear all
        </Button>
      </ButtonGroup>
    </div >
  );
};

export default CumulativeImpactsToolbar;
