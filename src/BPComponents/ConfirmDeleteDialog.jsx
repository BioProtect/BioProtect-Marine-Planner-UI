import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Confirmation popup shown before a delete; children is the message body
const ConfirmDeleteDialog = ({
  open,
  title,
  children,
  onCancel,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText component="div">{children}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;
