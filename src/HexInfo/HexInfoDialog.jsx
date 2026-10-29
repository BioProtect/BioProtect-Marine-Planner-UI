import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CONSTANTS from "../bpVars.jsx";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import CloseIcon from "@mui/icons-material/Close";
import Fade from "@mui/material/Fade";
import HexagonIcon from "@mui/icons-material/Hexagon";
import HexagonOutlinedIcon from "@mui/icons-material/HexagonOutlined";
import { HexInfoFeatureRow, dotSx } from "./HexInfoFeatureRow";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import { togglePUD } from "@slices/planningUnitSlice";

// Small uppercase label used on the dark rail
const railLabelSx = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.7)",
};

const railValueSx = {
  fontFamily: (theme) => theme.typography.headingFont,
  fontSize: 17,
  lineHeight: 1.3,
};

const countSx = {
  ml: "auto",
  minWidth: 20,
  px: 0.75,
  borderRadius: 9,
  fontSize: 11,
  fontWeight: 700,
  lineHeight: "18px",
  textAlign: "center",
};

const HexInfoDialog = ({ xy, metadata }) => {
  const dispatch = useDispatch();
  const identifyPlanningUnits = useSelector(
    (s) => s.planningUnit.identifyPlanningUnits,
  );

  const { hexInfoDialogOpen } = useSelector((s) => s.planningUnit.dialogs);
  const puInfo = identifyPlanningUnits?.puData;
  const puFeatures = identifyPlanningUnits?.features || [];
  // WDPA areas under the click, when that reference layer is on
  const protectedAreas = identifyPlanningUnits?.protectedAreas || [];

  const [section, setSection] = useState("features");
  // Protected areas menu item only exists when the WDPA layer returned some
  const view = protectedAreas.length > 0 ? section : "features";

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

  const menuItems = [
    { key: "features", label: "Features", count: puFeatures.length },
    ...(protectedAreas.length > 0
      ? [
          {
            key: "protected",
            label: "Protected areas",
            count: protectedAreas.length,
          },
        ]
      : []),
  ];

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
              width: 520,
              height: 380,
              overflow: "hidden",
              borderRadius: 2.5,
            }}
          >
            <ClickAwayListener onClickAway={closeDialog}>
              <Box sx={{ display: "flex", height: "100%" }}>
                {/* Rail: planning unit stats + section menu */}
                <Box
                  sx={{
                    width: 172,
                    flex: "none",
                    display: "flex",
                    flexDirection: "column",
                    color: "#fff",
                    background: (theme) => theme.palette.brand.barGradient,
                  }}
                >
                  {puInfo ? (
                    <Box
                      sx={{
                        p: 1.75,
                        pb: 1.5,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px 8px",
                        borderBottom: "1px solid rgba(255,255,255,.1)",
                      }}
                    >
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Box component="span" sx={railLabelSx}>
                          Planning unit
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 11,
                            color: "rgba(255,255,255,.9)",
                            wordBreak: "break-all",
                          }}
                        >
                          {puInfo.h3_index || puInfo.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Box component="span" sx={railLabelSx}>
                          Area
                        </Box>
                        <Typography sx={railValueSx}>
                          {puInfo.area_km2 != null
                            ? `${puInfo.area_km2.toFixed(2)} km²`
                            : "-"}
                        </Typography>
                      </Box>
                      <Box>
                        <Box component="span" sx={railLabelSx}>
                          Cost
                        </Box>
                        <Typography sx={railValueSx}>
                          {puInfo.cost?.toFixed(3) ?? "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Box component="span" sx={railLabelSx}>
                          Status
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                          }}
                        >
                          <span
                            className="hexLegendItem"
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <HexagonIcon
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                color: puStatus.fillColor,
                              }}
                            />
                            <HexagonOutlinedIcon
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                color: puStatus.strokeColor,
                              }}
                            />
                          </span>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                            {puStatus.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      sx={{ p: 1.75, fontSize: 12.5, color: "rgba(255,255,255,.8)" }}
                    >
                      No planning unit data available.
                    </Typography>
                  )}

                  <Box
                    sx={{
                      py: 1.25,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ ...railLabelSx, px: 1.75, pb: 0.5 }}
                    >
                      Show
                    </Box>
                    {menuItems.map((item) => {
                      const active = view === item.key;
                      return (
                        <ButtonBase
                          key={item.key}
                          onClick={() => setSection(item.key)}
                          sx={{
                            justifyContent: "flex-start",
                            gap: 1,
                            py: 1.1,
                            pl: 1.4,
                            pr: 1.75,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            color: active ? "#fff" : "rgba(255,255,255,.8)",
                            bgcolor: active
                              ? "rgba(255,255,255,.1)"
                              : "transparent",
                            borderLeft: "3px solid",
                            borderLeftColor: active
                              ? "brand.green"
                              : "transparent",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,.06)",
                              color: "#fff",
                            },
                          }}
                        >
                          {item.label}
                          <Box
                            component="span"
                            sx={{
                              ...countSx,
                              bgcolor: active
                                ? "brand.green"
                                : "rgba(255,255,255,.14)",
                              color: active ? "brand.deep" : "#fff",
                            }}
                          >
                            {item.count}
                          </Box>
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>

                {/* Main: title + scrolling list */}
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pl: 1.75,
                      pr: 1,
                      py: 0.9,
                      borderBottom: "1px solid",
                      borderColor: "brand.border",
                    }}
                  >
                    <Typography
                      sx={{
                        flex: 1,
                        fontFamily: (theme) => theme.typography.headingFont,
                        fontSize: 18,
                      }}
                    >
                      {view === "features" ? "Features" : "Protected areas"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={closeDialog}
                      aria-label="Close"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    {view === "features" ? (
                      puFeatures.length > 0 ? (
                        puFeatures.map((row, i) => (
                          <HexInfoFeatureRow
                            key={row.feature_id ?? row.alias ?? i}
                            row={row}
                          />
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ p: 2, textAlign: "center" }}
                        >
                          No features in this planning unit.
                        </Typography>
                      )
                    ) : (
                      protectedAreas.map((pa) => (
                        <Box
                          key={pa.wdpaid}
                          sx={{
                            px: 1.75,
                            py: 1,
                            borderBottom: "1px solid #f0f3f5",
                          }}
                        >
                          <Link
                            href={`https://www.protectedplanet.net/${pa.wdpaid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ fontSize: 13, fontWeight: 600 }}
                          >
                            {pa.name || `WDPA ${pa.wdpaid}`} ↗
                          </Link>
                          <Typography
                            sx={{
                              fontSize: 11.5,
                              lineHeight: 1.35,
                              color: "text.secondary",
                            }}
                          >
                            {[
                              pa.desig_eng,
                              pa.iucn_cat && `IUCN ${pa.iucn_cat}`,
                              [pa.status, pa.status_yr || null]
                                .filter(Boolean)
                                .join(" "),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>

                  {view === "features" && puFeatures.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        px: 1.75,
                        py: 0.75,
                        fontSize: 11,
                        color: "text.secondary",
                        bgcolor: "brand.surfaceTint",
                        borderTop: "1px solid #f0f3f5",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.6 }}
                      >
                        <Box sx={dotSx(true)} />
                        Preprocessed
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.6 }}
                      >
                        <Box sx={dotSx(false)} />
                        Not preprocessed
                      </Box>
                    </Box>
                  )}
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
