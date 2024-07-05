import { faLock, faUnlink } from "@fortawesome/free-solid-svg-icons";

import DialogContent from "@mui/material/DialogContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MarxanDialog from "./MarxanDialog";
import MenuItem from "@mui/material/MenuItem";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

class LoginDialog extends React.Component {
  handleKeyPress(e) {
    if (e.nativeEvent.key === "Enter") this.props.onOk();
  }
  selectServer(evt, key, value) {
    this.props.selectServer(this.props.marxanServers[key]);
  }

  render() {
    const {
      open,
      onOk,
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
    } = this.props;

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

    return (
      <React.Fragment>
        <MarxanDialog
          {...this.props}
          showOverlay={true}
          okDisabled={okDisabled}
          okLabel={okLabel}
          showCancelButton={true}
          cancelLabel={"Register"}
          cancelDisabled={cancelDisabled}
          helpLink={"user.html#log-in-window"}
          // contentWidth={500}
          // offsetY={200}
        >
          {[
            <div key="21">
              <DialogContent dividers>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel id="select-marxan-server-label">
                    Marxan Server
                  </InputLabel>
                  <Select
                    labelId="select-marxan-server-label"
                    id="select-marxan-server"
                    value={marxanServer ? marxanServer.name : ""}
                    onChange={this.selectServer.bind(this)}
                    label="Marxan Server"
                  >
                    {marxanServers.map((item) => {
                      //if the server is offline - just put that otherwise: if CORS is enabled for this domain then it is read/write otherwise: if the guest user is enabled then put the domain and read only otherwise: put the domain and guest user disabled
                      let text = item.offline
                        ? item.name
                        : item.corsEnabled
                        ? item.name
                        : item.guestUserEnabled
                        ? item.name
                        : item.name + " (Guest user disabled)";
                      return (
                        <MenuItem
                          value={item.name}
                          key={item.name}
                          style={{ fontSize: "12px" }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
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
                </FormControl>
                <TextField
                  id="TextUsername"
                  label="Username"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  onChange={(event, value) => changeUserName(value)}
                  value={user}
                  disabled={
                    loading || (marxanServer && !marxanServer.corsEnabled)
                  }
                  onKeyPress={this.handleKeyPress.bind(this)}
                />
                <TextField
                  id="TextPassword"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  onChange={(event, value) => changePassword(value)}
                  value={password}
                  disabled={
                    loading || (marxanServer && !marxanServer.corsEnabled)
                  }
                  onKeyPress={this.handleKeyPress.bind(this)}
                />
              </DialogContent>

              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "10px",
                  fontSize: "11px",
                }}
              >
                {marxanClientReleaseVersion}
              </div>
            </div>,
          ]}
        </MarxanDialog>
      </React.Fragment>
    );
  }
}

export default LoginDialog;
