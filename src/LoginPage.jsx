import { setLoading, toggleDialog } from "./slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLayoutEffect, useRef, useState } from "react";

import AccountCircle from "@mui/icons-material/AccountCircle";
import BioProtectLogo from "./images/bioprotect_logo_new.png";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LockIcon from "@mui/icons-material/Lock";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { selectServer, toggleProjDialog } from "@slices/projectSlice";
import { setCredentials } from "@slices/authSlice";
import styled from "@emotion/styled";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useLoginMutation } from "@slices/authApiSlice";

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: #ffffff;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  overflow: hidden;
  display: flex;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const Left = styled.div`
  width: 54%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 72px;
  background: linear-gradient(
    162deg,
    #091b35 0%,
    #0e2a4e 10%,
    #125085 26%,
    #1a4260 42%,
    #2b575c 58%,
    #3a7972 70%,
    #448188 80%,
    #4d9882 90%,
    #5bbd8c 100%
  );

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 80px;
    background: linear-gradient(to right, transparent, rgba(9, 27, 53, 0.18));
    pointer-events: none;
  }
`;

const Contours = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Right = styled.div`
  width: 46%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 52px 64px;
  position: relative;
  overflow-y: auto;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(68, 129, 136, 0.15) 15%,
      rgba(68, 129, 136, 0.18) 50%,
      rgba(68, 129, 136, 0.15) 85%,
      transparent 100%
    );
  }
`;

const FormWrap = styled.form`
  width: 100%;
  max-width: 360px;
`;

// muted whites used over the marine gradient on the left panel
const onDark = {
  eyebrow: "rgba(255,255,255,0.4)",
  body: "rgba(255,255,255,0.55)",
  italic: "rgba(255,255,255,0.7)",
  foot: "rgba(255,255,255,0.35)",
  footStrong: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.18)",
  divider: "rgba(255,255,255,0.25)",
  chipBg: "rgba(255,255,255,0.06)",
};

