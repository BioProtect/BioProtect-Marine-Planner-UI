import { faLock, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
import React from "react";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { selectServer } from "./slices/projectSlice";
import { setCredentials } from "./slices/authSlice";
import { useLoginMutation } from "./slices/authApiSlice";

const LoginDialog = ({
  open,
  validateUser,
  loading,
  password,
  changeUserName,
  changePassword,
  marxanClientReleaseVersion,
}) => {
  const [selectOpen, setSelectOpen] = useState(false);
  const dialogState = useSelector((state) => state.ui.dialogState);
  const projectState = useSelector((state) => state.project);
  const userRef = useRef(null);
  const errRef = useRef(null);
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

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
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const data = new FormData(event.currentTarget);
    // const name = data.get("username");
    // const pass = data.get("password");
    // changeUserName(name);
    // changePassword(pass);
    // validateUser(name, pass);

    try {
      const userData = await login({ user, pwd }).unwrap();
      dispatch(setCredentials({ ...userData, user }));
      setUser("");
      setPwd("");
      navigate("/welcome");
    } catch (err) {
      if (!err?.originalStatus) {
        // isLoading: true until timeout occurs
        setErrMsg("No Server Response");
      } else if (err.originalStatus === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.originalStatus === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  const handleUserInput = (e) => setUser(e.target.value);

  const handlePwdInput = (e) => setPwd(e.target.value);

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
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>

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
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            ref={userRef}
            value={user}
            onChange={handleUserInput}
            autoComplete="off"
            required
          />
          {/* <TextField
            margin="normal"
            required
            fullWidth
            id="Username"
            label="Username"
            name="username"
            autoFocus
          /> */}
          {/* <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
          /> */}
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        {marxanClientReleaseVersion}
      </div>
    </Dialog>
  );
};

export default LoginDialog;
