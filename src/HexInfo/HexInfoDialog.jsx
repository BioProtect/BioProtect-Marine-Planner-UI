import { setIdentifyPlanningUnits, togglePUD } from "@slices/planningUnitSlice";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CONSTANTS from "../constants";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import { HexInfoFeatureRow } from "./HexInfoFeatureRow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Swatch from "../Swatch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

const HexInfoDialog = ({ xy, metadata }) => {
  const dispatch = useDispatch();
  const identifyPlanningUnits = useSelector(
    (s) => s.planningUnit.identifyPlanningUnits,
  );

  const { hexInfoDialogOpen } = useSelector((s) => s.planningUnit.dialogs);
  const puInfo = identifyPlanningUnits?.puData;
  console.log("puInfo ", puInfo);
  const puFeatures = identifyPlanningUnits?.features || [];
  console.log("puFeatures ", puFeatures);
  const identifiedFeatures = identifyPlanningUnits?.identifiedFeatures || [];
  console.log("identifiedFeatures ", identifiedFeatures);

  const virtualAnchor = useMemo(
    () =>
      xy
        ? {
            getBoundingClientRect: () => ({
              top: xy.y,
              left: xy.x,
              right: xy.x,
              bottom: xy.y,
              width: 0,
              height: 0,
            }),
          }
        : null,
    [xy],
  );

  const closeDialog = useCallback(() => {
    dispatch(togglePUD({ dialogName: "hexInfoDialogOpen", isOpen: false }));
  }, [dispatch]);

  const puStatus = useMemo(() => {
    if (!puInfo) return CONSTANTS.PU_STATUS_DEFAULT;
    switch (puInfo.status) {
      case 1:
        return CONSTANTS.PU_STATUS_LOCKED_IN;
      case 2:
        return CONSTANTS.PU_STATUS_LOCKED_OUT;
      default:
        return CONSTANTS.PU_STATUS_DEFAULT;
    }
  }, [puInfo]);

  if (!hexInfoDialogOpen || !virtualAnchor) return null;

  /** TAB: Features */
  const FeaturesTab =
    identifiedFeatures.length > 0 ? (
      <Box sx={{ p: 2 }}>
        <Box>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Feature</TableCell>
                  <TableCell align="right">Preprocessed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {identifiedFeatures.map((row) => (
                  <HexInfoFeatureRow key={row.alias} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    ) : (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="text.secondary">
          No nearby features identified.
        </Typography>
      </Box>
    );

  return (
    <Popper
      open={hexInfoDialogOpen}
      anchorEl={virtualAnchor}
      placement="right-start"
      transition
      modifiers={[
        { name: "offset", options: { offset: [12, 12] } },
        { name: "preventOverflow", options: { padding: 16 } },
        { name: "flip", options: { fallbackPlacements: ["left-start"] } },
      ]}
      sx={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={150}>
          <Paper
            elevation={6}
            sx={{
              width: 600,
              maxHeight: 420,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ClickAwayListener onClickAway={closeDialog}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {/* ===================== */}
                  {/* Planning Unit Section */}
                  {/* ===================== */}
                  {puInfo ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        border: "1px solid #eee",
                        borderRadius: 2,
                        p: 1.5,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Planning Unit
                      </Typography>

                      {/* Hex ID */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Hex ID
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {puInfo.h3_index || puInfo.id}
                        </Typography>
                      </Box>

                      {/* Cost */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Cost
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {puInfo.cost?.toFixed(3)}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {puStatus.label}
                        </Typography>
                        <Swatch
                          item={puStatus}
                          shape={
                            metadata?.PLANNING_UNIT_NAME?.includes("hexagon")
                              ? "hexagon"
                              : "square"
                          }
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary" textAlign="center">
                      No planning unit data available.
                    </Typography>
                  )}

                  {/* ================= */}
                  {/* Features Section  */}
                  {/* ================= */}
                  <Box
                    sx={{
                      border: "1px solid #eee",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderBottom: "1px solid #eee",
                        bgcolor: "grey.50",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Planning Unit Features
                      </Typography>
                    </Box>

                    {identifiedFeatures.length > 0 ? (
                      <Box sx={{ maxHeight: 260, overflowY: "auto" }}>
                        <TableContainer component={Paper} elevation={0}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell />
                                <TableCell>Feature</TableCell>
                                <TableCell align="right">
                                  Preprocessed
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {identifiedFeatures.map((row) => (
                                <HexInfoFeatureRow key={row.alias} row={row} />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          No nearby features identified.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    px: 1.5,
                    py: 1,
                    borderTop: "1px solid #eee",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={closeDialog}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default HexInfoDialog;
