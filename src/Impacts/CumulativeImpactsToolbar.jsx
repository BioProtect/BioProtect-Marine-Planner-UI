import { useDispatch, useSelector } from "react-redux";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import DeleteIcon from "@mui/icons-material/Delete";
import { toggleDialog } from "@slices/uiSlice";

const CumulativeImpactsToolbar = ({
  userRole,
  openHumanActivitiesDialog,
  // deleteImpact,
  selectedImpact,
  selectedProject,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const openCumulativeImpactStepper = () =>
    dispatch(
      toggleDialog({
        dialogName: "uploadedActivitiesDialogOpen",
        isOpen: true,
      }),
    );

  return (
    <div>
      <ButtonGroup aria-label="Basic button group" fullWidth={true}>
        <Button
          startIcon={<AddCircleIcon />}
          title="New CI function"
          onClick={openHumanActivitiesDialog}
        >
          Add Activity
        </Button>

        <Button
          startIcon={<AddCircleIcon />}
          title="View uploaded activities"
          onClick={() => openCumulativeImpactStepper()}
          disabled={uiState.loading}
        >
          Run Cumulative Impact
        </Button>

        {/* <Button
          startIcon={
            <DeleteIcon color="rgb(255, 64, 129)" />
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
          startIcon={<ClearAllIcon />}
          title="Clear all Impact layers"
          // onClick={clearAllImpacts}
          disabled={!selectedProject || uiState.loading}
        >
          Clear all
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default CumulativeImpactsToolbar;
