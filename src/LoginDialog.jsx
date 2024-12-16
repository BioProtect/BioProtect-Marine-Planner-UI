import React, { useState } from "react";
import { faLock, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import BioProtectLogo from "./images/bioprotect_project_logo.jpeg";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { selectServer } from "./slices/projectSlice";

const LoginDialog = (props) => {
  const dispatch = useDispatch();
  const [selectOpen, setSelectOpen] = useState(false);
  const dialogState = useSelector((state) => state.ui.dialogState);
  const projectState = useSelector((state) => state.project);
  console.log("projectState ", projectState);

  const {
    open,
    validateUser,
    onCancel,
    loading,
    user,
    password,
    changeUserName,
    changePassword,
    marxanClientReleaseVersion,
  } = props;

  const okDisabled =
    !user ||
    !password ||
    !projectState.bpServer ||
    projectState.bpServer.offline;
  const okLabel =
    projectState.bpServer &&
    !projectState.bpServer.offline &&
    !projectState.bpServer.corsEnabled &&
    projectState.bpServer.guestUserEnabled
      ? "Login (Read-Only)"
      : "Login";
  const cancelDisabled =
    !projectState.bpServer ||
    projectState.bpServer.offline ||
    !projectState.bpServer.corsEnabled;

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("event ", event);
    const data = new FormData(event.currentTarget);
    const name = data.get("username");
    const pass = data.get("password");
    changeUserName(name);
    changePassword(pass);
    validateUser(name, pass);
  };

  const handleClose = () => {
    setSelectOpen(false);
  };

  const handleOpen = () => {
    setSelectOpen(true);
  };

  const handleSelectServer = (event) => {
    const selectedServer = projectState.bpServers.find(
      (server) => server.name === event.target.value
    );
    dispatch(selectServer(selectedServer));
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="sm"
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <DialogTitle>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CardMedia>
            <img
              srcSet={`${BioProtectLogo}`}
              src={`${BioProtectLogo}`}
              alt="bioprotect logo"
              loading="lazy"
            />
          </CardMedia>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="select-bpServer-label">BioProtect Server</InputLabel>

          <Select
            labelId="select-bpServer-label"
            id="select-bpServer"
            open={selectOpen}
            onClose={handleClose}
            onOpen={handleOpen}
            value={projectState.bpServer.name ?? ""}
            onChange={handleSelectServer}
            label="BioProtect Server"
          >
            {projectState.bpServers.map((item) => {
              if (item.name === "localhost") console.log("item ", item);
              //if the server is offline - just put that otherwise: if CORS is enabled for this domain then it is read/write otherwise: if the guest user is enabled then put the domain and read only otherwise: put the domain and guest user disabled
              let text =
                item.offline || item.corsEnabled || item.guestUserEnabled
                  ? item.name
                  : item.name + " (Guest user disabled)";

              return (
                <MenuItem
                  value={item.name}
                  key={item.name}
                  style={{ fontSize: "12px" }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    {item.offline ? (
                      <FontAwesomeIcon
                        style={{ height: "12px", marginRight: "8px" }}
                        icon={faUnlink}
                      />
                    ) : item.corsEnabled ? null : (
                      <FontAwesomeIcon
                        style={{ height: "12px", marginRight: "8px" }}
                        icon={faLock}
                      />
                    )}
                    {text}
                  </span>
                </MenuItem>
              );
            })}
          </Select>
          <TextField
            margin="normal"
            required
            fullWidth
            id="Username"
            label="Username"
            name="username"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
      </DialogActions>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {marxanClientReleaseVersion}
      </div>
    </Dialog>
  );
};

export default LoginDialog;
