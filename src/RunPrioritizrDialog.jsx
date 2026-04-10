import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BoundaryPenaltyControl from "./LeftInfoPanel/BoundaryPenaltyControl";
import Box from "@mui/material/Box";
import MarxanDialog from "./MarxanDialog";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { toggleDialog } from "@slices/uiSlice";

// Modal shown when the user clicks "Run Prioritizr". Lets them name and
// describe the run, and pick a boundary penalty before kicking it off.
const RunPrioritizrDialog = ({
  runPrioitizr,
  boundaryPenalty,
  setBoundaryPenalty,
}) => {
  const dispatch = useDispatch();
  const open = useSelector(
    (s) => s.ui.dialogStates.runPrioritizrDialogOpen ?? false,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default the name to a timestamp every time the dialog opens so the user
  // gets something sensible without having to think.
  useEffect(() => {
    if (!open) return;
    const stamp = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setName(`Run ${stamp}`);
    setDescription("");
    setSubmitting(false);
  }, [open]);

  const close = () =>
    dispatch(
      toggleDialog({ dialogName: "runPrioritizrDialogOpen", isOpen: false }),
    );

  const handleRun = async () => {
    if (submitting) return;
    setSubmitting(true);
    // Close immediately so the results panel / log tab takes over the UI;
    // runPrioitizr handles the websocket lifecycle from here.
    close();
    try {
      await runPrioitizr({
        name: name.trim() || null,
        description: description.trim() || null,
        boundaryPenalty,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarxanDialog
      open={open}
      title="Run Prioritizr"
      contentWidth={420}
      showCancelButton
      okLabel="Run"
      okDisabled={submitting}
      onOk={handleRun}
      onCancel={close}
    >
      <Box sx={{ width: 420 }}>
        <Stack spacing={2} sx={{ py: 1 }}>
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            placeholder="Optional notes about this run"
          />
          <BoundaryPenaltyControl
            value={boundaryPenalty ?? 0}
            onChange={setBoundaryPenalty}
          />
        </Stack>
      </Box>
    </MarxanDialog>
  );
};

export default RunPrioritizrDialog;
