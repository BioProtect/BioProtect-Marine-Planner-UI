import { faLock, faUnlink } from "@fortawesome/free-solid-svg-icons";

import BioProtectLogo from "./images/bioprotect_project_logo.jpeg";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MarxanDialog from "./MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

const LoginDialog = (props) => {
  const [selectOpen, setSelectOpen] = React.useState(false);

  const {
    validateUser,
    onCancel,
    loading,
    user,
    password,
    changeUserName,
    changePassword,
    updateState,
    marxanServers,
    selectServer,
    marxanServer,
    marxanClientReleaseVersion,
  } = props;

  const okDisabled =
    !user || !password || !marxanServer || marxanServer.offline;
  const okLabel =
    marxanServer &&
    !marxanServer.offline &&
    !marxanServer.corsEnabled &&
    marxanServer.guestUserEnabled
      ? "Login (Read-Only)"
      : "Login";
  const cancelDisabled =
    !marxanServer || marxanServer.offline || !marxanServer.corsEnabled;

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("username");
    const pass = data.get("password");
    changeUserName(name);
    changePassword(pass);
    validateUser(name, pass);
  };

  const handleChange = (event) => {
    handleSelectServer(event.target.value);
  };

  const handleClose = () => {
    setSelectOpen(false);
  };

  const handleOpen = () => {
    setSelectOpen(true);
  };

  const handleSelectServer = (val) => {
    const selectedServer = marxanServers.find((server) => server.name === val);
    selectServer(selectedServer);
  };

  return (
    <React.Fragment>
      <MarxanDialog
        {...props}
        fullWidth={false}
        maxWidth="sm"
        component="form"
        onSubmit={handleSubmit}
        noValidate
        hideOKButton={true}
        showCancelButton={false}
        cancelLabel={"Register"}
        cancelDisabled={cancelDisabled}
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
            <InputLabel id="select-marxan-server-label">
              BioProtect Server
            </InputLabel>

            <Select
              labelId="select-marxan-server-label"
              id="select-marxan-server"
              open={selectOpen}
              onClose={handleClose}
              onOpen={handleOpen}
              value={marxanServer.name ?? ""}
              onChange={handleChange}
              label="BioProtect Server"
            >
              {marxanServers.map((item) => {
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
              disabled={loading || (marxanServer && !marxanServer.corsEnabled)}
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
              disabled={loading || (marxanServer && !marxanServer.corsEnabled)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </DialogActions>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {marxanClientReleaseVersion}
        </div>
      </MarxanDialog>
    </React.Fragment>
  );
};

export default LoginDialog;
