import { CONSTANTS, INITIAL_VARS } from "./bpVars";
import { faLock, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { setSnackbarMessage, setSnackbarOpen } from "./slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import AccountCircle from "@mui/icons-material/AccountCircle";
import BioProtectLogo from "./images/bioprotect_project_logo.jpeg";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import React from "react";
import Select from "@mui/material/Select";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { selectCurrentToken } from "./slices/authSlice";
import { selectServer } from "./slices/projectSlice";
import { setCredentials } from "./slices/authSlice";
import { useLoginMutation } from "./slices/authApiSlice";

const LoginDialog = ({open, postLoginSetup}) => {
  const [selectOpen, setSelectOpen] = useState(false);
  const dialogState = useSelector((state) => state.ui.dialogState);
  const projectState = useSelector((state) => state.project);
  const userRef = useRef(null);
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (open && userRef.current) {
      userRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    dispatch(setSnackbarOpen(false));
    dispatch(setSnackbarMessage(""));
  }, [user, pwd]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = await login({ user, pwd }).unwrap();
      console.log("userdata ", userData)
      dispatch(setCredentials({ ...userData, user }));
      postLoginSetup();
      setUser("");
      setPwd("");
      
    } catch (err) {
      let errMsg = null;
      if (!err?.originalStatus) {
        // isLoading: true until timeout occurs
        errMsg = "No Server Response";
      } else if (err.originalStatus === 400) {
        errMsg = "Missing Username or Password";
      } else if (err.originalStatus === 401) {
        errMsg = "Unauthorized";
      } else {
        errMsg = "Login Failed";
      }
      dispatch(setSnackbarMessage(errMsg));
      dispatch(setSnackbarOpen(true));
    }
  };

  const handleUserInput = (e) => setUser(e.target.value);

  const handlePwdInput = (e) => setPwd(e.target.value);

  const handleClose = () => setSelectOpen(false);
  const handleOpen = () => setSelectOpen(true);

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
        </FormControl>
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel htmlFor="username">Username</InputLabel>
          <OutlinedInput
            id="username"
            type="text"
            endAdornment={
              <InputAdornment position="end">
                <AccountCircle />
              </InputAdornment>
            }
            label="Username"
            ref={userRef}
            value={user}
            onChange={handleUserInput}
            autoComplete="off"
            required
          />
        </FormControl>
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            onChange={handlePwdInput}
            value={pwd}
            required
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
