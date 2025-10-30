import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { toggleDialog } from "@slices/uiSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useState } from "react";
import { useUpdateUserMutation } from "@slices/userSlice";

const ChangePasswordDialog = ({ open }) => {
  const userState = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const userId = useSelector((state) => state.auth.userId); // adjust to your store
  console.log("userId ", userId);
  const { showMessage } = useAppSnackbar();

  const [updateUser] = useUpdateUserMutation();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const closeDialog = () =>
    dispatch(toggleDialog({ dialogName: "changePasswordDialogOpen", isOpen: false }));


  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) {
      showMessage("Passwords do not match", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("password", newPwd);

      const resp = await updateUser(formData).unwrap();

      // check if the server returned an error or missing message
      if (resp.error || resp.message?.toLowerCase().includes("error")) {
        const msg = resp.error || resp.message || "Password update failed";
        showMessage(msg, "error");
      } else {
        showMessage(resp.message || "Password updated successfully", "success");
        closeDialog();
      }
    } catch (err) {
      console.error("Failed to change password:", err);

      // RTK Query will throw if HTTP status >= 400
      const msg =
        err?.data?.message ||
        err?.error ||
        err.message ||
        "Failed to change password";
      showMessage(msg, "error");
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleChangePassword();
    }
  };


  return (
    <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          margin="normal"
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
          disabled={uiState.loading}
          autoFocus
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={uiState.loading}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={uiState.loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleChangePassword}
          disabled={!currentPwd || !newPwd || !confirmPwd || uiState.loading}
          variant="contained"
          color="primary"
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
