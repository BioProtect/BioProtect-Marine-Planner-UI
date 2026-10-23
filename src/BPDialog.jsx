import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";

// onCancel also fires when the dialog is closed; actions render above the OK/Cancel row
const BPDialog = ({
  open,
  title,
  children,
  actions,
  onOk,
  onCancel,
  fullWidth = false,
  maxWidth = "lg",
  showCancelButton,
  cancelLabel = "Cancel",
  hideOKButton,
  okDisabled,
  okLabel = "OK",
}) => (
  <Dialog open={open} fullWidth={fullWidth} maxWidth={maxWidth} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions>{actions}</DialogActions>
    <DialogActions>
      {showCancelButton && (
        <Button variant="outlined" onClick={onCancel} color="error">
          {cancelLabel}
        </Button>
      )}
      {!hideOKButton && (
        <Button variant="outlined" onClick={onOk} disabled={okDisabled}>
          {okLabel}
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export default BPDialog;