const LoginPage = ({ loadProjectAndSetup }) => {
  const projectState = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const { showMessage } = useAppSnackbar();
  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const userRef = useRef(null);

  useLayoutEffect(() => {
    if (userRef.current) userRef.current.focus();
  }, []);

  const handleSelectServer = (event) => {
    const selectedServer = projectState.bpServers.find(
      (server) => server.name === event.target.value,
    );
    dispatch(selectServer(selectedServer));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password }).unwrap();
      dispatch(
        setCredentials({
          userId: response.userId,
          accessToken: response.accessToken,
          userData: response.userData,
        }),
      );
      // ponytail: new users have no project yet; send them to New Project
      if (response.project) {
        await loadProjectAndSetup(response.project.id);
      } else {
        dispatch(
          toggleProjDialog({
            dialogName: "newProjectDialogOpen",
            isOpen: true,
          }),
        );
      }
      dispatch(setLoading(false));
      setUsername("");
      setPassword("");
    } catch (err) {
      let errMsg = "Login Failed";
      if (!err?.originalStatus) {
        errMsg = "No Server Response";
      } else if (err.originalStatus === 400) {
        errMsg = "Missing Username or Password";
      } else if (err.originalStatus === 401) {
        errMsg = "Unauthorized";
      }
      showMessage(errMsg, "error");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    dispatch(toggleDialog({ dialogName: "resetDialogOpen", isOpen: true }));
  };

  const chipSx = {
    color: onDark.body,
    borderColor: onDark.border,
    backgroundColor: onDark.chipBg,
    fontSize: 11,
    fontWeight: 500,
  };

  return (
    <Root>
      <Left>
        <Contours>
          <svg
            viewBox="0 0 620 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-70,75 Q70,50 200,92 Q380,140 530,72 Q645,38 750,80"
              fill="none"
              stroke="rgba(255,255,255,0.048)"
              strokeWidth="1.5"
            />
            <path
              d="M-70,145 Q50,118 195,165 Q390,218 540,142 Q658,104 762,150"
              fill="none"
              stroke="rgba(255,255,255,0.032)"
              strokeWidth="1"
            />
            <path
              d="M-70,230 Q90,200 228,248 Q415,302 558,222 Q672,180 778,234"
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1.5"
            />
            <path
              d="M-70,328 Q68,298 222,350 Q422,408 568,322 Q682,278 788,334"
              fill="none"
              stroke="rgba(255,255,255,0.032)"
              strokeWidth="1"
            />
            <path
              d="M-70,438 Q125,403 272,455 Q448,515 582,422 Q698,375 802,440"
              fill="none"
              stroke="rgba(255,255,255,0.048)"
              strokeWidth="1.5"
            />
            <path
              d="M-70,558 Q95,522 255,572 Q448,636 595,538 Q718,488 822,558"
              fill="none"
              stroke="rgba(255,255,255,0.028)"
              strokeWidth="1"
            />
            <path
              d="M-70,685 Q115,648 272,698 Q468,762 618,660 Q745,608 848,685"
              fill="none"
              stroke="rgba(255,255,255,0.042)"
              strokeWidth="1.5"
            />
            <path
              d="M-70,808 Q142,768 308,820 Q508,888 662,778 Q792,724 895,808"
              fill="none"
              stroke="rgba(255,255,255,0.028)"
              strokeWidth="1"
            />
          </svg>
        </Contours>

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box
            component="img"
            src={BioProtectLogo}
            alt="BioProtect logo"
            loading="lazy"
            sx={{ width: 150, height: 180, display: "block" }}
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 6,
          }}
        >
          <Typography
            variant="overline"
            component="div"
            sx={{
              color: onDark.eyebrow,
              letterSpacing: "0.2em",
              fontWeight: 600,
              fontSize: 10,
              mb: 2,
            }}
          >
            Horizon Europe · Atlantic-Arctic Lighthouse
          </Typography>

          <Typography
            component="h1"
            sx={(theme) => ({
              fontFamily: theme.typography.headingFont,
              fontSize: "clamp(42px, 5.2vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: "#ffffff",
            })}
          >
            BioProtect
            <Box
              component="em"
              sx={{
                fontStyle: "italic",
                display: "block",
                color: onDark.italic,
              }}
            >
              Marine Planner
            </Box>
          </Typography>

          <Box
            sx={{
              width: 44,
              height: 2,
              backgroundColor: onDark.divider,
              borderRadius: 2,
              my: 3.5,
            }}
          />

          <Typography
            variant="body1"
            component="p"
            sx={{
              color: onDark.body,
              maxWidth: 400,
              lineHeight: 1.78,
              fontSize: 14,
            }}
          >
            A browser-based decision support tool for marine conservation and
            restoration planning — visualising cumulative impacts, identifying
            priority areas for protection, and enabling transparent, inclusive
            decision-making across European seas.
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 4 }}>
            <Chip
              label="Cumulative Impact Analysis"
              variant="outlined"
              size="small"
              sx={chipSx}
            />
            <Chip
              label="Hex-Grid Planning"
              variant="outlined"
              size="small"
              sx={chipSx}
            />
            <Chip
              label="Biodiversity Data"
              variant="outlined"
              size="small"
              sx={chipSx}
            />
            <Chip
              label="Scenario Optimisation"
              variant="outlined"
              size="small"
              sx={chipSx}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            borderTop: `1px solid ${onDark.border}`,
            pt: 2.75,
          }}
        >
          <Typography
            variant="caption"
            component="p"
            sx={{
              color: onDark.foot,
              lineHeight: 1.6,
              fontSize: 10.5,
              "& strong": { color: onDark.footStrong },
            }}
          >
            <strong>Co-funded by the European Union</strong>
            <br />
            Grant Agreement No. 101157341 · Mission Ocean and Waters
          </Typography>
        </Box>
      </Left>

      <Right>
        <FormWrap onSubmit={handleSubmit} noValidate>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              gap: 1.25,
              mb: 4,
            }}
          >
            <Box
              component="img"
              src={BioProtectLogo}
              alt="BioProtect logo"
              loading="lazy"
              sx={{
                width: 100,
                height: 120,
                flexShrink: 0,
              }}
            />
          </Box>

          <Typography
            component="h2"
            sx={(theme) => ({
              fontFamily: theme.typography.headingFont,
              fontSize: 30,
              color: "primary.main",
              letterSpacing: "-0.01em",
              mb: 0.75,
            })}
          >
            Welcome back.
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 4.5 }}>
            Sign in to your BioProtect Marine Planner account
          </Typography>

          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="select-bpServer-label">
              BioProtect Server
            </InputLabel>
            <Select
              labelId="select-bpServer-label"
              id="select-bpServer"
              open={selectOpen}
              onClose={() => setSelectOpen(false)}
              onOpen={() => setSelectOpen(true)}
              value={projectState.bpServer?.name ?? ""}
              onChange={handleSelectServer}
              label="BioProtect Server"
            >
              {projectState.bpServers.map((item) => {
                const text =
                  item.offline || item.corsEnabled || item.guestUserEnabled
                    ? item.name
                    : item.name + " (Guest user disabled)";
                return (
                  <MenuItem
                    value={item.name}
                    key={item.name}
                    sx={{ fontSize: 13 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {item.offline ? (
                        <LinkOffIcon sx={{ fontSize: 16, mr: 1 }} />
                      ) : item.corsEnabled ? null : (
                        <LockIcon sx={{ fontSize: 16, mr: 1 }} />
                      )}
                      {text}
                    </Box>
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
              inputRef={userRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
                    onClick={() => setShowPassword((s) => !s)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </FormControl>
          <Divider sx={{ my: 3 }} />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            sx={(theme) => ({
              py: 1.6,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.02em",
              textTransform: "none",
              background: theme.palette.brand.barGradient,
              boxShadow:
                "0 6px 20px rgba(18,80,133,0.22), 0 2px 6px rgba(18,80,133,0.14)",
              "&:hover": {
                background: theme.palette.brand.barGradient,
                filter: "brightness(1.05)",
                boxShadow:
                  "0 10px 28px rgba(18,80,133,0.3), 0 4px 10px rgba(18,80,133,0.18)",
              },
            })}
          >
            {isLoading
              ? "Signing in…"
              : "Sign in to the BioProtect Marine Planner"}
          </Button>

          <Box
            sx={{
              mt: 5.5,
              pt: 2.75,
              borderTop: "1px solid #eef1f4",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: 10, color: "#b8c4ca", lineHeight: 1.5 }}
            >
              Co-funded by the European Union · Grant No. 101157341
            </Typography>
          </Box>
        </FormWrap>
      </Right>
    </Root>
  );
};

export default LoginPage;
